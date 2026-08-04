import mongoose from "mongoose";

const userschema = mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String },
  channelname: { 
    type: String, 
    unique: true, 
    sparse: true, 
    default: "" 
  },
  description: { type: String },
  image: { type: String },
  joinedon: { type: Date, default: Date.now },
  themePreference: { 
    type: String, 
    enum: ['light', 'dark', 'auto'], 
    default: 'auto' 
  },
  lastIp: { type: String, default: "" }, 
  lastLocation: { type: String, default: "" }, 
  otp: { type: String },
  otpExpires: { type: Date },
  subscriptionPlan: { type: String, default: "Free" },
  isPremium: { type: Boolean, default: false },
  subscriptionDate: { type: Date }
});

export default mongoose.models.user || mongoose.model("user", userschema);