import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  User,
  Settings,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar({ setMobileOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);

  // DARK MODE
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const displayName = user?.name || "Mohamed";

  // Apply theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/login", { replace: true });
  };

  const handleProfileToggle = () => {
    setProfileOpen((prev) => !prev);
  };

  const handleThemeToggle = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex w-full items-center justify-between gap-4">
        {/* LEFT */}
        <div className="flex min-w-0 items-center gap-3">
          {/* MOBILE MENU */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={21} />
          </button>

          {/* WELCOME */}
          <div className="hidden min-w-0 sm:block">
            <p className="text-xs font-medium text-slate-400">
              Welcome back
            </p>

            <h2 className="truncate text-sm font-bold text-slate-900">
              Good morning, {displayName}
            </h2>
          </div>
        </div>

        {/* SEARCH */}
        <div className="hidden flex-1 justify-center px-4 lg:flex">
          <button
            type="button"
            className="group flex w-full max-w-[430px] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-left transition hover:border-slate-300 hover:bg-white"
          >
            <Search
              size={17}
              className="text-slate-400 transition group-hover:text-slate-600"
            />

            <span className="flex-1 text-sm text-slate-400">
              Search orders, customers, products...
            </span>

            <kbd className="hidden rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-400 xl:block">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* RIGHT */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {/* THEME TOGGLE */}
          <button
            type="button"
            onClick={handleThemeToggle}
            className="hidden h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 sm:flex"
            aria-label="Toggle theme"
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          {/* NOTIFICATIONS */}
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Notifications"
          >
            <Bell size={19} />

            <span className="absolute right-2.5 top-2 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
          </button>

          <div className="mx-1 hidden h-7 w-px bg-slate-200 sm:block" />

          {/* PROFILE */}
          <div className="relative">
            <button
              type="button"
              onClick={handleProfileToggle}
              className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-100"
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
            >
              {/* AVATAR */}
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
                MA
              </div>

              {/* USER INFO */}
              <div className="hidden text-left xl:block">
                <p className="max-w-[120px] truncate text-xs font-semibold text-slate-800">
                  {displayName}
                </p>

                <p className="text-[10px] text-slate-400">
                  Administrator
                </p>
              </div>

              {/* ARROW */}
              <ChevronDown
                size={15}
                className={`hidden text-slate-400 transition-transform xl:block ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* PROFILE DROPDOWN */}
            {profileOpen && (
              <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/50">
                {/* USER INFO */}
                <div className="border-b border-slate-100 px-3 py-3">
                  <p className="text-sm font-semibold text-slate-900">
                    {displayName}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Administrator
                  </p>
                </div>

                {/* PROFILE SETTINGS */}
                <button
                  type="button"
                  onClick={() => setProfileOpen(false)}
                  className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <User size={17} className="text-slate-400" />
                  Profile Settings
                </button>

                {/* ACCOUNT PREFERENCES */}
                <button
                  type="button"
                  onClick={() => setProfileOpen(false)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <Settings size={17} className="text-slate-400" />
                  Account Preferences
                </button>

                <div className="my-2 border-t border-slate-100" />

                {/* LOGOUT */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;