import React from "react";
import Link from "next/link";
import { Play } from "lucide-react";

interface VideoRowProps {
  video: any;
}

export default function TrendingVideoRow({ video }: VideoRowProps) {
  let filename = video.filepath || "vdo.mp4";
  if (filename.includes("/") || filename.includes("\\")) {
    const parts = filename.split(/[/\\]/);
    filename = parts[parts.length - 1];
  }
  const videoId = video._id || filename;

  return (
    <Link href={`/watch/${videoId}`} className="group flex flex-col sm:flex-row gap-4 p-2 rounded-xl hover:bg-gray-50 transition-colors">
      {/* Thumbnail Layer */}
      <div className="aspect-video w-full sm:w-72 bg-slate-900 rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-gray-400 relative border border-gray-100 shadow-xs">
        <Play className="w-8 h-8 opacity-0 group-hover:opacity-80 transition-all duration-200 text-white scale-90 group-hover:scale-100 absolute" />
        <div className="w-full h-full bg-linear-to-br from-zinc-800 to-black flex items-center justify-center text-xs text-zinc-500 font-mono">
          [Thumbnail Fallback]
        </div>
      </div>

      {/* Meta Text Details Container */}
      <div className="flex-1 space-y-1.5 py-1">
        <h3 className="font-bold text-lg text-black group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
          {video.videotitle || "Trending Global Content"}
        </h3>
        
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <span>{video.videochanel || "Premium Creator"}</span>
          <span>•</span>
          <span>{video.views || 0} views</span>
          <span>•</span>
          <span>2 hours ago</span>
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 max-w-2xl pt-1">
          {video.videodescription || "Catch up on the latest trending clips, updates, and community highlights happening right now."}
        </p>
      </div>
    </Link>
  );
}