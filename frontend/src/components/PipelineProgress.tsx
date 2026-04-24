import React, { useState, useEffect } from 'react'
import type { UploadResult, DetectionResult } from '../types'
interface Props { uploadResult: UploadResult; onComplete: (result: DetectionResult) => void }
const STAGES = [
  { name: 'Preprocessing', sub: 'Normalizing spectral bands' },
  { name: 'PCA Reduction', sub: '186 → 30 components (99.2% variance)' },
  { name: 'U-Net', sub: 'Reconstructing spectral cube' },
  { name: 'RX Detector', sub: 'Computing Mahalanobis distances' },
  { name: 'Score Fusion', sub: 'Blending U-Net 60% + RX 40%' },
  { name: 'Spatial Filter', sub: 'Applying neighborhood smoothing' },
]
const PipelineProgress: React.FC<Props> = ({ uploadResult, onComplete }) => {
  const [activeStage, setActiveStage] = useState(0)
  const [doneStages, setDoneStages] = useState<number[]>([])
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState('')
  useEffect(() => {
    const timer = setInterval(() => setElapsed(e => e + 1), 1000)
    runDetection()
    return () => clearInterval(timer)
  }, [])
  const runDetection = async () => {
    for (let i = 0; i < STAGES.length; i++) {
      setActiveStage(i)
      await new Promise(r => setTimeout(r, 800))
      setDoneStages(d => [...d, i])
    }
    try {
      const res = await fetch('http://localhost:8000/detect', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ file_hash: uploadResult.file_hash })
      })
      if (!res.ok) { setError('Detection failed. Check backend terminal.'); return }
      const data: DetectionResult = await res.json()
      onComplete(data)
    } catch {
      setError('Backend not responding. Run: uvicorn main:app --reload --port 8000')
    }
  }
  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg)' }}>
      <div style={{ width:'35%', padding:48, borderRight:'1px solid var(--border)' }}>
        <h2 style={{ fontFamily:'JetBrains Mono, monospace', color:'var(--cyan)', fontSize:14, letterSpacing:'0.1em', marginBottom:32 }}>PIPELINE EXECUTING</h2>
        {STAGES.map((stage, i) => {
          const isDone = doneStages.includes(i)
          const isActive = activeStage === i && !isDone
          return (
            <div key={i} style={{ display:'flex', gap:16, alignItems:'flex-start', padding:'12px 16px', marginBottom:8, borderRadius:6, borderLeft: isActive?'2px solid var(--cyan)':'2px solid transparent', background: isActive?'rgba(0,229,255,0.04)':'transparent', transition:'all 250ms' }}>
              <div style={{ width:12, height:12, borderRadius:'50%', marginTop:4, flexShrink:0, background: isDone?'var(--success)': isActive?'var(--cyan)':'rgba(255,255,255,0.2)', boxShadow: isActive?'0 0 8px var(--cyan)':'none', animation: isActive?'pulse-cyan 1s infinite':undefined }} />
              <div>
                <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:13, color: isDone?'var(--success)': isActive?'white':'rgba(255,255,255,0.4)' }}>{stage.name}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:4 }}>{stage.sub}</div>
              </div>
            </div>
          )
        })}
        {error && <div style={{ color:'var(--red)', fontSize:12, marginTop:24, fontFamily:'JetBrains Mono, monospace' }}>{error}</div>}
      </div>
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:24 }}>
        <div style={{ width:320, height:240, background:'var(--surface1)', borderRadius:10, border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ color:'rgba(255,255,255,0.2)', fontSize:12, fontFamily:'JetBrains Mono, monospace' }}>PROCESSING STAGE {activeStage + 1} / {STAGES.length}</span>
        </div>
        <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:24, color:'var(--cyan)' }}>
          {String(Math.floor(elapsed/60)).padStart(2,'0')}:{String(elapsed%60).padStart(2,'0')}
        </div>
        <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>elapsed · est. {uploadResult.estimated_processing_seconds}s total</div>
      </div>
    </div>
  )
}
export default PipelineProgress
