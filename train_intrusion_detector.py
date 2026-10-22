"""
Yukti AI - Intrusion Detector Trainer
Trains a Deep PyTorch Object Detection Model for Agricultural Perimeter & Intruder Monitoring.
Inputs: intrusion_detection/images, intrusion_detection/labels
Outputs: models/intrusion_detector.pt
"""

import os
import argparse
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, random_split

from datasets.dataset import IntrusionDataset, intrusion_collate_fn

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_SAVE_PATH = os.path.join(BASE_DIR, "models", "intrusion_detector.pt")


class ConvBlock(nn.Module):
    def __init__(self, in_c, out_c, kernel_size=3, stride=1, padding=1):
        super().__init__()
        self.conv = nn.Conv2d(in_c, out_c, kernel_size, stride, padding, bias=False)
        self.bn = nn.BatchNorm2d(out_c)
        self.relu = nn.LeakyReLU(0.1, inplace=True)

    def forward(self, x):
        return self.relu(self.bn(self.conv(x)))


class IntrusionDetector(nn.Module):
    """
    Grid-based Object Detector for Farm Surveillance:
    Transforms input (B, 3, H, W) -> feature map (B, S, S, 5 + C)
    where each grid cell predicts:
    [obj_conf, x_offset, y_offset, norm_w, norm_h, class_0..C-1]
    """
    def __init__(self, num_classes=4, grid_size=8):
        super().__init__()
        self.num_classes = num_classes
        self.grid_size = grid_size
        self.out_channels_per_cell = 5 + num_classes  # conf(1) + box(4) + classes(C)

        # Deep Feature Extraction Backbone
        self.backbone = nn.Sequential(
            ConvBlock(3, 32, stride=2),    # -> 128x128
            ConvBlock(32, 64, stride=2),   # -> 64x64
            ConvBlock(64, 64),
            ConvBlock(64, 128, stride=2),  # -> 32x32
            ConvBlock(128, 128),
            ConvBlock(128, 256, stride=2), # -> 16x16
            ConvBlock(256, 256),
            ConvBlock(256, 512, stride=2), # -> 8x8 (grid size)
            ConvBlock(512, 512),
        )

        # Detection Head
        self.head = nn.Sequential(
            ConvBlock(512, 256),
            nn.Dropout(0.3),
            nn.Conv2d(256, self.out_channels_per_cell, kernel_size=1)
        )

    def forward(self, x):
        features = self.backbone(x)
        out = self.head(features)  # (B, out_channels, S, S)
        # Permute to (B, S, S, out_channels)
        out = out.permute(0, 2, 3, 1).contiguous()
        return out


def build_grid_targets(targets, grid_size=8, num_classes=4, device="cpu"):
    """
    Converts variable list of ground truth bounding boxes [x1, y1, x2, y2]
    into an (B, S, S, 5 + num_classes) target tensor.
    """
    batch_size = len(targets)
    gt_tensor = torch.zeros((batch_size, grid_size, grid_size, 5 + num_classes), device=device)

    for b_idx, target in enumerate(targets):
        boxes = target["boxes"]
        labels = target["labels"]
        for box, label in zip(boxes, labels):
            x1, y1, x2, y2 = box.tolist()
            xc = (x1 + x2) / 2.0
            yc = (y1 + y2) / 2.0
            w = max(1e-4, x2 - x1)
            h = max(1e-4, y2 - y1)

            # Determine grid cell
            gx = min(grid_size - 1, int(xc * grid_size))
            gy = min(grid_size - 1, int(yc * grid_size))

            # Cell-relative offsets
            x_offset = xc * grid_size - gx
            y_offset = yc * grid_size - gy

            # Set objectness
            gt_tensor[b_idx, gy, gx, 0] = 1.0
            # Set coordinates
            gt_tensor[b_idx, gy, gx, 1] = x_offset
            gt_tensor[b_idx, gy, gx, 2] = y_offset
            gt_tensor[b_idx, gy, gx, 3] = w
            gt_tensor[b_idx, gy, gx, 4] = h
            # One-hot class label
            if 0 <= label < num_classes:
                gt_tensor[b_idx, gy, gx, 5 + label] = 1.0

    return gt_tensor


