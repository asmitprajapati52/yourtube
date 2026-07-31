import React from "react";
import VideoCard from "./videocard";
import type { Video } from "@/types/video";

interface ChannelVideosProps {
  videos: Video[];
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
        {videos.map((video) => (
          <div
            key={video._id}
            className="block group transition-transform hover:scale-[1.01]"
          >
            <VideoCard video={video} />
          </div>
        ))}
      </div>
    </div>
  );
}
