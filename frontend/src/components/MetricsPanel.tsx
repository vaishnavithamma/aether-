import React from 'react'
import type { AnomalyRegion } from '../types'
interface Props {
  regions: AnomalyRegion[]
  metadata: { bands_removed:number[]; pca_variance_retained:number; unet_final_loss:number; total_anomalous_pixels:number }
  onSelectAnomaly: (r: AnomalyRegion) => void
}
const HEAT_COLOR = (conf: number) => conf > 0.9 ? '#ff2d55' : conf > 0.7 ? '#ff6b35' : '#ffb347'
const MetricsPanel: React.FC<Props> = ({ regions, metadata, onSelectAnomaly }) => {
  const maxConf = regions.length ? Math.max(...regions.map(r=>r.confidence)) : 0
  return (
    <div style={{ width:300, background:'var(--surface1)', borderLeft:'1px solid var(--border)', display:'flex', flexDirection:'column', overflow:'hidden', flexShrink:0 }}>
      <div style={{ padding:16, borderBottom:'1px solid var(--border)' }}>
        <h3 style={{ fontSize:11, color:'rgba(255,255,255,0.5)', letterSpacing:'0.08em', marginBottom:16 }}>DETECTION METRICS</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {[
            { label:'ANOMALY REGIONS', value: regions.length },
            { label:'MAX CONFIDENCE', value: `${metadata.max_confidence?.toFixed(1) || 0}%` },
            { label:'ANOMALOUS PIXELS', value: metadata.total_anomalous_pixels },
            { label:'PCA VARIANCE', value: `${metadata.pca_variance_retained?.toFixed(1) || 0}%` },
          ].map(m => (
            <div key={m.label} style={{ background:'var(--surface2)', padding:'10px 12px', borderRadius:6 }}>
              <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', letterSpacing:'0.06em', marginBottom:4 }}>{m.label}</div>
              <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:20, color:'var(--cyan)' }}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding:16, flex:1, overflow:'auto' }}>
        <h3 style={{ fontSize:11, color:'rgba(255,255,255,0.5)', letterSpacing:'0.08em', marginBottom:12 }}>DETECTED ANOMALIES</h3>
        {regions.length === 0 && <div style={{ color:'rgba(255,255,255,0.2)', fontSize:12, textAlign:'center', marginTop:32 }}>No anomalies detected</div>}
        {regions.map((r, i) => (
          <div key={r.id} onClick={()=>onSelectAnomaly(r)}
            style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:6, marginBottom:6, background:'var(--surface2)', border:'1px solid var(--border)', cursor:'pointer', transition:'all 200ms', animationDelay:`${i*50}ms` }}
            onMouseEnter={e=>(e.currentTarget.style.borderColor='var(--border-act)')}
            onMouseLeave={e=>(e.currentTarget.style.borderColor='var(--border)')}>
            <div style={{ width:12, height:12, borderRadius:2, background:HEAT_COLOR(r.confidence), flexShrink:0 }} />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, fontFamily:'JetBrains Mono, monospace', color:'white' }}>Region {String(r.id).padStart(2,'0')}</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:2 }}>({r.centroid.x}, {r.centroid.y}) · {r.pixel_count}px</div>
            </div>
            <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:13, color:HEAT_COLOR(r.confidence) }}>{(r.confidence*100).toFixed(0)}%</div>
          </div>
        ))}
      </div>
      <div style={{ padding:12, borderTop:'1px solid var(--border)', background:'var(--surface2)' }}>
        <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>U-Net Loss: <span style={{ color:'var(--cyan)', fontFamily:'JetBrains Mono, monospace' }}>{metadata.unet_final_loss.toFixed(5)}</span></div>
        <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:4 }}>Bands removed: <span style={{ color:'var(--amber)' }}>{metadata.bands_removed.length}</span></div>
      </div>
    </div>
  )
}
export default MetricsPanel
