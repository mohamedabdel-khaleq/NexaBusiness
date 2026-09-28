import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";

import { loginUser } from "../services/auth.service";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError("");

    try {
      const response = await loginUser(
        data.email,
        data.password
      );

      console.log("LOGIN RESPONSE:", response);

      // JWT/AuthContext will be added next.
      // For now, we only verify that login works.
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      const message =
        error.response?.data?.message ||
        "Unable to sign in. Please try again.";

      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="min-h-screen lg:grid lg:grid-cols-[1.15fr_0.85fr]">

        {/* =====================================================
            LEFT - BRANDING
        ====================================================== */}

        <section className="relative hidden overflow-hidden lg:block">

          {/* Background */}

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.25),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.2),transparent_35%)]" />

          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950" />

          {/* Decorative grid */}

          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          {/* Glow */}

          <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="relative z-10 flex min-h-screen flex-col p-10 xl:p-14">

            {/* Logo */}

            <div>
              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500 shadow-lg shadow-blue-500/30">
                  <BarChart3
                    size={23}
                    strokeWidth={2.5}
                  />
                </div>

                <div>
                  <h1 className="text-xl font-bold tracking-tight text-white">
                    NexaBusiness
                  </h1>

                  <p className="text-xs text-slate-400">
                    Business Management Platform
                  </p>
                </div>

              </div>
            </div>

            {/* Hero */}

            <div className="flex flex-1 items-center">

              <div className="w-full max-w-2xl">

                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-medium text-blue-200">

                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />

                  Built for modern businesses

                </div>

                <h2 className="text-5xl font-bold leading-[1.08] tracking-tight text-white xl:text-6xl">

                  Run your business

                  <span className="block bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
                    with clarity.
                  </span>

                </h2>

                <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 xl:text-lg">
                  Manage sales, products, inventory, customers and daily
                  operations from one powerful workspace.
                </p>

                {/* Dashboard Preview */}

                <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] shadow-2xl shadow-black/20 backdrop-blur-xl">

                  {/* Dashboard Header */}

                  <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">

                    <div>
                      <p className="text-xs text-slate-400">
                        Business overview
                      </p>

                      <p className="mt-1 text-sm font-semibold text-white">
                        Today
                      </p>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                      Live data
                    </div>

                  </div>

                  {/* Stats */}

                  <div className="grid grid-cols-3 gap-3 p-4">

                    <PreviewCard
                      icon={<ShoppingCart size={15} />}
                      label="Sales"
                      value="$12.4K"
                    />

                    <PreviewCard
                      icon={<Package size={15} />}
                      label="Products"
                      value="248"
                    />

                    <PreviewCard
                      icon={<Users size={15} />}
                      label="Customers"
                      value="1,284"
                    />

                  </div>

                  {/* Chart */}

                  <div className="px-4 pb-4">

                    <div className="rounded-xl border border-white/10 bg-black/10 p-4">

                      <div className="mb-5 flex items-center justify-between">

                        <div>
                          <p className="text-xs text-slate-400">
                            Revenue
                          </p>

                          <p className="mt-1 text-lg font-semibold text-white">
                            $48,290
                          </p>
                        </div>

                        <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-medium text-emerald-300">
                          +12.8%
                        </span>

                      </div>

                      <div className="flex h-20 items-end gap-2">

                        {[35, 48, 42, 63, 54, 72, 65, 82, 74, 94].map(
                          (height, index) => (
                            <div
                              key={index}
                              className="flex-1 rounded-t-md bg-gradient-to-t from-blue-600/60 to-blue-300/90 transition-all"
                              style={{
                                height: `${height}%`,
                              }}
                            />
                          )
                        )}

                      </div>

                    </div>

                  </div>

                </div>

                {/* Features */}

                <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3">

                  <Feature text="Sales & POS" />

                  <Feature text="Inventory" />

                  <Feature text="Customers" />

                  <Feature text="Reports" />

                </div>

              </div>

            </div>

            {/* Footer */}

            <div className="flex items-center justify-between text-xs text-slate-500">

              <span>© 2026 NexaBusiness</span>

              <span>Secure business management</span>

            </div>

          </div>

        </section>

        {/* =====================================================
            RIGHT - LOGIN
        ====================================================== */}

        <section className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10 sm:px-8">

          <div className="w-full max-w-[430px]">

            {/* Mobile Branding */}

            <div className="mb-10 lg:hidden">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <BarChart3 size={21} />
                </div>

                <div>
                  <h1 className="font-bold text-slate-900">
                    NexaBusiness
                  </h1>

                  <p className="text-xs text-slate-500">
                    Business Management Platform
                  </p>
                </div>

              </div>

            </div>

            {/* Heading */}

            <div className="mb-8">

              <p className="mb-3 text-sm font-semibold text-blue-600">
                Welcome back
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Sign in to your workspace
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Enter your credentials to access your NexaBusiness dashboard.
              </p>

            </div>

            {/* Server Error */}

            {serverError && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {serverError}
              </div>
            )}

            {/* Form */}

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-5"
            >

              {/* Email */}

              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>

                <div className="relative">

                  <Mail
                    size={18}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                      errors.email
                        ? "text-red-400"
                        : "text-slate-400"
                    }`}
                  />

                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="you@example.com"
                    autoComplete="email"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={
                      errors.email
                        ? "email-error"
                        : undefined
                    }
                    className={`w-full rounded-xl border bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                      errors.email
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                        : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                    }`}
                  />

                </div>

                {errors.email && (
                  <p
                    id="email-error"
                    className="mt-2 text-xs font-medium text-red-500"
                  >
                    {errors.email.message}
                  </p>
                )}

              </div>

              {/* Password */}

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-xs font-semibold text-blue-600 transition hover:text-blue-700"
                  >
                    Forgot password?
                  </button>

                </div>

                <div className="relative">

                  <LockKeyhole
                    size={18}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                      errors.password
                        ? "text-red-400"
                        : "text-slate-400"
                    }`}
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={
                      errors.password
                        ? "password-error"
                        : undefined
                    }
                    className={`w-full rounded-xl border bg-white py-3.5 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                      errors.password
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                        : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

                {errors.password && (
                  <p
                    id="password-error"
                    className="mt-2 text-xs font-medium text-red-500"
                  >
                    {errors.password.message}
                  </p>
                )}

              </div>

              {/* Remember Me */}

              <label className="flex cursor-pointer items-center gap-3">

                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 accent-blue-600"
                />

                <span className="text-sm text-slate-600">
                  Keep me signed in
                </span>

              </label>

              {/* Submit */}

              <button
                type="submit"
                disabled={isLoading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-blue-600/30 disabled:cursor-not-allowed disabled:opacity-70"
              >

                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in

                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </>
                )}

              </button>

            </form>

            {/* Create Account */}

            <div className="mt-6 text-center text-sm text-slate-500">

              Don&apos;t have an account?{" "}

              <button
                type="button"
                onClick={() => navigate("/register")}
                className="font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Create account
              </button>

            </div>

            {/* Security */}

            <div className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-slate-400">

              <CheckCircle2 size={14} />

              Your connection is secure and encrypted

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}

/* =====================================================
   Preview Card
===================================================== */

function PreviewCard({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">

      <div className="flex items-center gap-2 text-slate-400">

        {icon}

        <span className="text-[10px]">
          {label}
        </span>

      </div>

      <p className="mt-2 text-sm font-semibold text-white">
        {value}
      </p>

    </div>
  );
}

/* =====================================================
   Feature
===================================================== */

function Feature({ text }) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-400">

      <CheckCircle2
        size={14}
        className="text-blue-400"
      />

      {text}

    </div>
  );
}

export default Login;