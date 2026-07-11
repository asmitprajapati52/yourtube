"use client";

import { useEffect } from "react";

interface ThemeEngineProps {
  user: {
    _id?: string;
    themePreference?: "light" | "dark" | "auto";
  } | null;
}

export default function ThemeEngine({ user }: ThemeEngineProps) {
  useEffect(() => {
    const handleThemeSync = () => {
      const root = window.document.documentElement;

      // 1️⃣ AGAR MANUAL PREFERENCE HAI, TOH AUTO TIME LOGIC CHALANE KI ZAROORAT NAHI HAI
      if (user?.themePreference && user.themePreference !== "auto") {
        root.classList.remove("light", "dark");
        root.classList.add(user.themePreference);
        return; 
      }

      // 2️⃣ AGAR AUTO HAI, TABHI TIME CHECK CHALAO
      if (user?.themePreference === "auto" || !user) {
        const now = new Date();
        const istHourString = now.toLocaleTimeString("en-US", {
          timeZone: "Asia/Kolkata",
          hour12: false,
          hour: "2-digit"
        });
        
        const currentHourIST = parseInt(istHourString, 10);
        root.classList.remove("light", "dark");

        // Light mode: 6 AM se 6 PM tak
        if (currentHourIST >= 6 && currentHourIST < 18) {
          root.classList.add("light");
        } else {
          root.classList.add("dark");
        }
      }
    };

    handleThemeSync();

    const intervalId = setInterval(handleThemeSync, 60000);
    return () => clearInterval(intervalId);
  }, [user]);

  return null;
}