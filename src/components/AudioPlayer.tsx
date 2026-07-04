"use client";

import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface AudioPlayerProps {
  filename: string;
}

export function AudioPlayer({ filename }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
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

  const handleEnded = () => {
    setIsPlaying(false);
  };

  // Nguồn audio được trỏ về thư mục public/uploads
  const src = `/uploads/${filename}`;

  return (
    <div className="flex items-center gap-4 bg-secondary/30 p-3 rounded-2xl border border-border/50 shadow-sm w-fit">
      <audio 
        ref={audioRef} 
        src={src} 
        onEnded={handleEnded}
        onError={(e) => console.error("Audio failed to load", e)}
      />
      
      <button 
        onClick={togglePlay}
        className="w-10 h-10 flex items-center justify-center bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-transform active:scale-95 shadow-sm"
      >
        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
      </button>

      <div className="flex flex-col">
        <span className="text-sm font-semibold tracking-wide">Nghe hiểu</span>
        <span className="text-xs text-foreground/60">{filename}</span>
      </div>

      <div className="w-px h-8 bg-border mx-2"></div>

      <button 
        onClick={toggleMute}
        className="p-2 text-foreground/70 hover:text-foreground hover:bg-secondary rounded-full transition-colors"
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>
    </div>
  );
}
