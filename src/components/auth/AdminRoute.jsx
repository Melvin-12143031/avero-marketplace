import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../app/AuthContext";

const AdminRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Wait until session restoration finishes

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600">Checking authentication...</p>
      </div>
    );
  }

  // Redirect unauthenticated users to login

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Only administrators can access admin routes
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
export default AdminRoute;
