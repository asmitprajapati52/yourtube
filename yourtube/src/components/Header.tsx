import { Bell, Menu, Mic, Search, User, VideoIcon, Sun, Moon, Clock } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Input } from "./ui/input";
import axios from "axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Channeldialogue from "./channeldialogue";
import VideoUploader from "./VideoUploader"; 
import { useRouter } from "next/router";
import { useUser } from "@/lib/AuthContext";

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { user, logout, handlegooglesignin, setUser } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [isdialogeopen, setisdialogeopen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  // Local state taaki dropdown UI instant update ho ske
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark" | "auto">("dark");
  const router = useRouter();

  // Sync state whenever user object loads or changes
  useEffect(() => {
    if (user?.themePreference) {
      setCurrentTheme(user.themePreference);
      // DOM elements manual switch agar global CSS configure na ho toh
      const root = window.document.documentElement;
      if (user.themePreference === "light") {
        root.classList.remove("dark");
      } else if (user.themePreference === "dark") {
        root.classList.add("dark");
      }
    }
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeypress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(e as any);
    }
  };

  const handleThemeChange = async (selectedTheme: "light" | "dark" | "auto") => {
    const userId = user?._id || user?.id;
    if (!userId) return;

    try {
      // Sahi URL jo index.js se bind hai
      const response = await axios.patch("http://localhost:5000/user/update-theme", {
        userId,
        theme: selectedTheme,
      });

      if (response.status === 200) {
        // UI class manipulation
        const root = window.document.documentElement;
        if (selectedTheme === "light") {
          root.classList.remove("dark");
        } else if (selectedTheme === "dark") {
          root.classList.add("dark");
        } else if (selectedTheme === "auto") {
          const hour = new Date().getHours();
          if (hour >= 18 || hour < 6) root.classList.add("dark");
          else root.classList.remove("dark");
        }

        // States updates
        setCurrentTheme(selectedTheme);
        if (setUser) {
          setUser((prev: any) => ({ ...prev, themePreference: selectedTheme }));
        }
      }
    } catch (error) {
      console.error("Failed to update manual user profile theme preference:", error);
    }
  };

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-white dark:bg-[#0f0f0f] text-black dark:text-white border-b dark:border-zinc-800 sticky top-0 z-50 h-[57px] select-none transition-colors duration-150">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onMenuClick} type="button" className="dark:text-white dark:hover:bg-zinc-800">
          <Menu className="w-6 h-6" />
        </Button>
        <Link href="/" className="flex items-center gap-1">
          <div className="bg-red-600 p-1 rounded">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93-.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>
          <span className="text-xl font-medium tracking-tight text-black dark:text-white">YourTube</span>
          <span className="text-xs text-gray-400 ml-1">IN</span>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-2xl mx-4">
        <div className="flex flex-1 items-center">
          <Input
            type="search"
            placeholder="Search"
            value={searchQuery}
            onKeyPress={handleKeypress}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-l-full border-r-0 focus-visible:ring-0 text-black dark:text-white bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 h-9"
          />
          <Button type="submit" className="rounded-r-full px-6 bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border border-l-0 border-zinc-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700 h-9">
            <Search className="w-5 h-5" />
          </Button>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full dark:text-white dark:hover:bg-zinc-800" type="button">
          <Mic className="w-5 h-5" />
        </Button>
      </form>

      <div className="flex items-center gap-2">
        {user ? (
          <>
            <Button variant="ghost" size="icon" onClick={() => setIsUploadOpen(true)} type="button" className="dark:text-white dark:hover:bg-zinc-800">
              <VideoIcon className="w-6 h-6" />
            </Button>
            <Button variant="ghost" size="icon" type="button" className="dark:text-white dark:hover:bg-zinc-800">
              <Bell className="w-6 h-6" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image} />
                    <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white dark:bg-zinc-950 text-black dark:text-white border dark:border-zinc-800" align="end" forceMount>
                {user?.channelname ? (
                  <DropdownMenuItem asChild className="dark:focus:bg-zinc-800 cursor-pointer">
                    <Link href={`/channel/${user?._id || user?.id}`}>Your channel</Link>
                  </DropdownMenuItem>
                ) : (
                  <div className="px-2 py-1.5">
                    <Button variant="secondary" size="sm" className="w-full" onClick={() => setisdialogeopen(true)}>
                      Create Channel
                    </Button>
                  </div>
                )}
                <DropdownMenuItem asChild className="dark:focus:bg-zinc-800 cursor-pointer">
                  <Link href="/history">History</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="dark:focus:bg-zinc-800 cursor-pointer">
                  <Link href="/liked">Liked videos</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="dark:focus:bg-zinc-800 cursor-pointer">
                  <Link href="/watch-later">Watch later</Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="dark:bg-zinc-800" />
                <div className="px-2 py-1 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 tracking-wider uppercase">
                  Appearance Theme
                </div>
                
                <DropdownMenuItem 
                  onClick={() => handleThemeChange("light")} 
                  className={`dark:focus:bg-zinc-800 cursor-pointer flex items-center gap-2 ${currentTheme === "light" ? "font-bold text-red-600 dark:text-red-400 bg-zinc-100 dark:bg-zinc-800" : ""}`}
                >
                  <Sun className="w-4 h-4" /> Light Mode {currentTheme === "light" && "✓"}
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => handleThemeChange("dark")} 
                  className={`dark:focus:bg-zinc-800 cursor-pointer flex items-center gap-2 ${currentTheme === "dark" ? "font-bold text-red-600 dark:text-red-400 bg-zinc-100 dark:bg-zinc-800" : ""}`}
                >
                  <Moon className="w-4 h-4" /> Dark Mode {currentTheme === "dark" && "✓"}
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => handleThemeChange("auto")} 
                  className={`dark:focus:bg-zinc-800 cursor-pointer flex items-center gap-2 ${currentTheme === "auto" ? "font-bold text-red-600 dark:text-red-400 bg-zinc-100 dark:bg-zinc-800" : ""}`}
                >
                  <Clock className="w-4 h-4" /> Auto (Time Based) {currentTheme === "auto" && "✓"}
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="dark:bg-zinc-800" />
                <DropdownMenuItem onClick={logout} className="dark:focus:bg-zinc-800 text-red-600 dark:text-red-400 cursor-pointer">Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Button className="flex items-center gap-2 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200" onClick={handlegooglesignin} type="button">
            <User className="w-4 h-4" />
            Sign in
          </Button>
        )}
      </div>

      <Channeldialogue isopen={isdialogeopen} onclose={() => setisdialogeopen(false)} mode="create" />
      <VideoUploader isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} channelId={user?._id || user?.id} channelName={user?.channelname} />
    </header>
  );
};

export default Header;