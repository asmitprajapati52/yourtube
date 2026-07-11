import { Home, Compass, PlaySquare, Clock, ThumbsUp, History, User } from "lucide-react";
import React, { useState } from "react";
import { Button } from "./ui/button";
import Channeldialogue from "./channeldialogue";
import { useUser } from "@/lib/AuthContext";
import { useRouter } from "next/router";

const Sidebar = ({ isOpen = true }: { isOpen?: boolean }) => {
  const { user } = useUser();
  const [isdialogeopen, setisdialogeopen] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const navigateTo = (path: string) => {
    if (router.asPath === path || router.pathname === path) {
      return;
    }
    router.push(path);
  };

  return (
    <aside className="w-64 bg-white dark:bg-[#0f0f0f] text-black dark:text-white border-r dark:border-zinc-800 min-h-screen p-2 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto hidden md:block select-none transition-colors duration-150">
      <nav className="space-y-1">
        
        <Button 
          variant={router.pathname === "/" ? "secondary" : "ghost"} 
          className={`w-full justify-start cursor-pointer ${router.pathname === "/" ? "dark:bg-zinc-800 dark:text-white" : "dark:text-zinc-300 dark:hover:bg-zinc-900"}`}
          onClick={() => navigateTo("/")}
        >
          <Home className="w-5 h-5 mr-3" />
          Home
        </Button>

        <Button 
          variant={router.pathname === "/explore" ? "secondary" : "ghost"} 
          className={`w-full justify-start cursor-pointer ${router.pathname === "/explore" ? "dark:bg-zinc-800 dark:text-white" : "dark:text-zinc-300 dark:hover:bg-zinc-900"}`}
          onClick={() => navigateTo("/explore")}
        >
          <Compass className="w-5 h-5 mr-3" />
          Explore
        </Button>

        <Button 
          variant={router.pathname === "/subscriptions" ? "secondary" : "ghost"} 
          className={`w-full justify-start cursor-pointer ${router.pathname === "/subscriptions" ? "dark:bg-zinc-800 dark:text-white" : "dark:text-zinc-300 dark:hover:bg-zinc-900"}`}
          onClick={() => navigateTo("/subscriptions")}
        >
          <PlaySquare className="w-5 h-5 mr-3" />
          Subscriptions
        </Button>

        {user && (
          <>
            <div className="border-t dark:border-zinc-800 pt-2 mt-2 space-y-1">
              <Button 
                variant={router.pathname === "/history" ? "secondary" : "ghost"} 
                className={`w-full justify-start cursor-pointer ${router.pathname === "/history" ? "dark:bg-zinc-800 dark:text-white" : "dark:text-zinc-300 dark:hover:bg-zinc-900"}`}
                onClick={() => navigateTo("/history")}
              >
                <History className="w-5 h-5 mr-3" />
                History
              </Button>

              <Button 
                variant={router.pathname === "/liked" ? "secondary" : "ghost"} 
                className={`w-full justify-start cursor-pointer ${router.pathname === "/liked" ? "dark:bg-zinc-800 dark:text-white" : "dark:text-zinc-300 dark:hover:bg-zinc-900"}`}
                onClick={() => navigateTo("/liked")}
              >
                <ThumbsUp className="w-5 h-5 mr-3" />
                Liked videos
              </Button>

              <Button 
                variant={router.pathname === "/watch-later" ? "secondary" : "ghost"} 
                className={`w-full justify-start cursor-pointer ${router.pathname === "/watch-later" ? "dark:bg-zinc-800 dark:text-white" : "dark:text-zinc-300 dark:hover:bg-zinc-900"}`}
                onClick={() => navigateTo("/watch-later")}
              >
                <Clock className="w-5 h-5 mr-3" />
                Watch later
              </Button>

              {user?.channelname ? (
                <Button 
                  variant={router.pathname.startsWith("/channel") ? "secondary" : "ghost"} 
                  className={`w-full justify-start cursor-pointer ${router.pathname.startsWith("/channel") ? "dark:bg-zinc-800 dark:text-white" : "dark:text-zinc-300 dark:hover:bg-zinc-900"}`}
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