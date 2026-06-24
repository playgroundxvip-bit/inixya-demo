import os
import cv2
import base64
import asyncio
import logging
import time
import httpx
import numpy as np
from typing import Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

# Initialize logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("inixya-studio-backend")

# Try to import Anam client & types
try:
    from anam import AnamClient, AnamEvent
    from anam.types import MessageRole
    from anam.errors import AnamError
    ANAM_AVAILABLE = True
except ImportError:
    logger.warning("Anam SDK is not installed or import failed. Forcing simulation mode.")
    ANAM_AVAILABLE = False
    
    # Safe fallbacks for simulation execution
    class AnamEvent:
        CONNECTION_ESTABLISHED = "connection_established"
        CONNECTION_CLOSED = "connection_closed"
        SESSION_READY = "session_ready"
        MESSAGE_RECEIVED = "message_received"
        MESSAGE_STREAM_EVENT_RECEIVED = "message_stream_event_received"
        ERROR = "error"
    
    class MessageRole:
        ASSISTANT = "assistant"
        USER = "user"

# Try to load environment variables from a local .env file if python-dotenv is installed
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Project Configuration
ANAM_API_KEY = os.getenv("ANAM_API_KEY", "")
PERSONA_ID = os.getenv("PERSONA_ID", "64b5b09e-6898-4f44-a0d6-722851e921c8")  # Luna Casual

app = FastAPI(title="iNixya Studio Backend", description="Real-time Media & AI Agent Pipeline")

# Enable CORS for frontend connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def generate_mock_llm_reply(message: str) -> str:
    """Routes user messages to OpenAI if configured, otherwise returns simulated Luna replies."""
    openai_key = os.getenv("OPENAI_API_KEY")
    if openai_key:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {openai_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "gpt-4o-mini",
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are Luna, a friendly, stylish, and highly-capable AI co-host for iNixya Studio. Your responses should be conversational, warm, and concise (under 3 sentences)."
                            },
                            {"role": "user", "content": message}
                        ],
                        "max_tokens": 150
                    },
                    timeout=5.0
                )
                if response.status_code == 200:
                    data = response.json()
                    return data["choices"][0]["message"]["content"].strip()
                else:
                    logger.error(f"OpenAI error status {response.status_code}: {response.text}")
        except Exception as e:
            logger.error(f"Failed to connect to OpenAI endpoint: {e}")

    # Fallback simulation thinking delay & responses
    await asyncio.sleep(0.6)
    msg = message.lower()
    if "hello" in msg or "hi" in msg:
        return "Hey! Welcome back to iNixya Studio. I'm Luna, how can I help you today?"
    elif "who are you" in msg:
        return "I'm Luna, your interactive AI avatar. I stream real-time frames right here inside the studio!"
    elif "how are you" in msg:
        return "I'm doing fantastic! Ready to showcase some real-time avatar interaction. How are you?"
    elif "project" in msg or "studio" in msg:
        return "iNixya Studio is our playground for combining next-generation web tools, WebSockets, and live AI streams."
    else:
        return f"Interesting! You said: '{message}'. Tell me more about what you'd like to build!"


