import {
  ShoppingBag,
  Package,
  LogIn,
  ShoppingCart,
  LogOut,
  UserRound,
} from "lucide-react";

import { NavLink, Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Button from "../ui/Button";
import { useAuth } from "../../app/AuthContext";

const Header = ({ cartCount, onCartClick }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully.");
    navigate("/login");
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:px-6 sm:py-4">
        <a href="/" className="text-xl font-bold tracking-tight text-slate-900">
          Market<span className="text-indigo-600">Place</span>
        </a>

        <nav className="flex items-center gap-2 sm:gap-3">
          <NavLink
            to="/"
            end
            aria-label="Products"
            className={({ isActive }) =>
              `flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-medium transition-colors hover:bg-slate-50 sm:h-auto sm:w-auto sm:px-4 sm:py-2.5 ${
                isActive
                  ? "text-indigo-600"
                  : "text-slate-600 hover:text-indigo-600"
              }`
            }
          >
            <ShoppingBag size={20} className="sm:hidden" />

            <span className="hidden sm:inline">Products</span>
          </NavLink>

          <NavLink
            to="/orders"
            aria-label="My Orders"
            className={({ isActive }) =>
              `flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-medium transition-colors hover:bg-slate-50 sm:h-auto sm:w-auto sm:px-4 sm:py-2.5 ${
                isActive
                  ? "text-indigo-600"
                  : "text-slate-600 hover:text-indigo-600"
              }`
            }
          >
            <Package size={20} className="sm:hidden" />

            <span className="hidden sm:inline">My Orders</span>
          </NavLink>

          <Button
            variant="secondary"
            onClick={onCartClick}
            aria-label={`Cart with ${cartCount} items`}
            className="h-11 w-11 shrink-0 rounded-lg p-0 sm:h-auto sm:w-auto sm:px-4 sm:py-2.5"
          >
            <ShoppingCart size={20} className="sm:hidden" />

            <span className="hidden sm:inline">Cart ({cartCount})</span>
          </Button>

          {isAuthenticated ? (
            <>
              <div className="hidden items-center gap-2 text-sm font-medium text-slate-700 sm:flex">
                <UserRound size={18} />
                <span>{user.fullName}</span>
              </div>

              <Button
                variant="secondary"
                onClick={handleLogout}
                aria-label="Logout"
                className="h-11 w-11 shrink-0 rounded-lg p-0 sm:h-auto sm:w-auto sm:px-4 sm:py-2.5"
              >
                <LogOut size={20} className="sm:hidden" />

                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                aria-label="Sign In"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-indigo-600 sm:h-auto sm:w-auto sm:px-4 sm:py-2.5"
              >
                <LogIn size={20} className="sm:hidden" />

                <span className="hidden sm:inline">Sign In</span>
              </Link>

              <Link
                to="/register"
                className="hidden rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 sm:inline-flex"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
