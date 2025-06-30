import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  // basic info
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAccountVerified: { type: Boolean, default: false },
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
