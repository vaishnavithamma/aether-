from fastapi import APIRouter
import torch, time
router = APIRouter()
START = time.time()

@router.get("/health")
def health():
    return {
        "status": "operational",
        "gpu_available": torch.cuda.is_available(),
        "pytorch_version": torch.__version__,
        "uptime_seconds": int(time.time() - START)
    }
