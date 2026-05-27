import { useNavigate } from 'react-router-dom'
import { LinkIcon, Home } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-dark-700 border border-dark-400 rounded-2xl mb-6">
          <LinkIcon size={28} className="text-dark-300" />
        </div>
        <h1 className="font-display font-bold text-6xl text-brand-400 mb-2">404</h1>
        <p className="font-display font-semibold text-xl mb-2">Page not found</p>
        <p className="text-dark-100 text-sm mb-6">This page doesn't exist.</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary inline-flex items-center gap-2">
          <Home size={16} />Go to Dashboard
        </button>
      </div>
    </div>
  )
}