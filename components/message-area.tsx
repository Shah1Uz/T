"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Send, Image as ImageIcon, ArrowLeft, Mic, MicOff,
  Square, Play, Pause, X, Check, CheckCheck, Phone, PhoneOff, Video, Smile, Loader2, Trash2, VolumeX, Volume2,
  Heart, ThumbsUp, Laugh, Plus, MessageCircle, Home
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
  const [waveform, setWaveform] = useState<number[]>([]);
  const waveformRef = useRef<number[]>([]);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true, 
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1
        } 
      });
      
      let updateVolumeFn: () => void;

      // Setup Advanced Audio Processing Pipeline
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 48000 });
        audioCtxRef.current = audioCtx;
        
        if (audioCtx.state === "suspended") {
          await audioCtx.resume().catch(() => {});
        }

        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.5;
        analyserRef.current = analyser;

        // 1. High-pass filter (Removes low hum/rumble below 100Hz)
        const hpFilter = audioCtx.createBiquadFilter();
        hpFilter.type = "highpass";
        hpFilter.frequency.value = 100;

        // 2. Low-pass filter (Removes high hiss above 8kHz)
        const lpFilter = audioCtx.createBiquadFilter();
        lpFilter.type = "lowpass";
        lpFilter.frequency.value = 8000;

        // 3. Dynamics Compressor (Levels the voice)
        const compressor = audioCtx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-24, audioCtx.currentTime);
        compressor.knee.setValueAtTime(40, audioCtx.currentTime);
        compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
        compressor.attack.setValueAtTime(0, audioCtx.currentTime);
        compressor.release.setValueAtTime(0.25, audioCtx.currentTime);

        // 4. Output Destination for Recording
        const destination = audioCtx.createMediaStreamDestination();

        // Chain: Source -> HPF -> LPF -> Compressor -> Analyser & Destination
        source.connect(hpFilter);
        hpFilter.connect(lpFilter);
        lpFilter.connect(compressor);
        compressor.connect(analyser);
        compressor.connect(destination);

        const dataStream = destination.stream;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        updateVolumeFn = () => {
          if (!analyserRef.current || !mediaRef.current || mediaRef.current.state !== "recording") return;
          analyserRef.current.getByteFrequencyData(dataArray);
          const sum = dataArray.reduce((acc, v) => acc + v, 0);
          const avg = (sum / bufferLength) * 2;
          const currentVol = Math.min(100, avg);
          setVolume(currentVol);
          
          waveformRef.current.push(currentVol);
          if (waveformRef.current.length % 3 === 0) {
            setWaveform([...waveformRef.current.slice(-30)]);
          }
          requestAnimationFrame(updateVolumeFn);
        };

        // Use the cleaned stream for MediaRecorder
        const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")
            ? "audio/ogg;codecs=opus"
            : "";
        
        const recorder = new MediaRecorder(dataStream, {
          mimeType: mimeType || undefined,
          audioBitsPerSecond: 128000 
        });
        
        mediaRef.current = recorder;
        chunksRef.current = [];

        recorder.ondataavailable = (e) => { 
          if (e.data.size > 0) chunksRef.current.push(e.data); 
        };
        
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
          setAudioBlob(blob);
          stream.getTracks().forEach((t) => t.stop());
          if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') audioCtxRef.current.close().catch(() => {});
        };

        recorder.start(100); 
        setRecording(true);
        setRecordingTime(0);
        timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
        
        setTimeout(() => updateVolumeFn!(), 100);

      } catch (audioErr) {
        console.error("Audio Processing Error:", audioErr);
        // Fallback to raw stream if processing fails
        const recorder = new MediaRecorder(stream);
        mediaRef.current = recorder;
        recorder.start(100);
        setRecording(true);
      }
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
    setWaveform([]);
    waveformRef.current = [];
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return { recording, audioBlob, recordingTime, formatTime, volume, waveform, start, stop, clear };
}

