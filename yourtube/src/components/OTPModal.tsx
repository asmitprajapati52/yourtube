import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useUser } from "@/lib/AuthContext";

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

const OTPModal = ({ isOpen, onClose, email }: OTPModalProps) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { verifyOtpCode } = useUser();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Yahan email pass karna mat bhoolna agar AuthContext handle kar raha hai
    const success = await verifyOtpCode(email, otp); 
    if (success) {
      onClose();
    } else {
      alert("Invalid OTP, please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-xl shadow-xl w-full max-w-sm border dark:border-zinc-800 flex flex-col gap-5 overflow-hidden">
        
        {/* Header Section */}
        <div>
          <h2 className="text-xl font-bold mb-2 dark:text-white">Security Verification</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            A new login was detected. Please enter the 6-digit OTP sent to <b>{email}</b>.
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="text"
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full text-center text-2xl tracking-[0.5em] h-14 border-zinc-300 dark:border-zinc-700"
            maxLength={6}
            required
          />
          
          <div className="flex gap-3 w-full mt-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose} 
              className="flex-1 border border-zinc-200 dark:border-zinc-700"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-red-600 hover:bg-red-700 text-white" 
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify"}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default OTPModal;