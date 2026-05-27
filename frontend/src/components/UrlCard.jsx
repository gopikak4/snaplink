import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Copy, Check, Trash2, QrCode, BarChart2, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import QRModal from './QRModal'

export default function UrlCard({ url, onDelete }) {
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url.shortUrl)
    setCopied(true)
    toast.success('Copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <>
      <div className="card p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <a href={url.shortUrl} target="_blank" rel="noopener noreferrer" className="font-display font-bold text-brand-400 hover:text-brand-300 transition-colors">
                {url.shortUrl.replace('http://localhost:5000/', '')}
              </a>
              <ExternalLink size={12} className="text-dark-200" />
            </div>
            <p className="text-sm text-dark-100 truncate">{url.originalUrl}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-dark-200">
              <span>{url.totalClicks} clicks</span>
              <span>·</span>
              <span>{formatDate(url.createdAt)}</span>
              {url.expiresAt && <><span>·</span><span>Expires {formatDate(url.expiresAt)}</span></>}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={handleCopy} className="btn-secondary p-2" title="Copy">
              {copied ? <Check size={15} className="text-brand-400" /> : <Copy size={15} />}
            </button>
            <button onClick={() => setShowQR(true)} className="btn-secondary p-2" title="QR Code">
              <QrCode size={15} />
            </button>
            <Link to={`/analytics/${url.shortCode}`} className="btn-secondary p-2" title="Analytics">
              <BarChart2 size={15} />
            </Link>
            <button onClick={() => onDelete(url.id)} className="btn-secondary p-2 hover:text-red-400 hover:border-red-500/30" title="Delete">
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
      {showQR && <QRModal url={url} onClose={() => setShowQR(false)} />}
    </>
  )
}