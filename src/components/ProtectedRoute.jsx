import { Navigate, Outlet, useLocation } from "react-router-dom";
import { auth } from "../auth";

export default function ProtectedRoute() {
  const loc = useLocation();

  if (!auth.isAuthed()) {
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }

  return <Outlet />;
}