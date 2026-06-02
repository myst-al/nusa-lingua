import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";

/**
 * Wrapper untuk protected routes.
 * Redirect ke /login kalau belum signed-in.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink-mute text-sm">
        Memuat sesi…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
