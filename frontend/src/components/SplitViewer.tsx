import React, { useState, useRef, useCallback } from 'react'

interface Props {
  rgbImage: string        // base64 of actual uploaded image
  heatmapOverlay: string  // base64 of blend overlay
  heatmapRaw: string      // base64 of pure inferno heatmap
  anomalyMask: string     // base64 of binary mask
}

type Mode = 'overlay'|'rgb'|'heatmap'|'mask'

export default function SplitViewer({ rgbImage, heatmapOverlay, heatmapRaw, anomalyMask }: Props) {
  const [split, setSplit]     = useState(50)
  const [mode,  setMode]      = useState<Mode>('overlay')
  const [opacity, setOpacity] = useState(85)
  const isDragging            = useRef(false)
  const containerRef          = useRef<HTMLDivElement>(null)

  const rightSrc = mode==='rgb' ? rgbImage : mode==='heatmap' ? heatmapRaw : mode==='mask' ? anomalyMask : heatmapOverlay

  const onMouseDown = useCallback(() => { isDragging.current = true }, [])
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const pct  = Math.max(10, Math.min(90, ((e.clientX - rect.left) / rect.width) * 100))
    setSplit(pct)
  }, [])
  const onMouseUp = useCallback(() => { isDragging.current = false }, [])

  const imgStyle: React.CSSProperties = { position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }
  const noData = !rgbImage

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:'#050508', userSelect:'none' }}
         onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
      {/* Main viewer */}
      <div ref={containerRef} style={{ flex:1, position:'relative', overflow:'hidden', cursor:'col-resize' }}>
        {noData
          ? <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.15)', flexDirection:'column', gap:12 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
              <span style={{ fontSize:13, fontFamily:'JetBrains Mono,monospace' }}>No image data</span>
            </div>
          : <>
            {/* LEFT: RGB */}
            <div style={{ position:'absolute', top:0, left:0, width:`${split}%`, height:'100%', overflow:'hidden' }}>
              <img src={`data:image/jpeg;base64,${rgbImage}`} alt="RGB" style={imgStyle}/>
              <div style={{ position:'absolute', top:10, left:10, padding:'3px 10px', background:'rgba(5,5,8,0.85)', borderRadius:4, fontSize:10, color:'#00e5ff', fontFamily:'JetBrains Mono,monospace', border:'1px solid rgba(0,229,255,0.25)', letterSpacing:'0.06em' }}>RGB COMPOSITE</div>
            </div>

            {/* RIGHT: Anomaly view */}
            <div style={{ position:'absolute', top:0, left:`${split}%`, right:0, height:'100%', overflow:'hidden' }}>
              {rightSrc
                ? <img src={`data:image/jpeg;base64,${rightSrc}`} alt="Anomaly" style={{ ...imgStyle, opacity: opacity/100 }}/>
                : <div style={{ width:'100%', height:'100%', background:'#0a0a12', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ fontSize:12, color:'rgba(255,255,255,0.2)', fontFamily:'JetBrains Mono,monospace' }}>Processing...</span>
                  </div>}
              <div style={{ position:'absolute', top:10, left:10, padding:'3px 10px', background:'rgba(5,5,8,0.85)', borderRadius:4, fontSize:10, color:'#ff6b35', fontFamily:'JetBrains Mono,monospace', border:'1px solid rgba(255,107,53,0.3)', letterSpacing:'0.06em' }}>
                {mode==='rgb'?'RGB COMPOSITE':mode==='heatmap'?'ANOMALY HEATMAP (RAW)':mode==='mask'?'BINARY MASK':'HEATMAP OVERLAY'}
              </div>

              {/* Inferno colorbar */}
              {(mode==='heatmap'||mode==='overlay') && (
                <div style={{ position:'absolute', bottom:12, right:12, display:'flex', flexDirection:'column', gap:4 }}>
                  <div style={{ width:120, height:10, borderRadius:3, background:'linear-gradient(to right, #000004, #3b0f70, #8c2981, #de4968, #fe9f6d, #fcfdbf)', border:'1px solid rgba(255,255,255,0.15)' }}/>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ fontSize:9, color:'rgba(255,255,255,0.4)', fontFamily:'JetBrains Mono,monospace' }}>LOW</span>
                    <span style={{ fontSize:9, color:'rgba(255,255,255,0.4)', fontFamily:'JetBrains Mono,monospace' }}>HIGH</span>
                  </div>
                </div>
              )}
            </div>

            {/* Draggable divider */}
            <div onMouseDown={onMouseDown}
                 style={{ position:'absolute', top:0, left:`${split}%`, width:3, height:'100%', background:'rgba(0,229,255,0.7)', transform:'translateX(-50%)', zIndex:20, cursor:'col-resize' }}>
              <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:22, height:22, borderRadius:'50%', background:'#00e5ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#050508', fontWeight:'bold', boxShadow:'0 0 12px rgba(0,229,255,0.9)' }}>⇔</div>
            </div>
          </>}
      </div>

      {/* Controls */}
      <div style={{ padding:'8px 16px', background:'rgba(13,13,20,0.98)', borderTop:'1px solid var(--border)', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <div style={{ display:'flex', gap:4 }}>
          {(['overlay','heatmap','rgb','mask'] as Mode[]).map(m=>(
            <button key={m} onClick={()=>setMode(m)}
              style={{ padding:'4px 10px', borderRadius:4, fontSize:10, fontFamily:'JetBrains Mono,monospace', letterSpacing:'0.05em', cursor:'pointer', transition:'all 180ms',
                background:mode===m?'rgba(0,229,255,0.15)':'transparent',
                color:mode===m?'#00e5ff':'rgba(255,255,255,0.4)',
                border:`1px solid ${mode===m?'rgba(0,229,255,0.5)':'var(--border)'}` }}>
              {m.toUpperCase()}
            </button>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginLeft:'auto' }}>
          <span style={{ fontSize:10, color:'rgba(255,255,255,0.35)', fontFamily:'JetBrains Mono,monospace' }}>OPACITY</span>
          <input type="range" min={20} max={100} value={opacity} onChange={e=>setOpacity(+e.target.value)} style={{ width:80, accentColor:'#00e5ff' }}/>
          <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:11, color:'#00e5ff', width:32 }}>{opacity}%</span>
        </div>
      </div>
    </div>
  )
}
