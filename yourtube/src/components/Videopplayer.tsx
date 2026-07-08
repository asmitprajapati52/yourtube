"use client";

import React from "react";

interface VideoPlayerProps {
  video: {
    filepath?: string;
    videotitle?: string;
    [key: string]: any;
  };
}

export default function Videopplayer({ video }: VideoPlayerProps) {
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  let finalVideoSrc = video?.filepath || "";

  if (finalVideoSrc && !finalVideoSrc.startsWith("http")) {
    // 🚀 FIX: Agar database me absolute disk path ('D:/...') hai, toh usme se sirf unique filename nikalo
    let filename = finalVideoSrc;
    
    if (finalVideoSrc.includes("/") || finalVideoSrc.includes("\\")) {
      const parts = finalVideoSrc.split(/[/\\]/);
      filename = parts[parts.length - 1]; // Get only the '2026-07-07T...vdo.mp4' part
    }

    // Form perfect route string match for backend stream controller mapping
    finalVideoSrc = `${backendBaseUrl}/video/uploads/${filename}`;
  }

  if (!finalVideoSrc) {
    finalVideoSrc = `${backendBaseUrl}/video/uploads/vdo.mp4`;
  }

  return (
    <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg border border-gray-100 relative">
      <video
        key={finalVideoSrc} 
        src={finalVideoSrc}
        controls
        autoPlay
        preload="auto"
        className="w-full h-full object-contain"
        crossOrigin="anonymous"
      >
        Your browser does not support video playback streaming.
      </video>
    </div>
  );
}