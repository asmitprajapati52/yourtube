import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ChannelHeader from "@/components/ChannelHeader";
import Channeltabs from "@/components/Channeltabs";
import ChannelVideos from "@/components/ChannelVideos";
import VideoUploader from "@/components/VideoUploader";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "sonner";

export default function ChannelPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const [channelData, setChannelData] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  // 🚀 Hydration Safety Control Trigger
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 🚀 NAVIGATION FORCE LOCK: Kisi bhi naye page navigation trigger par popup close state verify karega
  useEffect(() => {
    const handleRouteChange = () => {
      setIsUploadOpen(false);
    };

    router.events.on("routeChangeStart", handleRouteChange);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router]);

  useEffect(() => {
    if (!router.isReady || !id) return;

    const fetchChannelDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch Channel Details
        const channelRes = await axiosInstance.get(`/video/details/${id}`);
        setChannelData(channelRes.data);
      } catch (error: any) {
        console.error("Error fetching channel data:", error);
        // Fallback production backup state block
        setChannelData({
          _id: id,
          channelname: "CodingNings",
          description: "Welcome to my development channel!",
          ownerId: id,
          subscribers: "125K"
        });
      }

      try {
        // Fetch Channel Videos
        const videosRes = await axiosInstance.get(`/video/channel/${id}`);
        setVideos(videosRes.data || []);
      } catch (videoErr) {
        console.error("Error fetching channel videos:", videoErr);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChannelDetails();
  }, [id, router.isReady]);

  if (!isMounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black">
        <div className="w-10 h-10 border-4 border-t-red-600 border-gray-200 rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium text-gray-600">Loading channel dashboard...</p>
      </div>
    );
  }

  const currentChannel = channelData || { channelname: "CodingNings", _id: id };
  const isOwner = user?._id === currentChannel?.ownerId || user?.channelId === id;

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Banner & Header Component Sync hooks mapping */}
      <ChannelHeader 
        channel={currentChannel} 
        user={user}
        isOwner={isOwner} 
        onUploadClick={() => setIsUploadOpen(true)} 
      />
      
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <Channeltabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Videos Grid Layout Handler */}
        {activeTab === "videos" || activeTab === "home" ? (
          <ChannelVideos videos={videos} />
        ) : (
          <div className="py-12 text-center text-gray-500">
            <p>No content available in this section.</p>
          </div>
        )}
      </div>

      {/* Floating Video Uploader Overlay Modal */}
      {isUploadOpen && (
        <VideoUploader 
          channelId={id as string} 
          channelName={currentChannel?.channelname} 
          isOpen={isUploadOpen} 
          onClose={() => setIsUploadOpen(false)} 
        />
      )}
    </div>
  );
}