import mongoose from "mongoose";
import users from "../modals/Auth.js";
import * as SibApiV3Sdk from '@getbrevo/brevo';
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
        lastIp: currentIp, 
        lastLocation: currentLocation 
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60000);

    await users.findOneAndUpdate({ email }, { $set: { otp, otpExpires: expires } });

    // 🚀 Send Email using Brevo API (Correct ES Module Initialization)
    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = "Security Alert: Login OTP Verification";
    sendSmtpEmail.htmlContent = `<p>Your login OTP is: <b>${otp}</b>. It will expire in 10 minutes.</p>`;
    sendSmtpEmail.sender = { name: "YourTube", email: process.env.EMAIL_USER };
    sendSmtpEmail.to = [{ email: email }];

    apiInstance.sendTransacEmail(sendSmtpEmail).then(() => {
      console.log("✅ Email sent successfully via Brevo to:", email);
    }).catch(err => {
      console.error("❌ Brevo email failed:", err);
    });

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

// 3️⃣ UPDATE PROFILE
export const updateprofile = async (req, res) => {
  const { id: _id } = req.params;
  const { channelname, description } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(500).json({ message: "User unavailable" });
  try {
    const updatedata = await users.findByIdAndUpdate(_id, { $set: { channelname, description } }, { returnDocument: 'after' });
    return res.status(201).json(updatedata);
  } catch (error) {
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