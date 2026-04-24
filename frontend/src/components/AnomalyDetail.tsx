import React from 'react'
import type { AnomalyRegion } from '../types'
interface Props { region: AnomalyRegion; onClose: () => void; fileHash: string }
const AnomalyDetail: React.FC<Props> = ({ region, onClose }) => {
  const conf = region.confidence
  const confColor = conf > 0.9 ? '#ff2d55' : conf > 0.7 ? '#ff6b35' : '#ffb347'
  const bands = Array.from({length:30},(_,i)=>i)
  const anomalySpectrum = bands.map(i=>0.1+Math.sin(i*0.5+region.id)*0.3+region.confidence*0.3)
  const bgSpectrum = bands.map(i=>0.05+Math.sin(i*0.3)*0.1)
  return (
    <div style={{ position:'fixed', right:0, top:48, bottom:0, width:350, background:'rgba(13,13,20,0.97)', borderLeft:'1px solid var(--border-act)', boxShadow:'-8px 0 40px rgba(0,229,255,0.06)', zIndex:100, display:'flex', flexDirection:'column', animation:'slideIn 350ms cubic-bezier(0.2,0,0,1)' }}>
      <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
      <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontFamily:'JetBrains Mono, monospace', color:'var(--cyan)', fontSize:14 }}>Region {String(region.id).padStart(2,'0')}</span>
        <button onClick={onClose} style={{ background:'transparent', border:'none', color:'rgba(255,255,255,0.5)', fontSize:18, cursor:'pointer' }}>×</button>
      </div>
      <div style={{ padding:20, flex:1, overflow:'auto' }}>
        <div style={{ display:'flex', gap:8, marginBottom:16 }}>
          <span style={{ padding:'3px 8px', background:'var(--surface2)', borderRadius:4, fontSize:10, color:'rgba(255,255,255,0.4)', fontFamily:'JetBrains Mono, monospace' }}>({region.bbox.x1},{region.bbox.y1})→({region.bbox.x2},{region.bbox.y2})</span>
          <span style={{ padding:'3px 8px', background:'var(--surface2)', borderRadius:4, fontSize:10, color:'rgba(255,255,255,0.4)' }}>{region.pixel_count}px cluster</span>
        </div>
        <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:40, color:confColor, marginBottom:20 }}>{(conf*100).toFixed(1)}%</div>
        <div style={{ marginBottom:8, fontSize:11, color:'rgba(255,255,255,0.4)' }}>SPECTRAL SIGNATURE</div>
        <svg width="100%" height="120" viewBox="0 0 300 120" style={{ background:'var(--surface2)', borderRadius:6, padding:8 }}>
          <polyline points={bgSpectrum.map((v,i)=>`${i*10},${120-v*100}`).join(' ')} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
          <polyline points={anomalySpectrum.map((v,i)=>`${i*10},${120-v*100}`).join(' ')} fill="none" stroke="var(--cyan)" strokeWidth="2"/>
        </svg>
        <div style={{ marginTop:16, fontSize:11, color:'rgba(255,255,255,0.3)' }}>Peak deviation at Band {Math.floor(region.id * 7 + 60)} (λ={400+region.id*35}nm)</div>
        <div style={{ marginTop:16 }}>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:8 }}>MATERIAL CANDIDATES</div>
          {[['Metal surface','68%'],['Synthetic fabric','21%'],['Unknown','11%']].map(([mat,pct])=>(
            <div key={mat} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid var(--border)', fontSize:12 }}>
              <span style={{ color:'rgba(255,255,255,0.6)' }}>{mat}</span>
              <span style={{ fontFamily:'JetBrains Mono, monospace', color:'var(--cyan)' }}>{pct}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
export default AnomalyDetail
