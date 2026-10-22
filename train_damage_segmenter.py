"""
Yukti AI - Crop Damage Semantic Segmenter Trainer
Trains a PyTorch U-Net Model for Pixel-Level Crop Damage & Health Segmentation.
Inputs: crop_damage/images, crop_damage/masks
Outputs: models/damage_segmenter.pt
"""

import os
import argparse
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from torch.utils.data import DataLoader, random_split

from datasets.dataset import CropDamageDataset

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_SAVE_PATH = os.path.join(BASE_DIR, "models", "damage_segmenter.pt")


class DoubleConv(nn.Module):
    """(Conv2D -> BatchNorm -> ReLU) * 2"""
    def __init__(self, in_channels, out_channels):
        super().__init__()
        self.net = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True)
        )

    def forward(self, x):
        return self.net(x)


class UNet(nn.Module):
    """
    Classic U-Net Architecture with Skip Connections for Semantic Segmentation:
    Contracting (Encoder) -> Bottleneck -> Expanding (Decoder) -> 1x1 Conv
    """
    def __init__(self, in_channels=3, num_classes=4):
        super().__init__()
        self.num_classes = num_classes

        # Encoder
        self.inc = DoubleConv(in_channels, 32)
        self.down1 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(32, 64))
        self.down2 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(64, 128))
        self.down3 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(128, 256))

        # Bottleneck
        self.down4 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(256, 512))

        # Decoder with Skip Connections
        self.up1 = nn.ConvTranspose2d(512, 256, kernel_size=2, stride=2)
        self.conv_up1 = DoubleConv(512, 256)

        self.up2 = nn.ConvTranspose2d(256, 128, kernel_size=2, stride=2)
        self.conv_up2 = DoubleConv(256, 128)

        self.up3 = nn.ConvTranspose2d(128, 64, kernel_size=2, stride=2)
        self.conv_up3 = DoubleConv(128, 64)

        self.up4 = nn.ConvTranspose2d(64, 32, kernel_size=2, stride=2)
        self.conv_up4 = DoubleConv(64, 32)

        # Final Classifier
        self.outc = nn.Conv2d(32, num_classes, kernel_size=1)

    def forward(self, x):
        x1 = self.inc(x)
        x2 = self.down1(x1)
        x3 = self.down2(x2)
        x4 = self.down3(x3)
        x5 = self.down4(x4)

        x = self.up1(x5)
        x = torch.cat([x, x4], dim=1)
        x = self.conv_up1(x)

        x = self.up2(x)
        x = torch.cat([x, x3], dim=1)
        x = self.conv_up2(x)

        x = self.up3(x)
        x = torch.cat([x, x2], dim=1)
        x = self.conv_up3(x)

        x = self.up4(x)
        x = torch.cat([x, x1], dim=1)
        x = self.conv_up4(x)

        logits = self.outc(x)
        return logits


class DiceLoss(nn.Module):
    """Multi-class Dice Loss for segmentation masks"""
    def __init__(self, smooth=1.0):
        super().__init__()
        self.smooth = smooth

    def forward(self, logits, targets):
        num_classes = logits.shape[1]
        probs = F.softmax(logits, dim=1)
        # One-hot encode targets: (B, H, W) -> (B, C, H, W)
        targets_one_hot = F.one_hot(targets, num_classes=num_classes).permute(0, 3, 1, 2).float()

        dice_per_class = []
        for c in range(num_classes):
            p = probs[:, c, ...].contiguous().view(-1)
            t = targets_one_hot[:, c, ...].contiguous().view(-1)
            intersection = (p * t).sum()
            dice = (2.0 * intersection + self.smooth) / (p.sum() + t.sum() + self.smooth)
            dice_per_class.append(dice)

        return 1.0 - torch.stack(dice_per_class).mean()


