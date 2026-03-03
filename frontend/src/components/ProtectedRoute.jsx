import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import api from "../utils/api"; //
import Loader from "./ui/Loader"; //

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let alive = true;

    const checkSession = async () => {
      try {
        // Sprawdzamy sesję na backendzie Bliss
        await api.get("/auth/me");
        if (alive) setStatus("authed");
      } catch (err) {
        if (alive) setStatus("guest");
      }
    };

    checkSession();

    return () => {
      alive = false;
    };
  }, []);

  if (status === "checking") {
    return <Loader fullPage message="Weryfikacja uprawnień..." />;
  }

  if (status === "guest") {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
