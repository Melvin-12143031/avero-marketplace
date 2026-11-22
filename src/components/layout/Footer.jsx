import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../app/AuthContext";

const Footer = () => {
  const { isAuthenticated, logout } = useAuth();
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

  const focusClass =
    "focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D78B7F] focus-visible:ring-offset-4 focus-visible:ring-offset-[#1C1C1C]";

  const linkClass = `group inline-flex w-fit items-center gap-2 text-sm text-[#BDB5AA] transition-colors duration-200 hover:text-[#FAF8F4] ${focusClass}`;

  const linkArrow = (
    <ArrowUpRight className="size-3 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
  );

  return (
    <footer className="bg-[#1C1C1C] text-[#FAF8F4]">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-5 pb-12 pt-16 sm:px-6 sm:pt-20 lg:pb-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_0.9fr_0.9fr] lg:gap-12">
          {/* Brand */}
          <div>
            <Link
              to="/"
              className={`inline-block text-3xl font-semibold tracking-[0.18em] transition-colors hover:text-[#D78B7F] ${focusClass}`}
            >
              AVÉRO
            </Link>

            <div className="mt-5 flex items-center gap-3">
              <span className="h-px w-8 bg-[#B3261E]" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#D78B7F]">
                Thoughtfully chosen
              </p>
            </div>

            <p className="mt-5 max-w-xs text-sm leading-7 text-[#BDB5AA]">
              Discover thoughtfully selected products that bring simplicity and
              inspiration to everyday living.
            </p>

            <Link
              to="/shop"
              className={`group mt-7 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#FAF8F4] transition-colors hover:text-[#D78B7F] ${focusClass}`}
            >
              Explore the collection
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FAF8F4]">
              Explore
            </h3>

            <ul className="mt-6 space-y-4">
              <li>
                <Link to="/" className={linkClass}>
                  Home
                  {linkArrow}
                </Link>
              </li>

              <li>
                <Link to="/shop" className={linkClass}>
                  Shop All
                  {linkArrow}
                </Link>
              </li>

              <li>
                <Link to="/about" className={linkClass}>
                  About AVÉRO
                  {linkArrow}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FAF8F4]">
              Customer Care
            </h3>

            <ul className="mt-6 space-y-4">
              {isAuthenticated && (
                <li>
                  <Link to="/orders" className={linkClass}>
                    My Orders
                    {linkArrow}
                  </Link>
                </li>
              )}

              <li>
                <Link to="/help" className={linkClass}>
                  Help Center
                  {linkArrow}
                </Link>
              </li>

              <li>
                <Link to="/contact" className={linkClass}>
                  Contact Us
                  {linkArrow}
                </Link>
              </li>

              <li>
                <Link to="/shop" className={linkClass}>
                  Continue Shopping
                  {linkArrow}
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FAF8F4]">
              Your Account
            </h3>

            <ul className="mt-6 space-y-4">
              {isAuthenticated ? (
                <li>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={`${linkClass} cursor-pointer`}
                  >
                    Sign Out
                    {linkArrow}
                  </button>
                </li>
              ) : (
                <>
                  <li>
                    <Link to="/login" className={linkClass}>
                      Sign In
                      {linkArrow}
                    </Link>
                  </li>

                  <li>
                    <Link to="/register" className={linkClass}>
                      Create an Account
                      {linkArrow}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Brand Statement */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-7 sm:px-6">
          <p className="text-center text-[10px] font-medium uppercase tracking-[0.3em] text-[#8A8176]">
            Less noise. Better choices.
          </p>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-center sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:text-left">
          <p className="text-xs text-[#8A8176]">
            © {new Date().getFullYear()} AVÉRO. All rights reserved.
          </p>

          <Link
            to="/"
            className={`text-xs text-[#8A8176] transition-colors hover:text-[#FAF8F4] ${focusClass}`}
          >
            Thoughtfully chosen. Simply yours.
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
