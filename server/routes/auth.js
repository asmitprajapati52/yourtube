import express from "express";
import { login, updateprofile, updateThemePreference, verifyOTP } from "../controllers/auth.js";

const routes = express.Router();

// 1️⃣ Login route
routes.post("/login", login);

// 2️⃣ OTP Verification route
routes.post("/verify-otp", verifyOTP);

// 3️⃣ Profile update route
routes.patch("/update/:id", updateprofile);

// 4️⃣ Theme Preference Update Route
routes.patch("/update-theme", updateThemePreference);

export default routes;