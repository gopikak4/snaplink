import { useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { X, Download } from 'lucide-react'
import toast from 'react-hot-toast'

export default function QRModal({ url, onClose }) {
  const qrRef = useRef(null)

  const handleDownload = () => {
    try {
      const svg = qrRef.current.querySelector('svg')
      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      canvas.width = 300
      canvas.height = 300
      img.onload = () => {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, 300, 300)
        ctx.drawImage(img, 0, 0, 300, 300)
        const a = document.createElement('a')
        a.download = `qr-${url.shortCode}.png`
        a.href = canvas.toDataURL('image/png')
        a.click()
        toast.success('QR Code downloaded!')
      }
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    } catch {
      toast.error('Download failed')
    }
  }

  return (
    <div 
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}
      onClick={onClose}
    >
      <div 
        style={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '360px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontWeight: 'bold', fontSize: '18px', margin: 0 }}>QR Code</h3>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', fontSize: '20px', padding: '4px 8px' }}
          >
            ✕
          </button>
        </div>
        <div ref={qrRef} style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', padding: '16px', backgroundColor: '#ffffff', borderRadius: '12px' }}>
          <QRCodeSVG value={url.shortUrl} size={200} bgColor="#ffffff" fgColor="#080c10" level="H" />
        </div>
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#8b949e', marginBottom: '16px', wordBreak: 'break-all' }}>{url.shortUrl}</p>
        <button 
          onClick={handleDownload}
          style={{ width: '100%', padding: '10px', backgroundColor: '#22c55e', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Download size={16} /> Download QR Code
        </button>
      </div>
    </div>
  )
}