import React, { useState, useCallback } from 'react'
import type { UploadResult } from '../types'
interface Props { onUploadComplete: (r: UploadResult) => void }
export default function Upload({ onUploadComplete }: Props) {
  const [dragging, setDragging] = useState(false)
  const [status, setStatus] = useState<'idle'|'validating'|'valid'|'error'>('idle')
  const [msg, setMsg] = useState('')
  const [result, setResult] = useState<UploadResult|null>(null)
  const handleFile = useCallback(async (file: File) => {
    setStatus('validating')
    setMsg('Validating file...')
    // Try real backend first
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('http://localhost:8000/upload', { method:'POST', body:fd })
      if (res.ok) {
        const data: UploadResult = await res.json()
        setStatus('valid')
        setMsg(`${data.shape.height}×${data.shape.width}×${data.shape.bands} · AVIRIS confirmed`)
        setResult(data)
        return
      }
    } catch {
      // Backend offline — use demo mode
    }
    // DEMO MODE: simulate successful upload for any file
    const demoResult: UploadResult = {
      file_hash: 'demo_' + Date.now(),
      shape: { height: 256, width: 256, bands: 186 },
      rgb_preview: '',
      estimated_processing_seconds: 3.2,
      noisy_bands_detected: [104,105,106,107,108,150,151,152]
    }
    setStatus('valid')
    setMsg(`DEMO MODE: 256×256×186 · ${file.name} loaded`)
    setResult(demoResult)
  }, [])
  return (
    <div className="grid-bg" style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:32, padding:40, position:'relative', background:'var(--bg)' }}>
      <div className="scanline" />
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:600, height:600, background:'radial-gradient(circle, rgba(0,229,255,0.05) 0%, transparent 70%)', pointerEvents:'none' }} />
      {/* Logo */}
      <div className="fade-in-up" style={{ textAlign:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, justifyContent:'center', marginBottom:8 }}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="17" stroke="rgba(0,229,255,0.3)" strokeWidth="1"/>
            <polyline points="4,18 8,10 12,22 16,6 20,26 24,12 28,20 32,18" stroke="#00e5ff" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          </svg>
          <h1 className="mono" style={{ fontSize:28, fontWeight:600, letterSpacing:'0.15em', color:'#00e5ff', textShadow:'0 0 20px rgba(0,229,255,0.8)' }}>SPECTRASHIELD</h1>
        </div>
        <p className="mono" style={{ fontSize:11, letterSpacing:'0.12em', color:'rgba(255,255,255,0.35)' }}>DUAL-ENGINE HYPERSPECTRAL ANOMALY DETECTION PLATFORM · v2.1</p>
      </div>
      {/* Upload zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); e.dataTransfer.files && handleFile(e.dataTransfer.files[0]) }}
        onClick={() => document.getElementById('fi')?.click()}
        style={{
          width:500, height:280, border:`1.5px dashed ${dragging?'#00e5ff':'rgba(255,255,255,0.18)'}`,
          borderRadius:12, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16,
          background: dragging?'rgba(0,229,255,0.06)':'rgba(13,13,20,0.9)',
          boxShadow: dragging?'0 0 40px rgba(0,229,255,0.2), inset 0 0 40px rgba(0,229,255,0.03)':'none',
          transform: dragging?'scale(1.01)':'scale(1)',
          transition:'all 300ms cubic-bezier(0.4,0,0.2,1)', cursor:'pointer', position:'relative'
        }}>
        {/* Corner accents */}
        {[{top:12,left:12,bt:'top',bl:'left'},{top:12,right:12,bt:'top',bl:'right'},{bottom:12,left:12,bt:'bottom',bl:'left'},{bottom:12,right:12,bt:'bottom',bl:'right'}].map((pos,i)=>(
          <div key={i} style={{ position:'absolute', ...{top:pos.top,bottom:pos.bottom,left:pos.left,right:pos.right} as React.CSSProperties, width:16, height:16,
            borderTop:pos.bt==='top'?'1.5px solid #00e5ff':'none', borderBottom:pos.bt==='bottom'?'1.5px solid #00e5ff':'none',
            borderLeft:pos.bl==='left'?'1.5px solid #00e5ff':'none', borderRight:pos.bl==='right'?'1.5px solid #00e5ff':'none',
            opacity:dragging?1:0.5 }}/>
        ))}
        <svg width="56" height="40" viewBox="0 0 200 60" fill="none">
          <polyline points="0,40 20,20 40,35 60,10 80,30 100,5 120,25 140,15 160,30 180,20 200,35"
            stroke="#00e5ff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="100" cy="5" r="4" fill="#00e5ff" opacity="0.9"/>
        </svg>
        <div style={{ textAlign:'center' }}>
          <p style={{ fontSize:16, fontWeight:500, color: dragging?'#00e5ff':'white', transition:'color 200ms' }}>
            {dragging ? 'Release to analyze' : 'Drop hyperspectral file'}
          </p>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginTop:6 }}>.mat · .hdr · .img formats · or any image for demo</p>
          <p style={{ fontSize:11, color:'#00e5ff', marginTop:10, opacity:0.8, textDecoration:'underline', textUnderlineOffset:3 }}>or click to browse files</p>
        </div>
      </div>
      <input id="fi" type="file" accept="*" style={{ display:'none' }} onChange={e => e.target.files?.length && handleFile(e.target.files[0])} />
      {/* Status badge */}
      {status !== 'idle' && (
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 20px', borderRadius:8,
          background:'rgba(13,13,20,0.95)', border:`1px solid ${status==='error'?'rgba(255,45,85,0.4)':status==='valid'?'rgba(0,214,143,0.4)':'rgba(0,229,255,0.3)'}` }}>
          {status==='validating' && <div style={{ width:10, height:10, borderRadius:'50%', border:'2px solid #00e5ff', borderTopColor:'transparent', animation:'spin 0.8s linear infinite' }} />}
          {status==='valid' && <div style={{ width:10, height:10, borderRadius:'50%', background:'#00d68f', boxShadow:'0 0 8px #00d68f' }} />}
          {status==='error' && <div style={{ width:10, height:10, borderRadius:'50%', background:'#ff2d55', boxShadow:'0 0 8px #ff2d55' }} />}
          <span className="mono" style={{ fontSize:12, color: status==='error'?'#ff2d55':status==='valid'?'#00d68f':'#00e5ff' }}>{msg}</span>
        </div>
      )}
      {/* CTA button */}
      {status==='valid' && result && (
        <button onClick={() => onUploadComplete(result)}
          style={{ padding:'14px 52px', background:'transparent', border:'1.5px solid #00e5ff', color:'#00e5ff', borderRadius:6,
            fontSize:13, fontWeight:600, letterSpacing:'0.12em', fontFamily:'JetBrains Mono, monospace',
            boxShadow:'0 0 20px rgba(0,229,255,0.3)', cursor:'pointer', transition:'all 250ms', animation:'pulse-cyan 2s ease-in-out infinite' }}
          onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background='rgba(0,229,255,0.12)'}}
          onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background='transparent'}}>
          INITIALIZE DETECTION →
        </button>
      )}
      {/* Bottom chips */}
      <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center' }}>
        {['Unsupervised detection','Dual-engine fusion','< 3s inference','Zero labels required'].map(l => (
          <span key={l} className="chip">{l}</span>
        ))}
      </div>
    </div>
  )
}
