from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import numpy as np
from ml.pipeline import run_pipeline

router = APIRouter()
TMP_DIR = "/tmp/spectrashield"

class DetectRequest(BaseModel):
    file_hash: str
    unet_weight: float = 0.6
    rx_weight: float = 0.4
    spatial_window: int = 5
    pca_components: int = 30
    unet_epochs: int = 50

@router.post("/detect")
async def detect(req: DetectRequest):
    """Run full dual-engine ML pipeline on uploaded hyperspectral cube."""
    path = f"{TMP_DIR}/{req.file_hash}.npy"
    if not __import__('os').path.exists(path):
        raise HTTPException(404, {"error": "file_not_found", "detail": "Upload file first"})
    cube = np.load(path)
    result = run_pipeline(cube, req.unet_weight, req.rx_weight,
                          req.spatial_window, req.pca_components, req.unet_epochs)
    return {"status": "ok", **result}
