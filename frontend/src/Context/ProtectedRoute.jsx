// src/Components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext"; // adjust path if needed

export default function ProtectedRoute({ children }) {
  const { isLoggedin, isInitialized, loading } = useAuth();

  if (!isInitialized || loading) return null; // wait for auth check
  if (!isLoggedin) return <Navigate to="/login" replace />;

  return children;
}
