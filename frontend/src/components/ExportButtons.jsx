import { useState } from 'react'
import { exportItems } from '../api/client'

export function ExportButtons({ meetingId }) {
  const [downloading, setDownloading] = useState(null)

  const handleExport = async (format) => {
    setDownloading(format)
    try {
      const response = await exportItems(meetingId, format)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `meeting_actions.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {/* CSV Button */}
      <button
        onClick={() => handleExport('csv')}
        disabled={downloading === 'csv'}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 14px', borderRadius: '8px', fontSize: '13px',
          fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s',
          background: downloading === 'csv' ? 'var(--surface2)' : 'rgba(0,229,176,0.08)',
          border: '1px solid rgba(0,229,176,0.3)',
          color: '#00e5b0', fontFamily: 'var(--font)'
        }}
        onMouseEnter={e => {
          if (downloading !== 'csv') {
            e.currentTarget.style.background = 'rgba(0,229,176,0.15)'
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,229,176,0.2)'
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(0,229,176,0.08)'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        {downloading === 'csv' ? (
          <span className="spinner" style={{ borderTopColor: '#00e5b0', borderColor: 'rgba(0,229,176,0.2)', width: '12px', height: '12px' }} />
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="12" y1="18" x2="12" y2="12"/>
            <line x1="9" y1="15" x2="12" y2="18"/>
            <line x1="15" y1="15" x2="12" y2="18"/>
          </svg>
        )}
        CSV
      </button>

      {/* PDF Button */}
      <button
        onClick={() => handleExport('pdf')}
        disabled={downloading === 'pdf'}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 14px', borderRadius: '8px', fontSize: '13px',
          fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s',
          background: downloading === 'pdf' ? 'var(--surface2)' : 'rgba(249,115,22,0.08)',
          border: '1px solid rgba(249,115,22,0.3)',
          color: '#f97316', fontFamily: 'var(--font)'
        }}
        onMouseEnter={e => {
          if (downloading !== 'pdf') {
            e.currentTarget.style.background = 'rgba(249,115,22,0.15)'
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(249,115,22,0.2)'
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(249,115,22,0.08)'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        {downloading === 'pdf' ? (
          <span className="spinner" style={{ borderTopColor: '#f97316', borderColor: 'rgba(249,115,22,0.2)', width: '12px', height: '12px' }} />
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
        )}
        PDF
      </button>
    </div>
  )
}