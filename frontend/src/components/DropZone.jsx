import { useDropzone } from 'react-dropzone'

export function DropZone({ onFiles }) {
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    accept: { 'text/plain': ['.txt'], 'text/vtt': ['.vtt'] },
    maxFiles: 10,
    onDrop: onFiles
  })

  return (
    <div>
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />
        <p>{isDragActive ? 'Drop transcripts here...' : 'Drag .txt or .vtt files, or click to browse'}</p>
        <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 8px 0' }}>
          or
        </p>

        {/* The New Button */}
        <div style={{
          padding: '8px 20px',
          background: '#6ba3f9',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: '600',
          color: 'var(--text-h)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          cursor: 'pointer',
          transition: 'all 0.15s',
          display: 'inline-block',
        }}>
          Select Files
        </div>
      </div>
      {fileRejections.map(({ file, errors }) => (
        <p key={file.name} className="error">{file.name}: {errors[0].message}</p>
      ))}
    </div>
  )
}