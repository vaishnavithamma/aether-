import numpy as np
from sklearn.decomposition import PCA
from utils.config import *

def preprocess(cube: np.ndarray):
    """Denoise, normalize, and PCA-reduce hyperspectral cube. Returns pca_cube (H,W,30)."""
    H, W, B = cube.shape
    snr = cube.mean(axis=(0,1)) / (cube.std(axis=(0,1)) + 1e-8)
    noisy = list(np.where(snr < SNR_THRESHOLD)[0])
    for start, end in WATER_ABSORPTION_BANDS:
        noisy += list(range(start, min(end, B)))
    keep = [i for i in range(B) if i not in noisy]
    cube_clean = cube[:, :, keep]
    for i in range(cube_clean.shape[2]):
        b = cube_clean[:,:,i]
        cube_clean[:,:,i] = (b - b.min()) / (b.max() - b.min() + 1e-8)
    pixels = cube_clean.reshape(H*W, len(keep))
    pca = PCA(n_components=min(PCA_COMPONENTS, len(keep)))
    pca_data = pca.fit_transform(pixels)
    pca_cube = pca_data.reshape(H, W, pca_data.shape[1])
    return pca_cube, pca, noisy