def compute_miou(preds, targets, num_classes=4):
    """Computes mean Intersection-over-Union (mIoU) across classes."""
    ious = []
    preds = preds.view(-1)
    targets = targets.view(-1)

    for cls in range(num_classes):
        pred_inds = preds == cls
        target_inds = targets == cls
        intersection = (pred_inds & target_inds).sum().item()
        union = (pred_inds | target_inds).sum().item()
        if union == 0:
            ious.append(1.0)  # Avoid NaN if class not present
        else:
            ious.append(intersection / float(union))
    return np.mean(ious), ious


def train_damage_segmenter(epochs=12, batch_size=8, lr=1e-3):
    print("==================================================")
    print("Training Crop Damage U-Net Segmenter (PyTorch)")
    print("==================================================")
    os.makedirs(os.path.join(BASE_DIR, "models"), exist_ok=True)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"-> Training device: {device}")

    # Dataset & splits
    dataset = CropDamageDataset(img_size=(256, 256))
    val_size = max(10, int(len(dataset) * 0.2))
    train_size = len(dataset) - val_size
    train_ds, val_ds = random_split(
        dataset,
        [train_size, val_size],
        generator=torch.Generator().manual_seed(42)
    )

    print(f"-> Segmentation Dataset: {len(train_ds)} train, {len(val_ds)} val samples.")
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False)

    # Model & loss
    model = UNet(in_channels=3, num_classes=4).to(device)
    ce_loss_fn = nn.CrossEntropyLoss()
    dice_loss_fn = DiceLoss()

    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    best_val_miou = 0.0

    print("\n-> Commencing U-Net Training...")
    for epoch in range(1, epochs + 1):
        model.train()
        train_loss = 0.0

        for images, masks in train_loader:
            images = images.to(device)
            masks = masks.to(device)

            optimizer.zero_grad()
            logits = model(images)

            loss_ce = ce_loss_fn(logits, masks)
            loss_dice = dice_loss_fn(logits, masks)
            loss = loss_ce + 0.8 * loss_dice

            loss.backward()
            optimizer.step()
            train_loss += loss.item()

        train_loss /= len(train_loader)
        scheduler.step()

        # Validation
        model.eval()
        val_loss = 0.0
        all_preds = []
        all_targets = []

        with torch.no_grad():
            for images, masks in val_loader:
                images = images.to(device)
                masks = masks.to(device)

                logits = model(images)
                loss_ce = ce_loss_fn(logits, masks)
                loss_dice = dice_loss_fn(logits, masks)
                loss = loss_ce + 0.8 * loss_dice
                val_loss += loss.item()

                preds = torch.argmax(logits, dim=1)
                all_preds.append(preds.cpu())
                all_targets.append(masks.cpu())

        val_loss /= len(val_loader)
        all_preds = torch.cat(all_preds, dim=0)
        all_targets = torch.cat(all_targets, dim=0)
        val_miou, class_ious = compute_miou(all_preds, all_targets, num_classes=4)

        print(f"Epoch [{epoch:02d}/{epochs:02d}] Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f} | Val mIoU: {val_miou * 100:.2f}%")

        if val_miou > best_val_miou or epoch == epochs:
            best_val_miou = val_miou
            checkpoint = {
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "classes": CropDamageDataset.CLASSES,
                "val_miou": best_val_miou
            }
            torch.save(checkpoint, MODEL_SAVE_PATH)
            print(f"   [*] Saved best model checkpoint to {MODEL_SAVE_PATH} (mIoU: {best_val_miou*100:.2f}%)")

    print("\n-> Training complete!")
    print(f"-> Final trained segmentation model saved at: {MODEL_SAVE_PATH}")
    print("==================================================")
    return model


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Crop Damage U-Net Segmenter")
    parser.add_argument("--epochs", type=int, default=10, help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=8, help="Batch size")
    parser.add_argument("--lr", type=float, default=1e-3, help="Learning rate")
    args = parser.parse_args()

    train_damage_segmenter(epochs=args.epochs, batch_size=args.batch_size, lr=args.lr)
