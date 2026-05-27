import { useState, useEffect, useRef } from 'react'
import { Link2, Plus, Search, MousePointer, TrendingUp, Loader2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import UrlCard from '../components/UrlCard'
import api from '../api/axios'

// Animated counter hook
function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!target) return
    let start = 0
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target])
  return count
}

// Confetti component
function Confetti({ active }) {
  if (!active) return null
  const colors = ['#22c55e', '#86efac', '#fff', '#facc15', '#34d399']
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
      {[...Array(60)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${Math.random() * 100}%`,
          top: '-10px',
          width: `${4 + Math.random() * 6}px`,
          height: `${8 + Math.random() * 10}px`,
          background: colors[Math.floor(Math.random() * colors.length)],
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          animation: `confettiFall ${1.5 + Math.random() * 2}s ease-in ${Math.random() * 0.8}s forwards`,
          transform: `rotate(${Math.random() * 360}deg)`,
        }} />
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [urls, setUrls] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [search, setSearch] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [form, setForm] = useState({ originalUrl: '', customAlias: '', expiresAt: '' })
  const [formErrors, setFormErrors] = useState({})
  const [showConfetti, setShowConfetti] = useState(false)
  const [newLinkId, setNewLinkId] = useState(null)

  const totalUrls = useCountUp(summary?.totalUrls || 0)
  const totalClicks = useCountUp(summary?.totalClicks || 0)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [urlsRes, summaryRes] = await Promise.all([api.get('/urls'), api.get('/analytics/summary')])
      setUrls(urlsRes.data.urls)
      setSummary(summaryRes.data)
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }

  const validateForm = () => {
    const e = {}
    if (!form.originalUrl.trim()) e.originalUrl = 'URL is required'
    else if (!/^https?:\/\/.+/.test(form.originalUrl)) e.originalUrl = 'URL must start with http:// or https://'
    setFormErrors(e)
    return Object.keys(e).length === 0
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setCreating(true)
    try {
      const payload = { originalUrl: form.originalUrl }
      if (form.customAlias.trim()) payload.customAlias = form.customAlias.trim()
      if (form.expiresAt) payload.expiresAt = form.expiresAt
      const res = await api.post('/urls', payload)
      setUrls([res.data.url, ...urls])
      setNewLinkId(res.data.url.id)
      setForm({ originalUrl: '', customAlias: '', expiresAt: '' })
      setShowAdvanced(false)
      // Confetti!
      setShowConfetti(true)
      setTimeout(() => { setShowConfetti(false); setNewLinkId(null) }, 3000)
      toast.success('🎉 Short URL created!')
      const summaryRes = await api.get('/analytics/summary')
      setSummary(summaryRes.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create URL')
    } finally { setCreating(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this URL?')) return
    try {
      await api.delete(`/urls/${id}`)
      setUrls(urls.filter((u) => u.id !== id))
      toast.success('URL deleted')
      const summaryRes = await api.get('/analytics/summary')
      setSummary(summaryRes.data)
    } catch { toast.error('Failed to delete') }
  }

  const filtered = urls.filter((u) =>
    u.originalUrl.toLowerCase().includes(search.toLowerCase()) ||
    u.shortCode.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen">
      <Confetti active={showConfetti} />
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Animated Stat Cards */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            <div className="card p-4" style={{ background: 'linear-gradient(135deg, #0d1117, #0a1f14)', border: '1px solid rgba(34,197,94,0.2)', transition: 'all 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(34,197,94,0.5)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(34,197,94,0.2)'}>
              <div className="flex items-center gap-2 text-dark-100 text-xs mb-2">
                <Link2 size={12} className="text-brand-500" />Total Links
              </div>
              <p className="font-display font-bold text-3xl" style={{ color: '#22c55e', textShadow: '0 0 20px rgba(34,197,94,0.4)' }}>{totalUrls}</p>
            </div>

            <div className="card p-4" style={{ background: 'linear-gradient(135deg, #0d1117, #0a1f14)', border: '1px solid rgba(34,197,94,0.2)', transition: 'all 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(34,197,94,0.5)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(34,197,94,0.2)'}>
              <div className="flex items-center gap-2 text-dark-100 text-xs mb-2">
                <MousePointer size={12} className="text-brand-500" />Total Clicks
              </div>
              <p className="font-display font-bold text-3xl" style={{ color: '#22c55e', textShadow: '0 0 20px rgba(34,197,94,0.4)' }}>{totalClicks}</p>
            </div>

            {summary.topUrl && (
              <div className="card p-4 col-span-2 sm:col-span-1" style={{ background: 'linear-gradient(135deg, #0d1117, #0a1f14)', border: '1px solid rgba(34,197,94,0.2)', transition: 'all 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(34,197,94,0.5)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(34,197,94,0.2)'}>
                <div className="flex items-center gap-2 text-dark-100 text-xs mb-2">
                  <TrendingUp size={12} className="text-brand-500" />Top Link
                </div>
                <p className="font-display font-bold text-sm text-brand-400 truncate">/{summary.topUrl.shortCode}</p>
                <p className="text-xs text-dark-100">{summary.topUrl.totalClicks} clicks</p>
              </div>
            )}
          </div>
        )}

        {/* Shorten Form */}
        <div className="card p-5 mb-6" style={{ background: 'linear-gradient(135deg, #0d1117, #091a10)', border: '1px solid rgba(34,197,94,0.3)', boxShadow: '0 0 40px rgba(34,197,94,0.08)' }}>
          <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-brand-400" />Shorten a URL
          </h2>
          <form onSubmit={handleCreate}>
            <div className="flex gap-2 mb-2">
              <div className="flex-1">
                <input type="text" className={`input ${formErrors.originalUrl ? 'border-red-500' : ''}`}
                  placeholder="Paste your long URL here... https://"
                  value={form.originalUrl}
                  onChange={(e) => setForm({ ...form, originalUrl: e.target.value })} />
                {formErrors.originalUrl && <p className="text-red-400 text-xs mt-1">{formErrors.originalUrl}</p>}
              </div>
              <button type="submit" disabled={creating} className="btn-primary shrink-0 flex items-center gap-2"
                style={{ boxShadow: '0 0 20px rgba(34,197,94,0.3)' }}>
                {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                <span className="hidden sm:block">Shorten</span>
              </button>
            </div>
            <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-xs text-dark-100 hover:text-white transition-colors mt-2">
              {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              Advanced options (custom alias, expiry)
            </button>
            {showAdvanced && (
              <div className="grid sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-dark-500">
                <div>
                  <label className="label">Custom alias (optional)</label>
                  <div className="flex">
                    <span className="px-3 py-3 bg-dark-600 border border-r-0 border-dark-400 rounded-l-xl text-dark-100 text-sm font-mono">snap/</span>
                    <input type="text" className="input rounded-l-none" placeholder="my-link"
                      value={form.customAlias} onChange={(e) => setForm({ ...form, customAlias: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="label">Expiry date (optional)</label>
                  <input type="datetime-local" className="input" value={form.expiresAt}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Links List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg">Your Links
              {urls.length > 0 && <span className="ml-2 text-xs font-normal text-dark-200 bg-dark-700 px-2 py-0.5 rounded-full">{urls.length}</span>}
            </h2>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-200" />
              <input type="text" className="input pl-8 py-2 text-sm w-48" placeholder="Search links..."
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="card p-12 text-center">
              <Link2 size={36} className="text-dark-400 mx-auto mb-3" />
              <p className="font-display font-semibold text-dark-100 mb-1">{search ? 'No links match your search' : 'No links yet'}</p>
              <p className="text-sm text-dark-200">{search ? 'Try a different search term' : 'Paste a URL above to get started'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((url) => (
                <div key={url.id} style={{
                  animation: url.id === newLinkId ? 'slideInNew 0.5s cubic-bezier(0.34,1.56,0.64,1)' : 'none',
                  border: url.id === newLinkId ? '1px solid rgba(34,197,94,0.5)' : 'transparent',
                  borderRadius: '16px',
                }}>
                  <UrlCard url={url} onDelete={handleDelete} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes slideInNew {
          from { opacity: 0; transform: translateY(-20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
