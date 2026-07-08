import React, { useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";

interface ChannelHeaderProps {
  channel: any;
  user: any;
  isOwner?: boolean;        // Isse pata chalega ki logged-in banda hi owner hai
  onUploadClick?: () => void; // Upload popup kholne ka dynamic state binder
}

const ChannelHeader = ({ channel, user, isOwner, onUploadClick }: ChannelHeaderProps) => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  // 🚀 CRASH PROTECTION: Agar channelname undefined ho toh default name use hoga
  const displayName = channel?.channelname || channel?.name || "CodingNings";
  const fallbackLetter = displayName ? displayName[0].toUpperCase() : "Y";
  const uniqueHandle = displayName ? displayName.toLowerCase().replace(/\s+/g, "") : "channel";

  return (
    <div className="w-full bg-white text-black">
      {/* Banner */}
      <div className="relative h-32 md:h-48 lg:h-64 bg-gradient-to-r from-blue-400 to-purple-500 overflow-hidden"></div>

      {/* Channel Info */}
      <div className="px-4 py-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          <Avatar className="w-20 h-20 md:w-32 md:h-32 border-4 border-white shadow-sm">
            <AvatarFallback className="text-2xl font-bold bg-gray-200 text-black">
              {fallbackLetter}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2 min-w-0">
            <h1 className="text-2xl md:text-4xl font-bold truncate">{displayName}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span>@{uniqueHandle}</span>
            </div>
            {channel?.description && (
              <p className="text-sm text-gray-700 max-w-2xl mt-2">
                {channel?.description}
              </p>
            )}
          </div>

          {/* Buttons Area: Owner ko Upload/Customize dikhega, doosro ko Subscribe */}
          <div className="flex gap-2 w-full md:w-auto justify-end">
            {isOwner ? (
              <>
                <Button
                  onClick={onUploadClick}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-full font-medium"
                >
                  Upload Video
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Customize Channel
                </Button>
              </>
            ) : (
              // Baki normal visitors ke liye subscribe button tabhi dikhega jab user logged in ho
              user && user?._id !== channel?.ownerId && (
                <Button
                  onClick={() => setIsSubscribed(!isSubscribed)}
                  variant={isSubscribed ? "outline" : "default"}
                  className={`rounded-full font-medium ${
                    isSubscribed ? "bg-gray-100 text-black" : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  {isSubscribed ? "Subscribed" : "Subscribe"}
                </Button>
              )
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ChannelHeader;