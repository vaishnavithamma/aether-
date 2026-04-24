import React, { useState } from 'react'
interface Props { fileHash: string; bands: number; noisyBands: number[] }
const BandExplorer: React.FC<Props> = ({ bands }) => {
  const [activeBand, setActiveBand] = useState(47)
  const thumbnails = Array.from({length:12},(_,i)=>Math.floor(i*bands/12))
  return (
    <div style={{ width:280, background:'var(--surface1)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', padding:16, overflow:'hidden', flexShrink:0 }}>
      <h3 style={{ fontSize:11, color:'rgba(255,255,255,0.5)', letterSpacing:'0.08em', marginBottom:16 }}>SPECTRAL BAND EXPLORER</h3>
      <div style={{ textAlign:'center', marginBottom:16 }}>
        <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:32, color:'var(--cyan)' }}>Band {String(activeBand).padStart(3,'0')}</div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:4 }}>λ = {400 + activeBand * 5}nm</div>
      </div>
      <input type="range" min={0} max={bands-1} value={activeBand} onChange={e=>setActiveBand(+e.target.value)}
        style={{ width:'100%', accentColor:'var(--cyan)', marginBottom:20 }} />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6, flex:1, overflow:'auto' }}>
        {thumbnails.map(band => (
          <div key={band} onClick={() => setActiveBand(band)} style={{
            background:'var(--surface2)', borderRadius:6, aspectRatio:'1', display:'flex', alignItems:'center', justifyContent:'center',
            border: activeBand===band?'1px solid var(--cyan)':'1px solid var(--border)',
            cursor:'pointer', fontSize:9, color:'rgba(255,255,255,0.4)', fontFamily:'JetBrains Mono, monospace',
            transition:'all 200ms'
          }}>{band}</div>
        ))}
      </div>
      <div style={{ marginTop:16, padding:8, background:'rgba(255,45,85,0.1)', borderRadius:6, border:'1px solid rgba(255,45,85,0.2)' }}>
        <div style={{ fontSize:10, color:'var(--red)', marginBottom:4 }}>Water absorption regions</div>
        <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>Bands 104–113 · 150–170 excluded</div>
      </div>
    </div>
  )
}
export default BandExplorer
