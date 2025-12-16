import React from 'react'
import { useTheme } from '../../context/ThemeContext'
import useAppStore from '../../state/store'

export default function Topbar({ onMenuClick }) {
  const { theme, toggle } = useTheme()
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const user = useAppStore((s) => s.user)

  return (
    <header className="sticky top-0 z-30 w-full border-b border-gray-200/70 dark:border-gray-700/60 bg-white/90 dark:bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-gray-900/60">
      <div className="mx-auto flex h-16 items-center gap-3 px-3 sm:px-4">
        {/* Mobile menu */}
        <button
          aria-label="Open sidebar"
          onClick={onMenuClick}
          className="inline-flex md:hidden items-center justify-center h-10 w-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>

        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500" />
          <span className="hidden sm:block text-lg font-semibold tracking-tight text-gray-900 dark:text-white">ShopAdmin</span>
        </div>

        {/* Search */}
        <div className="ml-auto md:ml-6 flex-1 md:flex-none md:w-auto">
          <div className="hidden md:flex items-center gap-2">
            <div className="relative w-[460px] max-w-[60vw]">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" />
                </svg>
              </div>
              <input
                className="w-full h-10 rounded-xl border border-gray-200/70 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 pl-9 pr-28 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                placeholder="Search products, orders, buyers..."
              />
              <div className="absolute inset-y-0 right-1.5 flex items-center">
                <button className="inline-flex items-center gap-1 h-7 px-2 rounded-lg text-xs font-medium bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
                  </svg>
                  Categories
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <IconButton label="Toggle sidebar" onClick={toggleSidebar}>
            {sidebarCollapsed ? <ExpandIcon /> : <CollapseIcon />}
          </IconButton>
          <IconButton label="Dark mode" onClick={toggle}>
            {theme === 'dark' ? (
              <SunIcon />
            ) : (
              <MoonIcon />
            )}
          </IconButton>
          <IconButton label="Notifications">
            <BellIcon />
            <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">3</span>
          </IconButton>
          <IconButton label="Cart">
            <CartIcon />
          </IconButton>

          {/* Profile */}
          <button className="ml-1 inline-flex items-center gap-2 rounded-xl border border-gray-200/70 dark:border-gray-700 bg-white dark:bg-gray-900 px-2.5 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800">
            <img
              src={user?.avatar || "https://ui-avatars.com/api/?name=" + (user?.name || "Admin") + "&background=random"}
              alt="avatar"
              className="h-7 w-7 rounded-lg object-cover"
            />
            <span className="hidden sm:block text-sm font-medium text-gray-800 dark:text-gray-200">{user?.name || 'Admin'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="hidden sm:block h-4 w-4 text-gray-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

function IconButton({ children, onClick, label }) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200/70 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
    >
      {children}
    </button>
  )
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.17V11a6 6 0 1 0-12 0v3.17c0 .53-.21 1.04-.59 1.41L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l3.6 10.59A2 2 0 0 0 10.5 16H18a2 2 0 0 0 2-1.5l1.5-6H6" />
    </svg>
  )
}

function CollapseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16M10 6l-6 6 6 6" />
    </svg>
  )
}

function ExpandIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4m6 6 6-6-6-6" />
    </svg>
  )
}
