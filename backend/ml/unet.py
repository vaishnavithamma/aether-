import torch
import torch.nn as nn
from utils.config import *

class DoubleConv(nn.Module):
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.net = nn.Sequential(
            nn.Conv2d(in_ch, out_ch, 3, padding=1),
            nn.BatchNorm2d(out_ch), nn.ReLU(inplace=True),
            nn.Conv2d(out_ch, out_ch, 3, padding=1),
            nn.BatchNorm2d(out_ch), nn.ReLU(inplace=True)
        )
    def forward(self, x): return self.net(x)

class SpectralUNet(nn.Module):
    """U-Net for unsupervised hyperspectral reconstruction. Input/output: (B, 30, H, W)"""
    def __init__(self):
        super().__init__()
        self.enc1 = DoubleConv(PCA_COMPONENTS, UNET_ENC1_CHANNELS)
        self.pool1 = nn.MaxPool2d(2)
        self.enc2 = DoubleConv(UNET_ENC1_CHANNELS, UNET_ENC2_CHANNELS)
        self.pool2 = nn.MaxPool2d(2)
        self.bottleneck = DoubleConv(UNET_ENC2_CHANNELS, UNET_BOTTLENECK_CHANNELS)
        self.up1 = nn.ConvTranspose2d(UNET_BOTTLENECK_CHANNELS, UNET_ENC2_CHANNELS, 2, stride=2)
        self.dec1 = DoubleConv(UNET_ENC2_CHANNELS * 2, UNET_ENC2_CHANNELS)
        self.up2 = nn.ConvTranspose2d(UNET_ENC2_CHANNELS, UNET_ENC1_CHANNELS, 2, stride=2)
        self.dec2 = DoubleConv(UNET_ENC1_CHANNELS * 2, UNET_ENC1_CHANNELS)
        self.out_conv = nn.Conv2d(UNET_ENC1_CHANNELS, PCA_COMPONENTS, 1)

    def forward(self, x):
        e1 = self.enc1(x)
        e2 = self.enc2(self.pool1(e1))
        b  = self.bottleneck(self.pool2(e2))
        d1 = self.dec1(torch.cat([self.up1(b), e2], dim=1))
        d2 = self.dec2(torch.cat([self.up2(d1), e1], dim=1))
        return self.out_conv(d2)

def train_unet(pca_cube, device="cpu"):
    """Train SpectralUNet on full hyperspectral PCA cube using patch-based approach."""
    import numpy as np
    H, W, C = pca_cube.shape
    model = SpectralUNet().to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=UNET_LR)
    loss_fn = nn.MSELoss()
    patches = []
    for i in range(0, H - UNET_PATCH_SIZE + 1, UNET_PATCH_STRIDE):
        for j in range(0, W - UNET_PATCH_SIZE + 1, UNET_PATCH_STRIDE):
            patch = pca_cube[i:i+UNET_PATCH_SIZE, j:j+UNET_PATCH_SIZE, :]
            patches.append(torch.FloatTensor(patch.transpose(2,0,1)))
    patches = torch.stack(patches).to(device)
    for epoch in range(UNET_EPOCHS):
        model.train()
        optimizer.zero_grad()
        out = model(patches)
        loss = loss_fn(out, patches)
        loss.backward()
        optimizer.step()
    model.eval()
    with torch.no_grad():
        full = torch.FloatTensor(pca_cube.transpose(2,0,1)).unsqueeze(0).to(device)
        x_hat = model(full)
        unet_scores = torch.mean((full - x_hat)**2, dim=1).squeeze(0).cpu().numpy()
        unet_map = (unet_scores - unet_scores.min()) / (unet_scores.max() - unet_scores.min() + 1e-8)
        x_hat_flat = x_hat.squeeze(0).permute(1,2,0).reshape(H*W, C).cpu().numpy()
    return unet_map, x_hat_flat, float(loss.item())
