
import { useEffect, useState } from "react";
import {
  UserRound,
  ShieldCheck,
  Save,
  LoaderCircle,
  Mail,
  LockKeyhole,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";

import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const getErrorMessage = (error) => {
  return (
    error.response?.data?.message ||
    error.message ||
    "Something went wrong. Please try again."
  );
};

export default function Settings() {
  const { user, setUser, token } = useAuth();

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [notice, setNotice] = useState({
    type: "",
    message: "",
  });

  const [profileLoaded, setProfileLoaded] = useState(false);

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const showNotice = (type, message) => {
    setNotice({ type, message });
  };

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      if (!token) {
        if (!cancelled) {
          setLoading(false);
          showNotice(
            "error",
            "Your session was not found. Please log in again."
          );
        }
        return;
      }

      setLoading(true);

      try {
        const response = await API.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (cancelled) return;

        const currentUser = response.data.user;

        setProfile({
          name: currentUser.name || "",
          email: currentUser.email || "",
        });

        if (setUser) {
          setUser((previousUser) => ({
            ...previousUser,
            ...currentUser,
          }));
        }

        setProfileLoaded(true);
      } catch (error) {
        if (cancelled) return;

        setProfile({
          name: user?.name || "",
          email: user?.email || "",
        });

        showNotice("error", getErrorMessage(error));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (notice.message) {
      setNotice({ type: "", message: "" });
    }
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswords((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (notice.message) {
      setNotice({ type: "", message: "" });
    }
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setNotice({ type: "", message: "" });

    const name = profile.name.trim();
    const email = profile.email.trim();

    if (name.length < 2) {
      showNotice("error", "Name must be at least 2 characters.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showNotice("error", "Please enter a valid email address.");
      return;
    }

    setSavingProfile(true);

    try {
      const response = await API.patch(
        "/auth/me",
        { name, email },
        authConfig
      );

      const updatedUser = response.data.user;

      setProfile({
        name: updatedUser.name,
        email: updatedUser.email,
      });

      if (setUser) {
        setUser((previousUser) => ({
          ...previousUser,
          ...updatedUser,
        }));
      }

      showNotice(
        "success",
        response.data.message || "Profile updated successfully."
      );
    } catch (error) {
      showNotice("error", getErrorMessage(error));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setNotice({ type: "", message: "" });

    if (
      !passwords.currentPassword ||
      !passwords.newPassword ||
      !passwords.confirmPassword
    ) {
      showNotice("error", "Please complete all password fields.");
      return;
    }

    if (passwords.newPassword.length < 6) {
      showNotice(
        "error",
        "Your new password must be at least 6 characters."
      );
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      showNotice("error", "The new passwords do not match.");
      return;
    }

    if (passwords.currentPassword === passwords.newPassword) {
      showNotice(
        "error",
        "Your new password must be different from your current password."
      );
      return;
    }

    setChangingPassword(true);

    try {
      const response = await API.post(
        "/auth/me/change-password",
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        },
        authConfig
      );

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      showNotice(
        "success",
        response.data.message || "Password changed successfully."
      );
    } catch (error) {
      showNotice("error", getErrorMessage(error));
    } finally {
      setChangingPassword(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white";

  const labelClass =
    "mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200";

  const tabs = [
    {
      id: "profile",
      label: "My Profile",
      description: "Personal information",
      icon: UserRound,
    },
    {
      id: "security",
      label: "Security",
      description: "Password and account security",
      icon: ShieldCheck,
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <LoaderCircle className="h-6 w-6 animate-spin text-indigo-600" />
          <span className="text-sm font-medium">
            Loading your settings...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full space-y-6 pb-8">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-indigo-600 dark:text-indigo-400">
            ACCOUNT MANAGEMENT
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Settings
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Manage your profile and keep your account secure.
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
          <ShieldCheck className="h-6 w-6" />
        </div>
      </div>

      {/* Account overview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl font-bold text-white shadow-lg shadow-indigo-500/20">
            {(profile.name || user?.name || "U")
              .trim()
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-bold text-slate-900 dark:text-white">
              {profile.name || user?.name || "Your account"}
            </h2>

            <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
              {profile.email || user?.email || "No email available"}
            </p>

            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Account settings
            </div>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Settings navigation */}
        <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <p className="px-3 pb-3 pt-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            Preferences
          </p>

          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setNotice({ type: "", message: "" });
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                    active
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      active
                        ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">
                      {tab.label}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                      {tab.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Settings content */}
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-7">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {activeTab === "profile"
                ? "Personal Information"
                : "Password & Security"}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {activeTab === "profile"
                ? "Update the name and email associated with your account."
                : "Change your password to help protect your account."}
            </p>
          </div>

          <div className="p-5 sm:p-7">
            {/* Success and error messages */}
            {notice.message && (
              <div
                role="status"
                className={`mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm ${
                  notice.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                    : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
                }`}
              >
                {notice.type === "success" ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                ) : (
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                )}

                <span>{notice.message}</span>
              </div>
            )}

            {activeTab === "profile" && (
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div>
                  <label className={labelClass} htmlFor="settings-name">
                    Full name
                  </label>

                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      id="settings-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={profile.name}
                      onChange={handleProfileChange}
                      placeholder="Enter your full name"
                      minLength={2}
                      required
                      className={`${inputClass} pl-12`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass} htmlFor="settings-email">
                    Email address
                  </label>

                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      id="settings-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                      placeholder="you@example.com"
                      required
                      className={`${inputClass} pl-12`}
                    />
                  </div>

                  <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Your email must be unique and valid.
                  </p>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setProfile({
                        name: user?.name || "",
                        email: user?.email || "",
                      });
                      setNotice({ type: "", message: "" });
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset
                  </button>

                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingProfile ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}

                    {savingProfile ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "security" && (
              <form onSubmit={handleChangePassword} className="space-y-5">
                <div className="mb-2 rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 dark:border-indigo-500/20 dark:bg-indigo-500/5">
                  <div className="flex items-start gap-3">
                    <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" />

                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">
                        Keep your account secure
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                        Enter your current password before choosing a new
                        one. Use at least 6 characters.
                      </p>
                    </div>
                  </div>
                </div>

                {[
                  {
                    id: "currentPassword",
                    label: "Current password",
                    field: "current",
                    placeholder: "Enter current password",
                    autoComplete: "current-password",
                  },
                  {
                    id: "newPassword",
                    label: "New password",
                    field: "new",
                    placeholder: "Enter new password",
                    autoComplete: "new-password",
                  },
                  {
                    id: "confirmPassword",
                    label: "Confirm new password",
                    field: "confirm",
                    placeholder: "Re-enter new password",
                    autoComplete: "new-password",
                  },
                ].map((item) => (
                  <div key={item.id}>
                    <label className={labelClass} htmlFor={item.id}>
                      {item.label}
                    </label>

                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                      <input
                        id={item.id}
                        name={item.id}
                        type={showPasswords[item.field] ? "text" : "password"}
                        autoComplete={item.autoComplete}
                        value={passwords[item.id]}
                        onChange={handlePasswordChange}
                        placeholder={item.placeholder}
                        minLength={item.id === "currentPassword" ? undefined : 6}
                        required
                        className={`${inputClass} pl-12 pr-12`}
                      />

                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(item.field)}
                        aria-label={
                          showPasswords[item.field]
                            ? "Hide password"
                            : "Show password"
                        }
                        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                      >
                        {showPasswords[item.field] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end border-t border-slate-100 pt-5 dark:border-slate-800">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {changingPassword ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="h-4 w-4" />
                    )}

                    {changingPassword
                      ? "Updating password..."
                      : "Update password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
