import React, { useState } from 'react'
import type { DetectionResult, UploadResult, AnomalyRegion } from '../types'
import BandExplorer from './BandExplorer'
import SplitViewer from './SplitViewer'
import MetricsPanel from './MetricsPanel'
import AnomalyDetail from './AnomalyDetail'
interface Props { result: DetectionResult; uploadResult: UploadResult; onNewAnalysis: () => void }
const Dashboard: React.FC<Props> = ({ result, uploadResult, onNewAnalysis }) => {
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyRegion | null>(null)
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:'var(--bg)', overflow:'hidden' }}>
      {/* Navbar */}
      <div style={{ height:48, background:'var(--surface1)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontFamily:'JetBrains Mono, monospace', color:'var(--cyan)', fontSize:16, fontWeight:600, letterSpacing:'0.1em' }}>SPECTRASHIELD</span>
          <span style={{ fontSize:10, background:'rgba(0,229,255,0.1)', color:'var(--cyan)', padding:'2px 8px', borderRadius:4, border:'1px solid rgba(0,229,255,0.3)' }}>v2.1</span>
        </div>
        <span style={{ fontSize:12, color:'rgba(255,255,255,0.4)', fontFamily:'JetBrains Mono, monospace' }}>
          {uploadResult.shape.height}×{uploadResult.shape.width}×{uploadResult.shape.bands}
        </span>
        <div style={{ display:'flex', gap:12 }}>
          <button onClick={onNewAnalysis} style={{ padding:'6px 16px', background:'transparent', border:'1px solid var(--border-act)', color:'white', borderRadius:6, fontSize:12, cursor:'pointer' }}>New Analysis</button>
          <button style={{ padding:'6px 16px', background:'var(--cyan)', color:'#050508', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer', border:'none' }}>Export</button>
        </div>
      </div>
      {/* 3-column layout */}
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
        <BandExplorer fileHash={uploadResult.file_hash} bands={uploadResult.shape.bands} noisyBands={uploadResult.noisy_bands_detected} />
        <SplitViewer
          rgbImage={result.rgb_image || ''}
          heatmapOverlay={result.heatmap_overlay || ''}
          heatmapRaw={result.heatmap_raw || ''}
          anomalyMask={result.anomaly_mask || ''}
          isDemoMode={!result.rgb_image || result.rgb_image === ''}
        />
        <MetricsPanel regions={result.anomaly_regions} metadata={result.pipeline_metadata} onSelectAnomaly={setSelectedAnomaly} />
      </div>
      {selectedAnomaly && <AnomalyDetail region={selectedAnomaly} onClose={() => setSelectedAnomaly(null)} fileHash={uploadResult.file_hash} />}
    </div>
  )
}
export default Dashboard
