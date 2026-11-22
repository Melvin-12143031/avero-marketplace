import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "../app/AuthContext";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsLoading(true);

      await register(formData);

      toast.success("Account registered successfully!");
      navigate("/login");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-[#FAF8F4] px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-xl border border-[#E4DCCE] bg-white shadow-sm lg:min-h-[620px] lg:grid-cols-2">
        {/* Registration Form */}
        <section className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-16">
          <div className="w-full max-w-md">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B3261E]">
                Become a Member
              </p>

              <h1 className="mt-3 font-serif text-3xl font-medium text-[#1C1C1C] sm:text-4xl">
                Create your account.
              </h1>

              <p className="mt-3 text-sm leading-7 text-[#6B6258]">
                Join AVÉRO and discover thoughtfully selected pieces for
                everyday living.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-9 space-y-6">
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-medium text-[#1C1C1C]"
                >
                  Full Name
                </label>

                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                  placeholder="Your full name"
                  className="w-full rounded-md border border-[#E4DCCE] bg-white px-4 py-3 text-sm text-[#1C1C1C] outline-none transition placeholder:text-[#A49A8D] focus:border-[#B3261E] focus:ring-2 focus:ring-[#B3261E]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-[#1C1C1C]"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-md border border-[#E4DCCE] bg-white px-4 py-3 text-sm text-[#1C1C1C] outline-none transition placeholder:text-[#A49A8D] focus:border-[#B3261E] focus:ring-2 focus:ring-[#B3261E]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-[#1C1C1C]"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    placeholder="At least 8 characters"
                    className="w-full rounded-md border border-[#E4DCCE] bg-white px-4 py-3 pr-12 text-sm text-[#1C1C1C] outline-none transition placeholder:text-[#A49A8D] focus:border-[#B3261E] focus:ring-2 focus:ring-[#B3261E]/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A8176] transition hover:text-[#B3261E] focus:outline-none focus:ring-2 focus:ring-[#B3261E]/20"
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>

                <p className="mt-2 text-xs text-[#8A8176]">
                  Use at least 8 characters for your password.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md bg-[#B3261E] px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#922019] focus:outline-none focus:ring-2 focus:ring-[#B3261E] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <div className="mt-8 border-t border-[#E4DCCE] pt-6 text-center">
              <p className="text-sm text-[#6B6258]">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-[#B3261E] transition hover:text-[#922019]"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* Brand Panel */}
        <section className="relative flex min-h-[260px] flex-col justify-between overflow-hidden bg-[#1C1C1C] p-8 text-white sm:min-h-[320px] sm:p-12 lg:min-h-full">
          <img
            src="/images/avero-hero.jpg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 size-full object-cover opacity-35"
          />

          <div className="absolute inset-0 bg-gradient-to-br from-[#1C1C1C]/90 via-[#1C1C1C]/60 to-[#1C1C1C]/80" />

          <div className="relative z-10">
            <Link
              to="/"
              className="font-serif text-3xl font-semibold tracking-[0.18em] text-white"
            >
              AVÉRO
            </Link>

            <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.25em] text-[#D8CABB]">
              Thoughtfully chosen. Beautifully lived.
            </p>
          </div>

          <div className="relative z-10 mt-12 max-w-md lg:mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D78B7F]">
              A Place for You
            </p>

            <h2 className="mt-4 font-serif text-3xl font-medium leading-tight sm:text-4xl lg:text-5xl">
              Make room for the things that matter.
            </h2>

            <p className="mt-5 max-w-sm text-sm leading-7 text-white/75">
              Create your account and enjoy a more personal way to discover
              everyday essentials and considered finds.
            </p>
          </div>

          <p className="relative z-10 mt-10 text-xs tracking-wide text-white/50">
            A collection made for everyday living.
          </p>
        </section>
      </div>
    </div>
  );
};

export default RegisterPage;
