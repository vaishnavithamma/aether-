import numpy as np
import cv2

def make_sparse_heatmap(score: np.ndarray, percentile: float = 99.0):
    threshold = np.percentile(score, percentile)
    masked = np.where(score >= threshold, score, 0.0)
    if masked.max() > 0:
        norm = (masked - threshold) / (masked.max() - threshold + 1e-9)
    else:
        norm = masked
    norm = np.clip(norm, 0, 1)
    u8 = (norm * 255).astype(np.uint8)
    colored = cv2.applyColorMap(u8, cv2.COLORMAP_INFERNO)
    colored[score < threshold] = [0, 0, 0]
    return colored, threshold

score = np.random.rand(100, 100)
heatmap, thresh = make_sparse_heatmap(score)
cv2.imwrite("test_heatmap.jpg", heatmap)
print("Non-black pixels:", np.sum(heatmap.sum(axis=2) > 0))
print("Expected around:", 100 * 100 * 0.01)
