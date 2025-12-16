import React from "react";
import { NavLink } from "react-router-dom";
import useAppStore from "../../state/store";

export default function Sidebar({ mobileOpen = false, onClose }) {
  const isCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  const items = [
    { to: "/", label: "Dashboard", icon: DashboardIcon },
    { to: "/products", label: "Products", icon: TagIcon },
    { to: "/sellers", label: "Sellers", icon: ShieldIcon },
    { to: "/dispute", label: "Dispute", icon: DisputeIcon },
    { to: "/buyers", label: "Buyers", icon: UsersIcon },
    { to: "/analytics", label: "Analytics", icon: ChartIcon },
    { to: "/discounts", label: "Discounts", icon: BadgeIcon },
    { to: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  const linkClass = ({ isActive }) =>
    `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors 
    hover:bg-gray-100 dark:hover:bg-gray-800/80 
    ${isActive ? "bg-gray-100 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400" : "text-gray-700 dark:text-gray-300"}`;

  return (
    <div>
      {/* Overlay for mobile */}
      <div
        onClick={onClose}
        className={`${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden`}
      />

      <aside
        className={`${isCollapsed ? "w-[84px]" : "w-[260px]"} fixed md:static z-50 h-screen flex flex-col border-r border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-gray-900/95 backdrop-blur shadow-sm transition-[width,transform] duration-200 md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:block`}
      >
        {/* Header / Toggle */}
        <div className="flex items-center justify-between px-3 py-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500" />
            {!isCollapsed && (
              <span className="text-base font-semibold text-gray-900 dark:text-gray-100">ShopAdmin</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleSidebar}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <CollapseIcon />
            </button>
            <button
              onClick={onClose}
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-2">
          {items.map(({ to, label, icon: Icon }) => ( // eslint-disable-line no-unused-vars
            <NavLink key={to} to={to} className={linkClass} end={to === "/"}>
              <Icon />
              {!isCollapsed && <span className="text-sm font-medium">{label}</span>}

              {/* Tooltip when collapsed */}
              {isCollapsed && (
                <span className="pointer-events-none absolute left-[76px] z-50 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-md transition group-hover:opacity-100">
                  {label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-gray-200/80 dark:border-gray-800/80 px-2 py-3">
          <NavLink to="/logout" className={linkClass}>
            <LogoutIcon />
            {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
          </NavLink>
        </div>
      </aside>
    </div>
  );
}

function IconBase({ children }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
      {children}
    </svg>
  );
}

function DashboardIcon() {
  return (
    <IconBase>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h7v7H3zM14 3h7v4h-7zM14 10h7v11h-7zM3 14h7v7H3z" />
    </IconBase>
  );
}

function UsersIcon() {
  return (
    <IconBase>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11c1.657 0 3-1.79 3-4s-1.343-4-3-4-3 1.79-3 4 1.343 4 3 4ZM8 13c2.21 0 4-2.015 4-4.5S10.21 4 8 4 4 6.015 4 8.5 5.79 13 8 13Zm0 2c-3.866 0-7 2.239-7 5v2h14v-2c0-2.761-3.134-5-7-5Zm8 1c2.761 0 5 1.79 5 4v2h-6" />
    </IconBase>
  );
}

function SettingsIcon() {
  return (
    <IconBase>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.07a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.07a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 5.02 3.3l.06.06c.46.46 1.12.6 1.7.39A1.65 1.65 0 0 0 8.3 2.75V2a2 2 0 1 1 4 0v.07c0 .66.39 1.26 1 1.51.58.21 1.24.07 1.7-.39l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.46.46-.6 1.12-.39 1.7.25.61.85 1 1.51 1H22a2 2 0 1 1 0 4h-.07c-.66 0-1.26.39-1.51 1Z" />
    </IconBase>
  );
}

function DisputeIcon() {
  return (
    <IconBase>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    </IconBase>
  );
}

function TagIcon() {
  return (
    <IconBase>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M3 11l8 8 8-8-8-8H7a4 4 0 0 0-4 4v4Z" />
    </IconBase>
  );
}

function ChartIcon() {
  return (
    <IconBase>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 15v3M11 9v9M15 6v12M19 12v6" />
    </IconBase>
  );
}

function BadgeIcon() {
  return (
    <IconBase>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3 3 4-.5-.5 4 3 3-3 3 .5 4-4-.5-3 3-3-3-4 .5.5-4-3-3 3-3-.5-4 4 .5 3-3Z" />
    </IconBase>
  );
}

function LogoutIcon() {
  return (
    <IconBase>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 17l5-5-5-5M15 12H3M21 3v18" />
    </IconBase>
  );
}

function CollapseIcon() {
  return (
    <IconBase>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16M10 6l-6 6 6 6" />
    </IconBase>
  );
}

function CloseIcon() {
  return (
    <IconBase>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6l-12 12" />
    </IconBase>
  );
}

function ShieldIcon() {
  return (
    <IconBase>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4v6c0 5-3.58 7.5-8 8-4.42-.5-8-3-8-8V7l8-4Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </IconBase>
  );
}
