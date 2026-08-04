import mongoose from "mongoose";
import users from "../modals/Auth.js";
import dotenv from "dotenv";
import geoip from 'geoip-lite';

dotenv.config();

// Helper: Get Location from IP
const getLocation = (ip) => {
  const lookupIp = (ip === "::1" || ip === "127.0.0.1") ? "103.148.164.120" : ip;
  const geo = geoip.lookup(lookupIp);
  return geo ? `${geo.city}, ${geo.region}` : "Unknown Location";
};

// 1️⃣ LOGIN
export const login = async (req, res) => {
  const { email, name, image } = req.body;
  const currentIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const currentLocation = getLocation(currentIp);

  try {
    let existingUser = await users.findOne({ email });

    if (!existingUser) {
      existingUser = await users.create({ 
        email, 
        name, 
        image, 
        channelname: "", 
        description: "", 
        lastIp: currentIp, 
        lastLocation: currentLocation 
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60000);

    await users.findOneAndUpdate({ email }, { $set: { otp, otpExpires: expires } });

    // 🚀 Send Email using Brevo HTTP API
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: "YourTube", email: process.env.EMAIL_USER },
        to: [{ email: email }],
        subject: "Security Alert: Login OTP Verification",
        htmlContent: `<p>Your login OTP is: <b>${otp}</b>. It will expire in 10 minutes.</p>`
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("❌ Brevo API failed:", data);
    } else {
      console.log("✅ Email sent successfully via Brevo API to:", email);
    }

    return res.status(202).json({ message: "OTP sent to email", requiresOTP: true });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// 2️⃣ OTP VERIFICATION
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const currentIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const currentLocation = getLocation(currentIp);

  try {
    const user = await users.findOne({ email });
    if (user && user.otp === otp && user.otpExpires > new Date()) {
      await users.findOneAndUpdate(
        { email },
        { 
          $set: { 
            lastIp: currentIp, 
            lastLocation: currentLocation, 
            otp: null, 
            otpExpires: null 
          } 
        }
      );
      return res.status(200).json({ result: user });
    }
    return res.status(400).json({ message: "Invalid or expired OTP" });
  } catch (error) {
    return res.status(500).json({ message: "Verification failed" });
  }
};

// 3️⃣ UPDATE PROFILE (With Duplicate Channel Name Prevention)
export const updateprofile = async (req, res) => {
  const { id: _id } = req.params;
  const { channelname, description } = req.body;
  
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(500).json({ message: "User unavailable" });
  }

  try {
    if (channelname && channelname.trim() !== "") {
      const existingChannel = await users.findOne({ 
        channelname: { $regex: new RegExp(`^${channelname.trim()}$`, "i") }, 
        _id: { $ne: _id } 
      });

      if (existingChannel) {
        return res.status(400).json({ message: "This channel name is already taken! Please choose another one." });
      }
    }

    const updatedata = await users.findByIdAndUpdate(
      _id, 
      { $set: { channelname: channelname ? channelname.trim() : "", description } }, 
      { returnDocument: 'after' }
    );
    
    return res.status(201).json(updatedata);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Channel name already exists!" });
    }
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// 4️⃣ UPDATE THEME
export const updateThemePreference = async (req, res) => {
  const { userId, theme } = req.body;
  if (!['light', 'dark', 'auto'].includes(theme)) return res.status(400).json({ message: "Invalid theme" });
  try {
    const updatedUser = await users.findByIdAndUpdate(userId, { $set: { themePreference: theme } }, { returnDocument: 'after' });
    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// 5️⃣ DELETE CHANNEL / ACCOUNT
export const deleteChannel = async (req, res) => {
  const { id: _id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const deletedUser = await users.findByIdAndDelete(_id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ success: true, message: "Channel deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong while deleting channel" });
  }
};