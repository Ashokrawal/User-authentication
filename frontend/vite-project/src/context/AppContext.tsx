// AppContext.tsx
import React, { createContext, useState, useContext } from "react";

export const AppContent = createContext(null);

export const AppProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const backendUrl = "http://localhost:3000";

  return (
    <AppContent.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        loginEmail,
        setLoginEmail,
        backendUrl,
      }}
    >
      {children}
    </AppContent.Provider>
  );
};

// Custom hook to use context
export const useAppContext = () => useContext(AppContent);
