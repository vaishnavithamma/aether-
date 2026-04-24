export type Screen = 'upload' | 'pipeline' | 'dashboard'
export interface DetectionResult {
  rgb_image: string
  heatmap_raw: string
  heatmap_overlay: string
  anomaly_mask: string
  anomaly_regions: AnomalyRegion[]
  processing_time_ms: number
  pipeline_metadata: {
    bands_removed: number[]
    pca_variance_retained: number
    unet_final_loss: number
    total_anomalous_pixels: number
    anomaly_percent?: number
    max_confidence?: number
    total_pixels?: number
  }
  noisy_bands?: string[]
}
export interface AnomalyRegion {
  id: number
  bbox: { x1: number; y1: number; x2: number; y2: number }
  centroid: { x: number; y: number }
  confidence: number
  pixel_count: number
  mean_score: number
}
export interface UploadResult {
  file_hash: string
  shape: { height: number; width: number; bands: number }
  rgb_preview: string
  estimated_processing_seconds: number
  noisy_bands_detected: number[]
  bands?: { band_id: string; wavelength: string; thumbnail_b64: string }[]
}
