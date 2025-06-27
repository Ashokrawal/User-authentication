import express from "express";
import {
  delelteUser,
  loginRequestOtp,
  logout,
  register,
  verifyLoginOtp,
} from "../controllers/authController.js";
import userAuth from "../middleware/userAuth.js";

const authRouter = express.Router();

authRouter.post("/register", register);

authRouter.post("/logout", logout);
authRouter.post("/login-request-otp", loginRequestOtp);
authRouter.post("/verify-login-otp", verifyLoginOtp);

authRouter.delete("/:id", delelteUser);

export default authRouter;
