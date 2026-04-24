from fastapi import APIRouter
import json
import os

router = APIRouter()
HISTORY_FILE = "history.json"

@router.get("/history")
async def get_history():
    """Get the list of recently processed scans."""
    if not os.path.exists(HISTORY_FILE):
        return {"history": []}
    try:
        with open(HISTORY_FILE, "r") as f:
            history = json.load(f)
            # Sort by most recent first
            return {"history": sorted(history, key=lambda x: x.get("timestamp", ""), reverse=True)}
    except Exception:
        return {"history": []}
