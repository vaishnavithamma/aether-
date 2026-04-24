import React, { useState, useEffect, useRef } from 'react'
import type { UploadResult, DetectionResult } from '../types'

interface Props { uploadResult: UploadResult; onComplete: (r: DetectionResult) => void }

const STAGES = [
  { name:'Preprocessing',  sub:'Normalizing pixel values' },
  { name:'Feature Extract', sub:'DoG + LAB saliency maps' },
  { name:'RX Detector',    sub:'Local Mahalanobis distance' },
  { name:'Score Fusion',   sub:'Weighted 4-method blend' },
  { name:'Thresholding',   sub:'Adaptive percentile cutoff' },
  { name:'Region Label',   sub:'Connected component analysis' },
]

export default function PipelineProgress({ uploadResult, onComplete }: Props) {
  const [active, setActive]   = useState(0)
  const [done, setDone]       = useState<number[]>([])
  const [elapsed, setElapsed] = useState(0)
  const [statusMsg, setStatus] = useState('Starting pipeline...')
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    const timer = setInterval(() => setElapsed(e => e+1), 1000)
    runPipeline().finally(() => clearInterval(timer))
  }, [])

  const animateStages = async () => {
    for (let i = 0; i < STAGES.length; i++) {
      setActive(i)
      await new Promise(r => setTimeout(r, 600))
      setDone(d => [...d, i])
    }
  }

  const runPipeline = async () => {
    setStatus('Sending to ML pipeline...')
    
    // Start animation and backend call in parallel
    const [, res] = await Promise.all([
      animateStages(),
      fetch('http://localhost:8000/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_hash: uploadResult.file_hash })
      }).catch(() => null)
    ])

    if (res && res.ok) {
      const data: DetectionResult = await res.json()
      setStatus('Detection complete!')
      // Small delay so user sees 100% before transition
      await new Promise(r => setTimeout(r, 400))
      onComplete(data)
    } else {
      setStatus('Backend error — check terminal')
      // Show error for 2s then pass empty result so app doesn't freeze
      await new Promise(r => setTimeout(r, 2000))
      onComplete({
        rgb_image: uploadResult.rgb_preview || '',
        heatmap_raw: '', heatmap_overlay: '', anomaly_mask: '',
        processing_time_ms: 0,
        anomaly_regions: [],
        pipeline_metadata: { bands_removed:[], pca_variance_retained:0, unet_final_loss:0, total_anomalous_pixels:0 }
      })
    }
  }

  const pct = Math.round((done.length / STAGES.length) * 100)

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'var(--bg)' }}>
      <div className="scanline" />
      {/* Left stages */}
      <div style={{ width:340, background:'rgba(13,13,20,0.98)', borderRight:'1px solid var(--border)', padding:'44px 24px', display:'flex', flexDirection:'column' }}>
        <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:10, letterSpacing:'0.15em', color:'rgba(255,255,255,0.3)', marginBottom:6 }}>PIPELINE STATUS</div>
        <h2 style={{ fontFamily:'JetBrains Mono,monospace', fontSize:20, color:'#00e5ff', marginBottom:6, letterSpacing:'0.08em', textShadow:'0 0 16px rgba(0,229,255,0.7)' }}>EXECUTING</h2>
        <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:28, fontFamily:'JetBrains Mono,monospace' }}>{statusMsg}</div>

        {STAGES.map((s,i) => {
          const isDone = done.includes(i), isActive = active===i && !isDone
          return (
            <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start', padding:'11px 12px', marginBottom:6, borderRadius:8,
              borderLeft:`2px solid ${isDone?'#00d68f':isActive?'#00e5ff':'transparent'}`,
              background:isDone?'rgba(0,214,143,0.04)':isActive?'rgba(0,229,255,0.06)':'transparent',
              transition:'all 280ms' }}>
              <div style={{ width:26, height:26, borderRadius:6, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                border:`1px solid ${isDone?'#00d68f':isActive?'#00e5ff':'rgba(255,255,255,0.1)'}`,
                background:isDone?'rgba(0,214,143,0.1)':isActive?'rgba(0,229,255,0.1)':'transparent',
                boxShadow:isActive?'0 0 10px rgba(0,229,255,0.4)':'none',
                animation:isActive?'pulse-cyan 1.5s ease-in-out infinite':'none' }}>
                {isDone ? <span style={{ color:'#00d68f', fontSize:12 }}>✓</span>
                        : <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:9, color:isActive?'#00e5ff':'rgba(255,255,255,0.2)' }}>0{i+1}</span>}
              </div>
              <div>
                <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:13, color:isDone?'#00d68f':isActive?'white':'rgba(255,255,255,0.3)', transition:'color 280ms' }}>{s.name}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.25)', marginTop:3 }}>{s.sub}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Right: ring + timer */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:28 }}>
        <div style={{ position:'relative', width:180, height:180 }}>
          <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform:'rotate(-90deg)' }}>
            <circle cx="90" cy="90" r="78" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6"/>
            <circle cx="90" cy="90" r="78" fill="none" stroke="#00e5ff" strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2*Math.PI*78}`}
              strokeDashoffset={`${2*Math.PI*78*(1-pct/100)}`}
              style={{ transition:'stroke-dashoffset 600ms ease', filter:'drop-shadow(0 0 10px rgba(0,229,255,0.7))' }}/>
          </svg>
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:40, fontWeight:600, color:'#00e5ff' }}>{pct}%</span>
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.4)', letterSpacing:'0.1em', marginTop:2 }}>COMPLETE</span>
          </div>
        </div>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:48, fontWeight:600, color:'white' }}>
            {String(Math.floor(elapsed/60)).padStart(2,'0')}:{String(elapsed%60).padStart(2,'0')}
          </div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:4 }}>elapsed · est. {uploadResult.estimated_processing_seconds}s total</div>
        </div>
      </div>
    </div>
  )
}
