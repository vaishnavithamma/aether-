import { useState } from 'react'
interface Props { rgbImage:string; heatmapOverlay:string; heatmapRaw:string; anomalyMask:string; isDemoMode?:boolean }
type ViewMode = 'overlay'|'rgb'|'heatmap'|'mask'
const DEMO_HEATMAP = () => (
  <svg width="100%" height="100%" viewBox="0 0 256 256" style={{ position:'absolute', inset:0 }}>
    <rect width="256" height="256" fill="#0d0d14"/>
    <text x="128" y="90" textAnchor="middle" fill="rgba(255,255,255,0.1)" fontSize="11" fontFamily="JetBrains Mono">DEMO VISUALIZATION</text>
    <text x="128" y="110" textAnchor="middle" fill="rgba(255,255,255,0.06)" fontSize="10" fontFamily="JetBrains Mono">Upload .mat file for real output</text>
    {/* Simulated anomaly heatmap blobs */}
    <radialGradient id="a1"><stop offset="0%" stopColor="#ff2d55" stopOpacity="0.9"/><stop offset="100%" stopColor="#ff2d55" stopOpacity="0"/></radialGradient>
    <radialGradient id="a2"><stop offset="0%" stopColor="#ff6b35" stopOpacity="0.8"/><stop offset="100%" stopColor="#ff6b35" stopOpacity="0"/></radialGradient>
    <radialGradient id="a3"><stop offset="0%" stopColor="#ffb347" stopOpacity="0.7"/><stop offset="100%" stopColor="#ffb347" stopOpacity="0"/></radialGradient>
    <ellipse cx="61" cy="49" rx="22" ry="18" fill="url(#a1)"/>
    <ellipse cx="132" cy="99" rx="16" ry="14" fill="url(#a2)"/>
    <ellipse cx="200" cy="159" rx="12" ry="10" fill="url(#a3)"/>
    {/* Grid overlay */}
    {Array.from({length:8},(_,i)=><line key={'h'+i} x1="0" y1={i*32} x2="256" y2={i*32} stroke="rgba(0,229,255,0.04)" strokeWidth="1"/>)}
    {Array.from({length:8},(_,i)=><line key={'v'+i} x1={i*32} y1="0" x2={i*32} y2="256" stroke="rgba(0,229,255,0.04)" strokeWidth="1"/>)}
  </svg>
)
export default function SplitViewer({ rgbImage, heatmapOverlay, heatmapRaw, anomalyMask, isDemoMode }: Props) {
  const [split, setSplit] = useState(50)
  const [mode, setMode] = useState<ViewMode>('overlay')
  const [opacity, setOpacity] = useState(70)
  const rightSrc = mode==='rgb'?rgbImage: mode==='heatmap'?heatmapRaw: mode==='mask'?anomalyMask:heatmapOverlay
  const ImgOrDemo = ({ label }: { label: string }) => (
    <div style={{ position:'relative', width:'100%', height:'100%', overflow:'hidden' }}>
      {isDemoMode
        ? <DEMO_HEATMAP />
        : <img src={`data:image/jpeg;base64,${rightSrc}`} alt={label} style={{ width:'100%', height:'100%', objectFit:'cover', opacity:opacity/100 }} />}
      <span style={{ position:'absolute', top:10, left:10, padding:'3px 10px', background:'rgba(5,5,8,0.85)', borderRadius:4, fontSize:10, color:'#00e5ff', letterSpacing:'0.08em', fontFamily:'JetBrains Mono, monospace', border:'1px solid rgba(0,229,255,0.2)' }}>{label}</span>
      {isDemoMode && <span style={{ position:'absolute', bottom:10, right:10, padding:'2px 8px', background:'rgba(255,179,71,0.15)', borderRadius:4, fontSize:9, color:'#ffb347', fontFamily:'JetBrains Mono, monospace', border:'1px solid rgba(255,179,71,0.3)' }}>DEMO</span>}
    </div>
  )
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', position:'relative', background:'var(--bg)' }}>
      <div style={{ flex:1, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, display:'flex' }}>
          {/* Left: RGB */}
          <div style={{ width:`${split}%`, position:'relative', overflow:'hidden', borderRight:'1px solid rgba(0,229,255,0.3)' }}>
            {isDemoMode
              ? <div style={{ width:'100%', height:'100%', position:'relative', overflow:'hidden' }}>
                  <svg width="100%" height="100%" viewBox="0 0 256 256" style={{ position:'absolute', inset:0 }}>
                    <rect width="256" height="256" fill="#0a0f1a"/>
                    {Array.from({length:12},(_,i)=><rect key={i} x={Math.random()*200} y={Math.random()*200} width={20+Math.random()*40} height={20+Math.random()*40} fill={`hsl(${200+i*15},40%,${15+i*2}%)`} opacity="0.6"/>)}
                    {Array.from({length:8},(_,i)=><line key={'h'+i} x1="0" y1={i*32} x2="256" y2={i*32} stroke="rgba(0,229,255,0.04)" strokeWidth="1"/>)}
                  </svg>
                  <span style={{ position:'absolute', top:10, left:10, padding:'3px 10px', background:'rgba(5,5,8,0.85)', borderRadius:4, fontSize:10, color:'#00e5ff', letterSpacing:'0.08em', fontFamily:'JetBrains Mono, monospace', border:'1px solid rgba(0,229,255,0.2)' }}>RGB COMPOSITE</span>
                  <span style={{ position:'absolute', bottom:10, right:10, padding:'2px 8px', background:'rgba(255,179,71,0.15)', borderRadius:4, fontSize:9, color:'#ffb347', fontFamily:'JetBrains Mono, monospace', border:'1px solid rgba(255,179,71,0.3)' }}>DEMO</span>
                </div>
              : <><img src={`data:image/jpeg;base64,${rgbImage}`} alt="RGB" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  <span style={{ position:'absolute', top:10, left:10, padding:'3px 10px', background:'rgba(5,5,8,0.85)', borderRadius:4, fontSize:10, color:'#00e5ff', letterSpacing:'0.08em', fontFamily:'JetBrains Mono, monospace', border:'1px solid rgba(0,229,255,0.2)' }}>RGB COMPOSITE</span></>}
          </div>
          {/* Right: Anomaly */}
          <div style={{ width:`${100-split}%`, position:'relative', overflow:'hidden' }}>
            <ImgOrDemo label="ANOMALY HEATMAP" />
          </div>
          {/* Draggable divider */}
          <div onMouseDown={e => {
            const startX = e.clientX, startSplit = split
            const parent = (e.currentTarget as HTMLElement).parentElement!
            const move = (me: MouseEvent) => setSplit(Math.max(15, Math.min(85, startSplit + (me.clientX - startX) / parent.clientWidth * 100)))
            const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
            window.addEventListener('mousemove', move); window.addEventListener('mouseup', up)
          }} style={{ position:'absolute', left:`${split}%`, top:0, bottom:0, width:4, background:'rgba(0,229,255,0.6)', cursor:'col-resize', transform:'translateX(-50%)', zIndex:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ width:20, height:20, borderRadius:'50%', background:'#00e5ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#050508', boxShadow:'0 0 12px rgba(0,229,255,0.8)', fontWeight:'bold' }}>⇔</div>
          </div>
        </div>
      </div>
      {/* Controls */}
      <div style={{ padding:'8px 16px', background:'rgba(13,13,20,0.98)', borderTop:'1px solid var(--border)', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <div style={{ display:'flex', gap:4 }}>
          {(['rgb','overlay','heatmap','mask'] as ViewMode[]).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ padding:'4px 10px', borderRadius:4, fontSize:10, fontFamily:'JetBrains Mono, monospace', letterSpacing:'0.05em',
              background:mode===m?'rgba(0,229,255,0.15)':'transparent', color:mode===m?'#00e5ff':'rgba(255,255,255,0.4)',
              border:`1px solid ${mode===m?'rgba(0,229,255,0.5)':'var(--border)'}`, cursor:'pointer', transition:'all 200ms' }}>{m.toUpperCase()}</button>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginLeft:'auto' }}>
          <span style={{ fontSize:10, color:'rgba(255,255,255,0.35)', fontFamily:'JetBrains Mono, monospace' }}>OPACITY</span>
          <input type="range" min={0} max={100} value={opacity} onChange={e => setOpacity(+e.target.value)} style={{ width:80, accentColor:'#00e5ff' }}/>
          <span className="mono" style={{ fontSize:11, color:'#00e5ff', width:30 }}>{opacity}%</span>
        </div>
        {isDemoMode && <span style={{ fontSize:10, color:'#ffb347', fontFamily:'JetBrains Mono, monospace', padding:'3px 8px', border:'1px solid rgba(255,179,71,0.3)', borderRadius:4 }}>⚠ DEMO MODE — upload .mat for real results</span>}
      </div>
    </div>
  )
}
