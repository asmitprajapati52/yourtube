"use client";

import React from "react";
import axiosInstance from "@/lib/axiosinstance";

export default function UpgradePage() {
  const plans = [
    { name: "Bronze", price: 99, features: ["Ads-Free (Limited)", "Basic Support"] },
    { name: "Silver", price: 199, features: ["Ads-Free", "Downloads", "1080p Quality"] },
    { name: "Gold", price: 499, features: ["Everything in Silver", "4K Quality", "Priority Support"] }
  ];

  // Load Razorpay Script dynamically
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (plan: string, amount: number) => {
    try {
      // Multiple keys check kar rahe hain taaki login miss na ho
      const profileData = 
        localStorage.getItem("Profile") || 
        localStorage.getItem("user") || 
        localStorage.getItem("userInfo");

      let userId = null;
      if (profileData) {
        const parsed = JSON.parse(profileData);
        userId = parsed?.result?._id || parsed?.result?.id || parsed?._id || parsed?.id;
      }

      console.log("Extracted User ID:", userId);

      if (!userId) {
        alert("Please login first to upgrade your plan!");
        return;
      }

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert("Razorpay SDK failed to load. Check your internet connection.");
        return;
      }

      // 1. Backend se Order create karo
      const { data: order } = await axiosInstance.post("/payment/create-order", { amount });

      // 2. Razorpay Options Setup
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "MeTube Premium",
        description: `Upgrade to ${plan} Plan`,
        order_id: order.id,
        handler: async (response: any) => {
          await axiosInstance.post("/payment/verify", {
            userId: userId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            plan: plan,
            amount: amount
          });
          alert("Subscription Successful!");
          window.location.href = "/";
        },
        theme: { color: "#ef4444" }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment failed", err);
      alert("Something went wrong with the payment setup.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-center mb-10 text-black">Choose Your Plan</h1>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div key={p.name} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col">
            <h2 className="text-xl font-bold mb-2 text-black">{p.name}</h2>
            <p className="text-3xl font-extrabold mb-6 text-black">₹{p.price}</p>
            <ul className="mb-8 space-y-2 text-gray-600 flex-1">
              {p.features.map(f => <li key={f}>✓ {f}</li>)}
            </ul>
            <button 
              onClick={() => handlePayment(p.name, p.price)}
              className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition cursor-pointer"
            >
              Get {p.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}