import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, LinkIcon, LayoutDashboard } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <nav className="border-b border-dark-400 bg-dark-800/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center group-hover:bg-brand-400 transition-colors">
            <LinkIcon size={16} className="text-dark-900" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            Snap<span className="text-brand-400">Link</span>
          </span>
        </Link>
        {user && (
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-2 text-sm text-dark-100 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-dark-700">
              <LayoutDashboard size={15} />
              <span className="hidden sm:block">Dashboard</span>
            </Link>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-700 border border-dark-400">
              <div className="w-6 h-6 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center">
                <span className="text-brand-400 text-xs font-display font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-dark-100 hidden sm:block">{user.name}</span>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-dark-100 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10">
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}