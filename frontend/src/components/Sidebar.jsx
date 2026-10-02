import { NavLink } from "react-router-dom";
import {
  BarChart3,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  UserRoundCog,
  BarChart4,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const mainNavigation = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    label: "Sales",
    icon: ShoppingCart,
    path: "/sales",
  },
  {
    label: "Inventory",
    icon: Package,
    path: "/inventory",
  },
  {
    label: "Customers",
    icon: Users,
    path: "/customers",
  },
  {
    label: "Employees",
    icon: UserRoundCog,
    path: "/employees",
  },
];

const analyticsNavigation = [
  {
    label: "Reports",
    icon: BarChart4,
    path: "/reports",
  },
];

function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  return (
    <>
      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen flex-col
          border-r border-slate-800 bg-slate-950 text-white
          transition-all duration-300
          lg:translate-x-0
          ${collapsed ? "lg:w-[82px]" : "lg:w-[260px]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          w-[270px]
        `}
      >
        {/* LOGO */}
        <div
          className={`
            flex h-[76px] items-center border-b border-slate-800
            ${collapsed ? "justify-center px-3" : "px-6"}
          `}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
              <BarChart3 size={21} strokeWidth={2.5} />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <h1 className="truncate text-sm font-bold tracking-tight">
                  NexaBusiness
                </h1>

                <p className="truncate text-[11px] text-slate-500">
                  Business Management Platform
                </p>
              </div>
            )}
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="flex-1 overflow-y-auto px-3 py-6">
          {/* MAIN */}
          <SidebarSection
            title="MAIN"
            collapsed={collapsed}
            items={mainNavigation}
            setMobileOpen={setMobileOpen}
          />

          <div className="my-6 border-t border-slate-800" />

          {/* ANALYTICS */}
          <SidebarSection
            title="ANALYTICS"
            collapsed={collapsed}
            items={analyticsNavigation}
            setMobileOpen={setMobileOpen}
          />

          <div className="my-6 border-t border-slate-800" />

          {/* SETTINGS */}
          <SidebarItem
            icon={Settings}
            label="Settings"
            path="/settings"
            collapsed={collapsed}
            setMobileOpen={setMobileOpen}
          />

          {/* HELP */}
          <SidebarItem
            icon={HelpCircle}
            label="Help & Support"
            path="/help"
            collapsed={collapsed}
            setMobileOpen={setMobileOpen}
          />
        </div>

        {/* USER AREA */}
        <div
          className={`
            border-t border-slate-800 p-3
            ${collapsed ? "flex justify-center" : ""}
          `}
        >
          <div
            className={`
              flex items-center rounded-xl bg-slate-900
              ${collapsed ? "justify-center p-2" : "gap-3 px-3 py-3"}
            `}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold">
              MA
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  Mohamed
                </p>

                <p className="truncate text-xs text-slate-500">
                  Administrator
                </p>
              </div>
            )}
          </div>
        </div>

        {/* COLLAPSE BUTTON */}
        <button
          type="button"
          onClick={() => setCollapsed((previous) => !previous)}
          className="
            absolute -right-3 top-[86px]
            hidden h-7 w-7 items-center justify-center
            rounded-full border border-slate-700
            bg-slate-900 text-slate-400 shadow-lg
            transition
            hover:border-blue-500 hover:text-white
            lg:flex
          "
          aria-label={
            collapsed ? "Expand sidebar" : "Collapse sidebar"
          }
        >
          {collapsed ? (
            <ChevronRight size={15} />
          ) : (
            <ChevronLeft size={15} />
          )}
        </button>
      </aside>
    </>
  );
}

//SIDEBAR SECTION
function SidebarSection({
  title,
  collapsed,
  items,
  setMobileOpen,
}) {
  return (
    <div>
      {!collapsed && (
        <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.18em] text-slate-600">
          {title}
        </p>
      )}

      <div className="space-y-1">
        {items.map((item) => (
          <SidebarItem
            key={item.label}
            {...item}
            collapsed={collapsed}
            setMobileOpen={setMobileOpen}
          />
        ))}
      </div>
    </div>
  );
}

//SIDEBAR ITEM
function SidebarItem({
  icon: Icon,
  label,
  path,
  collapsed,
  setMobileOpen,
}) {
  return (
    <NavLink
      to={path}
      onClick={() => setMobileOpen(false)}
      title={collapsed ? label : undefined}
      className={({ isActive }) => `
        group relative flex items-center rounded-xl
        text-sm font-medium
        transition-all duration-200

        ${
          collapsed
            ? "justify-center px-3 py-3"
            : "gap-3 px-3 py-2.5"
        }

        ${
          isActive
            ? "bg-blue-600/15 text-blue-400"
            : "text-slate-400 hover:bg-slate-900 hover:text-white"
        }
      `}
    >
      {({ isActive }) => (
        <>
          {/* ACTIVE INDICATOR */}
          {isActive && (
            <span className="absolute left-0 h-6 w-0.5 rounded-full bg-blue-500" />
          )}

          {/* ICON */}
          <Icon
            size={19}
            strokeWidth={isActive ? 2.3 : 2}
            className={
              isActive
                ? "text-blue-400"
                : "text-slate-500 transition-colors group-hover:text-slate-300"
            }
          />

          {/* LABEL */}
          {!collapsed && <span>{label}</span>}
        </>
      )}
    </NavLink>
  );
}

export default Sidebar;