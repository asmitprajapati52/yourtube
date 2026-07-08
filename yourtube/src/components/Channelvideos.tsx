import React from "react";
import Link from "next/link";
import VideoCard from "./videocard";

interface ChannelVideosProps {
  videos: any[];
}

export default function ChannelVideos({ videos }: ChannelVideosProps) {
  if (!videos || videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No videos uploaded yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Videos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {videos.map((video: any) => (
          // 🚀 DIRECT WRAPPER ACTION: Card par click hote hi player check page par navigation push ho jayegi
          <Link 
            href={`/watch/${video._id}`} 
            key={video._id} 
            className="block group transition-transform hover:scale-[1.01]"
          >
            {/* Pointer-events-none lagane se purane card ke internal elements ka click intercept block ho jayega */}
            <div className="pointer-events-none">
              <VideoCard video={video} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}