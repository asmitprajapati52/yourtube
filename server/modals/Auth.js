import mongoose from "mongoose";

const userschema = mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String },
  channelname: { type: String },
  description: { type: String },
  image: { type: String },
  joinedon: { type: Date, default: Date.now },
  themePreference: { 
    type: String, 
    enum: ['light', 'dark', 'auto'], 
    default: 'auto' 
  },
  lastIp: { type: String, default: "" }, 
  lastLocation: { type: String, default: "" }, // Location field
  otp: { type: String },
  otpExpires: { type: Date }
});

export default mongoose.model("user", userschema);