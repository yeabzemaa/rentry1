import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Topbar from '../components/layout/Topbar'
import useAppStore from '../state/store'

export default function DashboardLayout() {
  const mobileSidebarOpen = useAppStore((s) => s.mobileSidebarOpen)
  const openMobileSidebar = useAppStore((s) => s.openMobileSidebar)
  const closeMobileSidebar = useAppStore((s) => s.closeMobileSidebar)

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="flex">
        <Sidebar mobileOpen={mobileSidebarOpen} onClose={closeMobileSidebar} />
        <div className="flex-1 min-h-screen">
          <Topbar onMenuClick={openMobileSidebar} />
          <main className={`p-4 transition-[margin] duration-200`}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
