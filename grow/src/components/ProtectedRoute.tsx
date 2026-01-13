// import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 1. LocalStorage se token check karein (Node.js backend wala)
    const token = localStorage.getItem("token");
    
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    
    setIsChecking(false);
  }, []);

  if (isChecking) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // 2. Agar token nahi hai, to wapis /auth par bhej do
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // 3. Agar token hai, to page khulne do
  return <>{children}</>;
};