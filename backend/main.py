from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes_upload import router as upload_router
from api.routes_detect import router as detect_router
from api.routes_health import router as health_router

app = FastAPI(title="SPECTRASHIELD API", version="2.1")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
app.include_router(upload_router)
app.include_router(detect_router)
app.include_router(health_router)
