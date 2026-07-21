import Razorpay from "razorpay";
import Payment from "../modals/payment.js";
import User from "../modals/auth.js";
import nodemailer from "nodemailer";

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const createOrder = async (req, res) => {
  const { amount } = req.body;
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: amount * 100, // Paise mein
      currency: "INR",
    });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  const { userId, razorpay_order_id, razorpay_payment_id, plan, amount } = req.body;
  try {
    // 1. Payment Record Save karo
    await Payment.create({ 
      userId, 
      razorpay_order_id, 
      razorpay_payment_id, 
      plan, 
      amount, 
      status: "Success" 
    });
    
    // 2. User ka Plan Update karo aur updated user fetch karo taaki email mil sake
    const updatedUser = await User.findByIdAndUpdate(userId, { 
      subscriptionPlan: plan, 
      isPremium: true 
    }, { new: true });

    // 3. Confirmation Email / Invoice Bhejo
    if (updatedUser && updatedUser.email) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: updatedUser.email,
        subject: `Subscription Confirmation - MeTube Premium (${plan.toUpperCase()} Plan)`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #ff0000;">Thank you for upgrading to MeTube Premium!</h2>
            <p>Hi ${updatedUser.name || "User"},</p>
            <p>Your payment was successful and your account has been upgraded.</p>
            <hr style="border: none; border-top: 1px solid #eee;" />
            <h3>Order & Plan Details:</h3>
            <ul>
              <li><strong>Plan:</strong> ${plan.toUpperCase()}</li>
              <li><strong>Amount Paid:</strong> ₹${amount}</li>
              <li><strong>Order ID:</strong> ${razorpay_order_id}</li>
              <li><strong>Payment ID:</strong> ${razorpay_payment_id}</li>
              <li><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
            </ul>
            <p>Enjoy your ad-free viewing experience and premium benefits!</p>
            <p>Best regards,<br/><strong>MeTube Team</strong></p>
          </div>
        `,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error("Error sending confirmation email:", err);
        } else {
          console.log("Confirmation email sent: ", info.response);
        }
      });
    }
    
    res.status(200).json({ message: "Subscription upgraded and confirmation email sent successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};