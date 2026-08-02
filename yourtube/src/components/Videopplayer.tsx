"use client";

import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, RotateCw, Loader2, SkipForward } from "lucide-react";

export default function Videopplayer({ video, onNext }: { video: any, onNext?: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastTap, setLastTap] = useState(0);
  
  // Next overlay state
  const [showNextOverlay, setShowNextOverlay] = useState(false);

  // Dynamic backend base URL for local fallback only
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://youtube-07v0.onrender.com";

  const getFullUrl = () => {
    if (!video?.filepath) return null;
    
    // 🚀 FIXED: Agar filepath pehle se hi Cloudinary ka full URL hai, toh seedha wahi return karo!
    if (video.filepath.startsWith("http://") || video.filepath.startsWith("https://")) {
      return video.filepath;
    }

    // Agar purana local path hai, tabhi render/uploads fallback use ho
    const filename = video.filepath.split(/[\\/]/).pop();
    return `${backendBaseUrl}/uploads/${encodeURIComponent(filename || "")}`;
  };

  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  useEffect(() => {
    setVideoSrc(getFullUrl());
  }, [video]);

  const handleVideoError = () => {
    const fallback = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    if (videoSrc !== fallback) {
      console.warn("Video failed to load. Falling back to public sample video.");
      setVideoSrc(fallback);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleTap = (e: React.MouseEvent) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      if (x < rect.width / 2) skip(-10);
      else skip(10);
    }
    setLastTap(now);
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
      setShowNextOverlay(false);
    }
  };

  // Play/Pause toggle handler to sync state perfectly
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => console.error("Playback error:", err));
      }
    }
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const handleLoadedMetadata = () => {
      setDuration(v.duration);
      setIsLoading(false);
    };
    const handleTimeUpdate = () => setCurrentTime(v.currentTime);
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
      setShowNextOverlay(false);
    };
    const handlePause = () => setIsPlaying(false);
    
    const handleEnded = () => {
      setIsPlaying(false);
      setShowNextOverlay(true); 
    };

    v.addEventListener("loadedmetadata", handleLoadedMetadata);
    v.addEventListener("timeupdate", handleTimeUpdate);
    v.addEventListener("waiting", handleWaiting);
    v.addEventListener("playing", handlePlaying);
    v.addEventListener("pause", handlePause);
    v.addEventListener("ended", handleEnded);

    return () => {
      v.removeEventListener("loadedmetadata", handleLoadedMetadata);
      v.removeEventListener("timeupdate", handleTimeUpdate);
      v.removeEventListener("waiting", handleWaiting);
      v.removeEventListener("playing", handlePlaying);
      v.removeEventListener("pause", handlePause);
      v.removeEventListener("ended", handleEnded);
    };
  }, [videoSrc]);

  if (!videoSrc) return <div className="text-white p-4">Video not found</div>;

  return (
    <div className="relative group w-full bg-black rounded-xl overflow-hidden shadow-2xl" onClick={handleTap}>
      <video 
        key={videoSrc}
        ref={videoRef} 
        src={videoSrc} 
        className="w-full aspect-video cursor-pointer" 
        onClick={togglePlay}
        onError={handleVideoError}
      />

      {isLoading && <Loader2 className="absolute inset-0 m-auto text-white animate-spin z-20" size={48} />}

      {/* YouTube Style Next Overlay */}
      {showNextOverlay && (
        <div className="absolute inset-0 z-40 bg-black/80 flex flex-col items-center justify-center animate-in fade-in duration-300">
          <button 
            onClick={onNext} 
            className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-bold text-lg hover:scale-105 transition-transform"
          >
            <SkipForward size={24} /> Play Next
          </button>
          <button 
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.currentTime = 0;
                videoRef.current.play();
                setShowNextOverlay(false);
              }
            }} 
            className="mt-6 text-gray-300 hover:text-white transition-colors"
          >
            <RotateCcw size={20} className="inline mr-2" /> Replay
          </button>
        </div>
      )}

      {/* Controls */}
      {!showNextOverlay && (
        <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-all z-30">
          <input 
            type="range" max={duration || 0} value={currentTime}
            onChange={(e) => { if(videoRef.current) videoRef.current.currentTime = Number(e.target.value); }}
            className="w-full h-1 mb-3 accent-red-600 cursor-pointer"
          />
          <div className="flex items-center justify-between text-white">
            <div className="flex gap-4 items-center">
              <button onClick={togglePlay}>
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button onClick={() => skip(-10)}><RotateCcw size={20} /></button>
              <button onClick={() => skip(10)}><RotateCw size={20} /></button>
              <button onClick={() => { if(videoRef.current) { videoRef.current.muted = !isMuted; setIsMuted(!isMuted); } }}>
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <span className="text-xs">{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
            <button onClick={() => videoRef.current?.requestFullscreen()}><Maximize size={20} /></button>
          </div>
        </div>
      )}
    </div>
  );
}