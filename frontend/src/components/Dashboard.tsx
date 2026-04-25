import React, { useState } from 'react'
import type { DetectionResult, UploadResult, AnomalyRegion } from '../types'
import BandExplorer from './BandExplorer'
import SplitViewer from './SplitViewer'
import MetricsPanel from './MetricsPanel'
import AnomalyDetail from './AnomalyDetail'
interface Props { result: DetectionResult; uploadResult: UploadResult; onNewAnalysis: () => void }
const Dashboard: React.FC<Props> = ({ result, uploadResult, onNewAnalysis }) => {
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyRegion | null>(null)

  const handleExport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      upload_metadata: uploadResult,
      detection_results: result
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spectrashield_report_${uploadResult.file_hash}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
          <button onClick={handleExport} style={{ padding:'6px 16px', background:'var(--cyan)', color:'#050508', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer', border:'none' }}>Export</button>
        </div>
      </div>
      {/* 3-column layout */}
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
        <BandExplorer bands={uploadResult.bands || []} noisyBands={result.noisy_bands || []} bandInfo={uploadResult.band_info} />
        <SplitViewer
          rgbImage={result.rgb_image || ''}
          heatmapOverlay={result.heatmap_overlay || ''}
          heatmapRaw={result.heatmap_raw || ''}
          anomalyMask={result.anomaly_mask || ''}
          regions={result.anomaly_regions || []}
          imageShape={uploadResult.shape}
          selectedRegionId={selectedAnomaly?.id}
        />
        <MetricsPanel regions={result.anomaly_regions} metrics={result.metrics} metadata={result.pipeline_metadata} onSelectAnomaly={setSelectedAnomaly} />
      </div>
      {selectedAnomaly && <AnomalyDetail region={selectedAnomaly} onClose={() => setSelectedAnomaly(null)} fileHash={uploadResult.file_hash} />}
    </div>
  )
}
export default Dashboard
