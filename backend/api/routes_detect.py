from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import numpy as np
from ml.pipeline import run_pipeline
from utils.cache import file_store

router = APIRouter()

class DetectRequest(BaseModel):
    file_hash: str
    unet_weight: float = 0.6
    rx_weight: float = 0.4
    spatial_window: int = 5
    pca_components: int = 30
    unet_epochs: int = 50

@router.post("/detect")
async def detect(req: DetectRequest):
    """Run full dual-engine ML pipeline on uploaded cube."""
    if req.file_hash not in file_store:
        raise HTTPException(404, {"error": "file_not_found", "detail": "Upload file first"})
    
    cube = file_store[req.file_hash]
    
    # Run the real ML pipeline
    result = run_pipeline(
        cube=cube,
        unet_weight=req.unet_weight,
        rx_weight=req.rx_weight,
        spatial_window=req.spatial_window,
        pca_components=req.pca_components,
        unet_epochs=req.unet_epochs
    )
    
    # Save to history
    import json
    import os
    from datetime import datetime
    history_entry = {
        "file_hash": req.file_hash,
        "timestamp": datetime.now().isoformat(),
        "shape": cube.shape,
        "total_anomalies": len(result.get("anomaly_regions", [])),
        "processing_time_ms": result.get("processing_time_ms", 0)
    }
    history = []
    if os.path.exists("history.json"):
        try:
            with open("history.json", "r") as f:
                history = json.load(f)
        except:
            pass
    history.append(history_entry)
    with open("history.json", "w") as f:
        json.dump(history, f)
    
    return {"status": "ok", **result}
