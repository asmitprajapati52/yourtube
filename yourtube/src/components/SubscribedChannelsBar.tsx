import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function SubscribedChannelsBar() {
  // Dummy channels layout track trace
  const channels = [
    { name: "CodingNinja", img: "" },
    { name: "MeTube India", img: "" },
    { name: "Traversy Media", img: "" },
    { name: "WebDev Simplified", img: "" },
    { name: "Fireship", img: "" },
  ];

  return (
    <div className="flex items-center gap-6 overflow-x-auto pb-4 border-b border-gray-100 scrollbar-hide select-none mb-6">
      {channels.map((ch, idx) => (
        <div key={idx} className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group">
          <div className="relative p-0.5 rounded-full border-2 border-red-500 group-hover:scale-105 transition-transform">
            <Avatar className="h-14 w-14 border border-white">
              <AvatarImage src={ch.img} />
              <AvatarFallback className="bg-gradient-to-tr from-red-500 to-amber-500 text-white font-bold text-sm">
                {ch.name[0]}
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full" />
          </div>
          <span className="text-xs font-medium text-gray-700 max-w-[70px] truncate text-center group-hover:text-black">
            {ch.name}
          </span>
        </div>
      ))}
    </div>
  );
}