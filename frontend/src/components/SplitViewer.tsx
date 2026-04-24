import React, { useState } from 'react'
interface Props { rgbImage:string; heatmapOverlay:string; heatmapRaw:string; anomalyMask:string }
type ViewMode = 'overlay'|'rgb'|'heatmap'|'mask'
const SplitViewer: React.FC<Props> = ({ rgbImage, heatmapOverlay, heatmapRaw, anomalyMask }) => {
  const [split, setSplit] = useState(50)
  const [mode, setMode] = useState<ViewMode>('overlay')
  const [opacity, setOpacity] = useState(70)
  const rightSrc = mode==='rgb'?rgbImage: mode==='heatmap'?heatmapRaw: mode==='mask'?anomalyMask:heatmapOverlay
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', position:'relative' }}>
      <div style={{ flex:1, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, display:'flex' }}>
          <div style={{ width:`${split}%`, overflow:'hidden', position:'relative' }}>
            <img src={`data:image/jpeg;base64,${rgbImage}`} alt="RGB" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            <span style={{ position:'absolute', top:8, left:8, padding:'3px 8px', background:'rgba(0,0,0,0.7)', borderRadius:4, fontSize:10, color:'var(--cyan)', letterSpacing:'0.05em', fontFamily:'JetBrains Mono, monospace' }}>RGB COMPOSITE</span>
          </div>
          <div style={{ width:`${100-split}%`, overflow:'hidden', position:'relative' }}>
            <img src={`data:image/jpeg;base64,${rightSrc}`} alt="Anomaly" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:opacity/100 }} />
            <span style={{ position:'absolute', top:8, left:8, padding:'3px 8px', background:'rgba(0,0,0,0.7)', borderRadius:4, fontSize:10, color:'var(--cyan)', letterSpacing:'0.05em', fontFamily:'JetBrains Mono, monospace' }}>ANOMALY HEATMAP</span>
          </div>
          <div onMouseDown={e=>{ const startX=e.clientX; const startSplit=split; const move=(me:MouseEvent)=>{ const dx=(me.clientX-startX)/(e.currentTarget as HTMLElement).parentElement!.clientWidth*100; setSplit(Math.max(10,Math.min(90,startSplit+dx))) }; const up=()=>{ window.removeEventListener('mousemove',move); window.removeEventListener('mouseup',up) }; window.addEventListener('mousemove',move); window.addEventListener('mouseup',up) }}
            style={{ position:'absolute', left:`${split}%`, top:0, bottom:0, width:3, background:'var(--cyan)', cursor:'col-resize', transform:'translateX(-50%)', zIndex:10 }}>
            <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:24, height:24, borderRadius:'50%', background:'var(--cyan)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#050508' }}>⇔</div>
          </div>
        </div>
      </div>
      <div style={{ padding:'8px 16px', background:'var(--surface1)', borderTop:'1px solid var(--border)', display:'flex', alignItems:'center', gap:16, flexShrink:0 }}>
        <div style={{ display:'flex', gap:4 }}>
          {(['rgb','overlay','heatmap','mask'] as ViewMode[]).map(m=>(
            <button key={m} onClick={()=>setMode(m)} style={{ padding:'4px 10px', borderRadius:4, fontSize:11, cursor:'pointer', fontFamily:'JetBrains Mono, monospace', background:mode===m?'var(--cyan)':'transparent', color:mode===m?'#050508':'rgba(255,255,255,0.5)', border:`1px solid ${mode===m?'var(--cyan)':'var(--border)'}` }}>{m.toUpperCase()}</button>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginLeft:'auto' }}>
          <span style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>Opacity</span>
          <input type="range" min={0} max={100} value={opacity} onChange={e=>setOpacity(+e.target.value)} style={{ accentColor:'var(--cyan)', width:80 }} />
          <span style={{ fontSize:11, color:'var(--cyan)', fontFamily:'JetBrains Mono, monospace', width:32 }}>{opacity}%</span>
        </div>
      </div>
    </div>
  )
}
export default SplitViewer
