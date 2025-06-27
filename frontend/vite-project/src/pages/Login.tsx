import React, { useContext, useState } from "react";
import "../index.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedIn, setLoginEmail } = useContext(AppContent);

  const [state, setState] = useState("sign up");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.email ||
      !formData.password ||
      (state === "sign up" && !formData.name)
    ) {
      return toast.error("Please fill all fields.");
    }

    setIsLoading(true);
    axios.defaults.withCredentials = true;

    try {
      let url = "";
      if (state === "sign up") {
        url = `${backendUrl}/api/auth/register`;
      } else {
        url = `${backendUrl}/api/auth/login-request-otp`;
      }

      const { data } = await axios.post(url, formData);

      if (data.success) {
        if (state === "sign up") {
          setIsLoggedIn(true);
          navigate("/");
        } else {
          setLoginEmail(formData.email); // Save email for OTP verification
          navigate("/verify-login");
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-box">
      <form onSubmit={handleSubmit}>
        <div className="form">
          <h2>{state === "sign up" ? "Create Account" : "Login"}</h2>

          {state === "sign up" && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <p onClick={() => navigate("/reset-password")}>Forgot password?</p>

          <button className="login-btn" type="submit" disabled={isLoading}>
            {isLoading
              ? "Please wait..."
              : state === "sign up"
              ? "Sign Up"
              : "Login"}
          </button>

          <span>
            {state === "sign up"
              ? "Already have an account?"
              : "Don't have an account?"}
          </span>

          <p
            onClick={() => setState(state === "sign up" ? "login" : "sign up")}
            style={{
              color: "#7783d1",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {state === "sign up" ? "Login here" : "Sign up here"}
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
