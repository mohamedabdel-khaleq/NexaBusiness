import { NavLink } from "react-router-dom";
import {
  BarChart3,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tags,
  Boxes,
  Users,
  UserRoundCog,
  CreditCard,
  BarChart4,
  Truck,
  Settings,
  HelpCircle,
  ShieldCheck,
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
    label: "Products",
    icon: Package,
    path: "/products",
  },
  {
    label: "Categories",
    icon: Tags,
    path: "/categories",
  },
  {
    label: "Inventory",
    icon: Boxes,
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
  {
    label: "Users",
    icon: ShieldCheck,
    path: "/users",
  },
  {
    label: "Delivery Orders",
    icon: Truck,
    path: "/delivery-orders",
  },
  {
    label: "Delivery Drivers",
    icon: UserRoundCog,
    path: "/delivery-drivers",
  },
  {
    label: "Payments",
    icon: CreditCard,
    path: "/payments",
  },
];

const analyticsNavigation = [
  {
    label: "Reports",
    icon: BarChart4,
    path: "/reports",
  },
];

function Sidebar({ mobileOpen, setMobileOpen }) {
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
          fixed left-0 top-0 z-50 flex h-screen w-[270px]
          flex-col border-r border-slate-800
          bg-slate-950 text-white
          transition-transform duration-300
          lg:w-[260px] lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* LOGO */}
        <div className="flex h-[76px] shrink-0 items-center border-b border-slate-800 px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
              <BarChart3 size={21} strokeWidth={2.5} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold tracking-tight">
                NexaBusiness
              </h1>
              <p className="truncate text-[11px] text-slate-500">
                Business Management Platform
              </p>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="flex-1 overflow-y-auto px-3 py-6">
          <SidebarSection
            title="MAIN"
            items={mainNavigation}
            setMobileOpen={setMobileOpen}
          />

          <div className="my-6 border-t border-slate-800" />

          <SidebarSection
            title="ANALYTICS"
            items={analyticsNavigation}
            setMobileOpen={setMobileOpen}
          />

          <div className="my-6 border-t border-slate-800" />

          <SidebarItem
            icon={Settings}
            label="Settings"
            path="/settings"
            setMobileOpen={setMobileOpen}
          />

          <SidebarItem
            icon={HelpCircle}
            label="Help & Support"
            path="/help"
            setMobileOpen={setMobileOpen}
          />
        </div>

        {/* USER AREA */}
        <div className="shrink-0 border-t border-slate-800 p-3">
          <div className="flex items-center gap-3 rounded-xl bg-slate-900 px-3 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold">
              MA
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                Mohamed
              </p>
              <p className="truncate text-xs text-slate-500">
                Administrator
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// SIDEBAR SECTION
function SidebarSection({ title, items, setMobileOpen }) {
  return (
    <div>
      <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.18em] text-slate-600">
        {title}
      </p>

      <div className="space-y-1">
        {items.map((item) => (
          <SidebarItem
            key={item.label}
            {...item}
            setMobileOpen={setMobileOpen}
          />
        ))}
      </div>
    </div>
  );
}

// SIDEBAR ITEM
function SidebarItem({ icon: Icon, label, path, setMobileOpen }) {
  return (
    <NavLink
      to={path}
      onClick={() => setMobileOpen(false)}
      className={({ isActive }) => `
        group relative flex items-center gap-3 rounded-xl
        px-3 py-2.5 text-sm font-medium
        transition-all duration-200
        ${
          isActive
            ? "bg-blue-600/15 text-blue-400"
            : "text-slate-400 hover:bg-slate-900 hover:text-white"
        }
      `}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 h-6 w-0.5 rounded-full bg-blue-500" />
          )}

          <Icon
            size={19}
            strokeWidth={isActive ? 2.3 : 2}
            className={
              isActive
                ? "text-blue-400"
                : "text-slate-500 transition-colors group-hover:text-slate-300"
            }
          />

          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default Sidebar;
