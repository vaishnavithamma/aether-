import numpy as np
from utils.config import RX_REGULARIZATION

def rx_detector(x_hat_flat: np.ndarray, H: int, W: int) -> np.ndarray:
    """RX detector on U-Net reconstructed output. Input: x_hat_flat (N,30). Returns rx_map (H,W)."""
    mu = np.mean(x_hat_flat, axis=0)
    diff = x_hat_flat - mu
    cov = np.cov(x_hat_flat.T) + np.eye(x_hat_flat.shape[1]) * RX_REGULARIZATION
    cov_inv = np.linalg.inv(cov)
    rx_scores = np.sum(diff @ cov_inv * diff, axis=1)
    rx_map = rx_scores.reshape(H, W)
    return (rx_map - rx_map.min()) / (rx_map.max() - rx_map.min() + 1e-8)
