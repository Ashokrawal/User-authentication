import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  // basic info
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAccountVerified: { type: Boolean, default: false },
  resetOtpExpireAt: { type: Number, default: 0 },
  loginOtp: { type: String, default: "" },
  loginOtpExpiresAt: { type: Date, default: 0 },
  resetOtp: { type: String, dafault: "" },
  resetOtpExpiresAt: { type: String, dafault: "" },
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
