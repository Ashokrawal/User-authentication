import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const VerifyLogin = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedIn, loginEmail } = useContext(AppContent);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error("Please enter OTP");

    setIsLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/verify-login-otp`,
        { email: loginEmail, otp },
        { withCredentials: true }
      );

      if (data.success) {
        setIsLoggedIn(true);
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-box">
      <form onSubmit={handleSubmit}>
        <div className="form">
          <h2>Verify OTP</h2>
          <p style={{ fontSize: "14px" }}>
            Enter the OTP sent to <strong>{loginEmail}</strong>
          </p>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button className="login-btn" type="submit" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify & Login"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VerifyLogin;
