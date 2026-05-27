import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, LinkIcon, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

const MESSAGES = {
  idle: "Hey! Sign in to SnapLink 👋",
  typing: "I see you typing... 👀",
  password: "Ooh a secret password! 🤫",
  error: "Hmm that doesn't look right 😅",
  loading: "Let me check that for you... 🔍",
  success: "Yay! Welcome back! 🎉",
}

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [robotMood, setRobotMood] = useState('idle')
  const [blink, setBlink] = useState(true)
  const { login } = useAuth()
  const navigate = useNavigate()

  // Blinking eyes
  useEffect(() => {
    const t = setInterval(() => setBlink(p => !p), 700)
    return () => clearInterval(t)
  }, [])

  const handleEmailChange = (e) => {
    setForm({ ...form, email: e.target.value })
    setRobotMood(e.target.value ? 'typing' : 'idle')
  }

  const handlePasswordChange = (e) => {
    setForm({ ...form, password: e.target.value })
    setRobotMood('password')
  }

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.password) e.password = 'Password is required'
    setErrors(e)
    if (Object.keys(e).length > 0) setRobotMood('error')
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setRobotMood('loading')
    try {
      await login(form.email, form.password)
      setRobotMood('success')
      toast.success('Welcome back!')
      setTimeout(() => navigate('/dashboard'), 600)
    } catch (err) {
      setRobotMood('error')
      toast.error(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  const eyeColor = robotMood === 'error' ? '#f87171' : robotMood === 'success' ? '#22c55e' : robotMood === 'loading' ? '#facc15' : '#22c55e'
  const mouthPath = robotMood === 'error' ? 'M 82 105 Q 110 92 138 105' : robotMood === 'success' ? 'M 82 98 Q 110 118 138 98' : 'M 85 102 Q 110 112 135 102'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#080c10', fontFamily: 'DM Sans, sans-serif' }}>

      {/* LEFT — Form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px', maxWidth: '500px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
          <div style={{ width: '40px', height: '40px', background: '#22c55e', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(34,197,94,0.4)' }}>
            <LinkIcon size={20} color="#080c10" />
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '22px' }}>Snap<span style={{ color: '#22c55e' }}>Link</span></span>
        </div>

        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '32px', marginBottom: '8px' }}>Welcome back 👋</h1>
        <p style={{ color: '#6e7681', fontSize: '15px', marginBottom: '32px' }}>Sign in to manage your links and analytics</p>

        <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: '20px', padding: '28px', boxShadow: '0 0 60px rgba(34,197,94,0.06)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#8b949e', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.5px' }}>EMAIL ADDRESS</label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={handleEmailChange}
                style={{ width: '100%', background: '#161b22', border: `1px solid ${errors.email ? '#f87171' : '#30363d'}`, borderRadius: '12px', padding: '14px 16px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s' }}
                onFocus={e => { e.target.style.borderColor = '#22c55e'; e.target.style.boxShadow = '0 0 0 3px rgba(34,197,94,0.1)'; setRobotMood('typing') }}
                onBlur={e => { e.target.style.borderColor = errors.email ? '#f87171' : '#30363d'; e.target.style.boxShadow = 'none' }}
              />
              {errors.email && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '6px' }}>⚠ {errors.email}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#8b949e', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.5px' }}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={handlePasswordChange}
                  style={{ width: '100%', background: '#161b22', border: `1px solid ${errors.password ? '#f87171' : '#30363d'}`, borderRadius: '12px', padding: '14px 48px 14px 16px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s' }}
                  onFocus={e => { e.target.style.borderColor = '#22c55e'; e.target.style.boxShadow = '0 0 0 3px rgba(34,197,94,0.1)'; setRobotMood('password') }}
                  onBlur={e => { e.target.style.borderColor = errors.password ? '#f87171' : '#30363d'; e.target.style.boxShadow = 'none' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6e7681', padding: 0 }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '6px' }}>⚠ {errors.password}</p>}
            </div>
            <button type="submit" disabled={loading}
              style={{ width: '100%', background: '#22c55e', border: 'none', borderRadius: '12px', padding: '15px', color: '#080c10', fontWeight: 800, fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 24px rgba(34,197,94,0.35)', fontFamily: 'Syne, sans-serif', opacity: loading ? 0.8 : 1, transition: 'all 0.2s' }}>
              {loading
                ? <><div style={{ width: '18px', height: '18px', border: '2px solid #080c10', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /><span>Signing in...</span></>
                : <><span>Sign In</span><ArrowRight size={16} /></>}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', fontSize: '13px', color: '#6e7681', marginTop: '20px' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#22c55e', fontWeight: 700, textDecoration: 'none' }}>Create one free →</Link>
        </p>
      </div>

      {/* RIGHT — Animated Robot */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #0d1117 0%, #0a1628 50%, #0d1117 100%)', borderLeft: '1px solid #21262d' }}>
        {/* Grid bg */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'linear-gradient(#22c55e 1px, transparent 1px), linear-gradient(90deg, #22c55e 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        {/* Glow */}
        <div style={{ position: 'absolute', width: '400px', height: '400px', background: `radial-gradient(circle, ${eyeColor}22 0%, transparent 70%)`, borderRadius: '50%', transition: 'background 0.5s', animation: 'glow 3s ease-in-out infinite' }} />

        {/* Chat bubble */}
        <div key={robotMood} style={{ position: 'relative', zIndex: 10, background: '#0d1117', border: `1px solid ${eyeColor}66`, borderRadius: '20px 20px 20px 4px', padding: '14px 22px', marginBottom: '20px', maxWidth: '280px', textAlign: 'center', boxShadow: `0 0 30px ${eyeColor}22`, animation: 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)', transition: 'border-color 0.3s' }}>
          <p style={{ color: '#fff', fontSize: '15px', fontWeight: 600, margin: 0 }}>{MESSAGES[robotMood]}</p>
          <div style={{ position: 'absolute', bottom: '-10px', left: '20px', width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '0px solid transparent', borderTop: `10px solid ${eyeColor}66` }} />
        </div>

        {/* Robot SVG */}
        <svg width="230" height="290" viewBox="0 0 230 290" style={{ position: 'relative', zIndex: 10, animation: 'float 3s ease-in-out infinite' }}>
          {/* Antenna */}
          <line x1="115" y1="18" x2="115" y2="46" stroke={eyeColor} strokeWidth="3" strokeLinecap="round" style={{ transition: 'stroke 0.3s' }} />
          <circle cx="115" cy="11" r="8" fill={eyeColor} style={{ transition: 'fill 0.3s', animation: 'antennaPulse 1.5s ease-in-out infinite' }} />

          {/* Head */}
          <rect x="62" y="46" width="106" height="84" rx="22" fill="#161b22" stroke={eyeColor} strokeWidth="2" style={{ transition: 'stroke 0.3s' }} />

          {/* Eyes — cover when password mood */}
          {robotMood === 'password' ? (
            <>
              <rect x="80" y="72" width="24" height="5" rx="2.5" fill={eyeColor} style={{ transition: 'fill 0.3s' }} />
              <rect x="118" y="72" width="24" height="5" rx="2.5" fill={eyeColor} style={{ transition: 'fill 0.3s' }} />
            </>
          ) : (
            <>
              <rect x="80" y="66" width="24" height={blink ? 17 : 3} rx="6" fill={eyeColor} style={{ transition: 'all 0.1s', filter: `drop-shadow(0 0 6px ${eyeColor})` }} />
              <rect x="118" y="66" width="24" height={blink ? 17 : 3} rx="6" fill={eyeColor} style={{ transition: 'all 0.1s', filter: `drop-shadow(0 0 6px ${eyeColor})` }} />
              {blink && <><circle cx="88" cy="73" r="4" fill="#fff" opacity="0.5" /><circle cx="126" cy="73" r="4" fill="#fff" opacity="0.5" /></>}
            </>
          )}

          {/* Eyebrows — sad when error */}
          {robotMood === 'error' && <>
            <line x1="80" y1="62" x2="104" y2="66" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="118" y1="66" x2="142" y2="62" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" />
          </>}

          {/* Mouth */}
          <path d={mouthPath} fill="none" stroke={eyeColor} strokeWidth="2.5" strokeLinecap="round" style={{ transition: 'all 0.4s, stroke 0.3s' }} />

          {/* Cheeks */}
          <ellipse cx="76" cy="100" rx="9" ry="6" fill={`${eyeColor}22`} style={{ transition: 'fill 0.3s' }} />
          <ellipse cx="154" cy="100" rx="9" ry="6" fill={`${eyeColor}22`} style={{ transition: 'fill 0.3s' }} />

          {/* Neck */}
          <rect x="104" y="129" width="22" height="14" rx="5" fill="#21262d" />

          {/* Body */}
          <rect x="48" y="142" width="134" height="94" rx="20" fill="#161b22" stroke="#30363d" strokeWidth="1.5" />

          {/* Chest panel */}
          <rect x="68" y="158" width="94" height="58" rx="12" fill="#0d1117" stroke={eyeColor} strokeWidth="1" opacity="0.8" style={{ transition: 'stroke 0.3s' }} />

          {/* Chest lights */}
          <circle cx="93" cy="172" r="6" fill={eyeColor} style={{ animation: 'pulse2 1s ease-in-out infinite', transition: 'fill 0.3s', filter: `drop-shadow(0 0 4px ${eyeColor})` }} />
          <circle cx="115" cy="172" r="6" fill={eyeColor} style={{ animation: 'pulse2 1.4s ease-in-out infinite', transition: 'fill 0.3s', filter: `drop-shadow(0 0 4px ${eyeColor})` }} />
          <circle cx="137" cy="172" r="6" fill={eyeColor} style={{ animation: 'pulse2 1.8s ease-in-out infinite', transition: 'fill 0.3s', filter: `drop-shadow(0 0 4px ${eyeColor})` }} />

          {/* Progress bar */}
          <rect x="78" y="190" width="74" height="9" rx="4.5" fill="#21262d" />
          <rect x="78" y="190" width={robotMood === 'loading' ? 74 : robotMood === 'success' ? 74 : 40} height="9" rx="4.5" fill={eyeColor} style={{ transition: 'width 0.5s, fill 0.3s', filter: `drop-shadow(0 0 4px ${eyeColor})` }} />

          {/* Arms */}
          <rect x="14" y="148" width="30" height="72" rx="15" fill="#161b22" stroke="#30363d" strokeWidth="1.5"
            style={{ transformOrigin: '29px 148px', animation: robotMood === 'success' ? 'waveArm 0.4s ease-in-out infinite alternate' : 'none' }} />
          <circle cx="29" cy="226" r="13" fill="#161b22" stroke="#30363d" strokeWidth="1.5" />
          <rect x="186" y="148" width="30" height="72" rx="15" fill="#161b22" stroke="#30363d" strokeWidth="1.5" />
          <circle cx="201" cy="226" r="13" fill="#161b22" stroke="#30363d" strokeWidth="1.5" />

          {/* Legs */}
          <rect x="72" y="234" width="30" height="48" rx="13" fill="#161b22" stroke="#30363d" strokeWidth="1.5" />
          <rect x="128" y="234" width="30" height="48" rx="13" fill="#161b22" stroke="#30363d" strokeWidth="1.5" />
          <rect x="64" y="273" width="42" height="16" rx="8" fill="#21262d" />
          <rect x="124" y="273" width="42" height="16" rx="8" fill="#21262d" />
        </svg>

        {/* Label */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: eyeColor, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '18px', marginBottom: '4px', transition: 'color 0.3s' }}>SnapBot</p>
          <p style={{ color: '#6e7681', fontSize: '12px' }}>Your personal link assistant</p>
        </div>

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{ position: 'absolute', width: i % 2 === 0 ? '6px' : '4px', height: i % 2 === 0 ? '6px' : '4px', background: eyeColor, borderRadius: '50%', opacity: 0.2, left: `${10 + i * 11}%`, top: `${15 + (i % 4) * 20}%`, animation: `float ${2 + i * 0.4}s ease-in-out infinite ${i * 0.2}s`, transition: 'background 0.3s' }} />
        ))}
      </div>

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes glow { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.1)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes pulse2 { 0%,100%{opacity:1} 50%{opacity:0.25} }
        @keyframes antennaPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
        @keyframes waveArm { from{transform:rotate(-15deg)} to{transform:rotate(15deg)} }
        @keyframes popIn { from{opacity:0;transform:scale(0.8) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
      `}</style>
    </div>
  )
}
