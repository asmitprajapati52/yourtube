"use client";

import { onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider } from "firebase/auth";
import { useState, createContext, useEffect, useContext } from "react";
import { provider, auth } from "./firebase";
import axiosInstance from "./axiosinstance";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");

  const login = (userdata) => {
    setUser(userdata);
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(userdata));
    }
  };

  const logout = async () => {
    setUser(null);
    if (typeof window !== "undefined") localStorage.removeItem("user");
    try { await signOut(auth); } catch (error) { console.error(error); }
  };

  const applyThemeBasedOnTime = () => {
    if (typeof window === "undefined") return;
    const currentHour = new Date().getHours();
    if (currentHour >= 10 && currentHour < 12) {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("dark");
    }
  };

  const handlegooglesignin = async () => {
    setAuthLoading(true);
    try {
      // 1. Force Signout before login to ensure fresh start
      await signOut(auth);
      
      // 2. Force select_account prompt
      const googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, googleProvider);
      const firebaseuser = result.user;

      if (firebaseuser) {
        const payload = {
          email: firebaseuser.email,
          name: firebaseuser.displayName,
          image: firebaseuser.photoURL || "https://github.com/shadcn.png",
        };

        const response = await axiosInstance.post("/user/login", payload);
        
        // 3. Status 202 means OTP is required from backend
        if (response.status === 202) {
          await signOut(auth); // Sign out till OTP verified
          setOtpRequired(true);
          setOtpEmail(firebaseuser.email);
        } else if (response?.data?.result) {
          login(response.data.result);
          applyThemeBasedOnTime();
        }
      }
    } catch (error) {
      if (error.code !== 'auth/cancelled-popup-request') {
        console.error("Firebase Auth Error:", error);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const verifyOtpCode = async (email, otp) => {
    try {
      const response = await axiosInstance.post("/user/verify-otp", { email, otp });
      if (response.status === 200) {
        login(response.data.result);
        applyThemeBasedOnTime();
        setOtpRequired(false);
        setOtpEmail("");
        return true;
      }
      return false;
    } catch (error) {
      console.error("OTP verification failed:", error);
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseuser) => {
      if (firebaseuser) {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
          applyThemeBasedOnTime();
        }
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ 
        user, 
        login, 
        logout, 
        handlegooglesignin, 
        authLoading, 
        otpRequired, 
        setOtpRequired, 
        verifyOtpCode, 
        otpEmail 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);