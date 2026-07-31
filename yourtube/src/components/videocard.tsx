"use client";

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
    if (!video?.filepath) return "/video/vdo.mp4";
    if (video.filepath.startsWith("http")) return video.filepath;
    const filename = video.filepath.split(/[\\/]/).pop();
    return `${backendBaseUrl}/uploads/${encodeURIComponent(filename || "")}`;
  };

  const views = video?.views ?? 0;
  const createdAt = video?.createdAt ? new Date(video.createdAt) : new Date();
  const channelInitial = video?.videochanel?.[0] ?? "C";

  return (
    <Link href={`/watch/${video._id}`} className="group">
      <div className="space-y-3">
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
          <video
            src={getVideoSrc()}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 rounded">
            10:24
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