// ─── Real Waveform Decoder ───────────────────────────────────────────────────
function useWaveformDecoder(url: string) {
  const [peaks, setPeaks] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!url) return;
    
    const decode = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        
        const rawData = audioBuffer.getChannelData(0); // Left channel
        const samples = 30; // Number of bars (Reduced for mobile fit)
        const blockSize = Math.floor(rawData.length / samples);
        const filteredData = [];
        for (let i = 0; i < samples; i++) {
          let blockStart = blockSize * i;
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum = sum + Math.abs(rawData[blockStart + j]);
          }
          filteredData.push(sum / blockSize);
        }
        
        // Normalize
        const multiplier = Math.pow(Math.max(...filteredData), -1);
        setPeaks(filteredData.map(n => n * multiplier));
      } catch (e) {
        console.error("Waveform decoding failed:", e);
        // Fallback to random peaks
        setPeaks([...Array(30)].map(() => Math.random() * 0.8 + 0.2));
      } finally {
        setIsLoading(false);
      }
    };

    decode();
  }, [url]);

  return { peaks, isLoading };
}

// ─── Audio player (Animated & Polished) ──────────────────────────────────────
function AudioPlayer({ url, duration: initialDuration, variant = "primary" }: { url: string; duration?: number; variant?: "primary" | "muted" }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { peaks, isLoading } = useWaveformDecoder(url);
  const [playbackVolumes, setPlaybackVolumes] = useState<number[]>([]);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);

  const toggle = () => {
    if (!audioRef.current) return;
    
    // Initialize Analyzer on first play
    if (!analyzerRef.current) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        
        // Handle crossOrigin for external URLs
        if (url.startsWith('http')) audioRef.current.crossOrigin = "anonymous";
        
        const source = audioCtx.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        analyzerRef.current = analyser;
        sourceRef.current = source;
      } catch (e) {
        console.error("Playback Visualizer Init Error:", e);
      }
    }

    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
  };

  useEffect(() => {
    const update = () => {
      if (playing && analyzerRef.current) {
        const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
        analyzerRef.current.getByteFrequencyData(dataArray);
        
        // Map frequencies to the number of bars we have (30)
        const newVols = [];
        for (let i = 0; i < 30; i++) {
          const sampleIdx = Math.floor((i / 30) * dataArray.length);
          newVols.push(dataArray[sampleIdx] / 255);
        }
        setPlaybackVolumes(newVols);
      }
      rafRef.current = requestAnimationFrame(update);
    };
    
    if (playing) {
      rafRef.current = requestAnimationFrame(update);
    } else {
      setPlaybackVolumes([]);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
    
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing]);

  const isMuted = variant === "muted";

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !isFinite(duration) || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    const newTime = pct * duration;
    audioRef.current.currentTime = newTime;
    setProgress(pct * 100);
  };

  return (
    <div className={cn(
      "flex flex-col gap-2 min-w-[200px] max-w-[280px] p-3 rounded-[24px] backdrop-blur-md border shadow-xl transition-all",
      isMuted 
        ? "bg-muted/60 border-border/50" 
        : "bg-white/10 border-white/5"
    )}>
      <audio 
        ref={audioRef} 
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => {
          const ct = e.currentTarget.currentTime;
          const du = e.currentTarget.duration;
          if (isFinite(ct) && isFinite(du) && du > 0) {
            setProgress((ct / du) * 100);
          }
        }}
        onLoadedMetadata={(e) => {
          const du = e.currentTarget.duration;
          if (isFinite(du)) setDuration(du);
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
            "h-11 w-11 flex items-center justify-center rounded-full transition-all shrink-0 shadow-lg active:scale-90",
            isMuted ? "bg-primary text-white" : "bg-white text-primary"
          )}
        >
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
        </button>
        
        <div 
          className="flex-1 flex items-center justify-between gap-[2px] h-8 cursor-pointer relative overflow-hidden"
          onClick={handleSeek}
        >
          {peaks.length > 0 ? (
            peaks.map((peak, i) => {
              const played = (i / peaks.length) * 100 < progress;
              return (
                <div
                  key={i}
                  className={cn(
                    "w-1 rounded-full transition-all duration-75",
                    isMuted 
                      ? (played ? "bg-primary" : "bg-primary/20") 
                      : (played ? "bg-white" : "bg-white/30")
                  )}
                  style={{ 
                    height: `${Math.max(15, (peak * 70) + ((playbackVolumes[i] || 0) * 30))}%` 
                  }}
                />
              );
            })
          ) : (
             <div className="flex-1 flex items-end gap-0.5 h-full opacity-30">
               {[...Array(30)].map((_, i) => (
                 <div key={i} className={cn("w-1 rounded-full", isMuted ? "bg-primary" : "bg-white")} style={{ height: `${15 + (i % 3) * 10}%` }} />
               ))}
             </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between gap-2 px-1">
        <span className={cn("text-[10px] font-bold", isMuted ? "text-muted-foreground" : "text-white/80")}>
           {progress > 0 && playing 
             ? `${Math.floor((progress/100 * duration) / 60)}:${Math.floor((progress/100 * duration) % 60).toString().padStart(2, '0')}`
             : (isFinite(duration) && duration > 0 
                ? `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}` 
                : "0:00")}
        </span>
        <div className="flex gap-0.5">
           {isMuted && <div className="h-1 w-1 rounded-full bg-primary/40" />}
           {!isMuted && <div className="h-1 w-1 rounded-full bg-white/40" />}
        </div>
      </div>
    </div>
  );
}

