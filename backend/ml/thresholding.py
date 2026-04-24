import numpy as np
from skimage.filters import threshold_otsu
from scipy.ndimage import label
from utils.config import MIN_ANOMALY_PIXELS

def threshold_and_label(final_map: np.ndarray):
    """Otsu threshold + connected component labeling. Returns binary_mask, regions list."""
    thresh = threshold_otsu(final_map)
    binary = (final_map > thresh).astype(np.uint8)
    labeled, n = label(binary)
    for rid in range(1, n+1):
        if (labeled == rid).sum() < MIN_ANOMALY_PIXELS:
            binary[labeled == rid] = 0
    labeled, n = label(binary)
    regions = []
    for rid in range(1, n+1):
        ys, xs = np.where(labeled == rid)
        pixels = final_map[ys, xs]
        regions.append({
            "id": rid,
            "bbox": {"x1": int(xs.min()), "y1": int(ys.min()), "x2": int(xs.max()), "y2": int(ys.max())},
            "centroid": {"x": int(xs.mean()), "y": int(ys.mean())},
            "confidence": float(round(pixels.max(), 4)),
            "pixel_count": int(len(ys)),
            "mean_score": float(round(pixels.mean(), 4))
        })
    return binary, regions
