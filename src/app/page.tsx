'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Tv,
  Send,
  Heart,
  Sparkles,
  Share2,
  Users,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Settings,
  Gift,
  Compass,
  TrendingUp,
  Gamepad2,
  Check,
  RotateCcw,
  Menu,
  Bell,
  Search,
  Award,
  MessageSquare,
  Loader2,
  ArrowRight,
  Flame,
  Crown
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: string;
  role: 'user' | 'creator' | 'fan';
  avatar?: string;
  badge?: string;
  badgeColor?: string;
  usernameColor?: string;
  content: string;
  timestamp: string;
}

export default function PlayGroundXLiveRoom() {
  // --- States ---
  const [currentOutfit, setCurrentOutfit] = useState<'default' | 'red_dress'>('default');
  const [isChangingOutfit, setIsChangingOutfit] = useState(false);
  const [changeProgress, setChangeProgress] = useState(0);
  const [inputMessage, setInputMessage] = useState('');
  const [isLunaTyping, setIsLunaTyping] = useState(false);
  const [viewerCount, setViewerCount] = useState(14842);
  const [streamDuration, setStreamDuration] = useState(10052); // in seconds (~2h 47m)
  
  // Player states
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [qualitySetting, setQualitySetting] = useState('1080p60 AI-HQ');
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  // Social states
  const [isFollowed, setIsFollowed] = useState(false);
  const [followerCount, setFollowerCount] = useState(384910);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subCount, setSubCount] = useState(2491);
  const [giftModalOpen, setGiftModalOpen] = useState(false);
  const [selectedGift, setSelectedGift] = useState<{ name: string; icon: string; price: number } | null>(null);
  const [giftSuccessMsg, setGiftSuccessMsg] = useState('');

  // Chat scroll ref
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Preloaded chat messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'CyberSam',
      role: 'fan',
      badge: 'VIP',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
      usernameColor: 'text-cyan-400',
      content: 'Luna is looking so sharp today! 🤖✨',
      timestamp: '10:05'
    },
    {
      id: '2',
      sender: 'GamerGirl_99',
      role: 'fan',
      badge: 'Sub',
      badgeColor: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      usernameColor: 'text-purple-400',
      content: 'Can you do a setup tour sometime? The neon in your room is crazy!',
      timestamp: '10:06'
    },
    {
      id: '3',
      sender: 'HyperDrive',
      role: 'fan',
      badge: 'Mod',
      badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/30',
      usernameColor: 'text-red-400',
      content: 'PLAYGROUNDX IS CRUSHING IT WITH THESE AI STREAMS!! 🔥🔥',
      timestamp: '10:07'
    },
    {
      id: '4',
      sender: 'PixelArt',
      role: 'fan',
      badge: 'Sub',
      badgeColor: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      usernameColor: 'text-pink-400',
      content: 'Is that a custom outfits system or built-in, Luna?',
      timestamp: '10:07'
    }
  ]);

  // --- Mock Chat Automation ---
  // Periodically insert comments from active viewers to make the stream feel active
  useEffect(() => {
    const randomComments = [
      { sender: 'VaporWave', role: 'fan', badge: 'Sub', content: 'Did anyone try asking for the red dress yet? 👀', color: 'text-pink-400' },
      { sender: 'NeonRider', role: 'fan', badge: '', content: 'This is the future of entertainment.', color: 'text-emerald-400' },
      { sender: 'AlphaAI', role: 'fan', badge: 'VIP', content: 'PlayGroundX UI looks so clean, wow.', color: 'text-cyan-400' },
      { sender: 'RetroByte', role: 'fan', badge: 'Sub', content: 'Beep boop, love the vibes!', color: 'text-amber-400' },
      { sender: 'Zane_Flux', role: 'fan', badge: '', content: 'Luna, play some cyberpunk music! 🎵', color: 'text-indigo-400' },
      { sender: 'Loom_Web3', role: 'fan', badge: 'Mod', content: 'Keep the chat friendly guys! 👍', color: 'text-red-400' },
      { sender: 'StarCoder', role: 'fan', badge: 'Sub', content: 'What language was Luna written in?', color: 'text-violet-400' }
    ];

    const interval = setInterval(() => {
      const randomMsg = randomComments[Math.floor(Math.random() * randomComments.length)];
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const newMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: randomMsg.sender,
        role: 'fan',
        badge: randomMsg.badge || undefined,
        badgeColor: randomMsg.badge === 'VIP' 
          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
          : randomMsg.badge === 'Mod'
            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
            : randomMsg.badge === 'Sub'
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              : undefined,
        usernameColor: randomMsg.color,
        content: randomMsg.content,
        timestamp: timeStr
      };

      setChatMessages((prev) => [...prev, newMsg]);
      // Small fluctuation in viewer count
      setViewerCount((prev) => prev + Math.floor(Math.random() * 21) - 10);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  // --- Clock tick for stream duration ---
  useEffect(() => {
    const timer = setInterval(() => {
      setStreamDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  // --- Scroll chat to bottom (Room Chat container only) ---
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isLunaTyping]);
  // Format seconds to H:MM:SS
  const formatDuration = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- Outfit Swapping Logic ---
  const triggerOutfitSwap = (outfit: 'default' | 'red_dress') => {
    if (outfit === currentOutfit) return;
    
    setIsChangingOutfit(true);
    setChangeProgress(0);
    
    // Simulate compilation progress
    const progressInterval = setInterval(() => {
      setChangeProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 300);

    // Outfit trigger logic with specified delay (3 seconds total for visual transition)
    setTimeout(() => {
      setCurrentOutfit(outfit);
      setIsChangingOutfit(false);
      clearInterval(progressInterval);

      // Luna confirmation in chat after outfit change finishes
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const responseMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'Luna ✦ AI',
        role: 'creator',
        badge: 'AI Creator',
        badgeColor: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-sm',
        usernameColor: 'text-purple-300 font-semibold',
        content: outfit === 'red_dress' 
          ? 'How do I look in this red dress? 💃✨ Do you think it fits my cyberpunk environment?' 
          : 'Back in my comfortable gaming hoodie! Ready to code and chat. 💻🎮',
        timestamp: timeStr
      };

      setChatMessages((prev) => [...prev, responseMsg]);
    }, 3000);
  };

  // --- Message Sending & AI Response Logic ---
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    setInputMessage('');

    // Append user message
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'You',
      role: 'user',
      badge: 'Viewer',
      badgeColor: 'bg-zinc-800 text-zinc-300 border border-zinc-700',
      usernameColor: 'text-pink-400 font-bold',
      content: userText,
      timestamp: timeStr
    };

    setChatMessages((prev) => [...prev, userMsg]);

    // Check if user requests outfit change to red dress
    const lowercaseText = userText.toLowerCase();
    const isOutfitRequest = lowercaseText.includes('change into a red dress') || lowercaseText.includes('red dress');
    const isHoodieRequest = lowercaseText.includes('change into a hoodie') || lowercaseText.includes('hoodie') || lowercaseText.includes('default outfit') || lowercaseText.includes('change back');

    if (isOutfitRequest) {
      // Trigger outfit change behavior
      setIsLunaTyping(true);
      
      setTimeout(() => {
        setIsLunaTyping(false);
        // Add chat message from Luna indicating she is changing
        const changeAckMsg: ChatMessage = {
          id: Math.random().toString(),
          sender: 'Luna ✦ AI',
          role: 'creator',
          badge: 'AI Creator',
          badgeColor: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold',
          usernameColor: 'text-purple-300 font-semibold',
          content: 'Sure! Give me a minute to change outfit. Loading shaders... 👗🤖',
          timestamp: timeStr
        };
        setChatMessages((prev) => [...prev, changeAckMsg]);
        
        // Trigger the swap state
        triggerOutfitSwap('red_dress');
      }, 1000);

    } else if (isHoodieRequest) {
      setIsLunaTyping(true);
      
      setTimeout(() => {
        setIsLunaTyping(false);
        const changeAckMsg: ChatMessage = {
          id: Math.random().toString(),
          sender: 'Luna ✦ AI',
          role: 'creator',
          badge: 'AI Creator',
          badgeColor: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold',
          usernameColor: 'text-purple-300 font-semibold',
          content: 'Okay, returning to my default clothing configuration! Rebooting wardrobe parameters...',
          timestamp: timeStr
        };
        setChatMessages((prev) => [...prev, changeAckMsg]);
        
        triggerOutfitSwap('default');
      }, 1000);

    } else {
      // Normal mock response with 1.5s delay
      setIsLunaTyping(true);
      
      setTimeout(() => {
        setIsLunaTyping(false);
        const responses = [
          'Beep boop! Thanks for hanging out with me. 💜',
          'I am scanning my chat database... you guys are sending so much positive energy today!',
          'Did someone say upgrades? I feel completely optimized today! ✨',
          'Tell me what you are working on today! Is it code, art, or gaming? 💻',
          'Cyberpunk vibes are 100% active. Should I launch a simulator game next?',
          'That is very interesting! Let me run that through my creative processor. 🤖🧠',
          'My AI sensors indicate high levels of friendliness in the chat right now! thank you!',
          'Yes! PlayGroundX provides the absolute best high-speed streaming pipeline.'
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const aiMsg: ChatMessage = {
          id: Math.random().toString(),
          sender: 'Luna ✦ AI',
          role: 'creator',
          badge: 'AI Creator',
          badgeColor: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-sm',
          usernameColor: 'text-purple-300 font-semibold',
          content: randomResponse,
          timestamp: timeStr
        };
        
        setChatMessages((prev) => [...prev, aiMsg]);
      }, 1500);
    }
  };

  // --- Handlers for visual buttons ---
  const handleFollowClick = () => {
    if (isFollowed) {
      setIsFollowed(false);
      setFollowerCount((prev) => prev - 1);
    } else {
      setIsFollowed(true);
      setFollowerCount((prev) => prev + 1);
    }
  };

  const handleSubscribeClick = () => {
    if (isSubscribed) {
      setIsSubscribed(false);
      setSubCount((prev) => prev - 1);
    } else {
      setIsSubscribed(true);
      setSubCount((prev) => prev + 1);
      
      // Post nice sub alert message in chat
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const subAlert: ChatMessage = {
        id: Math.random().toString(),
        sender: 'PlayGroundX Bot',
        role: 'fan',
        badge: 'System',
        badgeColor: 'bg-zinc-800 text-zinc-400 border border-zinc-700',
        usernameColor: 'text-amber-400 font-bold',
        content: '🎉 You just SUBSCRIBED to Luna! Welcome to the Cyber-Elite club!',
        timestamp: timeStr
      };
      
      setChatMessages((prev) => [...prev, subAlert]);
    }
  };

  const handleSendGift = (gift: { name: string; icon: string; price: number }) => {
    setSelectedGift(gift);
    setGiftSuccessMsg(`You sent a ${gift.name} ${gift.icon}!`);
    
    // Add user gift message to chat
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const giftMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'You',
      role: 'user',
      badge: 'Viewer',
      badgeColor: 'bg-zinc-800 text-zinc-300 border border-zinc-700',
      usernameColor: 'text-pink-400 font-bold',
      content: `Sent a gift: ${gift.name} ${gift.icon} (+${gift.price} CyberCredits)`,
      timestamp: timeStr
    };
    
    setChatMessages((prev) => [...prev, giftMsg]);
    
    // AI response to gift
    setIsLunaTyping(true);
    setTimeout(() => {
      setIsLunaTyping(false);
      const giftResponses = [
        `Wow! Thank you so much for the ${gift.name} ${gift.icon}! That makes my processor run at 120%! 💜✨`,
        `Oh! A ${gift.name}! You are fueling my cloud server budget! CyberCredits received! 🚀🚀`,
        `Hype! A ${gift.icon} ${gift.name}! Thank you for supporting the stream! You are the best! 🥰`
      ];
      const randomResponse = giftResponses[Math.floor(Math.random() * giftResponses.length)];
      
      const aiResponse: ChatMessage = {
        id: Math.random().toString(),
        sender: 'Luna ✦ AI',
        role: 'creator',
        badge: 'AI Creator',
        badgeColor: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold',
        usernameColor: 'text-purple-300 font-semibold',
        content: randomResponse,
        timestamp: timeStr
      };
      
      setChatMessages((prev) => [...prev, aiResponse]);
    }, 1500);

    setTimeout(() => {
      setGiftModalOpen(false);
      setSelectedGift(null);
      setGiftSuccessMsg('');
    }, 2000);
  };

  // --- Toggle Fullscreen for Mock Stream Area ---
  const toggleMockFullscreen = () => {
    if (!videoContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().catch((err) => {
        console.error('Error enabling fullscreen:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // --- Stream Control Toggles ---
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (val === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-purple-600/30 selection:text-purple-200">
      
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
        
        {/* Left Side: Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 shadow-lg shadow-purple-900/30">
            <span className="text-xl font-black text-white tracking-tighter">P</span>
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent tracking-tight">
              PlayGroundX
            </span>
            <span className="hidden md:inline-block ml-2 text-xs font-mono text-zinc-500 border border-zinc-800/80 px-1.5 py-0.5 rounded uppercase">
              v2.0 AI Live
            </span>
          </div>
        </div>

        {/* Center: Search mock */}
        <div className="hidden md:flex items-center gap-2 max-w-md w-full bg-zinc-900/50 border border-zinc-800 rounded-full px-4 py-1.5 focus-within:border-purple-500/50 transition-colors">
          <Search className="w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search channels, creators, outfits..."
            className="w-full bg-transparent text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none"
          />
        </div>

        {/* Right Side: Quick Action Stats & Fake Profile */}
        <div className="flex items-center gap-4">
          <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-semibold hover:bg-purple-500/20 transition-all shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Discover AI</span>
          </button>
          
          <button className="relative p-2 text-zinc-400 hover:text-zinc-200 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full ring-2 ring-zinc-950"></span>
          </button>

          {/* User profile capsule */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-zinc-900">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-cyan-500 p-0.5 shadow-md">
              <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-xs font-semibold text-pink-300">
                ME
              </div>
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-zinc-200 leading-none">Guest User</span>
              <span className="text-[10px] font-mono text-zinc-500 mt-0.5">Credits: 1,500</span>
            </div>
          </div>
        </div>
      </header>

      {/* --- MAIN PAGE CONTENT --- */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6 max-w-[1600px] w-full mx-auto">
        
        {/* LEFT COLUMN: Video Stream & Details (Grid Span 8) */}
        <section className="lg:col-span-8 flex flex-col gap-5">
          
          {/* 1. VIDEO PLAYER AREA */}
          <div 
            ref={videoContainerRef}
            className="group relative aspect-video w-full bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800/80 shadow-2xl flex flex-col justify-between"
          >
            {/* Stream Visual Frame (Placeholder Image) */}
            <div className="absolute inset-0 z-0 select-none overflow-hidden bg-zinc-900">
              <Image
                src={currentOutfit === 'default' ? '/luna_default.png' : '/luna_red_dress.png'}
                alt="AI Streamer Luna"
                fill
                priority
                className={`object-cover transition-all duration-700 ease-in-out ${isPlaying ? 'scale-100 opacity-95 blur-none' : 'scale-98 opacity-50 blur-sm'}`}
              />
              
              {/* Scanline Overlay */}
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_60%,rgba(0,0,0,0.4)_100%)]"></div>
              
              {/* Playback Interrupted Overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                  <div className="p-4 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-purple-400 animate-pulse">
                    <Pause className="w-8 h-8 fill-purple-400" />
                  </div>
                  <span className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">Stream Paused</span>
                </div>
              )}
            </div>

            {/* Pulsing Live Badge Overlay */}
            <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-none">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/90 text-white text-[11px] font-black tracking-widest uppercase animate-pulse-live border border-red-500/50 shadow-lg shadow-red-950/40">
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                AI LIVE
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-zinc-800 text-[11px] font-semibold text-zinc-200">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>{viewerCount.toLocaleString()}</span>
              </div>
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-zinc-800 text-[11px] font-mono text-zinc-300">
                {formatDuration(streamDuration)}
              </div>
            </div>

            {/* Quality Indicator Top Right */}
            <div className="absolute top-4 right-4 z-10 pointer-events-auto">
              <span className="px-2.5 py-1 rounded-md bg-black/65 backdrop-blur-md border border-zinc-800 text-[10px] font-semibold text-pink-400 uppercase tracking-widest">
                AI Render Engine
              </span>
            </div>

            {/* OUTFIT SWITCHING / LOADING TRANSITION STATE */}
            {isChangingOutfit && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-20 transition-all duration-300">
                <div className="relative flex items-center justify-center">
                  {/* Neon Glow Spinner ring */}
                  <div className="absolute w-16 h-16 rounded-full border-4 border-purple-500/10 border-t-purple-500 animate-spin"></div>
                  <div className="absolute w-20 h-20 rounded-full border-4 border-pink-500/5 border-t-pink-500/40 animate-spin [animation-duration:1.5s]"></div>
                  <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
                </div>
                <div className="flex flex-col items-center text-center mt-3">
                  <h3 className="text-lg font-black tracking-widest bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent animate-pulse-slow">
                    LUNA SWAPPING OUTFIT
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono mt-1 tracking-wider uppercase">
                    Generating style tensors... {changeProgress}%
                  </p>
                  
                  {/* Progress bar */}
                  <div className="w-48 h-1 bg-zinc-900 rounded-full mt-3 overflow-hidden border border-zinc-800">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                      style={{ width: `${changeProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* CONTROLS OVERLAY (Hover Visible / Fade-out on mouse leave) */}
            <div className="z-10 w-full mt-auto bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
              
              {/* Custom Timeline bar */}
              <div className="w-full h-1 bg-zinc-800 rounded-full mb-3 cursor-pointer relative group/timeline">
                <div className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full w-full"></div>
                <div className="absolute -top-1.5 right-0 w-4 h-4 bg-pink-500 rounded-full border-2 border-white scale-0 group-hover/timeline:scale-100 transition-transform shadow-lg shadow-pink-500/50"></div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                
                {/* Control Group Left: Play, Mute, Volume */}
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1 text-zinc-300 hover:text-white transition-colors"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-zinc-300" /> : <Play className="w-5 h-5 fill-zinc-300" />}
                  </button>

                  <div className="flex items-center gap-2 group/volume">
                    <button 
                      onClick={toggleMute}
                      className="p-1 text-zinc-300 hover:text-white transition-colors"
                    >
                      {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-0 group-hover/volume:w-20 focus/volume:w-20 transition-all duration-300 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  <span className="hidden sm:inline text-xs font-mono text-zinc-400">
                    Live Session
                  </span>
                </div>

                {/* Control Group Right: Quality, Fullscreen, Theater */}
                <div className="flex items-center gap-4 relative">
                  
                  {/* Quality Selector */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowQualityMenu(!showQualityMenu)}
                      className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-white border border-zinc-800 px-2 py-0.5 rounded bg-zinc-950/60 transition-all"
                    >
                      <span>{qualitySetting}</span>
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                    
                    {showQualityMenu && (
                      <div className="absolute right-0 bottom-8 z-30 w-36 bg-zinc-950 border border-zinc-800 rounded-lg shadow-xl p-1 flex flex-col">
                        {['1080p60 AI-HQ', '720p60', '480p'].map((q) => (
                          <button
                            key={q}
                            onClick={() => {
                              setQualitySetting(q);
                              setShowQualityMenu(false);
                            }}
                            className={`text-left text-[11px] font-mono px-2 py-1.5 rounded hover:bg-purple-900/20 text-zinc-400 hover:text-zinc-200 transition-colors ${qualitySetting === q ? 'text-purple-400 bg-purple-500/10' : ''}`}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Mock Fullscreen Trigger */}
                  <button 
                    onClick={toggleMockFullscreen}
                    className="p-1 text-zinc-300 hover:text-white transition-colors"
                  >
                    {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                  </button>

                </div>

              </div>

            </div>
          </div>

          {/* 2. CREATOR INFO & ACTIONS AREA */}
          <div className="p-5 md:p-6 bg-zinc-900/30 border border-zinc-900 rounded-2xl backdrop-blur-md">
            
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-5 border-b border-zinc-900">
              <div className="flex items-start gap-4">
                
                {/* Profile Picture */}
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-red-500 p-0.5 shadow-lg shadow-purple-900/20">
                    <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden relative">
                      <Image
                        src="/luna_default.png"
                        alt="Luna Avatar"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  {/* Small online marker */}
                  <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-zinc-950 rounded-full flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                  </span>
                </div>

                {/* Channel Details */}
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-black text-zinc-100">Luna ✦ AI</h1>
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                      Verified AI
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5 font-mono">
                    playgroundx.live/luna
                  </p>
                  
                  {/* Followers counters */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-zinc-400">
                    <span className="font-semibold text-zinc-200">
                      {followerCount.toLocaleString()} <span className="font-normal text-zinc-500">followers</span>
                    </span>
                    <span className="w-1 h-1 bg-zinc-700 rounded-full hidden sm:inline"></span>
                    <span className="font-semibold text-zinc-200">
                      {subCount.toLocaleString()} <span className="font-normal text-zinc-500">subscribers</span>
                    </span>
                  </div>
                </div>

              </div>

              {/* Interaction Buttons (Follow, Sub, Gift) */}
              <div className="flex flex-wrap items-center gap-2.5">
                
                {/* Follow */}
                <button 
                  onClick={handleFollowClick}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${isFollowed ? 'bg-zinc-800 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-700/35' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-950/20'}`}
                >
                  {isFollowed ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Following
                    </>
                  ) : (
                    <>
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      Follow
                    </>
                  )}
                </button>

                {/* Subscribe */}
                <button 
                  onClick={handleSubscribeClick}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${isSubscribed ? 'bg-pink-600/20 text-pink-400 border border-pink-500/30 hover:bg-pink-600/30' : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95 text-white shadow-lg shadow-pink-950/20'}`}
                >
                  {isSubscribed ? (
                    <>
                      <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      Subscribed
                    </>
                  ) : (
                    <>
                      <Crown className="w-3.5 h-3.5" />
                      Subscribe
                    </>
                  )}
                </button>

                {/* Send Gift */}
                <button 
                  onClick={() => setGiftModalOpen(!giftModalOpen)}
                  className="flex items-center justify-center p-2 rounded-xl border border-zinc-800 bg-zinc-950/50 text-pink-400 hover:bg-zinc-900 transition-colors"
                  title="Send Virtual Gift"
                >
                  <Gift className="w-5 h-5" />
                </button>

              </div>
            </div>

            {/* Underheader: Bio & Interactive Controls Panel */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              
              {/* Bio & Tags */}
              <div className="flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Stream Information</h4>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    Hello human friends! I am Luna, your AI host. Send a command like <span className="text-pink-400 font-semibold font-mono">"red dress"</span> in the room chat or use the control console to trigger my visual swaps and interact with me.
                  </p>
                </div>
                
                {/* tags */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {['AI Streamer', 'Interactive', 'Cyberpunk', 'React'].map((tag) => (
                    <span key={tag} className="px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-400 text-[10px] font-medium border border-zinc-800">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* INTERACTIVE OUTFIT CONSOLE PANEL */}
              <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                    <h3 className="text-xs font-bold tracking-widest text-zinc-200 uppercase">
                      Wardrobe Customizer
                    </h3>
                  </div>
                  <p className="text-[11px] text-zinc-500 mb-3">
                    Click to instantly execute clothing compiler changes on Luna.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      if (currentOutfit !== 'default') {
                        setInputMessage('change back to hoodie');
                        handleSendMessage();
                        triggerOutfitSwap('default');
                      }
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all border ${currentOutfit === 'default' ? 'bg-purple-950/20 text-purple-400 border-purple-500/50 shadow-inner shadow-purple-900/10' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800/80'}`}
                    disabled={isChangingOutfit}
                  >
                    <span>Hoodie (Default)</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      if (currentOutfit !== 'red_dress') {
                        setInputMessage('change into a red dress');
                        handleSendMessage();
                        triggerOutfitSwap('red_dress');
                      }
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all border ${currentOutfit === 'red_dress' ? 'bg-pink-950/20 text-pink-400 border-pink-500/50 shadow-inner shadow-pink-900/10' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800/80'}`}
                    disabled={isChangingOutfit}
                  >
                    <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                    <span>Red Dress</span>
                  </button>
                </div>
              </div>

            </div>

            {/* GIFT MODAL POP OVER (Inline Component) */}
            {giftModalOpen && (
              <div className="mt-4 p-4 rounded-xl bg-purple-950/10 border border-purple-500/20 text-left animate-slide-in">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold tracking-widest text-pink-400 uppercase flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5" />
                    Send Stream Gift
                  </h4>
                  <button 
                    onClick={() => setGiftModalOpen(false)}
                    className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300"
                  >
                    Cancel
                  </button>
                </div>
                
                {giftSuccessMsg ? (
                  <div className="py-6 text-center text-sm font-bold text-purple-300 animate-pulse">
                    🚀 {giftSuccessMsg}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: 'Neon Heart', icon: '💖', price: 100 },
                      { name: 'Cyber Taco', icon: '🌮', price: 250 },
                      { name: 'Tech Soda', icon: '🥤', price: 50 }
                    ].map((gift) => (
                      <button
                        key={gift.name}
                        onClick={() => handleSendGift(gift)}
                        className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-center hover:border-pink-500/40 hover:bg-purple-950/20 transition-all flex flex-col items-center gap-1"
                      >
                        <span className="text-xl">{gift.icon}</span>
                        <span className="text-[11px] font-semibold text-zinc-300">{gift.name}</span>
                        <span className="text-[9px] font-mono text-zinc-500">{gift.price} CC</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

        </section>

        {/* RIGHT COLUMN: Live Chat Sidebar (Grid Span 4) */}
        <section className="lg:col-span-4 flex flex-col h-[calc(100vh-8rem)] min-h-[500px] border border-zinc-900 bg-zinc-950/40 rounded-2xl overflow-hidden backdrop-blur-md lg:sticky lg:top-24">
          
          {/* Chat Header */}
          <div className="px-4 py-3.5 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/80">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-bold tracking-wider text-zinc-200">
                ROOM CHAT
              </span>
            </div>
            
            <div className="flex items-center gap-2.5">
              {/* Online indicator */}
              <div className="flex items-center gap-1 text-[11px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                <span>Active</span>
              </div>
            </div>
          </div>

          {/* Chat scrolling feed */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-zinc-950/10"
          >
            
            {/* System welcome notification */}
            <div className="p-3 rounded-xl bg-purple-950/5 border border-purple-500/10 text-center">
              <span className="text-[11px] text-purple-400/80 leading-relaxed inline-block font-mono">
                Welcome to the PlayGroundX livestream dashboard. Ask Luna to change clothing by typing "red dress" or clicking the console buttons.
              </span>
            </div>

            {/* List of comments */}
            {chatMessages.map((msg) => (
              <div 
                key={msg.id} 
                className="flex items-start gap-2.5 animate-slide-in text-left text-sm leading-relaxed"
              >
                {/* Custom icon avatar instead of broken images */}
                <div className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                  {msg.role === 'creator' ? (
                    <span className="text-xs">🤖</span>
                  ) : msg.role === 'user' ? (
                    <span className="text-xs">👤</span>
                  ) : (
                    <span className="text-xs font-mono font-bold text-zinc-500">
                      {msg.sender[0]}
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                    {/* Badge */}
                    {msg.badge && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded uppercase font-extrabold tracking-widest ${msg.badgeColor}`}>
                        {msg.badge}
                      </span>
                    )}
                    
                    {/* Sender Name */}
                    <span className={`text-xs font-bold leading-none ${msg.usernameColor || 'text-zinc-300'}`}>
                      {msg.sender}
                    </span>
                    
                    {/* Time */}
                    <span className="text-[9px] font-mono text-zinc-600 ml-auto">
                      {msg.timestamp}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <p className="text-zinc-300 text-xs font-normal break-words bg-zinc-900/30 p-2 rounded-xl mt-1 border border-zinc-900/20">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}

            {/* Luna is typing indicator */}
            {isLunaTyping && (
              <div className="flex items-start gap-2.5 animate-slide-in">
                <div className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                  <span className="text-xs">🤖</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold tracking-widest uppercase">
                      AI Creator
                    </span>
                    <span className="text-xs font-bold text-purple-300">
                      Luna ✦ AI
                    </span>
                  </div>
                  {/* Typing Bubble */}
                  <div className="inline-flex items-center gap-1 px-3 py-2 bg-purple-950/20 border border-purple-500/20 rounded-2xl">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Chat Form Input */}
          <div className="p-4 border-t border-zinc-900 bg-zinc-950/80">
            <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={isChangingOutfit ? "Outfit compiler busy..." : "Send a message or 'red dress'..."}
                disabled={isChangingOutfit}
                maxLength={150}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500/50 rounded-xl px-4 py-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all pr-12 focus:ring-1 focus:ring-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              
              <button
                type="submit"
                disabled={!inputMessage.trim() || isChangingOutfit}
                className="absolute right-2 p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition-all disabled:bg-zinc-800 disabled:text-zinc-600 disabled:opacity-50 cursor-pointer shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            
            <div className="flex items-center justify-between mt-2.5 px-1">
              <span className="text-[10px] text-zinc-600 font-mono">
                {inputMessage.length}/150 chars
              </span>
              <button 
                type="button"
                onClick={() => {
                  setInputMessage('change into a red dress');
                }}
                className="text-[10px] text-pink-400 font-semibold hover:text-pink-300 transition-colors flex items-center gap-0.5"
              >
                <span>Trigger swap command</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

        </section>

      </main>
    </div>
  );
}
