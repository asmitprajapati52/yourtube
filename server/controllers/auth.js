import mongoose from "mongoose";
import users from "../Modals/Auth.js";

// 1️⃣ LOGIN CONTROLLER (Security logic temporarily commented out to avoid crash)
export const login = async (req, res) => {
  const { email, name, image } = req.body;

  try {
    let existingUser = await users.findOne({ email });

    if (!existingUser) {
      const newUser = await users.create({ email, name, image });
      return res.status(201).json({ result: newUser });
    }

    // OTP logic ko filhal bypass kiya hai taaki server chale
    return res.status(200).json({ result: existingUser });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// 2️⃣ OTP VERIFICATION (Placeholder)
export const verifyOTP = async (req, res) => {
  res.status(200).json({ message: "OTP flow disabled for now" });
};

// 3️⃣ UPDATE PROFILE
export const updateprofile = async (req, res) => {
  const { id: _id } = req.params;
  const { channelname, description } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(500).json({ message: "User unavailable..." });
  }
  try {
    const updatedata = await users.findByIdAndUpdate(
      _id,
      { $set: { channelname, description } },
      { returnDocument: 'after' }
    );
    return res.status(201).json(updatedata);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// 4️⃣ UPDATE THEME PREFERENCE
export const updateThemePreference = async (req, res) => {
  const { userId, theme } = req.body;
  if (!['light', 'dark', 'auto'].includes(theme)) {
    return res.status(400).json({ message: "Invalid theme type" });
  }
  try {
    const updatedUser = await users.findByIdAndUpdate(
      userId,
      { $set: { themePreference: theme } },
      { returnDocument: 'after' }
    );
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong with theme update" });
  }
};