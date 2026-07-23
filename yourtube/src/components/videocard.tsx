"use client";

import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "./ui/avatar";

export default function VideoCard({ video }: any) {
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  const thumbnailSrc = video?.thumbnail 
    ? `${backendBaseUrl}/uploads/${video.thumbnail.split(/[\\/]/).pop()}` 
    : "https://placehold.co/600x400/png?text=No+Thumbnail";

  return (
    // Yahan Link ki jagah div kar diya hai taaki nested <a> tag error na aaye
    <div className="block space-y-3 cursor-pointer group">
      {/* Thumbnail Box */}
      <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 shadow-sm border border-gray-100">
        <img
          src={thumbnailSrc}
          alt={video?.videotitle || "Video thumbnail"}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          onError={(e) => { e.currentTarget.src = "https://placehold.co/600x400/png?text=Error"; }}
        />
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-medium px-1.5 py-0.5 rounded z-10">
          {video?.duration || "0:00"}
        </div>
      </div>

      {/* Details */}
      <div className="flex gap-3 px-1">
        <Avatar className="w-9 h-9 flex-shrink-0 border">
          <AvatarFallback className="bg-gray-200 font-bold text-gray-700">
            {video?.videochanel?.[0]?.toUpperCase() || "Y"}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors">
            {video?.videotitle}
          </h3>
          <p className="text-xs text-gray-500 mt-1 font-medium">{video?.videochanel}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {video?.views?.toLocaleString() || 0} views •{" "}
            {video?.createdAt ? formatDistanceToNow(new Date(video.createdAt)) : "Just now"} ago
          </p>
        </div>
      </div>
    </div>
  );
}