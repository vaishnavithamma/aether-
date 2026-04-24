import numpy as np
import cv2
import base64

def generate_band_thumbnails(img: np.ndarray) -> list:
    h, w = img.shape[:2]
    thumb_size = (80, 80)
    bands = []
    b, g, r = cv2.split(img)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    band_data = [
        ("001", "405nm",  r.astype(np.float32)),                          # Violet
        ("010", "450nm",  b.astype(np.float32)),                          # Blue
        ("020", "520nm",  g.astype(np.float32)),                          # Green
        ("030", "580nm",  (r*0.7 + g*0.3).astype(np.float32)),            # Yellow
        ("047", "635nm",  r.astype(np.float32)),                          # Red
        ("060", "700nm",  (r*0.6 + g*0.2 + b*0.2).astype(np.float32)),   # Red-edge
        ("080", "850nm",  (g*0.5 + r*0.5).astype(np.float32)),            # NIR sim
        ("100", "1050nm", gray.astype(np.float32)),                       # SWIR sim
    ]
    for band_id, wavelength, data in band_data:
        lo, hi = data.min(), data.max()
        norm = ((data - lo) / (hi - lo + 1e-9) * 255).astype(np.uint8)
        thumb = cv2.resize(norm, thumb_size)
        _, buf = cv2.imencode('.jpg', thumb, [cv2.IMWRITE_JPEG_QUALITY, 85])
        b64 = base64.b64encode(buf.tobytes()).decode('utf-8')
        bands.append(b64)
    return bands

img = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)
bands = generate_band_thumbnails(img)
for i, b64 in enumerate(bands):
    print(f"Band {i} len:", len(b64))
    # decode and check mean
    decoded = base64.b64decode(b64)
    arr = np.frombuffer(decoded, np.uint8)
    dec_img = cv2.imdecode(arr, cv2.IMREAD_GRAYSCALE)
    print(f"Band {i} mean:", dec_img.mean())
