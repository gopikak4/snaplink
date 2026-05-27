import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ArrowLeft, MousePointer, Clock, Calendar, ExternalLink, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import api from '../api/axios'

// Animated counter
function useCountUp(target, duration = 1500) {
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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#161b22', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '10px', padding: '10px 14px', boxShadow: '0 0 20px rgba(34,197,94,0.15)' }}>
        <p style={{ color: '#8b949e', fontSize: '11px', marginBottom: '4px' }}>{label}</p>
        <p style={{ color: '#22c55e', fontWeight: 700, fontSize: '16px' }}>{payload[0].value} <span style={{ fontSize: '12px', fontWeight: 400 }}>clicks</span></p>
      </div>
    )
  }
  return null
}

export default function Analytics() {
  const { shortCode } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [chartVisible, setChartVisible] = useState(false)

  const animatedClicks = useCountUp(data?.analytics?.totalClicks || 0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/analytics/${shortCode}`)
        setData(res.data)
        setTimeout(() => setChartVisible(true), 300)
      } catch {
        toast.error('Failed to load analytics')
        navigate('/dashboard')
      } finally { setLoading(false) }
    }
    fetchData()
  }, [shortCode])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(data.url.shortUrl)
    setCopied(true)
    toast.success('Copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDate = (d) => d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'
  const formatChartDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  if (loading) return (
    <div className="min-h-screen"><Navbar />
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-dark-100 text-sm animate-pulse">Loading analytics...</p>
      </div>
    </div>
  )

  if (!data) return null
  const { url, analytics } = data
  const chartData = analytics.dailyClicks.map(d => ({ date: formatChartDate(d.date), clicks: d.clicks }))
  const maxClicks = Math.max(...chartData.map(d => d.clicks), 1)

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm text-dark-100 hover:text-white transition-colors mb-6 group">
          <ArrowLeft size={16} style={{ transition: 'transform 0.2s' }} className="group-hover:-translate-x-1" />Back to Dashboard
        </button>

        {/* URL Card */}
        <div className="card p-5 mb-6" style={{ background: 'linear-gradient(135deg, #0d1117, #091a10)', border: '1px solid rgba(34,197,94,0.3)', boxShadow: '0 0 40px rgba(34,197,94,0.08)', animation: 'fadeSlideIn 0.4s ease' }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e', animation: 'pulse2 1.5s ease-in-out infinite' }} />
                <p className="font-display font-bold text-xl text-brand-400">{url.shortUrl.replace('https://', '').replace('http://', '')}</p>
              </div>
              <a href={url.originalUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-dark-100 hover:text-white flex items-center gap-1.5">
                <span className="truncate max-w-xs">{url.originalUrl}</span>
                <ExternalLink size={12} />
              </a>
              <p className="text-xs text-dark-200 mt-1">Created {formatDate(url.createdAt)}</p>
            </div>
            <button onClick={handleCopy} className="btn-secondary flex items-center gap-2 shrink-0">
              {copied ? <Check size={14} className="text-brand-400" /> : <Copy size={14} />}
              <span className="hidden sm:block">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {[
            { icon: MousePointer, label: 'Total Clicks', value: animatedClicks, big: true, delay: '0s' },
            { icon: Clock, label: 'Last Visited', value: formatDate(analytics.lastVisited), big: false, delay: '0.1s' },
            { icon: Calendar, label: 'Expires', value: url.expiresAt ? formatDate(url.expiresAt) : 'Never', big: false, delay: '0.2s', span: true },
          ].map(({ icon: Icon, label, value, big, delay, span }) => (
            <div key={label} className={`card p-4 ${span ? 'col-span-2 sm:col-span-1' : ''}`}
              style={{ background: 'linear-gradient(135deg, #0d1117, #0a1628)', border: '1px solid rgba(34,197,94,0.15)', animation: `fadeSlideIn 0.5s ease ${delay} both`, transition: 'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(34,197,94,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(34,197,94,0.15)'; e.currentTarget.style.transform = 'translateY(0)' }}>
              <div className="flex items-center gap-2 text-dark-100 text-xs mb-2">
                <Icon size={12} className="text-brand-500" />{label}
              </div>
              {big
                ? <p className="font-display font-bold text-4xl" style={{ color: '#22c55e', textShadow: '0 0 30px rgba(34,197,94,0.5)' }}>{value}</p>
                : <p className="font-display font-semibold text-sm">{value}</p>
              }
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="card p-5 mb-6" style={{ background: 'linear-gradient(135deg, #0d1117, #091a10)', border: '1px solid rgba(34,197,94,0.15)', animation: 'fadeSlideIn 0.5s ease 0.3s both' }}>
          <h3 className="font-display font-bold text-base mb-1">Clicks — Last 7 Days</h3>
          <p className="text-dark-200 text-xs mb-4">Daily click trend for this link</p>

          {/* Mini bars showing peak */}
          <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '32px', marginBottom: '16px' }}>
            {chartData.map((d, i) => (
              <div key={i} style={{ flex: 1, background: d.clicks === maxClicks ? '#22c55e' : 'rgba(34,197,94,0.2)', borderRadius: '3px', height: `${Math.max(10, (d.clicks / maxClicks) * 100)}%`, transition: 'all 0.5s ease', transitionDelay: `${i * 0.05}s` }} title={`${d.date}: ${d.clicks} clicks`} />
            ))}
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(48,54,61,0.5)" />
              <XAxis dataKey="date" tick={{ fill: '#6e7681', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6e7681', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="clicks" stroke="#22c55e" strokeWidth={2.5} fill="url(#clickGradient)"
                dot={{ fill: '#22c55e', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#22c55e', stroke: '#fff', strokeWidth: 2 }}
                animationDuration={1500} animationEasing="ease-out" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Visits */}
        <div className="card p-5" style={{ animation: 'fadeSlideIn 0.5s ease 0.4s both' }}>
          <h3 className="font-display font-bold text-base mb-4">Recent Visits</h3>
          {analytics.recentVisits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <MousePointer size={32} style={{ color: '#30363d', margin: '0 auto 12px' }} />
              <p className="text-dark-100 text-sm">No visits yet — share your link!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {analytics.recentVisits.map((visit, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '10px', background: '#161b22', border: '1px solid #21262d', animation: `fadeSlideIn 0.3s ease ${i * 0.05}s both`, transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(34,197,94,0.3)'; e.currentTarget.style.background = '#1c2330' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#21262d'; e.currentTarget.style.background = '#161b22' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', flexShrink: 0, boxShadow: '0 0 6px rgba(34,197,94,0.5)' }} />
                    <span style={{ color: '#8b949e', fontSize: '13px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {visit.referer === 'Direct' ? '🔗 Direct visit' : visit.referer}
                    </span>
                  </div>
                  <span style={{ color: '#6e7681', fontSize: '12px', flexShrink: 0 }}>{formatDate(visit.clickedAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse2 {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  )
}
