from fastapi import APIRouter, UploadFile, File, HTTPException
import numpy as np, os, tempfile
from utils.file_io import load_mat, file_hash
from utils.visualization import build_outputs, encode_img
import cv2

router = APIRouter()
TMP_DIR = "/tmp/spectrashield"
os.makedirs(TMP_DIR, exist_ok=True)

@router.post("/upload")
async def upload(file: UploadFile = File(...)):
    """Validate and store uploaded hyperspectral file."""
    if not file.filename.endswith(('.mat', '.hdr', '.img')):
        raise HTTPException(400, {"error": "invalid_format", "detail": "Expected .mat or .hdr file"})
    data = await file.read()
    if len(data) > 500 * 1024 * 1024:
        raise HTTPException(413, {"error": "file_too_large", "detail": "Max 500MB"})
    fhash = file_hash(data)
    tmp_path = f"{TMP_DIR}/{fhash}.npy"
    mat_path = f"{TMP_DIR}/{fhash}.mat"
    with open(mat_path, 'wb') as f: f.write(data)
    cube = load_mat(mat_path)
    H, W, B = cube.shape
    if B < 100:
        raise HTTPException(400, {"error": "band_count_too_low", "detail": f"Only {B} bands found"})
    np.save(tmp_path, cube)
    r = cube[:,:,int(B*0.6)]; g = cube[:,:,int(B*0.4)]; b = cube[:,:,int(B*0.2)]
    def norm(x): return ((x-x.min())/(x.max()-x.min()+1e-8)*255).astype(np.uint8)
    rgb = cv2.merge([norm(b), norm(g), norm(r)])
    return {
        "status": "ok", "file_hash": fhash,
        "shape": {"height": H, "width": W, "bands": B},
        "format": "AVIRIS", "rgb_preview": encode_img(rgb),
        "estimated_processing_seconds": round(H*W*B / 1e7, 1),
        "noisy_bands_detected": []
    }
