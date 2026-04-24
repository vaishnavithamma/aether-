import React, { useState } from 'react'

interface Band {
  band_id: string
  wavelength: string
  thumbnail_b64: string
}

interface Props { 
  bands: Band[]
  noisyBands: string[]
}

export default function BandExplorer({ bands, noisyBands }: Props) {
  const [activeBand, setActiveBand] = useState(0)

  const activeBandData = bands[activeBand] || { band_id: '001', wavelength: '405nm' }

  return (
    <div style={{ width:210, background:'rgba(13,13,20,0.98)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', overflow:'hidden', flexShrink:0 }}>
      <div style={{ padding:'14px 14px 10px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        <div style={{ fontSize:9, letterSpacing:'0.14em', color:'rgba(255,255,255,0.3)', marginBottom:10, fontFamily:'JetBrains Mono,monospace' }}>SPECTRAL BAND EXPLORER</div>
        <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:22, fontWeight:600, color:'#00e5ff', marginBottom:4 }}>
          Band {activeBandData.band_id}
        </div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)' }}>λ = {activeBandData.wavelength}</div>
        <input 
          type="range" 
          min={0} 
          max={Math.max(bands.length - 1, 0)} 
          value={activeBand} 
          onChange={e=>setActiveBand(+e.target.value)} 
          style={{ width:'100%', marginTop:12, accentColor:'#00e5ff' }}
        />
      </div>

      <div style={{ flex:1, overflow:'auto', padding:10, display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
        {bands.map((band, i) => (
          <div key={i} onClick={() => setActiveBand(i)}
            style={{ 
              borderRadius:6, aspectRatio:'1', cursor:'pointer', position:'relative',
              overflow:'hidden', transition:'all 200ms', 
              boxShadow:i===activeBand?'0 0 10px rgba(0,229,255,0.3)':'none',
              border:`1px solid ${i===activeBand?'rgba(0,229,255,0.6)':'rgba(255,255,255,0.06)'}`
            }}>
            <img
              src={`data:image/jpeg;base64,${band.thumbnail_b64}`}
              alt={`Band ${band.band_id}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: activeBand === i ? 1 : 0.6 }}
            />
            <span style={{ position:'absolute', bottom:4, left:4, fontFamily:'JetBrains Mono,monospace', fontSize:9, color:'rgba(255,255,255,0.9)', textShadow:'0 0 2px black', lineHeight:1 }}>{band.band_id}</span>
          </div>
        ))}
      </div>

      {noisyBands && noisyBands.length > 0 && (
        <div style={{ padding:'8px 12px', background:'rgba(255,45,85,0.08)', borderTop:'1px solid rgba(255,45,85,0.2)', flexShrink:0 }}>
          <div style={{ fontSize:10, color:'#ff2d55', fontWeight:500, fontFamily:'JetBrains Mono,monospace', marginBottom:3 }}>Water absorption regions</div>
          {noisyBands.map((msg, i) => (
            <div key={i} style={{ fontSize:10, color:'rgba(255,255,255,0.4)', marginBottom:2 }}>{msg}</div>
          ))}
        </div>
      )}
    </div>
  )
}
