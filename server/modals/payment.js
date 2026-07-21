import mongoose from "mongoose";

const paymentSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  razorpay_order_id: { type: String, required: true },
  razorpay_payment_id: { type: String },
  plan: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.payment || mongoose.model("payment", paymentSchema);