def compute_detector_loss(predictions, gt_targets):
    """
    Computes multi-task object detection loss:
    - Objectness confidence BCE loss
    - Coordinate regression Smooth L1 loss
    - Classification Cross Entropy loss
    """
    pred_conf = predictions[..., 0]
    gt_conf = gt_targets[..., 0]

    obj_mask = gt_conf == 1.0
    noobj_mask = gt_conf == 0.0

    bce_loss = nn.BCEWithLogitsLoss()
    smooth_l1 = nn.SmoothL1Loss(reduction="mean")

    # Objectness loss (down-weighting empty background cells)
    loss_obj = bce_loss(pred_conf[obj_mask], gt_conf[obj_mask]) if obj_mask.sum() > 0 else torch.tensor(0.0)
    loss_noobj = bce_loss(pred_conf[noobj_mask], gt_conf[noobj_mask])
    loss_conf = 3.0 * loss_obj + 0.5 * loss_noobj

    # Bounding box regression loss
    if obj_mask.sum() > 0:
        pred_boxes = predictions[..., 1:5][obj_mask]
        gt_boxes = gt_targets[..., 1:5][obj_mask]
        loss_box = 2.0 * smooth_l1(pred_boxes, gt_boxes)

        # Classification loss
        pred_cls = predictions[..., 5:][obj_mask]
        gt_cls = gt_targets[..., 5:][obj_mask]
        loss_cls = bce_loss(pred_cls, gt_cls)
    else:
        loss_box = torch.tensor(0.0)
        loss_cls = torch.tensor(0.0)

    total_loss = loss_conf + loss_box + loss_cls
    return total_loss, loss_conf.item(), loss_box.item(), loss_cls.item()


def train_intrusion_detector(epochs=12, batch_size=8, lr=1e-3):
    print("==================================================")
    print("Training Farm Intrusion Detection Model (PyTorch)")
    print("==================================================")
    os.makedirs(os.path.join(BASE_DIR, "models"), exist_ok=True)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"-> Training device: {device}")

    # Dataset & DataLoader
    full_dataset = IntrusionDataset(img_size=(256, 256))
    val_size = max(10, int(len(full_dataset) * 0.2))
    train_size = len(full_dataset) - val_size
    train_ds, val_ds = random_split(
        full_dataset,
        [train_size, val_size],
        generator=torch.Generator().manual_seed(42)
    )

    print(f"-> Intrusion Dataset: {len(train_ds)} train samples, {len(val_ds)} val samples.")
    train_loader = DataLoader(
        train_ds,
        batch_size=batch_size,
        shuffle=True,
        collate_fn=intrusion_collate_fn
    )
    val_loader = DataLoader(
        val_ds,
        batch_size=batch_size,
        shuffle=False,
        collate_fn=intrusion_collate_fn
    )

    # Initialize model
    model = IntrusionDetector(num_classes=4, grid_size=8).to(device)
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    best_val_loss = float("inf")

    print("\n-> Commencing PyTorch Training Loop...")
    for epoch in range(1, epochs + 1):
        model.train()
        train_loss = 0.0

        for images, targets in train_loader:
            images = images.to(device)
            gt_tensor = build_grid_targets(targets, grid_size=8, num_classes=4, device=device)

            optimizer.zero_grad()
            preds = model(images)
            loss, l_conf, l_box, l_cls = compute_detector_loss(preds, gt_tensor)
            loss.backward()
            optimizer.step()

            train_loss += loss.item()

        train_loss /= len(train_loader)
        scheduler.step()

        # Validation
        model.eval()
        val_loss = 0.0
        with torch.no_grad():
            for images, targets in val_loader:
                images = images.to(device)
                gt_tensor = build_grid_targets(targets, grid_size=8, num_classes=4, device=device)
                preds = model(images)
                loss, _, _, _ = compute_detector_loss(preds, gt_tensor)
                val_loss += loss.item()

        val_loss /= len(val_loader)
        print(f"Epoch [{epoch:02d}/{epochs:02d}] Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f}")

        if val_loss < best_val_loss:
            best_val_loss = val_loss
            # Save checkpoint state and architecture metadata
            checkpoint = {
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "classes": IntrusionDataset.CLASSES,
                "grid_size": 8,
                "val_loss": best_val_loss
            }
            torch.save(checkpoint, MODEL_SAVE_PATH)
            print(f"   [*] Saved best model checkpoint to {MODEL_SAVE_PATH} (Val Loss: {best_val_loss:.4f})")

    print("\n-> Training complete!")
    print(f"-> Final trained model saved at: {MODEL_SAVE_PATH}")
    print("==================================================")
    return model


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Intrusion Detector Model")
    parser.add_argument("--epochs", type=int, default=12, help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=8, help="Batch size")
    parser.add_argument("--lr", type=float, default=1e-3, help="Learning rate")
    args = parser.parse_args()

    train_intrusion_detector(epochs=args.epochs, batch_size=args.batch_size, lr=args.lr)
