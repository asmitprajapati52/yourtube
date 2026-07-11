import React, { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar"; 
import ThemeEngine from "@/components/ThemeEngine"; 
import "@/styles/globals.css"; 
import type { AppProps } from "next/app";
import { UserProvider } from "@/lib/AuthContext"; 

export default function App({ Component, pageProps }: AppProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const mockUserSession = pageProps.user || null; 

  return (
    <UserProvider> 
      {/* Dynamic background theme clock helper */}
      <ThemeEngine user={mockUserSession} />

      {/* Root Wrapper: Isko exact tumhare purane structure jaisa rakha hai, bas tailwind dark utilities handle karne ke liye classes add ki hain */}
      <div className="min-h-screen bg-white dark:bg-[#0f0f0f] text-black dark:text-white flex flex-col transition-colors duration-150">
        
        {/* Header wrapper block */}
        <Header onMenuClick={() => setIsSidebarOpen((prev) => !prev)} />
        
        {/* Content pipeline layout structure */}
        <div className="flex flex-1 w-full relative">
          
          <Sidebar isOpen={isSidebarOpen} />
          
          {/* Main Layout Component container */}
          <main className="flex-1 w-full bg-white dark:bg-[#0f0f0f] overflow-x-hidden transition-colors duration-150">
            <Component {...pageProps} />
          </main>
          
        </div>
      </div>
    </UserProvider>
  );
}