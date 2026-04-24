import { useState, useEffect, useRef } from 'react'
import type { UploadResult, DetectionResult } from '../types'
interface Props { uploadResult: UploadResult; onComplete: (r: DetectionResult) => void }
const STAGES = [
  { name:'Preprocessing',  sub:'Normalizing spectral bands' },
  { name:'PCA Reduction',  sub:'186 → 30 components · 99.2% variance' },
  { name:'U-Net',          sub:'Reconstructing spectral cube' },
  { name:'RX Detector',    sub:'Computing Mahalanobis distances' },
  { name:'Score Fusion',   sub:'Blending U-Net 60% + RX 40%' },
  { name:'Spatial Filter', sub:'Applying neighborhood smoothing' },
]
// Demo result when backend is offline
const DEMO_RESULT: DetectionResult = {
  rgb_image: '',
  heatmap_raw: '',
  heatmap_overlay: '',
  anomaly_mask: '',
  processing_time_ms: 2341,
  anomaly_regions: [
    { id:1, bbox:{x1:45,y1:32,x2:78,y2:67}, centroid:{x:61,y:49}, confidence:0.973, pixel_count:182, mean_score:0.891 },
    { id:2, bbox:{x1:120,y1:88,x2:145,y2:110}, centroid:{x:132,y:99}, confidence:0.841, pixel_count:94, mean_score:0.762 },
    { id:3, bbox:{x1:190,y1:150,x2:210,y2:168}, centroid:{x:200,y:159}, confidence:0.612, pixel_count:38, mean_score:0.541 },
  ],
  pipeline_metadata: {
    bands_removed: [104,105,106,107,108,150,151,152],
    pca_variance_retained: 0.992,
    unet_final_loss: 0.00341,
    total_anomalous_pixels: 847
  }
}
export default function PipelineProgress({ uploadResult, onComplete }: Props) {
  const [active, setActive] = useState(0)
  const [done, setDone] = useState<number[]>([])
  const [elapsed, setElapsed] = useState(0)
  const [statusMsg, setStatusMsg] = useState('Connecting to backend...')
  const ran = useRef(false)
  useEffect(() => {
    if (ran.current) return
    ran.current = true
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    run()
    return () => clearInterval(t)
  }, [])
  const animateStages = async () => {
    for (let i = 0; i < STAGES.length; i++) {
      setActive(i)
      await new Promise(r => setTimeout(r, 700))
      setDone(d => [...d, i])
    }
  }
  const run = async () => {
    setStatusMsg('Connecting to backend...')
    // Check if it's a demo hash
    if (uploadResult.file_hash.startsWith('demo_')) {
      setStatusMsg('DEMO MODE — simulating pipeline...')
      await animateStages()
      onComplete(DEMO_RESULT)
      return
    }
    // Try real backend
    try {
      setStatusMsg('Running ML pipeline...')
      const detectPromise = fetch('http://localhost:8000/detect', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ file_hash: uploadResult.file_hash })
      })
      // Animate stages while waiting
      await animateStages()
      const res = await detectPromise
      if (res.ok) {
        const data: DetectionResult = await res.json()
        setStatusMsg('Pipeline complete!')
        onComplete(data)
      } else {
        setStatusMsg('Backend error — switching to demo mode')
        await new Promise(r => setTimeout(r, 1000))
        onComplete(DEMO_RESULT)
      }
    } catch {
      setStatusMsg('Backend offline — demo mode activated')
      await new Promise(r => setTimeout(r, 1000))
      onComplete(DEMO_RESULT)
    }
  }
  const pct = Math.round((done.length / STAGES.length) * 100)
  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'var(--bg)' }}>
      <div className="scanline" />
      {/* Left panel */}
      <div style={{ width:360, background:'rgba(13,13,20,0.98)', borderRight:'1px solid var(--border)', padding:'48px 28px', display:'flex', flexDirection:'column' }}>
        <div className="mono" style={{ fontSize:10, letterSpacing:'0.15em', color:'rgba(255,255,255,0.3)', marginBottom:6 }}>PIPELINE STATUS</div>
        <h2 className="mono" style={{ fontSize:20, color:'#00e5ff', marginBottom:8, letterSpacing:'0.08em', textShadow:'0 0 20px rgba(0,229,255,0.7)' }}>EXECUTING</h2>
        <div className="mono" style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:32 }}>{statusMsg}</div>
        {STAGES.map((s, i) => {
          const isDone = done.includes(i)
          const isActive = active === i && !isDone
          return (
            <div key={i} style={{ display:'flex', gap:14, alignItems:'flex-start', padding:'12px 14px', marginBottom:6, borderRadius:8,
              borderLeft:`2px solid ${isDone?'#00d68f':isActive?'#00e5ff':'transparent'}`,
              background: isDone?'rgba(0,214,143,0.04)':isActive?'rgba(0,229,255,0.06)':'transparent',
              transition:'all 300ms' }}>
              <div style={{ width:26, height:26, borderRadius:6, border:`1px solid ${isDone?'#00d68f':isActive?'#00e5ff':'rgba(255,255,255,0.12)'}`,
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                background: isDone?'rgba(0,214,143,0.1)':isActive?'rgba(0,229,255,0.1)':'transparent',
                boxShadow: isActive?'0 0 10px rgba(0,229,255,0.4)':'none',
                animation: isActive?'pulse-cyan 1.5s ease-in-out infinite':'none' }}>
                {isDone
                  ? <span style={{ color:'#00d68f', fontSize:12 }}>✓</span>
                  : <span className="mono" style={{ fontSize:9, color:isActive?'#00e5ff':'rgba(255,255,255,0.2)' }}>0{i+1}</span>}
              </div>
              <div>
                <div className="mono" style={{ fontSize:13, color:isDone?'#00d68f':isActive?'white':'rgba(255,255,255,0.3)', transition:'color 300ms' }}>{s.name}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.25)', marginTop:3 }}>{s.sub}</div>
              </div>
            </div>
          )
        })}
      </div>
      {/* Right: progress */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:32 }}>
        {/* Ring */}
        <div style={{ position:'relative', width:180, height:180 }}>
          <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform:'rotate(-90deg)' }}>
            <circle cx="90" cy="90" r="78" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6"/>
            <circle cx="90" cy="90" r="78" fill="none" stroke="#00e5ff" strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2*Math.PI*78}`}
              strokeDashoffset={`${2*Math.PI*78*(1-pct/100)}`}
              style={{ transition:'stroke-dashoffset 700ms ease', filter:'drop-shadow(0 0 10px rgba(0,229,255,0.7))' }}/>
          </svg>
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
            <span className="mono" style={{ fontSize:40, fontWeight:600, color:'#00e5ff' }}>{pct}%</span>
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.4)', letterSpacing:'0.1em', marginTop:2 }}>COMPLETE</span>
          </div>
        </div>
        {/* Current stage */}
        <div style={{ width:340, padding:'18px 24px', background:'var(--surface1)', borderRadius:10, border:'1px solid var(--border)', textAlign:'center' }}>
          <div className="mono" style={{ fontSize:10, color:'rgba(255,255,255,0.3)', letterSpacing:'0.12em', marginBottom:8 }}>CURRENT STAGE</div>
          <div className="mono" style={{ fontSize:18, color:'#00e5ff', fontWeight:500 }}>{STAGES[active]?.name}</div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:6 }}>{STAGES[active]?.sub}</div>
          <div style={{ marginTop:14, height:3, background:'var(--surface3)', borderRadius:2 }}>
            <div style={{ height:'100%', width:`${((active+1)/STAGES.length)*100}%`, background:'linear-gradient(90deg,#00e5ff,rgba(0,229,255,0.4))', borderRadius:2, transition:'width 700ms ease', boxShadow:'0 0 8px rgba(0,229,255,0.5)' }} />
          </div>
        </div>
        {/* Timer */}
        <div style={{ textAlign:'center' }}>
          <div className="mono" style={{ fontSize:48, fontWeight:600, color:'white', letterSpacing:'0.05em' }}>
            {String(Math.floor(elapsed/60)).padStart(2,'0')}:{String(elapsed%60).padStart(2,'0')}
          </div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:6 }}>elapsed · est. {uploadResult.estimated_processing_seconds}s total</div>
        </div>
      </div>
    </div>
  )
}
