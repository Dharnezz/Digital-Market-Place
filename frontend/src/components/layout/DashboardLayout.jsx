import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import DashboardNavbar from './DashboardNavbar'
import Sidebar from './Sidebar'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <DashboardNavbar onToggleSidebar={() => setSidebarOpen((current) => !current)} />

      <div className="relative flex flex-1">
        <Sidebar open={sidebarOpen} onClose={closeSidebar} />

        <main className="flex w-full min-w-0 flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-gray-500 sm:flex-row sm:px-6">
          <p>Digital Products Marketplace</p>
          <p>Seller Portal</p>
        </div>
      </footer>
    </div>
  )
}