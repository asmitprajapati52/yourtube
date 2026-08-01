"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

const backendBaseUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://youtube-07v0.onrender.com";

const getVideoSrc = (video: any) => {
  if (!video?.filepath) return `${backendBaseUrl}/video/vdo.mp4`;
  if (video.filepath.startsWith("http")) return video.filepath;
  const filename = video.filepath.split(/[\\/]/).pop();
  return `${backendBaseUrl}/uploads/${encodeURIComponent(filename || "")}`;
};

function RelatedVideoRow({ video }: { video: any }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    setSrc(getVideoSrc(video));
  }, [video]);

  const handleError = () => {
    const fallback = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    if (src !== fallback) {
      setSrc(fallback);
    }
  };

  return (
    <Link
      href={`/watch/${video._id}`}
      className="flex flex-col sm:flex-row gap-2 group"
    >
      <div className="relative w-full sm:w-40 aspect-video bg-gray-100 rounded overflow-hidden shrink-0">
        <video
          src={src}
          onError={handleError}
          className="object-cover group-hover:scale-105 transition-transform duration-200"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600">
          {video.videotitle}
        </h3>
        <p className="text-xs text-gray-600 mt-1">{video.videochanel}</p>
        <p className="text-xs text-gray-600">
          {video.views.toLocaleString()} views •{" "}
          {formatDistanceToNow(new Date(video.createdAt))} ago
        </p>
      </div>
    </Link>
  );
}

interface RelatedVideosProps {
  videos: Array<{
    _id: string;
    videotitle: string;
    videochanel: string;
    views: number;
    createdAt: string;
    filepath?: string;
  }>;
}

export default function RelatedVideos({ videos }: RelatedVideosProps) {
  return (
    <div className="space-y-2">
      {videos.map((video) => (
        <RelatedVideoRow key={video._id} video={video} />
      ))}
    </div>
  );
}