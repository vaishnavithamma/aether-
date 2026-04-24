import React, { useState, useCallback } from 'react'
import type { UploadResult } from '../types'
interface Props { onUploadComplete: (result: UploadResult) => void }
const Upload: React.FC<Props> = ({ onUploadComplete }) => {
  const [dragging, setDragging] = useState(false)
  const [status, setStatus] = useState<'idle'|'validating'|'valid'|'error'>('idle')
  const [statusMsg, setStatusMsg] = useState('')
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const handleFile = useCallback(async (file: File) => {
    setStatus('validating'); setStatusMsg('Validating spectral cube...')
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('http://localhost:8000/upload', { method: 'POST', body: formData })
      if (!res.ok) { const e = await res.json(); setStatus('error'); setStatusMsg(e.detail || 'Upload failed'); return }
      const data: UploadResult = await res.json()
      setStatus('valid')
      setStatusMsg(`${data.shape.height}×${data.shape.width}×${data.shape.bands} — AVIRIS format confirmed`)
      setUploadResult(data)
    } catch {
      setStatus('error'); setStatusMsg('Cannot connect to backend. Start uvicorn on port 8000.')
    }
  }, [])
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', gap:32 }}>
      <div style={{ textAlign:'center' }}>
        <h1 style={{ fontFamily:'JetBrains Mono, monospace', fontSize:28, color:'var(--cyan)', letterSpacing:'0.15em', marginBottom:8 }}>SPECTRASHIELD</h1>
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:12, letterSpacing:'0.1em' }}>DUAL-ENGINE HYPERSPECTRAL ANOMALY DETECTION</p>
      </div>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => document.getElementById('file-input')?.click()}
        style={{
          width:480, height:280, border: `1.5px dashed ${dragging ? 'var(--cyan)' : 'rgba(255,255,255,0.2)'}`,
          borderRadius:10, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16,
          background: dragging ? 'var(--cyan-dim)' : 'var(--surface1)',
          boxShadow: dragging ? '0 0 24px rgba(0,229,255,0.2)' : 'none',
          transform: dragging ? 'scale(1.01)' : 'scale(1)',
          transition:'all 250ms cubic-bezier(0.4,0,0.2,1)', cursor:'pointer'
        }}>
        <svg width="48" height="48" viewBox="0 0 200 60" fill="none">
          <polyline points="0,40 20,20 40,35 60,10 80,30 100,5 120,25 140,15 160,30 180,20 200,35"
            stroke="var(--cyan)" strokeWidth="2" fill="none" opacity="0.8"/>
        </svg>
        <p style={{ color:'white', fontSize:16, fontWeight:500 }}>Drop hyperspectral file</p>
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:12 }}>.mat · .hdr · .img formats supported</p>
        <p style={{ color:'var(--cyan)', fontSize:11, textDecoration:'underline' }}>or click to browse</p>
      </div>
      <input id="file-input" type="file" accept=".mat,.hdr,.img" style={{ display:'none' }} onChange={e => { if(e.target.files?.[0]) handleFile(e.target.files[0]) }} />
      {status !== 'idle' && (
        <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background: status==='validating'?'var(--cyan)': status==='valid'?'var(--success)':'var(--red)', animation: status==='validating'?'pulse-cyan 1s infinite':undefined }} />
          <span style={{ color: status==='error'?'var(--red)': status==='valid'?'var(--success)':'var(--cyan)', fontFamily:'JetBrains Mono, monospace' }}>{statusMsg}</span>
        </div>
      )}
      {status === 'valid' && uploadResult && (
        <button onClick={() => onUploadComplete(uploadResult)} style={{
          background:'var(--cyan)', color:'#050508', padding:'12px 32px', borderRadius:6,
          fontFamily:'JetBrains Mono, monospace', fontWeight:600, fontSize:13, letterSpacing:'0.08em',
          border:'none', cursor:'pointer', animation:'pulse-cyan 2s ease-in-out infinite alternate'
        }}>INITIALIZE DETECTION →</button>
      )}
      <div style={{ display:'flex', gap:16, marginTop:16 }}>
        {['Unsupervised detection','Dual-engine fusion','< 3s inference'].map(label => (
          <span key={label} style={{ padding:'4px 12px', border:'1px solid var(--border)', borderRadius:4, fontSize:11, color:'rgba(255,255,255,0.5)', letterSpacing:'0.05em' }}>{label}</span>
        ))}
      </div>
    </div>
  )
}
export default Upload