def generate_mock_frame(width=640, height=480) -> bytes:
    """Generates an elegant, dynamic dark-mode placeholder frame using OpenCV."""
    img = np.zeros((height, width, 3), dtype=np.uint8)
    
    # 1. Background Gradient
    for y in range(height):
        ratio = y / height
        b = int(35 + ratio * 45)   # Purple-tint dark blue
        g = int(15 + ratio * 20)
        r = int(20 + ratio * 25)
        img[y, :] = [b, g, r]
        
    # 2. Glowing Pulse Rings (representing avatar activity)
    pulse = int(12 * np.sin(time.time() * 4))
    center = (width // 2, height // 2 - 30)
    
    # Outer glowing ring
    cv2.circle(img, center, 85 + pulse, (180, 50, 100), 2, cv2.LINE_AA)
    # Middle ring
    cv2.circle(img, center, 65, (100, 30, 60), -1)
    # Inner pulse core
    cv2.circle(img, center, 25 + pulse // 2, (255, 100, 150), -1, cv2.LINE_AA)
    
    # 3. Text Overlays (Anti-aliased)
    cv2.putText(img, "iNixya Studio", (30, 60), cv2.FONT_HERSHEY_DUPLEX, 0.8, (255, 255, 255), 1, cv2.LINE_AA)
    cv2.putText(img, "Persona: Luna (Casual)", (30, 95), cv2.FONT_HERSHEY_DUPLEX, 0.6, (180, 180, 180), 1, cv2.LINE_AA)
    cv2.putText(img, "SIMULATION MODE ACTIVE", (width - 240, 60), cv2.FONT_HERSHEY_DUPLEX, 0.5, (0, 200, 255), 1, cv2.LINE_AA)
    
    # 4. Audio Waveform Visualizer
    wave_y = height - 80
    for x in range(30, width - 30, 15):
        wave_h = int(25 * np.sin(time.time() * 6 + x * 0.12))
        wave_h = max(3, abs(wave_h))
        # Color wave in premium neon green
        cv2.line(img, (x, wave_y), (x, wave_y - wave_h), (120, 255, 0), 2, cv2.LINE_AA)
        cv2.line(img, (x, wave_y), (x, wave_y + wave_h), (120, 255, 0), 2, cv2.LINE_AA)
        
    # 5. Status Text
    cv2.putText(img, "STREAMING ACTIVE - 24 FPS", (30, height - 30), cv2.FONT_HERSHEY_DUPLEX, 0.5, (100, 255, 100), 1, cv2.LINE_AA)
    
    # Optimize mock frame JPEG encoding with quality 80
    success, encoded_img = cv2.imencode('.jpg', img, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
    if success:
        return encoded_img.tobytes()
    return b""


class AvatarSession:
    """Manages active WebRTC connection, frame streaming, and state machine transitions."""
    def __init__(self, websocket: WebSocket):
        self.websocket = websocket
        self.write_lock = asyncio.Lock()  # Serializer lock for thread-safe concurrent socket writes
        self.client = None
        self.session = None
        self.use_simulation = not ANAM_AVAILABLE
        self.running = True
        self.frame_task = None
        self.audio_task = None

    async def send_json(self, data: dict):
        """Thread-safe WebSocket sender to prevent concurrent write collisions."""
        async with self.write_lock:
            try:
                await self.websocket.send_json(data)
            except Exception as e:
                # Silently drop failed writes if client disconnected
                pass

    async def connect_avatar(self):
        """Attempts to spin up a connection with Anam SDK. Reports errors directly to WebSocket."""
        await self.disconnect_avatar()

        if not ANAM_AVAILABLE:
            error_msg = "Anam SDK is not installed or import failed."
            logger.error(error_msg)
            await self.send_json({
                "type": "chat_reply",
                "user": "System",
                "message": f"Connection Error: {error_msg}"
            })
            self.use_simulation = True
            return

        try:
            logger.info(f"Initiating AnamClient with persona ID: {PERSONA_ID}")
            self.client = AnamClient(api_key=ANAM_API_KEY, persona_id=PERSONA_ID)
            
            # Setup SDK event listeners to pipe responses back to client
            @self.client.on(AnamEvent.MESSAGE_RECEIVED)
            async def on_message_received(msg):
                logger.info(f"Received message event from Anam SDK: {msg.role} - {msg.content}")
                role_val = msg.role.value if hasattr(msg.role, "value") else str(msg.role)
                if role_val == "assistant":
                    await self.send_json({
                        "type": "chat_reply",
                        "user": "Luna",
                        "message": msg.content
                    })

            @self.client.on(AnamEvent.MESSAGE_STREAM_EVENT_RECEIVED)
            async def on_message_stream(stream_event):
                role_val = stream_event.role.value if hasattr(stream_event.role, "value") else str(stream_event.role)
                if role_val == "assistant":
                    await self.send_json({
                        "type": "chat_reply_chunk",
                        "message": stream_event.content,
                        "end_of_speech": stream_event.end_of_speech
                    })

            # Connect asynchronously to establish the session
            self.session = await self.client.connect_async()
            self.use_simulation = False
            logger.info("AnamClient connected successfully.")
            await self.send_json({
                "type": "chat_reply",
                "user": "System",
                "message": "Connected to Anam AI stream successfully!"
            })
        except Exception as e:
            error_msg = f"Failed to connect AnamClient: {e}"
            logger.error(error_msg)
            await self.send_json({
                "type": "chat_reply",
                "user": "System",
                "message": f"Connection Error: {error_msg}. Please check your API key and connection."
            })
            self.use_simulation = False

    async def disconnect_avatar(self):
        """Safely tears down active Anam SDK streaming connections."""
        if self.session:
            try:
                await self.session.close()
            except Exception as e:
                logger.error(f"Error closing session: {e}")
            self.session = None

        if self.client:
            try:
                await self.client.close()
            except Exception as e:
                logger.error(f"Error closing client: {e}")
            self.client = None

    async def start(self):
        """Starts the session by connecting the client and spinning up stream loops."""
        await self.connect_avatar()
        self.frame_task = asyncio.create_task(self.stream_frames_loop())
        self.audio_task = asyncio.create_task(self.stream_audio_loop())

    async def stream_frames_loop(self):
        """Background loop executing frame retrieval, encoding to JPEG/base64, and broadcasting."""
        while self.running:
            try:
                if self.use_simulation:
                    # Simulation Mode Frame Generation
                    jpeg_bytes = generate_mock_frame()
                    if jpeg_bytes:
                        base64_str = base64.b64encode(jpeg_bytes).decode('utf-8')
                        await self.send_json({
                            "type": "video",
                            "image": f"data:image/jpeg;base64,{base64_str}"
                        })
                    await asyncio.sleep(1 / 24)  # Throttle to 24 FPS
                else:
                    # Real Anam SDK frame consumption
                    if self.session and self.session.is_active:
                        async for frame in self.session.video_frames():
                            if self.use_simulation or not self.running:
                                break
                            
                            img = frame.to_ndarray(format="rgb24")
                            img_bgr = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
                            
                            # OPTIMIZATION: Compress JPEG at 80% quality to decrease package payload sizes by ~50%
                            success, encoded_img = cv2.imencode('.jpg', img_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
                            if success:
                                jpeg_bytes = encoded_img.tobytes()
                                base64_str = base64.b64encode(jpeg_bytes).decode('utf-8')
                                await self.send_json({
                                    "type": "video",
                                    "image": f"data:image/jpeg;base64,{base64_str}"
                                })
                    else:
                        await asyncio.sleep(0.1)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error encountered in frame streaming: {e}")
                await asyncio.sleep(1)

    async def stream_audio_loop(self):
        """Background loop executing 16-bit stereo PCM audio retrieval, encoding, and broadcasting."""
        while self.running:
            try:
                if self.use_simulation:
                    await asyncio.sleep(0.1)
                    continue

                if self.session and self.session.is_active:
                    async for frame in self.session.audio_frames():
                        if self.use_simulation or not self.running:
                            break
                        
                        # frame.to_ndarray() returns raw interleaved stereo PCM int16 samples
                        samples = frame.to_ndarray()
                        pcm_bytes = samples.tobytes()
                        base64_audio = base64.b64encode(pcm_bytes).decode('utf-8')
                        
                        await self.send_json({
                            "type": "audio",
                            "audio": base64_audio
                        })
                else:
                    await asyncio.sleep(0.1)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error encountered in audio streaming: {e}")
                await asyncio.sleep(0.5)

    async def handle_chat(self, message: str):
        """Intercepts chat messages, forwards to Anam session, and handles mock fallbacks."""
        logger.info(f"Chat input received: {message}")
        if self.use_simulation:
            # Simulation fallback: use mock LLM response
            reply_text = await generate_mock_llm_reply(message)
            await self.send_json({
                "type": "chat_reply",
                "user": "Luna",
                "message": reply_text
            })
        else:
            if self.session and self.session.is_active:
                try:
                    # Send message to let Anam orchestrate the response (LLM + TTS stream)
                    await self.session.send_message(message)
                except Exception as e:
                    logger.error(f"Failed to forward message to Anam SDK: {e}. Falling back to simulation.")
                    reply_text = await generate_mock_llm_reply(message)
                    await self.send_json({
                        "type": "chat_reply",
                        "user": "Luna",
                        "message": reply_text
                    })
            else:
                logger.warning("No active avatar session available to handle chat.")
                await self.send_json({
                    "type": "chat_reply",
                    "user": "System",
                    "message": "Error: No active live connection to process your chat."
                })

    async def close(self):
        """Cleans up active loops and connections upon WebSocket disconnect."""
        self.running = False
        if self.frame_task:
            self.frame_task.cancel()
        if self.audio_task:
            self.audio_task.cancel()
            
        if self.frame_task or self.audio_task:
            try:
                await asyncio.gather(self.frame_task, self.audio_task, return_exceptions=True)
            except Exception:
                pass
                
        await self.disconnect_avatar()


@app.get("/health")
async def health_check():
    """Simple API status checks."""
    return {
        "status": "online",
        "anam_sdk_available": ANAM_AVAILABLE,
        "current_persona_id": PERSONA_ID
    }


@app.get("/", response_class=HTMLResponse)
async def get_index():
    from fastapi.responses import HTMLResponse
    html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>iNixya Studio - Real-time Avatar Playground</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Space+Grotesk:wght@400;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-color: #0d0c15;
            --panel-bg: #141324;
            --accent-color: #8b5cf6;
            --accent-glow: rgba(139, 92, 246, 0.4);
            --neon-green: #10b981;
            --neon-blue: #06b6d4;
            --text-main: #f3f4f6;
            --text-muted: #9ca3af;
        }

        body {
            margin: 0;
            padding: 0;
            background-color: var(--bg-color);
            color: var(--text-main);
            font-family: 'Outfit', sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
            overflow-x: hidden;
        }

        header {
            width: 100%;
            max-width: 1200px;
            padding: 2rem 1rem 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            box-sizing: border-box;
        }

        h1 {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 1.8rem;
            font-weight: 800;
            margin: 0;
            background: linear-gradient(135deg, var(--text-main) 30%, var(--accent-color));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .status-badge {
            background-color: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
            color: var(--text-muted);
            padding: 0.4rem 0.8rem;
            border-radius: 9999px;
            font-size: 0.85rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.3s;
        }

        .status-badge .dot {
            width: 8px;
            height: 8px;
            background-color: var(--text-muted);
            border-radius: 50%;
        }

        main {
            display: flex;
            gap: 2rem;
            width: 100%;
            max-width: 1200px;
            padding: 2rem 1rem;
            flex-grow: 1;
            box-sizing: border-box;
        }

        @media (max-width: 900px) {
            main {
                flex-direction: column;
            }
        }

        .stream-container {
            flex: 1.3;
            background: var(--panel-bg);
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            position: relative;
        }

        .video-wrapper {
            position: relative;
            width: 100%;
            aspect-ratio: 4/3;
            border-radius: 12px;
            overflow: hidden;
            background-color: #050409;
            border: 1px solid rgba(255, 255, 255, 0.03);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        #avatar-video {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .console-container {
            flex: 1;
            background: var(--panel-bg);
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            height: 550px;
            box-sizing: border-box;
        }

        .chat-feed {
            flex-grow: 1;
            overflow-y: auto;
            border-radius: 8px;
            background-color: rgba(0, 0, 0, 0.2);
            padding: 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.8rem;
            border: 1px solid rgba(255, 255, 255, 0.02);
        }

        .message {
            max-width: 80%;
            padding: 0.6rem 1rem;
            border-radius: 12px;
            font-size: 0.95rem;
            line-height: 1.4;
            word-wrap: break-word;
        }

        .message.user {
            align-self: flex-end;
            background-color: var(--accent-color);
            color: white;
            border-bottom-right-radius: 2px;
            box-shadow: 0 4px 12px var(--accent-glow);
        }

        .message.luna {
            align-self: flex-start;
            background-color: rgba(255, 255, 255, 0.06);
            color: var(--text-main);
            border-bottom-left-radius: 2px;
            border: 1px solid rgba(255, 255, 255, 0.03);
        }

        .message.system {
            align-self: center;
            background-color: rgba(239, 68, 68, 0.15);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #f87171;
            font-family: monospace;
            font-size: 0.85rem;
            max-width: 95%;
            border-radius: 6px;
        }

        .chat-input-bar {
            display: flex;
            gap: 0.5rem;
        }

        .chat-input-bar input {
            flex-grow: 1;
            background-color: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 8px;
            color: white;
            padding: 0.8rem 1rem;
            font-family: inherit;
            font-size: 0.95rem;
            outline: none;
            transition: border-color 0.3s;
        }

        .chat-input-bar input:focus {
            border-color: var(--accent-color);
        }

        .chat-input-bar button {
            background-color: var(--accent-color);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0 1.5rem;
            font-family: inherit;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.2s;
        }

        .chat-input-bar button:hover {
            opacity: 0.9;
        }

        .quick-actions {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }

        .action-btn {
            background-color: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.06);
            color: var(--text-main);
            border-radius: 8px;
            padding: 0.5rem 1rem;
            font-size: 0.85rem;
            font-family: inherit;
            cursor: pointer;
            transition: all 0.2s;
        }

        .action-btn:hover {
            background-color: rgba(139, 92, 246, 0.1);
            border-color: var(--accent-color);
            color: white;
        }

        /* Ready overlay to unlock AudioContext autoplay */
        .ready-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(13, 12, 21, 0.96);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 100;
            backdrop-filter: blur(15px);
            transition: opacity 0.4s ease;
        }
        
        .ready-btn {
            background-color: var(--accent-color);
            color: white;
            border: none;
            border-radius: 9999px;
            padding: 1rem 2.5rem;
            font-size: 1.1rem;
            font-family: inherit;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 10px 25px var(--accent-glow);
            transition: transform 0.2s, background-color 0.2s;
        }
        
        .ready-btn:hover {
            transform: translateY(-2px);
            background-color: #7c3aed;
        }
    </style>
</head>
<body>
    <header>
        <div>
            <h1>iNixya Studio</h1>
            <p style="margin: 0.2rem 0 0; color: var(--text-muted); font-size: 0.9rem;">Real-time Media Playground</p>
        </div>
        <div class="status-badge">
            <div class="dot" id="status-dot"></div>
            <span id="backend-status">Disconnected</span>
        </div>
    </header>

    <main style="position: relative; width: 100%; max-width: 1200px;">
        <!-- Audio Unlock Overlay -->
        <div id="start-overlay" class="ready-overlay">
            <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: 2.2rem; font-weight: 800; margin: 0 0 0.5rem; text-align: center;">Ready to stream?</h2>
            <p style="color: var(--text-muted); margin: 0 0 2rem; font-size: 1rem; text-align: center; max-width: 400px;">Click below to initialize Web Audio, unmute the live stream, and join the session.</p>
            <button class="ready-btn" onclick="startSession()">Start Live Session & Audio</button>
        </div>

        <div style="display: flex; gap: 2rem; width: 100%; flex-wrap: wrap; box-sizing: border-box;">
            <div class="stream-container">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0; font-weight:600;">Avatar Stream</h3>
                    <span id="stream-info" style="font-size:0.85rem; color:var(--text-muted);">Frame Rate: 0 FPS</span>
                </div>
                
                <div class="video-wrapper">
                    <img id="avatar-video" src="" alt="Avatar Stream">
                </div>
            </div>

            <div class="console-container">
                <h3 style="margin:0; font-weight:600;">Luna Console</h3>
                <div id="chat-feed" class="chat-feed">
                    <div class="message luna">Hi! I'm Luna. Chat with me on live stream!</div>
                </div>

                <div class="quick-actions">
                    <button class="action-btn" onclick="sendAction('Hello Luna, how are you today?')">👋 Say Hello</button>
                    <button class="action-btn" onclick="sendAction('Who are you?')">❓ Who are you?</button>
                    <button class="action-btn" onclick="sendAction('Tell me about iNixya Studio')">🏢 iNixya Studio</button>
                </div>

                <div class="chat-input-bar">
                    <input type="text" id="chat-input" placeholder="Type a message to Luna..." onkeydown="if(event.key==='Enter') sendMessage()">
                    <button onclick="sendMessage()">Send</button>
                </div>
            </div>
        </div>
    </main>

    <script>
        let ws;
        const videoEl = document.getElementById('avatar-video');
        const chatFeed = document.getElementById('chat-feed');
        const inputEl = document.getElementById('chat-input');
        const statusText = document.getElementById('backend-status');
        const statusDot = document.getElementById('status-dot');
        const streamInfo = document.getElementById('stream-info');

        let frameCount = 0;
        let lastFpsTime = Date.now();
        let activeTypingMessage = null;
        
        let audioCtx;
        let nextStartTime = 0;

        function startSession() {
            // Instantiate and unlock AudioContext matching Anam's 48kHz output rate
            audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 48000 });
            audioCtx.resume().then(() => {
                console.log("AudioContext active and resumed.");
                const overlay = document.getElementById('start-overlay');
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.style.display = 'none';
                }, 400);
                
                // Establish connection after AudioContext unlock completes
                connect();
            });
        }

        function connect() {
            const loc = window.location;
            const wsUri = (loc.protocol === 'https:' ? 'wss:' : 'ws:') + '//' + loc.host + '/ws/room';
            console.log("Connecting to WebSocket:", wsUri);
            ws = new WebSocket(wsUri);

            ws.onopen = () => {
                statusText.innerText = 'Connected';
                statusDot.style.backgroundColor = 'var(--neon-green)';
                document.querySelector('.status-badge').style.borderColor = 'var(--neon-green)';
                document.querySelector('.status-badge').style.color = 'var(--neon-green)';
                statusDot.style.animation = 'pulse 1.5s infinite';
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                
                if (data.type === 'video') {
                    videoEl.src = data.image;
                    frameCount++;
                    const now = Date.now();
                    if (now - lastFpsTime >= 1000) {
                        const fps = Math.round((frameCount * 1000) / (now - lastFpsTime));
                        streamInfo.innerText = `Frame Rate: ${fps} FPS`;
                        frameCount = 0;
                        lastFpsTime = now;
                    }
                } else if (data.type === 'audio') {
                    if (audioCtx && audioCtx.state === 'running') {
                        playPCM(data.audio);
                    }
                } else if (data.type === 'chat_reply_chunk') {
                    if (!activeTypingMessage) {
                        activeTypingMessage = document.createElement('div');
                        activeTypingMessage.classList.add('message', 'luna');
                        chatFeed.appendChild(activeTypingMessage);
                    }
                    activeTypingMessage.innerText += data.message;
                    chatFeed.scrollTop = chatFeed.scrollHeight;

                    if (data.end_of_speech) {
                        activeTypingMessage = null;
                    }
                } else if (data.type === 'chat_reply') {
                    const isSystem = data.user === 'System';
                    if (activeTypingMessage) {
                        activeTypingMessage.innerText = data.message;
                        activeTypingMessage = null;
                    } else {
                        // Prevent duplicate display
                        const lastMsg = chatFeed.lastElementChild;
                        if (!lastMsg || lastMsg.innerText !== data.message) {
                            appendMessage(data.user, data.message, isSystem);
                        }
                    }
                }
            };

            ws.onclose = () => {
                statusText.innerText = 'Disconnected';
                statusDot.style.backgroundColor = '#ef4444';
                document.querySelector('.status-badge').style.borderColor = '#ef4444';
                document.querySelector('.status-badge').style.color = '#ef4444';
                statusDot.style.animation = 'none';
                
                // Reset audio timing queue
                nextStartTime = 0;
                
                setTimeout(connect, 3000);
            };
        }

        function playPCM(base64Audio) {
            try {
                const binary = atob(base64Audio);
                const len = binary.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binary.charCodeAt(i);
                }
                
                const int16Data = new Int16Array(bytes.buffer);
                const numSamples = int16Data.length / 2; // Stereo samples
                
                if (numSamples === 0) return;
                
                const audioBuffer = audioCtx.createBuffer(2, numSamples, 48000);
                const leftChannel = audioBuffer.getChannelData(0);
                const rightChannel = audioBuffer.getChannelData(1);
                
                // De-interleave raw 16-bit PCM and normalize to Float32 [-1.0, 1.0]
                for (let i = 0; i < numSamples; i++) {
                    leftChannel[i] = int16Data[2 * i] / 32768.0;
                    rightChannel[i] = int16Data[2 * i + 1] / 32768.0;
                }
                
                const source = audioCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioCtx.destination);
                
                const currentTime = audioCtx.currentTime;
                
                // Play audio back-to-back using a start time scheduler queue
                if (nextStartTime < currentTime) {
                    nextStartTime = currentTime + 0.06; // 60ms initial buffer delay to prevent crackle gaps
                }
                
                source.start(nextStartTime);
                nextStartTime += audioBuffer.duration;
            } catch (e) {
                console.error("PCM playback error:", e);
            }
        }

        function appendMessage(sender, text, isSystem = false) {
            const msgDiv = document.createElement('div');
            msgDiv.classList.add('message');
            if (isSystem) {
                msgDiv.classList.add('system');
            } else {
                msgDiv.classList.add(sender === 'You' ? 'user' : 'luna');
            }
            msgDiv.innerText = text;
            chatFeed.appendChild(msgDiv);
            chatFeed.scrollTop = chatFeed.scrollHeight;
        }

        function sendMessage() {
            const text = inputEl.value.trim();
            if (!text) return;
            appendMessage('You', text);
            ws.send(JSON.stringify({ type: 'chat', message: text }));
            inputEl.value = '';
        }

        function sendAction(text) {
            appendMessage('You', text);
            ws.send(JSON.stringify({ type: 'chat', message: text }));
        }
    </script>
</body>
</html>"""
    return HTMLResponse(content=html_content)


@app.websocket("/ws/room")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket router managing connections, processing incoming client commands, and broadcasting frames."""
    await websocket.accept()
    logger.info("New WebSocket client connected.")

    session_manager = AvatarSession(websocket)
    try:
        # Start connection and frame stream task
        await session_manager.start()

        # Keep connection open and listen for chat messages
        while True:
            data = await websocket.receive_json()
            if data.get("type") == "chat":
                user_msg = data.get("message", "")
                logger.info(f"Received chat input: {user_msg}")
                # Handle command in session manager task
                await session_manager.handle_chat(user_msg)
            else:
                logger.warning(f"Unrecognized socket payload type: {data}")

    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected.")
    except Exception as e:
        logger.error(f"Unhandled exception in WebSocket handler: {e}")
    finally:
        await session_manager.close()


if __name__ == "__main__":
    import uvicorn
    # Execute uvicorn server directly if run
    uvicorn.run(app, host="127.0.0.1", port=8000)
