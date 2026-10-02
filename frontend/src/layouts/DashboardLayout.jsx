import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div
        className={`
          min-h-screen
          transition-all duration-300
          ${collapsed ? "lg:pl-[82px]" : "lg:pl-[260px]"}
        `}
      >
        <Navbar setMobileOpen={setMobileOpen} />

        <main className="p-4 sm:p-6 lg:p-8 dark:bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;