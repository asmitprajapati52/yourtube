"use client";

import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "./ui/avatar";

export default function VideoCard({ video }: any) {
  // Backend URL config setup
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  let finalVideoPath = video?.filepath || "";

  if (!finalVideoPath.startsWith("http")) {
    finalVideoPath = `${backendBaseUrl}/${finalVideoPath}`;
  }

  // Yahan se <Link> hata diya hai kyunki hum ChannelVideos.tsx mein handle kar rahe hain
  return (
    <div className="space-y-3">
      {/* Video Player Box */}
      <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 shadow-sm border border-gray-200">
        <video
          src={finalVideoPath}
          controls
          preload="metadata"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-medium px-1.5 py-0.5 rounded z-10">
          10:24
        </div>
      </div>

      {/* Channel and Video Details */}
      <div className="flex gap-3 px-1">
        <Avatar className="w-9 h-9 flex-shrink-0 border">
          <AvatarFallback className="bg-gray-200 font-bold text-gray-700">
            {video?.videochanel ? video.videochanel[0].toUpperCase() : "Y"}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm line-clamp-2 text-gray-900 transition-colors">
            {video?.videotitle}
          </h3>
          <p className="text-xs text-gray-500 mt-1 font-medium">{video?.videochanel}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {video?.views ? video.views.toLocaleString() : 0} views •{" "}
            {video?.createdAt ? formatDistanceToNow(new Date(video.createdAt)) : "Just now"} ago
          </p>
        </div>
      </div>
    </div>
  );
}