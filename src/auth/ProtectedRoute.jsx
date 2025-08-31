import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem("token"); // Get token from localStorage
  let isAuthenticated = false; // Track authentication status
  let userRole = null; // Track user role

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
      userRole = payload.role; // Extract user role from token
      // Check token expiry (exp is in seconds)
      if (payload.exp && Date.now() / 1000 < payload.exp) {
        isAuthenticated = true; // Token is valid and not expired
      }
    } catch {
      isAuthenticated = false; // Invalid token
    }
  }

  // If not authenticated or role not allowed, redirect to login
  if (!isAuthenticated || !allowedRoles.includes(userRole)) {
    return <Navigate to="/auth/login" replace />;
  }

  // If authenticated and role allowed, render child routes
  return <Outlet />;
}

export default ProtectedRoute;
