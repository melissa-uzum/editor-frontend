import { Navigate, Outlet, useLocation } from "react-router-dom";

function getToken() {
  try {
    return localStorage.getItem("jwt") || "";
  } catch {
    return "";
  }
}

export default function ProtectedRoute() {
  const loc = useLocation();
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }

  return <Outlet />;
}
