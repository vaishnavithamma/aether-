import React, { useState } from 'react'
import Upload from './components/Upload.tsx'
import PipelineProgress from './components/PipelineProgress.tsx'
import Dashboard from './components/Dashboard.tsx'
import type { Screen, DetectionResult, UploadResult } from './types'
const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('upload')
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null)
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative' }}>
      <div className="scanline-anim" />
      {screen === 'upload' && (
        <Upload
          onUploadComplete={(result) => { setUploadResult(result); setScreen('pipeline') }}
        />
      )}
      {screen === 'pipeline' && uploadResult && (
        <PipelineProgress
          uploadResult={uploadResult}
          onComplete={(result) => { setDetectionResult(result); setScreen('dashboard') }}
        />
      )}
      {screen === 'dashboard' && detectionResult && uploadResult && (
        <Dashboard
          result={detectionResult}
          uploadResult={uploadResult}
          onNewAnalysis={() => { setScreen('upload'); setDetectionResult(null); setUploadResult(null) }}
        />
      )}
    </div>
  )
}
export default App
