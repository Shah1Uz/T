"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Send, Image as ImageIcon, ArrowLeft, Mic, MicOff,
  Square, Play, Pause, X, Check, CheckCheck, Phone, PhoneOff, Video, Smile, Loader2, Trash2, VolumeX, Volume2,
  Heart, ThumbsUp, Laugh, Plus, MessageCircle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PusherClient } from "@/lib/pusher-client";
import { cn } from "@/lib/utils";
import { useLocale } from "@/context/locale-context";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

// ─── Voice recorder hook ────────────────────────────────────────────────────
function useVoiceRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [volume, setVolume] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true, 
          autoGainControl: true 
        } 
      });
      
      // Setup Analyser for Visualizer (Isolated)
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioCtxRef.current = audioCtx;
        
        if (audioCtx.state === "suspended") {
          await audioCtx.resume().catch(() => {});
        }

        console.log("AudioContext state:", audioCtx.state);
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.5;
        source.connect(analyser);
        analyserRef.current = analyser;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateVolume = () => {
          if (!analyserRef.current || !mediaRef.current || mediaRef.current.state !== "recording") return;
          analyserRef.current.getByteFrequencyData(dataArray);
          const sum = dataArray.reduce((acc, v) => acc + v, 0);
          const avg = (sum / bufferLength) * 2;
          setVolume(Math.min(100, avg));
          requestAnimationFrame(updateVolume);
        };
        updateVolume();
      } catch (visErr) {
        console.error("Visualizer Error (non-critical):", visErr);
      }

      // MediaRecorder setup
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")
          ? "audio/ogg;codecs=opus"
          : "";
      
      console.log("Starting recorder with mime:", mimeType || "default");
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => { 
        if (e.data.size > 0) chunksRef.current.push(e.data); 
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        console.log("Recorded blob:", blob.size, blob.type);
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') audioCtxRef.current.close().catch(() => {});
      };

      recorder.start(1000);
      setRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch (e) {
      console.error("Critical Mic error:", e);
      alert("Mikrofonni ishlatib bo'lmadi. Iltimos ruxsatlarni tekshiring.");
    }
  }, []);

  const stop = useCallback(() => {
    mediaRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const clear = useCallback(() => {
    setAudioBlob(null);
    setRecordingTime(0);
    setVolume(0);
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return { recording, audioBlob, recordingTime, formatTime, volume, start, stop, clear };
}

// ─── Audio player (Animated & Polished) ──────────────────────────────────────
function AudioPlayer({ url, duration: initialDuration, variant = "primary" }: { url: string; duration?: number; variant?: "primary" | "muted" }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setPlaying(!playing);
  };

  const isMuted = variant === "muted";

  return (
    <div className={cn(
      "flex flex-col gap-2 min-w-[220px] p-3 rounded-2xl backdrop-blur-md border shadow-xl",
      isMuted 
        ? "bg-muted/50 border-border/50" 
        : "bg-white/10 border-white/5"
    )}>
      <audio 
        ref={audioRef} 
        onPlay={() => { console.log("Audio Play Event"); setPlaying(true); }}
        onPause={() => { console.log("Audio Pause Event"); setPlaying(false); }}
        onTimeUpdate={(e) => {
          const ct = e.currentTarget.currentTime;
          const du = e.currentTarget.duration;
          if (isFinite(ct) && isFinite(du) && du > 0) {
            setProgress((ct / du) * 100);
          }
        }}
        onLoadedMetadata={(e) => {
          const du = e.currentTarget.duration;
          if (isFinite(du)) {
            console.log("Audio Metadata Loaded. Duration:", du);
            setDuration(du);
          }
        }}
        onError={(e) => {
          const error = (e.target as any).error;
          console.error("AUDIO_ERROR:", {
            code: error?.code,
            message: error?.message,
            url: url
          });
        }}
        onEnded={() => { setPlaying(false); setProgress(0); }}
        className="hidden"
        preload="metadata"
      >
        <source src={url} type="audio/webm" />
        <source src={url} type="audio/mpeg" />
        <source src={url} />
      </audio>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={toggle} 
          className={cn(
            "h-11 w-11 flex items-center justify-center rounded-full transition-all shrink-0 shadow-lg group",
            isMuted ? "bg-primary text-white" : "bg-white text-primary"
          )}
        >
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
        </button>
        
        <div className="flex-1 flex items-center gap-1 h-7">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                "w-1 rounded-full",
                isMuted ? "bg-primary/30" : "bg-white/40"
              )}
              initial={{ height: "15%" }}
              animate={{ 
                height: playing ? ["15%", "90%", "30%", "100%", "15%"] : "15%",
                backgroundColor: playing 
                  ? (isMuted ? "rgb(59, 130, 246)" : "rgb(255, 255, 255)") 
                  : (isMuted ? "rgb(59, 130, 246, 0.3)" : "rgb(255, 255, 255, 0.4)")
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 0.7 + (i % 3) * 0.2,
                delay: i * 0.04 
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="flex items-center justify-between gap-2 px-1">
        <div className={cn("flex-1 h-1 rounded-full overflow-hidden relative", isMuted ? "bg-primary/10" : "bg-white/20")}>
          <motion.div 
            className={cn("absolute left-0 top-0 h-full rounded-full", isMuted ? "bg-primary" : "bg-white shadow-[0_0_8px_white]")}
            animate={{ width: `${isFinite(progress) ? progress : 0}%` }}
            transition={{ ease: "linear", duration: 0.1 }}
          />
        </div>
        <span className={cn("text-[9px] font-mono min-w-[30px]", isMuted ? "text-muted-foreground" : "text-white/70")}>
          {isFinite(duration) && duration > 0 
            ? `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}` 
            : "0:00"}
        </span>
      </div>
    </div>
  );
}

// ─── Video recorder hook ────────────────────────────────────────────────────
function useVideoRecorder() {
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: { width: { ideal: 480 }, height: { ideal: 480 }, facingMode: "user" } 
      });
      setVideoStream(stream);
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => { 
        if (e.data.size > 0) chunksRef.current.push(e.data); 
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setVideoBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
        setVideoStream(null);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recorder.start(1000);
      setRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch (e) {
      alert("Kamera yoki mikrofon ruxsati berilmadi");
    }
  }, []);

  const stop = useCallback(() => {
    mediaRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const clear = useCallback(() => {
    setVideoBlob(null);
    setVideoStream(null);
    setRecordingTime(0);
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return { recording, videoBlob, videoStream, recordingTime, formatTime, start, stop, clear };
}

// ─── Circular Video Player ───────────────────────────────────────────────────
function CircularVideoPlayer({ url }: { url: string }) {
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setMuted(videoRef.current.muted);
    }
  };

  return (
    <div 
      className="relative w-56 h-56 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl bg-black cursor-pointer group shrink-0 mb-1"
      onClick={toggleMute}
    >
      <video 
        ref={videoRef}
        src={url} 
        autoPlay 
        loop 
        muted={muted}
        playsInline 
        className="w-full h-full object-cover" 
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
        <div className="bg-black/40 backdrop-blur-sm p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-90 group-hover:scale-100">
          {muted ? <VolumeX className="h-6 w-6 text-white" /> : <Volume2 className="h-6 w-6 text-white" />}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function MessageArea({ chat, currentUserId }: { chat: any; currentUserId: string }) {
  const { t, locale } = useLocale();
  const [messages, setMessages] = useState(chat.messages || []);
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [imagePreview, setImagePreview] = useState<{ file: File; url: string } | null>(null);
  const [otherUserStatus, setOtherUserStatus] = useState<any>(null);
  const [activeReactionPicker, setActiveReactionPicker] = useState<string | null>(null);
  const [showFullPickerFor, setShowFullPickerFor] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const voice = useVoiceRecorder();
  const video = useVideoRecorder();

  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (video.videoStream && videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = video.videoStream;
    }
  }, [video.videoStream]);

  const otherParticipant = chat.participants?.find((p: any) => p.userId !== currentUserId);
  const otherUser = otherParticipant?.user;
  const otherName = otherUser?.name || (locale === "uz" ? "Foydalanuvchi" : "Пользователь");

  useEffect(() => {
    setMessages(chat.messages || []);
  }, [chat.messages]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Presence Pulse Heartbeat
  useEffect(() => {
    const ping = () => fetch("/api/user/ping", { method: "POST" }).catch(() => {});
    ping();
    const interval = setInterval(ping, 30000); // 30s
    return () => clearInterval(interval);
  }, []);

  // Update Other User Status
  useEffect(() => {
    if (!otherUser?.id) return;
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/user/${otherUser.id}/status`);
        if (!res.ok) return;
        const text = await res.text();
        if (!text) return;
        const data = JSON.parse(text);
        setOtherUserStatus(data.lastActive);
      } catch (e) {}
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [otherUser?.id]);

  const getStatus = (lastActive: any) => {
    if (!lastActive) return null;
    const date = new Date(lastActive);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 border-none h-4 px-1.5 text-[9px] font-black uppercase tracking-wider">Online</Badge>;
    
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let dateStr = "";
    if (isToday) {
      dateStr = locale === "uz" ? `bugun ${timeStr}` : `segodnya ${timeStr}`;
    } else if (isYesterday) {
      dateStr = locale === "uz" ? `kecha ${timeStr}` : `vchera ${timeStr}`;
    } else {
      const uzMonths = ['yan', 'fev', 'mar', 'apr', 'may', 'iun', 'iul', 'avg', 'sen', 'okt', 'noy', 'dek'];
      const ruMonths = ['yan', 'fev', 'mar', 'apr', 'may', 'iun', 'iul', 'avg', 'sen', 'okt', 'noy', 'dek'];
      const monthIdx = date.getMonth();
      const month = locale === "uz" ? uzMonths[monthIdx] : ruMonths[monthIdx];
      dateStr = `${date.getDate()}-${month} ${timeStr}`;
    }

    return <span className="text-muted-foreground text-[10px]">
      {locale === "uz" ? `Oxirgi marta: ${dateStr}` : `Был(а) в: ${dateStr}`}
    </span>;
  };
  useEffect(() => {
    const ch = PusherClient.subscribe(`chat-${chat.id}`);
    ch.bind("new-message", (msg: any) => setMessages((prev: any[]) => {
      if (prev.find((m: any) => m.id === msg.id)) return prev;
      
      // Play sound if message is from another user
      if (msg.senderId !== currentUserId) {
        const audio = new Audio("https://www.myinstants.com/media/sounds/notification_o14egLP.mp3");
        audio.volume = 0.5;
        audio.play().catch(() => {});
      }

      return [...prev, msg];
    }));

    ch.bind("delete-message", ({ messageId }: { messageId: string }) => {
      setMessages((prev: any[]) => prev.filter((m: any) => m.id !== messageId));
    });

    ch.bind("messages-seen", ({ userId }: { userId: string }) => {
      if (userId !== currentUserId) {
        setMessages((prev: any[]) => prev.map((m: any) => 
          m.senderId === currentUserId ? { ...m, seen: true } : m
        ));
      }
    });

    ch.bind("message-reaction", ({ messageId, reaction, userId, emoji, action }: any) => {
      setMessages((prev: any[]) => prev.map((m: any) => {
        if (m.id !== messageId) return m;
        
        const currentReactions = m.reactions || [];
        if (action === "added") {
          const filtered = currentReactions.filter((r: any) => !(r.userId === userId && r.emoji === emoji));
          return { ...m, reactions: [...filtered, reaction] };
        } else {
          return { ...m, reactions: currentReactions.filter((r: any) => !(r.userId === userId && r.emoji === emoji)) };
        }
      }));
    });

    return () => { 
      PusherClient.unsubscribe(`chat-${chat.id}`); 
    };
  }, [chat.id, currentUserId]);

  useEffect(() => {
    const markAsSeen = async () => {
      try {
        await fetch(`/api/chat/${chat.id}/seen`, { method: "POST" });
      } catch (e) {}
    };

    markAsSeen();
  }, [chat.id, messages.length]);

  const sendMessage = async (opts: { text?: string; audio?: Blob; audioDuration?: number; image?: File; video?: Blob }) => {
    setIsSending(true);
    try {
      const fd = new FormData();
      if (opts.text) fd.append("text", opts.text);
      if (opts.audio) {
        fd.append("audio", new File([opts.audio], "voice.webm", { type: "audio/webm" }));
        if (opts.audioDuration) fd.append("audioDuration", opts.audioDuration.toString());
      }
      if (opts.image) fd.append("image", opts.image);
      if (opts.video) fd.append("video", new File([opts.video], "video.webm", { type: "video/webm" }));

      const res = await fetch(`/api/chat/${chat.id}/messages`, { method: "POST", body: fd });
      if (res.ok) {
        const newMessage = await res.json();
        setMessages((prev: any[]) => {
          // Prevent duplicates if Pusher also triggers
          if (prev.find(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
        setText("");
        setImagePreview(null);
        voice.clear();
        video.clear();
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleSendText = () => {
    if (!text.trim() && !imagePreview) return;
    sendMessage({ text: text.trim(), image: imagePreview?.file });
  };

  const handleSendVoice = () => {
    if (!voice.audioBlob) return;
    sendMessage({ audio: voice.audioBlob, audioDuration: voice.recordingTime });
  };

  const handleSendVideo = () => {
    if (!video.videoBlob) return;
    sendMessage({ video: video.videoBlob });
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const res = await fetch(`/api/chat/${chat.id}/messages/${messageId}`, { method: "DELETE" });
      if (res.ok) {
        setMessages((prev: any[]) => prev.filter((m: any) => m.id !== messageId));
      } else {
        const data = await res.json();
        alert(data.error || "Xabarni o'chirishda xatolik yuz berdi");
      }
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      const res = await fetch(`/api/chat/${chat.id}/messages/${messageId}/reaction`, { 
        method: "POST", 
        body: JSON.stringify({ emoji }) 
      });
      if (res.ok) {
        setActiveReactionPicker(null);
        setShowFullPickerFor(null);
      }
    } catch (e) {
      console.error("Reaction failed:", e);
    }
  };

  const quickEmojis = ["👍", "❤️", "😂", "😮", "😢", "🙏"];


  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview({ file, url: URL.createObjectURL(file) });
  };

  return (
    <>
      {/* Header */}
      <div className="px-4 py-3 border-b bg-card flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" asChild className="md:hidden shrink-0 -ml-1 h-9 w-9 rounded-xl">
            <Link href="/chat"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <Link href={`/profile/${otherUser?.id}`} className="flex items-center gap-3 min-w-0 hover:bg-muted/50 p-1.5 rounded-2xl transition-all group/header active:scale-95">
            <Avatar className="h-10 w-10 border border-border shadow-sm group-hover/header:border-primary/30 transition-colors">
              <AvatarImage src={otherUser?.imageUrl || ""} alt={otherName} />
              <AvatarFallback className="bg-primary/5 text-primary font-black uppercase">
                {otherName.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex flex-col justify-center">
              <div className="font-bold text-foreground truncate flex items-center gap-1.5 leading-tight group-hover/header:text-primary transition-colors">
                <span className="truncate">{otherName}</span>
                {otherUser?.isVerified && (
                  <Badge variant="secondary" className="h-4 w-4 p-0 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 border-none shrink-0">
                    <Check className="h-2.5 w-2.5 text-white stroke-[4]" />
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 h-4">
                {getStatus(otherUserStatus || otherUser?.lastActive)}
              </div>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {/* Call features removed by user request */}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 hover:scrollbar-thumb-primary/40 bg-muted/30 dark:bg-transparent">
        <div className="max-w-4xl 3xl:max-w-6xl mx-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-20 text-muted-foreground opacity-50">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageCircle className="h-10 w-10" />
            </div>
            <p className="text-sm font-bold tracking-tight">{locale === "uz" ? "Hali xabarlar yo'q" : "Сообщений пока нет"}</p>
            <p className="text-xs font-medium mt-1">{locale === "uz" ? "Birinchi bo'lib yozing!" : "Напишите первым!"}</p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((msg: any) => {
            const isOwn = msg.senderId === currentUserId;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn("flex gap-2 group", isOwn ? "justify-end" : "justify-start")}
              >
                {!isOwn && (
                  <Avatar className="h-8 w-8 border border-border mt-1 shrink-0 bg-primary/10">
                    <AvatarImage src={otherUser?.imageUrl || ""} alt={otherName} />
                    <AvatarFallback className="text-primary font-bold text-[10px] uppercase">
                      {otherName.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className="relative group/msg max-w-[80%] sm:max-w-[70%]">
                  {isOwn && (
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-destructive/10"
                      title={locale === "uz" ? "O'chirish" : "Удалить"}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  
                  <div className={cn(
                    msg.videoUrl ? "flex flex-col relative" : "rounded-[24px] px-4 py-3 shadow-md overflow-hidden transition-all group-hover/msg:shadow-lg relative",
                    !msg.videoUrl && isOwn
                      ? "bg-gradient-to-br from-primary via-primary/95 to-blue-600 text-white rounded-br-none shadow-primary/20 border border-primary/10"
                      : (!msg.videoUrl ? "bg-card dark:bg-muted/50 border border-border/50 rounded-bl-none text-foreground shadow-sm" : "")
                  )}>
                    {/* Voice message */}
                    {msg.audioUrl && <AudioPlayer url={msg.audioUrl} duration={msg.audioDuration} variant={isOwn ? "primary" : "muted"} />}

                    {/* Image */}
                    {msg.imageUrl && (
                      <img 
                        src={msg.imageUrl} 
                        alt="img" 
                        className="rounded-xl max-w-full max-h-64 object-cover mb-1 cursor-pointer hover:opacity-90 transition-opacity" 
                        onClick={() => window.open(msg.imageUrl, '_blank')}
                      />
                    )}

                    {/* Video message */}
                    {msg.videoUrl && (
                      <CircularVideoPlayer url={msg.videoUrl} />
                    )}

                    {/* Text */}
                    {msg.text && !msg.audioUrl && !msg.videoUrl && (
                      <p className="break-words whitespace-pre-wrap leading-relaxed text-[15px]">{msg.text}</p>
                    )}

                    {/* Time + seen */}
                    <div className={cn("flex items-center gap-1 text-[10px] mt-1 opacity-70", isOwn ? "justify-end" : "justify-start")}>
                      <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      {isOwn && (msg.seen ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                    </div>
                  </div>

                  {/* Reactions Display */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className={cn("flex flex-wrap gap-1 mt-1", isOwn ? "justify-end" : "justify-start")}>
                      {Object.entries(
                        msg.reactions.reduce((acc: any, r: any) => {
                          acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([emoji, count]: any) => (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(msg.id, emoji)}
                          className={cn(
                            "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] border transition-colors",
                            msg.reactions.some((r: any) => r.userId === currentUserId && r.emoji === emoji)
                              ? "bg-primary/20 border-primary/40 text-primary"
                              : "bg-background border-border text-muted-foreground hover:bg-muted"
                          )}
                        >
                          <span>{emoji}</span>
                          {count > 1 && <span className="font-bold">{count}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Reaction Picker Trigger */}
                  <div className={cn(
                    "absolute top-0 opacity-0 group-hover/msg:opacity-100 transition-opacity",
                    isOwn ? "-left-10" : "-right-10"
                  )}>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-muted"
                        onClick={() => setActiveReactionPicker(activeReactionPicker === msg.id ? null : msg.id)}
                      >
                        <Smile className="h-4 w-4" />
                      </Button>

                      {/* Reaction Picker Bar */}
                      {activeReactionPicker === msg.id && (
                        <div className={cn(
                          "absolute bottom-full mb-2 z-[60] bg-card border border-border shadow-xl rounded-2xl p-1 flex items-center gap-1 animate-in fade-in zoom-in-95 duration-200",
                          isOwn ? "right-0" : "left-0"
                        )}>
                          {quickEmojis.map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => handleReaction(msg.id, emoji)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-xl text-xl transition-transform active:scale-125"
                            >
                              {emoji}
                            </button>
                          ))}
                          <button
                            onClick={() => {
                              setShowFullPickerFor(msg.id);
                              setActiveReactionPicker(null);
                            }}
                            className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-xl text-muted-foreground transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      )}

                      {/* Full Emoji Picker for Reactions */}
                      {showFullPickerFor === msg.id && (
                        <div className={cn(
                          "fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md sm:absolute sm:inset-auto sm:bottom-full sm:mb-2 sm:z-[70] sm:bg-transparent sm:backdrop-blur-none animate-in fade-in duration-200",
                          isOwn ? "sm:right-0" : "sm:left-0"
                        )} onClick={() => setShowFullPickerFor(null)}>
                          <div className="bg-card border border-border shadow-2xl rounded-[32px] overflow-hidden sm:rounded-2xl w-[90%] max-w-[350px] sm:w-[300px]" onClick={e => e.stopPropagation()}>
                            <EmojiPicker 
                              onEmojiClick={(e) => handleReaction(msg.id, e.emoji)}
                              width="100%"
                              height={450}
                              theme={document.documentElement.classList.contains('dark') ? 'dark' as any : 'light' as any}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
          <div ref={scrollRef} className="h-1" />
        </div>
      </div>

      {/* Video recording in progress */}
      {video.recording && (
        <div className="px-4 py-3 border-t bg-black/90 flex flex-col items-center gap-3">
          <div className="relative w-48 h-48 rounded-full overflow-hidden border-2 border-primary shadow-2xl">
            <video ref={videoPreviewRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-red-500/80 px-2.5 py-1 rounded-full text-[10px] font-bold text-white animate-pulse">
               <div className="h-1.5 w-1.5 rounded-full bg-white" /> REC {video.formatTime(video.recordingTime)}
            </div>
          </div>
          <Button size="sm" variant="destructive" onClick={video.stop} className="rounded-full h-12 w-12 p-0 shadow-lg">
            <Square className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Video preview before sending */}
      {video.videoBlob && !video.recording && (
        <div className="px-4 py-3 border-t bg-muted/40 flex flex-col items-center gap-3">
          <div className="pointer-events-none">
            <CircularVideoPlayer url={URL.createObjectURL(video.videoBlob)} />
          </div>
          <div className="flex gap-2 w-full justify-center">
            <Button variant="ghost" onClick={video.clear} className="rounded-xl h-10 px-6 text-muted-foreground">
              {locale === "uz" ? "Bekor qilish" : "Отмена"}
            </Button>
            <Button className="rounded-xl h-10 px-8 font-bold" onClick={handleSendVideo} disabled={isSending}>
              {isSending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              {locale === "uz" ? "Yuborish" : "Отправить"}
            </Button>
          </div>
        </div>
      )}

      {/* Voice recording in progress */}
      {voice.recording && (
        <div className="px-4 py-3 border-t bg-red-500/10 dark:bg-red-950/20 flex items-center gap-4">
          <div className="relative flex items-center justify-center h-10 w-10">
            <motion.div 
              className="absolute inset-0 bg-red-400/30 rounded-full"
              animate={{ scale: 1 + (voice.volume / 100) }}
              transition={{ duration: 0.1 }}
            />
            <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse relative z-10" />
          </div>
          
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-red-600 dark:text-red-400 text-sm font-bold">
              {locale === "uz" ? "Yozilmoqda" : "Запись"} {voice.formatTime(voice.recordingTime)}
            </span>
            <div className="flex items-center gap-0.5 h-3">
              {[...Array(20)].map((_, i) => (
                <motion.div 
                  key={i}
                  className="w-1 bg-red-400 rounded-full"
                  animate={{ 
                    height: Math.max(2, (voice.volume * (1 - Math.abs(i - 10) / 10)) / 2) + "%" 
                  }}
                  transition={{ duration: 0.1 }}
                />
              ))}
            </div>
          </div>

          <Button size="sm" variant="destructive" onClick={voice.stop} className="rounded-xl h-10 px-4 shadow-sm">
            <Square className="h-4 w-4 mr-2" />
            {locale === "uz" ? "To'xtatish" : "Стоп"}
          </Button>
        </div>
      )}

      {/* Voice preview */}
      {voice.audioBlob && !voice.recording && (
        <div className="px-4 py-3 border-t bg-muted/40 flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-3 py-2">
            <Mic className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-medium text-primary">{voice.formatTime(voice.recordingTime)}</span>
          </div>
          <Button size="icon" variant="ghost" onClick={voice.clear} className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive">
            <X className="h-4 w-4" />
          </Button>
          <Button size="sm" className="rounded-xl h-9 font-semibold" onClick={handleSendVoice} disabled={isSending}>
            <Send className="h-4 w-4 mr-1.5" />
            {locale === "uz" ? "Yuborish" : "Отправить"}
          </Button>
        </div>
      )}

      {/* Image preview */}
      {imagePreview && (
        <div className="px-4 pt-3 border-t bg-muted/30 flex items-center gap-3">
          <img src={imagePreview.url} alt="preview" className="h-16 w-16 rounded-xl object-cover border border-border" />
          <span className="text-sm text-muted-foreground flex-1 truncate">{imagePreview.file.name}</span>
          <Button size="icon" variant="ghost" onClick={() => setImagePreview(null)} className="h-9 w-9 rounded-xl">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Input area */}
      {!voice.recording && !voice.audioBlob && (
        <div className="relative px-4 py-4 border-t bg-card flex items-center gap-3">
          {showEmoji && (
            <div className="absolute bottom-[100%] left-4 mb-2 z-50 shadow-2xl rounded-2xl overflow-hidden border border-border">
               <EmojiPicker onEmojiClick={(e) => {
                 setText(t => t + e.emoji);
               }} />
            </div>
          )}

          <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageSelect} />

          {/* Left + Button */}
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-full border-2 border-border/60 text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 shrink-0 transition-all active:scale-90 shadow-sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus className="h-6 w-6" />
          </Button>

          {/* Main Input Field */}
          <div className="flex-1 relative flex items-center bg-muted/20 dark:bg-muted/10 rounded-full border-2 border-border/80 focus-within:border-primary/40 focus-within:bg-card transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 ml-1 rounded-full text-muted-foreground/60 hover:text-primary hover:bg-transparent shrink-0"
              onClick={() => setShowEmoji(!showEmoji)}
            >
              <Smile className="h-5 w-5" />
            </Button>

            <Input
              placeholder={t("chat.type_message") || "Send a message..."}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSendText())}
              className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] h-11 px-2"
            />

            <div className="flex items-center gap-1 pr-2">
              {text.trim() || imagePreview ? (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                  <Button 
                    size="icon" 
                    className="h-9 w-9 rounded-full shrink-0 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-90" 
                    disabled={isSending} 
                    onClick={handleSendText}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </motion.div>
              ) : (
                <div className="flex items-center gap-1">
                  {/* Waveform-like icon for voice */}
                  <Button
                    size="icon"
                    className="h-9 w-9 rounded-full shrink-0 text-muted-foreground/60 hover:text-primary hover:bg-primary/5 transition-all active:scale-95 group"
                    variant="ghost"
                    onClick={voice.start}
                  >
                    <div className="flex items-center gap-0.5">
                      <div className="w-[2px] h-3 bg-current rounded-full group-hover:animate-pulse" />
                      <div className="w-[2px] h-5 bg-current rounded-full group-hover:animate-bounce" />
                      <div className="w-[2px] h-2 bg-current rounded-full group-hover:animate-pulse" />
                      <div className="w-[2px] h-4 bg-current rounded-full group-hover:animate-bounce" />
                    </div>
                  </Button>
                  <Button
                    size="icon"
                    className="h-9 w-9 rounded-full shrink-0 text-muted-foreground/60 hover:text-primary hover:bg-primary/5 transition-all active:scale-95"
                    variant="ghost"
                    onClick={video.start}
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
