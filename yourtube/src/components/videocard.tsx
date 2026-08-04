"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "./ui/avatar";
import type { Video } from "@/types/video";

export interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  const backendBaseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "https://youtube-07v0.onrender.com";

  const getVideoSrc = () => {
    if (!video?.filepath) return `${backendBaseUrl}/video/vdo.mp4`;
    if (video.filepath.startsWith("http")) return video.filepath;
    const filename = video.filepath.split(/[\\/]/).pop();
    return `${backendBaseUrl}/uploads/${encodeURIComponent(filename || "")}`;
  };

  const [videoSrc, setVideoSrc] = useState<string>("");
  const [duration, setDuration] = useState<number | null>(null);
  const hiddenVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setVideoSrc(getVideoSrc());
  }, [video]);

  const handleVideoError = () => {
    const fallback = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    if (videoSrc !== fallback) {
      setVideoSrc(fallback);
    }
  };

  const formatDuration = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const views = video?.views ?? 0;
  const createdAt = video?.createdAt ? new Date(video.createdAt) : new Date();
  const channelInitial = video?.videochanel?.[0] ?? "C";

  return (
    <Link href={`/watch/${video._id}`} className="group">
      <div className="space-y-3">
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
          {/* Hidden video element to extract exact metadata duration automatically */}
          {videoSrc && (
            <video
              ref={hiddenVideoRef}
              src={videoSrc}
              preload="metadata"
              onLoadedMetadata={(e) => {
                setDuration(e.currentTarget.duration);
              }}
              className="hidden"
            />
          )}

          <video
            src={videoSrc}
            onError={handleVideoError}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
            {duration ? formatDuration(duration) : "0:00"}
          </div>
        </div>
        <div className="flex gap-3">
          <Avatar className="w-9 h-9 flex-shrink-0">
            <AvatarFallback>{channelInitial}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600">
              {video?.videotitle}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{video?.videochanel}</p>
            <p className="text-sm text-gray-600">
              {views.toLocaleString()} views •{" "}
              {formatDistanceToNow(createdAt)} ago
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}