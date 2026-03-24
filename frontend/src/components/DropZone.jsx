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
      </div>
      {fileRejections.map(({ file, errors }) => (
        <p key={file.name} className="error">{file.name}: {errors[0].message}</p>
      ))}
    </div>
  )
}