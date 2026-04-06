import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DropZone } from '../components/DropZone'
import { uploadFiles } from '../api/client'
import { Topbar } from '../components/Topbar'

export default function Upload() {
  const [files, setFiles] = useState([])
  const [project, setProject] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleDrop = useCallback((acceptedFiles) => {
    setFiles(prev => [...prev, ...acceptedFiles])
    setError(null)
  }, [])

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file')
      return
    }
    setUploading(true)
    setError(null)
    setSuccess(false)
    try {
      await uploadFiles(files, project || 'Untitled Project')
      setSuccess(true)
      setFiles([])
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <>
      <Topbar />

      {/* Main Container: Centers everything and adds top spacing to clear the Topbar */}
      <div style={{ 
        maxWidth: '680px', 
        margin: '0 auto', 
        padding: '80px 20px 40px 20px' // 80px top padding ensures it clears the 56px Topbar
      }}>
        
        {/* Header Section: Now perfectly aligned with the cards below */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '800', 
            color: 'var(--text-h)', 
            letterSpacing: '-0.02em' 
          }}>
            Upload Meeting
          </h1>
          <p style={{ 
            marginTop: '8px', 
            fontSize: '15px', 
            color: 'var(--text)', 
            opacity: 0.8 
          }}>
            Upload .txt or .vtt transcript files to analyze
          </p>
        </div>

        <div className="page-body">
          {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}
          {success && (
            <div className="alert alert-success" style={{ marginBottom: '20px' }}>
              ✓ Upload successful! Redirecting to dashboard...
            </div>
          )}

          {/* Project name */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block', fontSize: '13px', fontWeight: '600',
              color: 'var(--text-h)', marginBottom: '8px'
            }}>
              Project Name <span style={{ color: 'var(--muted)', fontWeight: '400' }}>(optional)</span>
            </label>
            <input
              type="text" className="input"
              value={project}
              onChange={e => setProject(e.target.value)}
              placeholder="e.g. Q2 Product Planning"
            />
          </div>

          {/* Dropzone */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <DropZone onFiles={handleDrop} />
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: '16px'
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-h)' }}>
                  Selected Files
                </h3>
                <span className="badge badge-blue">{files.length} file{files.length > 1 ? 's' : ''}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {files.map((file, index) => (
                  <div key={index} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 14px', background: 'var(--surface2)',
                    borderRadius: '8px', border: '1px solid var(--border)'
                  }}>
                    <span style={{ fontSize: '18px' }}>
                      {file.name.endsWith('.vtt') ? '🎬' : '📄'}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: '14px', color: 'var(--text-h)', fontWeight: '500',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>{file.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        {formatSize(file.size)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      style={{
                        background: 'none', border: 'none', color: 'var(--muted)',
                        fontSize: '18px', padding: '2px 6px', borderRadius: '4px',
                        cursor: 'pointer', transition: 'color 0.15s', flexShrink: 0
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '15px' }}
          >
            {uploading ? (
              <><span className="spinner" /> Processing transcripts...</>
            ) : (
              `Upload ${files.length > 0 ? files.length + ' file' + (files.length > 1 ? 's' : '') : ''} →`
            )}
          </button>

          {/* Info */}
          <div style={{
            marginTop: '20px', padding: '14px 16px',
            background: 'var(--surface2)', borderRadius: '8px',
            border: '1px solid var(--border)'
          }}>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: '1.7' }}>
              <strong style={{ color: 'var(--text-h)' }}>Supported formats:</strong> .txt and .vtt (WebVTT) · Max 10 files · 16MB per file
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: '1.7', marginTop: '4px' }}>
              <strong style={{ color: 'var(--text-h)' }}>Processing time:</strong> ~30–60 seconds depending on transcript length
            </p>
          </div>
        </div>
      </div>
    </>
  )
}