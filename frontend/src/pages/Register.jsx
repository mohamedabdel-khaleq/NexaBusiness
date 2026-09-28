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
  User,
} from "lucide-react";

import { registerUser } from "../services/auth.service";

const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Full name is required")
      .min(2, "Name must be at least 2 characters"),

    email: z
      .string()
      .min(1, "Email address is required")
      .email("Enter a valid email address"),

    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),

    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError("");

    try {
      const response = await registerUser(
        data.name,
        data.email,
        data.password
      );

      console.log("REGISTER RESPONSE:", response);

      navigate("/login");
    } catch (error) {
      console.error("REGISTER ERROR:", error);

      const message =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";

      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="min-h-screen lg:grid lg:grid-cols-[1.15fr_0.85fr]">
        {/* LEFT SIDE */}
        <section className="relative hidden overflow-hidden lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.25),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.2),transparent_35%)]" />

          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950" />

          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="relative z-10 flex min-h-screen flex-col p-10 xl:p-14">
            {/* LOGO */}
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500 shadow-lg shadow-blue-500/30">
                  <BarChart3 size={23} strokeWidth={2.5} />
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

            {/* HERO */}
            <div className="flex flex-1 items-center">
              <div className="max-w-2xl">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-medium text-blue-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  Start your business journey
                </div>

                <h2 className="text-5xl font-bold leading-[1.08] tracking-tight text-white xl:text-6xl">
                  Build your
                  <span className="block bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
                    workspace.
                  </span>
                </h2>

                <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 xl:text-lg">
                  Bring your sales, inventory, customers and daily operations
                  together in one powerful workspace.
                </p>

                <div className="mt-10 space-y-4">
                  <RegisterFeature
                    title="Manage your sales"
                    description="Track orders and payments from one place."
                  />

                  <RegisterFeature
                    title="Control your inventory"
                    description="Know what you have and what needs attention."
                  />

                  <RegisterFeature
                    title="Understand your business"
                    description="Use reports and insights to make better decisions."
                  />
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>© 2026 NexaBusiness</span>
              <span>Secure business management</span>
            </div>
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10 sm:px-8">
          <div className="w-full max-w-[430px]">
            {/* MOBILE LOGO */}
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

            {/* TITLE */}
            <div className="mb-8">
              <p className="mb-3 text-sm font-semibold text-blue-600">
                Get started
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Create your account
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Create your NexaBusiness account and start managing your
                workspace.
              </p>
            </div>

            {/* SERVER ERROR */}
            {serverError && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {serverError}
              </div>
            )}

            {/* FORM */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-5"
            >
              {/* NAME */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Full name
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                      errors.name ? "text-red-400" : "text-slate-400"
                    }`}
                  />

                  <input
                    id="name"
                    type="text"
                    {...register("name")}
                    placeholder="Mohamed Abdel-khaleq"
                    autoComplete="name"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={
                      errors.name ? "name-error" : undefined
                    }
                    className={`w-full rounded-xl border bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                      errors.name
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                        : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                    }`}
                  />
                </div>

                {errors.name && (
                  <p
                    id="name-error"
                    className="mt-2 text-xs font-medium text-red-500"
                  >
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* EMAIL */}
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
                      errors.email ? "text-red-400" : "text-slate-400"
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
                      errors.email ? "email-error" : undefined
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

              {/* PASSWORD */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                      errors.password ? "text-red-400" : "text-slate-400"
                    }`}
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
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
                      showPassword ? "Hide password" : "Show password"
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

              {/* CONFIRM PASSWORD */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                      errors.confirmPassword
                        ? "text-red-400"
                        : "text-slate-400"
                    }`}
                  />

                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors.confirmPassword)}
                    aria-describedby={
                      errors.confirmPassword
                        ? "confirm-password-error"
                        : undefined
                    }
                    className={`w-full rounded-xl border bg-white py-3.5 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                      errors.confirmPassword
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                        : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((previous) => !previous)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <p
                    id="confirm-password-error"
                    className="mt-2 text-xs font-medium text-red-500"
                  >
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={isLoading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-blue-600/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </button>
            </form>

            {/* LOGIN LINK */}
            <div className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Sign in
              </button>
            </div>

            {/* SECURITY */}
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

function RegisterFeature({ title, description }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-400/10 text-blue-300">
        <CheckCircle2 size={16} />
      </div>

      <div>
        <p className="text-sm font-semibold text-white">{title}</p>

        <p className="mt-1 text-sm leading-6 text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

export default Register;