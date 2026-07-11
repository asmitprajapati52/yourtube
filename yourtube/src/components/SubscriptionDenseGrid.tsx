import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface GridProps {
  videos: any[];
}

export default function SubscriptionDenseGrid({ videos }: GridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
      {videos.map((video) => {
        let filename = video.filepath || "vdo.mp4";
        if (filename.includes("/") || filename.includes("\\")) {
          const parts = filename.split(/[/\\]/);
          filename = parts[parts.length - 1];
        }
        const videoId = video._id || filename;

        return (
          <Link href={`/watch/${videoId}`} key={video._id || videoId} className="group flex flex-col gap-2 cursor-pointer">
            <div className="aspect-video w-full bg-zinc-900 rounded-xl overflow-hidden relative border border-gray-100 shadow-xs">
              <div className="w-full h-full bg-linear-to-tr from-zinc-900 to-zinc-800 flex items-center justify-center text-zinc-600 font-mono text-xs group-hover:scale-102 transition-transform duration-200">
                [Video Preview]
              </div>
            </div>
            
            <div className="flex gap-3 px-1 mt-1">
              <Avatar className="h-9 w-9 shrink-0 border mt-0.5">
                <AvatarFallback className="bg-red-100 text-red-700 font-bold text-xs">
                  {video.videochanel?.[0] || "C"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm leading-snug text-black group-hover:text-red-600 transition-colors line-clamp-2">
                  {video.videotitle || "Untitled Video Content"}
                </h4>
                <p className="text-xs text-gray-600 mt-1 truncate font-medium">{video.videochanel || "Unknown Channel"}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{video.views || 0} views • 1 day ago</p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}