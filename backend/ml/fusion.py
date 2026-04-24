import numpy as np
from scipy.ndimage import uniform_filter
from utils.config import *

def fuse_and_filter(unet_map: np.ndarray, rx_map: np.ndarray) -> np.ndarray:
    """Weighted fusion of U-Net + RX scores, spatial smoothing, isolation penalty."""
    fused = UNET_WEIGHT * unet_map + RX_WEIGHT * rx_map
    smoothed = uniform_filter(fused, size=SPATIAL_WINDOW)
    thresh75 = np.percentile(fused, 75)
    mask = (fused > thresh75) & (smoothed < 0.5 * fused)
    fused[mask] *= ISOLATION_PENALTY
    final = uniform_filter(fused, size=SPATIAL_WINDOW)
    return (final - final.min()) / (final.max() - final.min() + 1e-8)
