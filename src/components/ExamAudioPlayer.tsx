"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Music, AlertCircle } from "lucide-react";

interface ExamAudioPlayerProps {
  src: string;
  mode: "practice" | "test";
}

export function ExamAudioPlayer({ src, mode }: ExamAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(100);
      if (mode === "test") {
        setIsFinished(true); // Khóa luôn ở chế độ test
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [mode]);

  const togglePlay = () => {
    if (isFinished && mode === "test") return; // Không cho phát lại nếu đã xong

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mode === "test") return; // Cấm tua ở chế độ test

    const newTime = (parseFloat(e.target.value) / 100) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setProgress(parseFloat(e.target.value));
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`w-full max-w-3xl mx-auto p-4 rounded-2xl border backdrop-blur-xl flex items-center gap-4 transition-all ${mode === 'test' ? 'bg-rose-500/10 border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]' : 'bg-indigo-500/10 border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]'}`}>
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        disabled={isFinished && mode === "test"}
        className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full text-white transition-all ${
          isFinished && mode === "test"
            ? "bg-foreground/20 cursor-not-allowed"
            : mode === "test"
            ? "bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/30"
            : "bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/30"
        } active:scale-95`}
      >
        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
      </button>

      {/* Track & Progress */}
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-center justify-between text-xs font-bold text-foreground/60 px-1">
          <span className="flex items-center gap-1.5">
            {mode === "test" ? (
              <span className="text-rose-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> Chế độ thi: Chỉ nghe 1 lần</span>
            ) : (
              <span className="text-indigo-500 flex items-center gap-1"><Music className="w-3.5 h-3.5"/> Luyện tập</span>
            )}
          </span>
          <span className="font-mono">
            {formatTime(audioRef.current?.currentTime || 0)} / {formatTime(duration)}
          </span>
        </div>
        
        <div className="relative w-full h-2 rounded-full bg-foreground/10 overflow-hidden">
          <div 
            className={`absolute top-0 left-0 h-full transition-all duration-100 ease-linear ${mode === 'test' ? 'bg-rose-500' : 'bg-indigo-500'}`}
            style={{ width: `${progress}%` }}
          />
          {/* Input type range for seeking */}
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            disabled={mode === "test"}
            className={`absolute top-0 left-0 w-full h-full opacity-0 ${mode === 'test' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          />
        </div>
      </div>

      {/* Mute Button */}
      <button onClick={toggleMute} className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full text-foreground/60 hover:bg-foreground/10 transition-colors">
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>
    </div>
  );
}
