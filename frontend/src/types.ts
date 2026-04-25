export type Screen = 'upload' | 'pipeline' | 'dashboard'
export interface DetectionResult {
  rgb_image: string
  heatmap_raw: string
  heatmap_overlay: string
  anomaly_mask: string
  anomaly_regions: AnomalyRegion[]
  processing_time_ms: number
  metrics: {
    anomaly_regions: number
    max_confidence: number
    anomalous_pixels: number
    pca_variance: number
  }
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
  coords?: {
    x: number; y: number;
    norm_x: number; norm_y: number;
    bbox: { min_x: number; max_x: number; min_y: number; max_y: number };
    norm_bbox: { min_x: number; max_x: number; min_y: number; max_y: number };
  }
  confidence: number
  pixel_count: number
  mean_score: number
  spectral_signature?: number[]
  edge_fraction?: number
  detection_quality?: string
  quality_reason?: string
  material_candidates?: { name: string; confidence: number }[]
}
export interface UploadResult {
  file_hash: string
  shape: { height: number; width: number; bands: number }
  rgb_preview: string
  estimated_processing_seconds: number
  noisy_bands_detected: number[]
  bands?: { band_id: string; wavelength: string; thumbnail_b64: string }[]
  band_info?: { total_bands: number; bands_used: number; bands_removed: number; removed_ranges: string[] }
}
