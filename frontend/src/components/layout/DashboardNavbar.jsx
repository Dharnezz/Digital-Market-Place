import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function DashboardNavbar({ onToggleSidebar }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-md p-2 text-gray-700 hover:bg-gray-100 lg:hidden"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link to="/seller" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 text-sm font-bold text-white">
              DM
            </span>
            <span className="text-sm font-semibold text-gray-900 sm:text-base">Seller Dashboard</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-gray-600 sm:inline">
            {user?.name}
            <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
              {user?.role}
            </span>
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
  )
}