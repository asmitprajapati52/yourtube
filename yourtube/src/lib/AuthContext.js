"use client";

// Hamein yahan signInWithPopup chahiye, redirect ke jhanjhat hatane ke liye
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { useState, createContext, useEffect, useContext } from "react";
import { provider, auth } from "./firebase";
import axiosInstance from "./axiosinstance";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const login = (userdata) => {
    setUser(userdata);
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(userdata));
    }
  };

  const logout = async () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
    }
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  const applyThemeBasedOnTime = () => {
    if (typeof window === "undefined") return;
    const currentHour = new Date().getHours();
    if (currentHour >= 10 && currentHour < 12) {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    }
  };

  // Naya Popup aur Database Sync Logic ek sath
  const handlegooglesignin = async () => {
    setAuthLoading(true);
    try {
      // 1. Google Auth Popup open hoga aur user data laayega
      const result = await signInWithPopup(auth, provider);
      const firebaseuser = result.user;

      if (firebaseuser) {
        const payload = {
          email: firebaseuser.email,
          name: firebaseuser.displayName,
          image: firebaseuser.photoURL || "https://github.com/shadcn.png",
          loginTime: new Date().toISOString(),
        };

        console.log("Sending payload to backend...", payload);

        // 2. Turant local Express backend server ko request bhejega
        const response = await axiosInstance.post("/user/login", payload);
        
        if (response?.data?.result) {
          console.log("Backend registration success!", response.data.result);
          login(response.data.result);
          applyThemeBasedOnTime();
        } else {
          console.log("Backend verified but result not found in response structure.");
        }
      }
    } catch (error) {
      console.error("🔥 Firebase Popup Sign-In Error:", error);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    // Purana getRedirectResult poora saaf kar diya hai, ab uski zarurat nahi hai

    const unsubscribe = onAuthStateChanged(auth, async (firebaseuser) => {
      if (firebaseuser) {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
          applyThemeBasedOnTime();
          setAuthLoading(false);
          return;
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, login, logout, handlegooglesignin, authLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);