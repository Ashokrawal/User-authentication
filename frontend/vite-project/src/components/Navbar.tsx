import React from "react";
import "../index.css";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <div className="navbar">
      <h2>Ash's Journey</h2>
      <button onClick={() => navigate("/Login")} className="login-btn">
        Login
      </button>  
    </div>
  );
};

export default Navbar;
