"use client";

import Comments from "@/components/Comments";
import RelatedVideos from "@/components/RelatedVideos";
import VideoInfo from "@/components/VideoInfo";
import Videopplayer from "@/components/Videopplayer";
import axiosInstance from "@/lib/axiosinstance";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

export default function WatchVideoPage() {
  const router = useRouter();
  const { id } = router.query;
  const [currentVideo, setCurrentVideo] = useState<any>(null);
  const [allVideosList, setAllVideosList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Logic to find and navigate to the next video
  const handleNextVideo = () => {
    if (!allVideosList.length || !currentVideo) return;
    
    const currentIndex = allVideosList.findIndex((v: any) => v._id === currentVideo._id);
    const nextVideo = allVideosList[currentIndex + 1] || allVideosList[0]; // Agar last hai toh loop back to 0
    
    if (nextVideo) {
      router.push(`/watch/${nextVideo._id}`);
    }
  };

  useEffect(() => {
    const fetchVideoDetails = async () => {
      if (!id || typeof id !== "string") return;
      try {
        setLoading(true);
        const res = await axiosInstance.get("/video/getall");
        const listData = res.data || [];
        setAllVideosList(listData);

        const targetVideo = listData.find((vid: any) => vid._id === id);
        setCurrentVideo(targetVideo || listData[0]);
      } catch (error) {
        console.error("Error loading watch page assets:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (router.isReady) {
      fetchVideoDetails();
    }
  }, [id, router.isReady]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black">
        <div className="w-10 h-10 border-4 border-t-blue-600 border-gray-200 rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium text-gray-500">Buffering streaming client metadata...</p>
      </div>
    );
  }
  
  if (!currentVideo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-black">
        <p className="text-base font-semibold text-gray-600">Video asset not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-[1600px] mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] gap-6">
          
          <div className="space-y-4">
            {/* Yahan pass kiya 'onNext' function */}
            <Videopplayer video={currentVideo} onNext={handleNextVideo} />
            <VideoInfo video={currentVideo} />
            <Comments videoId={id as string} />
          </div>
          
          <div className="space-y-4">
            <RelatedVideos videos={allVideosList} />
          </div>
        </div>
      </div>
    </div>
  );
}