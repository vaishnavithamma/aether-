import React, { useState, useCallback } from 'react'
import type { UploadResult } from '../types'

interface Props { onUploadComplete: (r: UploadResult) => void }

export default function Upload({ onUploadComplete }: Props) {
  const [dragging, setDragging] = useState(false)
  const [status, setStatus] = useState<'idle'|'loading'|'ready'|'error'>('idle')
  const [msg, setMsg] = useState('')
  const [result, setResult] = useState<UploadResult|null>(null)
  const [preview, setPreview] = useState<string>('')

  const handleFile = useCallback(async (file: File) => {
    setStatus('loading')
    setMsg('Uploading to backend...')
    setPreview('')
    setResult(null)

    const fd = new FormData()
    fd.append('file', file)

    try {
      const res = await fetch('http://localhost:8000/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Upload failed' }))
        setStatus('error')
        setMsg(err.detail || 'Upload failed — ensure backend is running')
        return
      }

      const data: UploadResult = await res.json()
      setStatus('ready')
      setMsg(`✓ ${data.shape.height}×${data.shape.width}×${data.shape.bands} · Ready for detection`)
      if (data.rgb_preview) setPreview(data.rgb_preview)
      setResult(data)
    } catch {
      setStatus('error')
      setMsg('Backend offline — run: cd backend && uvicorn main:app --reload --port 8000')
    }
  }, [])

  return (
    <div className="grid-bg" style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:28, padding:40, background:'var(--bg)', position:'relative' }}>
      <div className="scanline" />
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:600, height:600, background:'radial-gradient(circle, rgba(0,229,255,0.05) 0%, transparent 70%)', pointerEvents:'none' }} />

      {/* Logo */}
      <div style={{ textAlign:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, justifyContent:'center', marginBottom:8 }}>
          <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="17" stroke="rgba(0,229,255,0.35)" strokeWidth="1"/>
            <polyline points="4,18 8,10 12,22 16,6 20,26 24,12 28,20 32,18" stroke="#00e5ff" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          </svg>
          <h1 style={{ fontSize:26, fontWeight:600, letterSpacing:'0.15em', color:'#00e5ff', fontFamily:'JetBrains Mono,monospace', textShadow:'0 0 20px rgba(0,229,255,0.7)' }}>SPECTRASHIELD</h1>
        </div>
        <p style={{ fontSize:11, letterSpacing:'0.12em', color:'rgba(255,255,255,0.35)', fontFamily:'JetBrains Mono,monospace' }}>DUAL-ENGINE HYPERSPECTRAL ANOMALY DETECTION · v2.1</p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e=>{e.preventDefault();setDragging(true)}}
        onDragLeave={()=>setDragging(false)}
        onDrop={e=>{e.preventDefault();setDragging(false);const f=e.dataTransfer.files;if(f && f.length > 0) handleFile(f[0])}}
        onClick={()=>!result&&document.getElementById('fi')?.click()}
        style={{ width:480, border:`1.5px dashed ${dragging?'#00e5ff':'rgba(255,255,255,0.18)'}`, borderRadius:12, overflow:'hidden',
          background:dragging?'rgba(0,229,255,0.05)':'rgba(13,13,20,0.9)',
          boxShadow:dragging?'0 0 40px rgba(0,229,255,0.2)':'none',
          transition:'all 300ms', cursor:result?'default':'pointer', position:'relative' }}>

        {/* Corner brackets */}
        {[{top:10,left:10},{top:10,right:10},{bottom:10,left:10},{bottom:10,right:10}].map((pos,i)=>(
          <div key={i} style={{ position:'absolute', ...pos as React.CSSProperties, width:14, height:14,
            borderTop:('top' in pos)?'1.5px solid #00e5ff':'none', borderBottom:('bottom' in pos)?'1.5px solid #00e5ff':'none',
            borderLeft:('left' in pos)?'1.5px solid #00e5ff':'none', borderRight:('right' in pos)?'1.5px solid #00e5ff':'none',
            opacity:0.6, zIndex:2 }}/>
        ))}

        {/* Preview or placeholder */}
        {preview
          ? <div style={{ position:'relative' }}>
              <img src={`data:image/jpeg;base64,${preview}`} alt="Uploaded" style={{ width:'100%', height:260, objectFit:'cover', display:'block' }}/>
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(5,5,8,0.7) 0%, transparent 50%)' }}/>
              <div style={{ position:'absolute', bottom:10, left:14, fontSize:11, color:'#00e5ff', fontFamily:'JetBrains Mono,monospace', background:'rgba(5,5,8,0.8)', padding:'3px 10px', borderRadius:4, border:'1px solid rgba(0,229,255,0.3)' }}>
                PREVIEW · {msg.split('·')[1]?.trim() || ''}
              </div>
              <button onClick={e=>{e.stopPropagation();setResult(null);setPreview('');setStatus('idle');setMsg('')}}
                style={{ position:'absolute', top:10, right:14, padding:'3px 10px', background:'rgba(255,45,85,0.15)', border:'1px solid rgba(255,45,85,0.4)', color:'#ff2d55', borderRadius:4, fontSize:11, fontFamily:'JetBrains Mono,monospace', cursor:'pointer' }}>
                ✕ CLEAR
              </button>
            </div>
          : <div style={{ height:240, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14 }}>
              <svg width="52" height="38" viewBox="0 0 200 60" fill="none">
                <polyline points="0,40 20,20 40,35 60,10 80,30 100,5 120,25 140,15 160,30 180,20 200,35" stroke="#00e5ff" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <circle cx="100" cy="5" r="4" fill="#00e5ff"/>
              </svg>
              <div style={{ textAlign:'center' }}>
                <p style={{ fontSize:15, fontWeight:500, color:dragging?'#00e5ff':'white', transition:'color 200ms' }}>Drop any image here</p>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginTop:5 }}>JPG · PNG · BMP · or .mat/.hdr/.img</p>
                <p style={{ fontSize:11, color:'#00e5ff', marginTop:8, opacity:0.8, textDecoration:'underline', textUnderlineOffset:3 }}>or click to browse</p>
              </div>
            </div>}
      </div>
      <input id="fi" type="file" accept="image/*,.mat,.hdr,.img" style={{ display:'none' }} onChange={e=>{const f=e.target.files;if(f && f.length > 0) handleFile(f[0]);e.target.value=''}}/>

      {/* Status */}
      {status!=='idle' && (
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 18px', borderRadius:8, background:'rgba(13,13,20,0.95)',
          border:`1px solid ${status==='error'?'rgba(255,45,85,0.4)':status==='ready'?'rgba(0,214,143,0.4)':'rgba(0,229,255,0.3)'}` }}>
          {status==='loading' && <div style={{ width:10, height:10, borderRadius:'50%', border:'2px solid #00e5ff', borderTopColor:'transparent', animation:'spin 0.8s linear infinite' }}/>}
          {status==='ready'   && <div style={{ width:10, height:10, borderRadius:'50%', background:'#00d68f', boxShadow:'0 0 8px #00d68f' }}/>}
          {status==='error'   && <div style={{ width:10, height:10, borderRadius:'50%', background:'#ff2d55', boxShadow:'0 0 8px #ff2d55' }}/>}
          <span style={{ fontSize:12, color:status==='error'?'#ff2d55':status==='ready'?'#00d68f':'#00e5ff', fontFamily:'JetBrains Mono,monospace' }}>{msg}</span>
        </div>
      )}

      {/* CTA */}
      {status==='ready' && result && (
        <button onClick={()=>onUploadComplete(result)}
          style={{ padding:'13px 52px', background:'transparent', border:'1.5px solid #00e5ff', color:'#00e5ff', borderRadius:6, fontSize:13, fontWeight:600, letterSpacing:'0.12em', fontFamily:'JetBrains Mono,monospace', boxShadow:'0 0 20px rgba(0,229,255,0.3)', cursor:'pointer', transition:'all 250ms', animation:'pulse-cyan 2s ease-in-out infinite' }}
          onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background='rgba(0,229,255,0.12)'}}
          onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background='transparent'}}>
          INITIALIZE DETECTION →
        </button>
      )}

      {/* Chips */}
      <div style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center' }}>
        {['Real-time analysis','Inferno heatmap','Adaptive thresholding','Per-image unique output'].map(l=>(
          <span key={l} className="chip">{l}</span>
        ))}
      </div>
    </div>
  )
}
