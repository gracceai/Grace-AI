import { Navigate } from "react-router-dom";
import { isSupabaseConfigured } from "../lib/supabase";

function AuthRoute({ children, mode, session }) {
  if (!isSupabaseConfigured) {
    return mode === "private" ? <Navigate replace to="/login" /> : children;
  }

  const isAuthenticated = Boolean(session?.user);

  if (mode === "private" && !isAuthenticated) {
    return <Navigate replace to="/login" />;
  }

  if (mode === "guest" && isAuthenticated) {
    return <Navigate replace to="/dashboard" />;
  }

  return children;
}

export default AuthRoute;
