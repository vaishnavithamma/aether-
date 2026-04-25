import React, { useState, useRef, useCallback, useEffect } from 'react'

import type { AnomalyRegion } from '../types'

interface SplitViewerProps {
  rgbImage: string
  heatmapOverlay: string
  anomalyMask: string
  regions?: AnomalyRegion[]
  imageShape?: { width: number; height: number; channels: number }
  selectedRegionId?: number
}

type Mode = 'overlay'|'rgb'|'heatmap'|'mask'

// BUG FIX 1: Define red color constants for anomaly region rendering
const ANOMALY_RED_FILL    = 'rgba(255, 30, 30, 0.25)'
const ANOMALY_RED_STROKE  = 'rgba(255, 30, 30, 0.90)'
const ANOMALY_RED_LABEL   = 'rgba(255, 30, 30, 1.00)'
const ANOMALY_WHITE_TEXT  = 'rgba(255, 255, 255, 1.00)'

export default function SplitViewer({ rgbImage, heatmapOverlay, heatmapRaw, anomalyMask, regions = [], imageShape = {width:800, height:600, channels:100}, selectedRegionId }: SplitViewerProps) {
  const [split, setSplit]     = useState(50)
  const [mode,  setMode]      = useState<Mode>('overlay')
  const [opacity, setOpacity] = useState(85)
  const isDragging            = useRef(false)
  const containerRef          = useRef<HTMLDivElement>(null)
  
  const heatmapRef = useRef<HTMLDivElement>(null)
  const [canvasDims, setCanvasDims] = useState({ width: 800, height: 600 })
  
  useEffect(() => {
    if (!heatmapRef.current) return
    const observer = new ResizeObserver(entries => {
      setCanvasDims({
        width: entries[0].contentRect.width,
        height: entries[0].contentRect.height
      })
    })
    observer.observe(heatmapRef.current)
    return () => observer.disconnect()
  }, [])

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
            <div ref={heatmapRef} style={{ position:'absolute', top:0, left:`${split}%`, right:0, height:'100%', overflow:'hidden' }}>
              {rightSrc
                ? <img src={`data:image/jpeg;base64,${rightSrc}`} alt="Anomaly" style={{ ...imgStyle, opacity: opacity/100, objectFit:'fill' }}/>
                : <div style={{ width:'100%', height:'100%', background:'#0a0a12', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ fontSize:12, color:'rgba(255,255,255,0.2)', fontFamily:'JetBrains Mono,monospace' }}>Processing...</span>
                  </div>}
              <div style={{ position:'absolute', top:10, left:10, padding:'3px 10px', background:'rgba(5,5,8,0.85)', borderRadius:4, fontSize:10, color:'#ff6b35', fontFamily:'JetBrains Mono,monospace', border:'1px solid rgba(255,107,53,0.3)', letterSpacing:'0.06em' }}>
                {mode==='rgb'?'RGB COMPOSITE':mode==='heatmap'?'ANOMALY HEATMAP (RAW)':mode==='mask'?'BINARY MASK':'HEATMAP OVERLAY'}
              </div>

              {/* Regions SVG Overlay */}
              {(mode === 'heatmap' || mode === 'overlay') && regions && imageShape && (
                // BUG FIX 4: SVG overlay must perfectly cover the heatmap image
                <svg style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', overflow:'visible', zIndex:10 }}>
                  <style>
                    {`
                      @keyframes region-pulse {
                        0%, 100% { transform: scale(1); opacity: 0.6; }
                        50% { transform: scale(1.3); opacity: 0.2; }
                      }
                      .region-pulse { animation: region-pulse 1.5s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
                    `}
                  </style>
                  {regions.map((r, index) => {
                    const canvasWidth = canvasDims.width;
                    const canvasHeight = canvasDims.height;
                    
                    // BUG FIX 2: Scale normalized coordinates to canvas display size
                    const displayX = r.coords ? r.coords.norm_x * canvasWidth : r.centroid.x;
                    const displayY = r.coords ? r.coords.norm_y * canvasHeight : r.centroid.y;
                    
                    let boxX = displayX - 10;
                    let boxY = displayY - 10;
                    let boxW = 20;
                    let boxH = 20;
                    
                    if (r.coords && r.coords.norm_bbox) {
                        boxX = r.coords.norm_bbox.min_x * canvasWidth;
                        boxY = r.coords.norm_bbox.min_y * canvasHeight;
                        boxW = Math.max(14, (r.coords.norm_bbox.max_x - r.coords.norm_bbox.min_x) * canvasWidth);
                        boxH = Math.max(14, (r.coords.norm_bbox.max_y - r.coords.norm_bbox.min_y) * canvasHeight);
                    }
                    
                    const minRadius = 5;
                    const naturalRadius = Math.sqrt(r.pixel_count / Math.PI);
                    const renderRadius = Math.max(minRadius, naturalRadius);
                    const opacity_val = Math.max(0.35, r.confidence);
                    const label = index + 1;
                    
                    const isSelected = r.id === selectedRegionId;
                    const finalOpacity = isSelected ? 1.0 : opacity_val * (opacity / 100);
                    const strokeWidth = isSelected ? 3 : 1;
                    
                    return (
                      <g key={r.id}>
                        {/* BUG FIX 2A: Red filled bounding box with transparent fill */}
                        {r.coords && (
                          <rect
                            x={boxX}
                            y={boxY}
                            width={boxW}
                            height={boxH}
                            fill={ANOMALY_RED_FILL}
                            stroke={ANOMALY_RED_STROKE}
                            strokeWidth={1.5}
                            strokeDasharray="5 2"
                            opacity={finalOpacity}
                          />
                        )}
                        
                        {/* Highlight selected region with pulsing ring */}
                        {isSelected && (
                          <circle
                            cx={displayX}
                            cy={displayY}
                            r={renderRadius + 6}
                            fill="none"
                            stroke={ANOMALY_RED_STROKE}
                            strokeWidth={1.5}
                            opacity={0.6}
                            className="region-pulse"
                          />
                        )}
                        
                        {/* BUG FIX 2B: Red solid dot at centroid */}
                        <circle
                          cx={displayX}
                          cy={displayY}
                          r={renderRadius}
                          fill="rgba(255, 30, 30, 0.70)"
                          stroke="rgba(255, 255, 255, 0.80)"
                          opacity={finalOpacity}
                          strokeWidth={strokeWidth}
                        />
                        
                        {/* BUG FIX 2C: Region number badge */}
                        <circle
                          cx={boxX + boxW - 6}
                          cy={boxY + 6}
                          r={8}
                          fill="rgba(0, 0, 0, 0.80)"
                          stroke={ANOMALY_RED_STROKE}
                          strokeWidth={1.2}
                        />
                        <text
                          x={boxX + boxW - 6}
                          y={boxY + 6 + 3.5}
                          textAnchor="middle"
                          fontSize={8}
                          fontFamily="monospace"
                          fontWeight="bold"
                          fill={ANOMALY_WHITE_TEXT}
                          style={{ userSelect: 'none', pointerEvents: 'none' }}
                        >
                          {label}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              )}

              {/* Inferno colorbar */}
              {(mode==='heatmap'||mode==='overlay') && (
                <div style={{ position:'absolute', bottom:12, right:12, display:'flex', flexDirection:'column', gap:4 }}>
                  <div style={{ width:120, height:10, borderRadius:3, background:'linear-gradient(to right, #000004, #3b0f70, #8c2981, #de4968, #fe9f6d, #fcfdbf)', border:'1px solid rgba(255,255,255,0.15)' }}/>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ fontSize:9, color:'rgba(255,255,255,0.4)', fontFamily:'JetBrains Mono,monospace' }}>LOW</span>
                    <span style={{ fontSize:9, color:'rgba(255,255,255,0.4)', fontFamily:'JetBrains Mono,monospace' }}>HIGH</span>
                  </div>
                  {/* BUG FIX 5: Add a small legend note for the red anomaly overlays */}
                  <div style={{ fontSize:'10px', color:'rgba(255, 30, 30, 0.85)', marginTop:'4px', fontFamily:'monospace', letterSpacing:'0.5px' }}>
                    ■ ANOMALY REGIONS (1–{regions.length})
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
