import numpy as np
import h5py
import hashlib

def load_mat(path: str) -> np.ndarray:
    """Load .mat hyperspectral file. Returns float32 numpy array (H,W,B)."""
    with h5py.File(path, 'r') as f:
        keys = [k for k in f.keys() if not k.startswith('#')]
        data = np.array(f[keys[0]], dtype=np.float32)
    if data.ndim == 3 and data.shape[0] < data.shape[2]:
        data = data.transpose(1, 2, 0)
    return data

def file_hash(data: bytes) -> str:
    """Return MD5 hash of file bytes."""
    return hashlib.md5(data).hexdigest()
