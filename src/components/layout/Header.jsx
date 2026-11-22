import {
  ShoppingBag,
  Package,
  LogIn,
  LogOut,
  UserRound,
  LayoutDashboard,
} from "lucide-react";

import { NavLink, Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Button from "../ui/Button";
import { useAuth } from "../../app/AuthContext";

const Header = ({ cartCount, onCartClick }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully.");
      navigate("/login");
    } catch (error) {
      toast.error(error.message || "Unable to log out.");
    }
  };

  const navLinkClass = ({ isActive }) =>
    `relative flex h-10 items-center text-sm font-medium transition-colors
    after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full
    after:origin-left after:transition-transform
    ${
      isActive
        ? "text-[#B3261E] after:scale-x-100 after:bg-[#B3261E]"
        : "text-[#514A43] after:scale-x-0 after:bg-[#B3261E] hover:text-[#B3261E] hover:after:scale-x-100"
    }`;

  const actionLinkClass = ({ isActive }) =>
    `flex h-10 items-center justify-center gap-2 rounded-md px-2 text-sm font-medium transition-colors
    ${
      isActive
        ? "text-[#B3261E] bg-[#EDE6D8]/60"
        : "text-[#514A43] hover:bg-[#EDE6D8]/60 hover:text-[#B3261E]"
    }`;

  return (
    <header className="sticky top-0 z-40">
      {/* Brand bar */}
      <div className="bg-[#1C1C1C] px-4 py-4 text-center">
        <Link to="/" className="inline-block">
          <span className="block text-2xl font-semibold tracking-[0.18em] text-[#FAF8F4]">
            AVÉRO
          </span>

          <span className="mt-1 block text-[10px] tracking-[0.12em] text-[#EDE6D8]">
            Thoughtfully chosen. Simply yours.
          </span>
        </Link>
      </div>

      {/* Navigation bar */}
      <div className="border-b border-[#E4DCCE] bg-[#FAF8F4]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          {/* Main navigation */}
          <nav className="flex shrink-0 items-center gap-4 sm:gap-7">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>

            <NavLink to="/shop" className={navLinkClass}>
              Shop
            </NavLink>
          </nav>

          {/* Account and shopping actions */}
          <div className="flex min-w-0 items-center gap-1 sm:gap-3">
            {isAuthenticated && (
              <NavLink
                to="/orders"
                aria-label="My Orders"
                className={actionLinkClass}
              >
                <Package size={18} />
                <span className="hidden lg:inline">Orders</span>
              </NavLink>
            )}
            {user?.role === "admin" && (
              <NavLink
                to="/admin"
                aria-label="Admin Dashboard"
                className={actionLinkClass}
              >
                <LayoutDashboard size={18} />
                <span className="hidden lg:inline">Admin</span>
              </NavLink>
            )}

            {isAuthenticated ? (
              <>
                <div className="hidden items-center gap-2 px-2 text-sm text-[#514A43] md:flex">
                  <UserRound size={18} />
                  <span className="max-w-32 truncate">{user.fullName}</span>
                </div>

                <Button
                  variant="secondary"
                  onClick={handleLogout}
                  aria-label="Logout"
                  className="h-10 gap-2 rounded-md border border-[#E4DCCE] bg-[#EDE6D8] px-3 text-[#1C1C1C] hover:bg-[#E4DCCE]"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <Link
                to="/login"
                aria-label="Sign In"
                className="flex h-10 items-center justify-center gap-2 rounded-md px-2 text-sm font-medium text-[#514A43] transition-colors hover:bg-[#EDE6D8]/60 hover:text-[#B3261E]"
              >
                <LogIn size={18} />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            <Button
              onClick={onCartClick}
              aria-label={`Shopping bag with ${cartCount} items`}
              className="h-10 gap-2 rounded-md bg-[#B3261E] px-3 text-[#FAF8F4] hover:bg-[#922018]"
            >
              <ShoppingBag size={18} />
              <span className="hidden sm:inline">Bag</span>
              <span>({cartCount})</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