// ─── Video recorder hook ────────────────────────────────────────────────────
function useVideoRecorder(onBlobReady?: (blob: Blob) => void) {
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [progress, setProgress] = useState(0); // 0 to 100
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onBlobReadyRef = useRef<((blob: Blob) => void) | null>(null);

  const MAX_DURATION = 60; // 60 seconds limit like Telegram

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true, 
          autoGainControl: true 
        }, 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 640 }, 
          aspectRatio: { exact: 1 },
          facingMode: "user" 
        } 
      });
      setVideoStream(stream);
      
      // Extensive MIME type check for better compatibility (especially iOS Safari)
      const types = [
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4;codecs=avc1,mp4a.40.2',
        'video/mp4',
        'video/quicktime'
      ];
      const selectedType = types.find(t => MediaRecorder.isTypeSupported(t)) || '';
      
      console.log("Selected Video MIME:", selectedType || "browser default");

      const recorder = new MediaRecorder(stream, selectedType ? { mimeType: selectedType } : {});
      mediaRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => { 
        if (e.data.size > 0) chunksRef.current.push(e.data); 
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: selectedType || "video/webm" });
        setVideoBlob(blob);
        if (onBlobReadyRef.current) {
          onBlobReadyRef.current(blob);
          onBlobReadyRef.current = null;
        }
        stream.getTracks().forEach((t) => t.stop());
        setVideoStream(null);
        if (timerRef.current) clearInterval(timerRef.current);
        setRecording(false);
      };

      recorder.start(1000);
      setRecording(true);
      setRecordingTime(0);
      setProgress(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => {
          const newTime = t + 1;
          const currentProgress = (newTime / MAX_DURATION) * 100;
          setProgress(currentProgress);
          
          if (newTime >= MAX_DURATION) {
            recorder.stop();
            return newTime;
          }
          return newTime;
        });
      }, 1000);
    } catch (e) {
      console.error("Video record error:", e);
      alert("Kamera yoki mikrofon ruxsati berilmadi");
    }
  }, []);

  const stop = useCallback((onReady?: (blob: Blob) => void) => {
    if (onReady) onBlobReadyRef.current = onReady;
    mediaRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const clear = useCallback(() => {
    setVideoBlob(null);
    setVideoStream(null);
    setRecordingTime(0);
    setProgress(0);
    onBlobReadyRef.current = null;
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return { recording, videoBlob, videoStream, recordingTime, progress, formatTime, start, stop, clear };
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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
      if (opts.video) {
        const videoExt = opts.video.type.includes('mp4') ? 'mp4' : 'webm';
        fd.append("video", new File([opts.video], `video.${videoExt}`, { type: opts.video.type }));
      }

      const res = await fetch(`/api/chat/${chat.id}/messages`, { method: "POST", body: fd });
      if (res.ok) {
        const newMessage = await res.json();
        setMessages((prev: any[]) => {
          if (prev.find(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
        setText("");
        setImagePreview(null);
        voice.clear();
        video.clear();
      } else {
        const errData = await res.json();
        alert(locale === "uz" ? `Xabarni yuborib bo'lmadi: ${errData.error}` : `Failed to send message: ${errData.error}`);
      }
    } catch (err: any) {
      console.error("SendMessage Error:", err);
      alert(locale === "uz" ? "Internet bilan bog'lanishda xatolik" : "Connection error");
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
    <div className="flex-1 flex flex-col min-h-0 h-full bg-background dark:bg-slate-950 overflow-hidden relative">
      {/* Header */}
      <div className="flex-none z-40 px-3 py-2.5 border-b bg-card/80 backdrop-blur-xl flex items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="ghost" size="icon" asChild className="md:hidden shrink-0 h-10 w-10 rounded-2xl bg-secondary/80 hover:bg-secondary active:scale-90 transition-all border border-border/20">
            <Link href="/chat"><ArrowLeft className="h-6 w-6 text-primary" /></Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="hidden md:flex shrink-0 h-10 w-10 rounded-2xl bg-secondary/40 hover:bg-secondary transition-all">
            <Link href="/"><Home className="h-5 w-5" /></Link>
          </Button>
          <Link href={`/profile/${otherUser?.id}`} className="flex items-center gap-2.5 min-w-0 hover:bg-muted/30 p-1 rounded-2xl transition-all group/header active:scale-95">
            <div className="relative shrink-0">
              <Avatar className="h-11 w-11 border-2 border-background shadow-md group-hover/header:border-primary/30 transition-all">
                <AvatarImage src={otherUser?.imageUrl || ""} alt={otherName} className="object-cover" />
                <AvatarFallback className="bg-primary/5 text-primary font-black uppercase text-sm">
                  {otherName.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card bg-emerald-500 shadow-sm" />
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <div className="font-extrabold text-foreground truncate flex items-center gap-1.5 leading-tight group-hover/header:text-primary transition-colors text-[15px]">
                <span className="truncate">{otherName}</span>
                {otherUser?.isVerified && (
                  <Badge variant="secondary" className="h-4 w-4 p-0 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 border-none shrink-0">
                    <Check className="h-2.5 w-2.5 text-white stroke-[4]" />
                  </Badge>
                )}
              </div>
              <div className="flex items-center h-4">
                {getStatus(otherUserStatus || otherUser?.lastActive)}
              </div>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" asChild className="md:hidden h-10 w-10 rounded-2xl bg-secondary/40 hover:bg-secondary active:scale-95 transition-all">
            <Link href="/"><Home className="h-5 w-5" /></Link>
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
            <Video className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-none bg-muted/20 dark:bg-slate-900/40 flex flex-col">
        <div className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-6 flex-1 flex flex-col justify-end">
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
                    msg.videoUrl ? "flex flex-col relative" : "rounded-[24px] px-4 py-3 shadow-sm overflow-hidden transition-all group-hover/msg:shadow-lg relative",
                    !msg.videoUrl && isOwn
                      ? "bg-gradient-to-br from-[#3D5AFE] via-[#304FFE] to-[#283593] text-white rounded-br-none shadow-[#304FFE]/20 border border-white/10"
                      : (!msg.videoUrl ? "bg-card dark:bg-slate-800 border border-border/40 rounded-bl-none text-foreground shadow-sm" : "")
                  )}>
                    {/* Voice message */}
                    {msg.audioUrl && <AudioPlayer url={msg.audioUrl} duration={msg.audioDuration} variant={isOwn ? "primary" : "muted"} />}

                    {/* Image */}
                    {msg.imageUrl && (
                      <img 
                        src={msg.imageUrl} 
                        alt="img" 
                        className="rounded-xl max-w-full max-h-64 object-cover mb-1 cursor-pointer hover:opacity-90 transition-opacity" 
                        onClick={() => setSelectedImage(msg.imageUrl)}
                      />
                    )}

                    {/* Video message */}
                    {msg.videoUrl && (
                      <CircularVideoPlayer url={msg.videoUrl} />
                    )}

                    {/* Text */}
                    {msg.text && !msg.audioUrl && !msg.videoUrl && !msg.imageUrl && (
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

      {/* Video recording in progress (Telegram Style) */}
      <AnimatePresence>
        {video.recording && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-x-0 bottom-0 z-[100] px-4 py-8 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col items-center gap-6"
          >
            <div className="relative h-64 w-64 md:h-72 md:w-72">
              {/* Progress Ring */}
              <svg className="absolute inset-0 -rotate-90 w-full h-full drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                <circle
                  cx="50%"
                  cy="50%"
                  r="48%"
                  className="fill-none stroke-white/20 stroke-[3px]"
                />
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="48%"
                  className="fill-none stroke-primary stroke-[4px]"
                  strokeDasharray="100 100"
                  animate={{ strokeDashoffset: 100 - video.progress }}
                  transition={{ duration: 1, ease: "linear" }}
                  strokeLinecap="round"
                  pathLength="100"
                />
              </svg>

              {/* Video Preview */}
              <div className="absolute inset-[6px] rounded-full overflow-hidden bg-black shadow-2xl transition-all border border-white/5">
                <video 
                  ref={videoPreviewRef} 
                  autoPlay 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover scale-x-[-1]" // Mirroring for front camera
                />
                
                {/* Recording Indicator at BOTTOM (Telegram Style) */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[13px] font-black text-white shadow-lg border border-white/10 z-20">
                  <motion.div 
                    className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" 
                    animate={{ opacity: [1, 0.4, 1] }} 
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                  <span className="tabular-nums">{video.formatTime(video.recordingTime)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={video.stop}
                className="h-14 w-14 rounded-full border-2 border-white/20 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md shadow-xl transition-all active:scale-95"
              >
                <X className="h-6 w-6" />
              </Button>

              <div className="flex flex-col items-center gap-1">
                <Button 
                  size="icon" 
                  onClick={() => video.stop((blob) => sendMessage({ video: blob }))} 
                  className="h-20 w-20 rounded-full bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(59,130,246,0.4)] border-4 border-white/10 group transition-all"
                  disabled={isSending}
                >
                  {isSending ? <Loader2 className="h-8 w-8 animate-spin text-white" /> : <Send className="h-8 w-8 text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                </Button>
                <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">
                  {isSending ? (locale === 'uz' ? 'Yuborilmoqda...' : 'Sending...') : (locale === 'uz' ? 'Yuborish' : 'Send')}
                </span>
              </div>

              <Button 
                variant="outline" 
                size="icon" 
                className="h-14 w-14 rounded-full border-2 border-white/20 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md shadow-xl transition-all active:scale-95"
                onClick={video.clear}
              >
                <Trash2 className="h-6 w-6" />
              </Button>
            </div>
            
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">{locale === 'uz' ? 'Videoxabar yozilmoqda' : 'Recording video message'}</p>
          </motion.div>
        )}
      </AnimatePresence>

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
            <span className="text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              {locale === "uz" ? "Yozilmoqda" : "Запись"} {voice.formatTime(voice.recordingTime)}
            </span>
            <div className="flex items-end gap-0.5 h-10 px-1">
              {voice.waveform.map((vol, i) => (
                <motion.div 
                  key={i}
                  className="w-1 bg-red-500 rounded-full shrink-0"
                  initial={{ height: "4px" }}
                  animate={{ 
                    height: `${Math.max(10, vol)}%`
                  }}
                  transition={{ duration: 0.1 }}
                />
              ))}
              {voice.waveform.length === 0 && (
                <div className="flex items-end gap-0.5 h-full opacity-20">
                   {[...Array(30)].map((_, i) => <div key={i} className="w-1 h-1 bg-red-500 rounded-full" />)}
                </div>
              )}
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
        <div className="flex-none relative px-4 py-4 border-t bg-card flex items-center gap-3">
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
    </div>

    {/* Image Lightbox */}
    <AnimatePresence>
      {selectedImage && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setSelectedImage(null)}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-5xl w-full h-full flex items-center justify-center pointer-events-none"
          >
            <img 
              src={selectedImage} 
              alt="Full screen view" 
              className="max-w-full max-h-full object-contain shadow-2xl pointer-events-auto cursor-default"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-6 w-6" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
