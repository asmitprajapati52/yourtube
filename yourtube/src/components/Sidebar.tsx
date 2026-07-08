import { Home, Compass, PlaySquare, Clock, ThumbsUp, History, User } from "lucide-react";
import React, { useState } from "react";
import { Button } from "./ui/button";
import Channeldialogue from "./channeldialogue";
import { useUser } from "@/lib/AuthContext";
import { useRouter } from "next/router"; // Agar app directory hai toh 'next/navigation' use karna

const Sidebar = ({ isOpen = true }: { isOpen?: boolean }) => {
  const { user } = useUser();
  const [isdialogeopen, setisdialogeopen] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  // 🚀 FOOLPROOF ROUTING HANDLER: Next.js programmatic routing bypasses nested anchor tag issues
  const navigateTo = (path: string) => {
    // Agar user pehle se hi usi page par hai, toh navigate drop kar do invariant crash se bachne ke liye
    if (router.asPath === path || router.pathname === path) {
      return;
    }
    router.push(path);
  };

  return (
    <aside className="w-64 bg-white border-r min-h-screen p-2 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto hidden md:block select-none">
      <nav className="space-y-1">
        
        {/* Programmatic Navigation Buttons layout mapping */}
        <Button 
          variant={router.pathname === "/" ? "secondary" : "ghost"} 
          className="w-full justify-start cursor-pointer"
          onClick={() => navigateTo("/")}
        >
          <Home className="w-5 h-5 mr-3" />
          Home
        </Button>

        <Button 
          variant={router.pathname === "/explore" ? "secondary" : "ghost"} 
          className="w-full justify-start cursor-pointer"
          onClick={() => navigateTo("/explore")}
        >
          <Compass className="w-5 h-5 mr-3" />
          Explore
        </Button>

        <Button 
          variant={router.pathname === "/subscriptions" ? "secondary" : "ghost"} 
          className="w-full justify-start cursor-pointer"
          onClick={() => navigateTo("/subscriptions")}
        >
          <PlaySquare className="w-5 h-5 mr-3" />
          Subscriptions
        </Button>

        {user && (
          <>
            <div className="border-t pt-2 mt-2 space-y-1">
              <Button 
                variant={router.pathname === "/history" ? "secondary" : "ghost"} 
                className="w-full justify-start cursor-pointer"
                onClick={() => navigateTo("/history")}
              >
                <History className="w-5 h-5 mr-3" />
                History
              </Button>

              <Button 
                variant={router.pathname === "/liked" ? "secondary" : "ghost"} 
                className="w-full justify-start cursor-pointer"
                onClick={() => navigateTo("/liked")}
              >
                <ThumbsUp className="w-5 h-5 mr-3" />
                Liked videos
              </Button>

              <Button 
                variant={router.pathname === "/watch-later" ? "secondary" : "ghost"} 
                className="w-full justify-start cursor-pointer"
                onClick={() => navigateTo("/watch-later")}
              >
                <Clock className="w-5 h-5 mr-3" />
                Watch later
              </Button>

              {user?.channelname ? (
                <Button 
                  variant={router.pathname.startsWith("/channel") ? "secondary" : "ghost"} 
                  className="w-full justify-start cursor-pointer"
                  onClick={() => navigateTo(`/channel/${user.id || user._id}`)}
                >
                  <User className="w-5 h-5 mr-3" />
                  Your channel
                </Button>
              ) : (
                <div className="px-2 py-1.5">
                  <Button variant="secondary" size="sm" className="w-full" onClick={() => setisdialogeopen(true)}>
                    Create Channel
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </nav>
      <Channeldialogue isopen={isdialogeopen} onclose={() => setisdialogeopen(false)} mode="create" />
    </aside>
  );
};

export default Sidebar;