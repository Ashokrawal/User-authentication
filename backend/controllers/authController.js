import bcrypt, { hash } from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodeMailer.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body; // get from user

  // CHECK IF ALL DETAILS FILLED
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "provide all the details" });
  }

  // CHECK IF HE IS A EXISITING USER
  try {
    const existingUser = await userModel.findOne({ email });

    // IF HE IS, RETURN A RESPONSE
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

    // IF NOT THEN ENCRPT HIS PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // ASSIGN HIS HASHED PASSWORD TO HIS PASSWORD AND
    const user = new userModel({ name, email, password: hashedPassword });

    // SAVE THE USER
    await user.save();
    // GENERATE TOKEN
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    // SAVE IN THE COOKIES
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // sending welcome email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to Ash's Journey",
      text: `Welcome to Ash's Journey, Your account has created with email id:${email}`,
    };

    await transporter.sendMail(mailOptions);

    console.log(user._id);
    return res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.status(200).json({ success: true, message: "logged out" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const delelteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await userModel.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 1. Request OTP After Password Auth
export const loginRequestOtp = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json({ success: false, message: "Email and password required" });

  const user = await userModel.findOne({ email: email.trim().toLowerCase() });
  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch)
    return res
      .status(401)
      .json({ success: false, message: "Invalid password" });

  // Generate OTP
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  user.loginOtp = otp;
  user.loginOtpExpiresAt = Date.now() + 10 * 60 * 1000;
  await user.save();

  // Send OTP to email
  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: user.email,
    subject: "Login OTP",
    text: `Your login OTP is: ${otp}`,
  };
  await transporter.sendMail(mailOptions);

  // Generate short-lived token for OTP verification
  const tempToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  return res.status(200).json({
    success: true,
    message: "OTP sent to email",
    token: tempToken,
  });
};

// 2. Verify OTP and Complete Login
export const verifyLoginOtp = async (req, res) => {
  const { otp } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!otp || !token)
    return res
      .status(400)
      .json({ success: false, message: "OTP and token required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (
      user.loginOtp !== otp ||
      !user.loginOtpExpiresAt ||
      user.loginOtpExpiresAt < Date.now()
    ) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    // Clear OTP and issue long-term auth token
    user.loginOtp = "";
    user.loginOtpExpiresAt = null;
    await user.save();

    const authToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ success: true, message: "Login successful" });
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(404)
      .json({ success: false, message: "provide valid email" });
  }

  try {
    const user = await userModel.findOne({ email });

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpiresAt = Date.now() + 15 * 60 * 1000;

    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Reset Otp",
      text: `Your reset OTP is ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: "OTP sent to email" });

    if (!user) {
      return res.json({ success: false, message: "user not found" });
    }
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
