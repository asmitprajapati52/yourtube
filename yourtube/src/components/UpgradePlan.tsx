"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "@/lib/AuthContext";

interface Plan {
  name: string;
  price: number;
  amount: number;
  features: string[];
  color: string;
  btnColor: string;
}

const UpgradePlan: React.FC = () => {
  const { user } = useUser() as any;
  const [loading, setLoading] = useState<boolean>(false);
  const [localProfile, setLocalProfile] = useState<any>(null);

  // Fallback ke liye localStorage se profile check karna
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = 
        localStorage.getItem("Profile") || 
        localStorage.getItem("user") || 
        localStorage.getItem("userInfo");
      
      if (stored) {
        try {
          setLocalProfile(JSON.parse(stored));
        } catch (e) {
          console.error("Error parsing local storage profile", e);
        }
      }
    }
  }, []);

  // Safe User ID aur Details extraction
  const userId = 
    user?._id || 
    user?.id || 
    localProfile?.result?._id || 
    localProfile?.result?.id || 
    localProfile?._id || 
    localProfile?.id;

  const currentPlan: string = 
    user?.subscriptionPlan || 
    localProfile?.result?.subscriptionPlan || 
    localProfile?.subscriptionPlan || 
    "Free";

  const userName = 
    user?.name || 
    localProfile?.result?.name || 
    localProfile?.name || 
    "User";

  const userEmail = 
    user?.email || 
    localProfile?.result?.email || 
    localProfile?.email || 
    "user@example.com";

  console.log("Resolved User ID:", userId);

  const plans: Plan[] = [
    {
      name: "Bronze",
      price: 99,
      amount: 99,
      features: ["Ad-free standard experience", "720p HD Streaming", "Basic Support"],
      color: "border-amber-600 bg-amber-50 text-amber-900",
      btnColor: "bg-amber-600 hover:bg-amber-700"
    },
    {
      name: "Silver",
      price: 199,
      amount: 199,
      features: ["Ad-free HD experience", "1080p Full HD Streaming", "Priority Support", "Background Play"],
      color: "border-slate-400 bg-slate-50 text-slate-900",
      btnColor: "bg-slate-700 hover:bg-slate-800"
    },
    {
      name: "Gold",
      price: 499,
      amount: 499,
      features: ["Ultimate 4K Ultra HD Streaming", "Zero Ads Ever", "24/7 VIP Support", "Offline Downloads"],
      color: "border-yellow-500 bg-yellow-50 text-yellow-900",
      btnColor: "bg-yellow-600 hover:bg-yellow-700"
    }
  ];

  // Load Razorpay Script Dynamically
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

  const handleUpgrade = async (planName: string, amount: number) => {
    if (!userId) {
      alert("Please login first to upgrade your plan!");
      return;
    }

    setLoading(true);
    const isScriptLoaded = await loadRazorpayScript();

    if (!isScriptLoaded) {
      alert("Razorpay SDK failed to load. Check your internet connection.");
      setLoading(false);
      return;
    }

    try {
      // 1. Create order on backend
      const { data: order } = await axios.post("http://localhost:5000/payment/create-order", {
        amount,
      });

      // 2. Razorpay Checkout Options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_YOUR_KEY_HERE",
        amount: order.amount,
        currency: "INR",
        name: "MeTube Premium",
        description: `Upgrade to ${planName} Plan`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            // 3. Verify payment on backend with signature
            await axios.post("http://localhost:5000/payment/verify", {
              userId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: planName,
              amount,
            });

            alert(`Successfully upgraded to ${planName} Plan!`);
            window.location.reload();
          } catch (err) {
            console.error(err);
            alert("Payment verification failed on server.");
          }
        },
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: {
          color: "#ef4444",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error(error);
      alert("Something went wrong while creating the order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Upgrade Your MeTube Experience</h1>
        <p className="mt-3 text-lg text-gray-600">
          Choose a plan that fits your streaming needs. Current Active Plan:{" "}
          <span className="font-semibold text-red-600 uppercase">{currentPlan}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const isCurrent = currentPlan.toLowerCase() === plan.name.toLowerCase();
          return (
            <div
              key={plan.name}
              className={`border-2 rounded-2xl p-8 shadow-lg flex flex-col justify-between transition-transform duration-300 hover:scale-105 ${plan.color}`}
            >
              <div>
                <h3 className="text-2xl font-bold">{plan.name} Plan</h3>
                <div className="my-6">
                  <span className="text-4xl font-bold">₹{plan.price}</span>
                  <span className="text-sm opacity-80"> / one-time</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm">
                      <span className="mr-2 text-green-600 font-bold">✓</span> {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                disabled={loading || isCurrent}
                onClick={() => handleUpgrade(plan.name, plan.amount)}
                className={`w-full py-3 px-4 rounded-xl text-white font-medium shadow-md transition cursor-pointer ${
                  isCurrent ? "bg-gray-400 cursor-not-allowed" : plan.btnColor
                }`}
              >
                {isCurrent ? "Active Plan" : loading ? "Processing..." : `Get ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UpgradePlan;