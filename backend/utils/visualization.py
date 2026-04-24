import numpy as np
import cv2
import base64
from utils.config import RGB_BAND_RATIOS

def encode_img(img_bgr: np.ndarray) -> str:
    """Encode BGR image to base64 JPEG string."""
    _, buf = cv2.imencode('.jpg', img_bgr)
    return base64.b64encode(buf).decode()

def build_outputs(cube, final_map, binary_mask, H, W, B):
    """Build all 4 output images: RGB, heatmap, overlay, mask."""
    r = cube[:,:,int(B*RGB_BAND_RATIOS[0])]
    g = cube[:,:,int(B*RGB_BAND_RATIOS[1])]
    b = cube[:,:,int(B*RGB_BAND_RATIOS[2])]
    def norm(x): return ((x - x.min())/(x.max()-x.min()+1e-8)*255).astype(np.uint8)
    rgb = cv2.merge([norm(b), norm(g), norm(r)])

    # Custom warm colormap: black->amber->orange->red->white
    lut = np.zeros((256, 1, 3), dtype=np.uint8)
    for i in range(256):
        v = i / 255.0
        if v < 0.4:
            t = v / 0.4
            lut[i,0] = [int(71*t), int(179*t), int(255*t)]
        elif v < 0.7:
            t = (v-0.4)/0.3
            lut[i,0] = [int(71+(-18)*t), int(179+(-72)*t), int(255+0*t)]
        elif v < 0.9:
            t = (v-0.7)/0.2
            lut[i,0] = [int(53+(-8)*t), int(107+(-62)*t), int(255+0*t)]
        else:
            t = (v-0.9)/0.1
            lut[i,0] = [int(45+210*t), int(45+210*t), int(255+0*t)]

    fm_uint8 = (final_map * 255).astype(np.uint8)
    heatmap_colored = cv2.LUT(cv2.merge([fm_uint8,fm_uint8,fm_uint8]), lut)
    overlay = cv2.addWeighted(rgb, 0.3, heatmap_colored, 0.7, 0)

    mask_rgb = np.zeros((H, W, 3), dtype=np.uint8)
    mask_rgb[binary_mask == 1] = 255
    contours, _ = cv2.findContours(binary_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cv2.drawContours(mask_rgb, contours, -1, (0, 229, 255), 1)

    return {
        "rgb_image": encode_img(rgb),
        "heatmap_raw": encode_img(heatmap_colored),
        "heatmap_overlay": encode_img(overlay),
        "anomaly_mask": encode_img(mask_rgb)
    }
