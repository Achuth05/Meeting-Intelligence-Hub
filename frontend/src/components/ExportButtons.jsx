export function ExportButtons({ meetingId }) {
  const handleExport = async (format) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/meetings/${meetingId}/export?format=${format}`
      )
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `meeting_actions.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  return (
    <div style={{ display: 'flex', gap: '10px', margin: '16px 0' }}>
      <button onClick={() => handleExport('csv')}>
        Download CSV
      </button>
      <button onClick={() => handleExport('pdf')}>
        Download PDF
      </button>
    </div>
  )
}