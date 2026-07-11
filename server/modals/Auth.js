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
  // New Security Fields
  lastLocation: { type: String },
  lastDevice: { type: String },
  otp: { type: String },
  otpExpires: { type: Date }
});

export default mongoose.model("user", userschema);