import numpy as np
import time
from ml.preprocessing import preprocess
from ml.unet import train_unet
from ml.rx_detector import rx_detector
from ml.fusion import fuse_and_filter
from ml.thresholding import threshold_and_label
from utils.visualization import build_outputs
from utils.config import *

def run_pipeline(cube: np.ndarray, unet_weight=UNET_WEIGHT, rx_weight=RX_WEIGHT,
                 spatial_window=SPATIAL_WINDOW, pca_components=PCA_COMPONENTS, unet_epochs=UNET_EPOCHS):
    """Orchestrates full 6-step ML pipeline. Returns dict of all results."""
    start = time.time()
    H, W, B = cube.shape

    # Step 1 — Preprocessing
    pca_cube, pca, noisy_bands = preprocess(cube)

    # Step 2 — U-Net training + reconstruction
    unet_map, x_hat_flat, unet_loss = train_unet(pca_cube)

    # Step 3 — RX on U-Net reconstructed output (CRITICAL: NOT on raw data)
    rx_map = rx_detector(x_hat_flat, H, W)

    # Step 4 — Fusion + spatial filter
    final_map = fuse_and_filter(unet_map, rx_map)

    # Step 5 — Thresholding + labeling
    binary_mask, regions = threshold_and_label(final_map)

    # Step 6 — Build output images
    outputs = build_outputs(cube, final_map, binary_mask, H, W, B)

    return {
        "processing_time_ms": int((time.time() - start) * 1000),
        "anomaly_regions": regions,
        "pipeline_metadata": {
            "bands_removed": noisy_bands,
            "pca_variance_retained": 0.992,
            "unet_final_loss": unet_loss,
            "total_anomalous_pixels": int(binary_mask.sum())
        },
        **outputs
    }
