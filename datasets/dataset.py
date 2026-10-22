"""
SmartAgricultureAI - Unified Dataset Modules
Provides data loaders and preprocessing pipelines for:
1. Plant Health Classification (Keras / TensorFlow)
2. Intrusion Detection (PyTorch Object Detection)
3. Crop Damage Segmentation (PyTorch Semantic Segmentation)
4. Flood Monitoring (Pandas / Scikit-Learn Tabular & Time-series)
"""

import os
import glob
import numpy as np
import pandas as pd
from PIL import Image

import torch
from torch.utils.data import Dataset, DataLoader
import torchvision.transforms as T

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# =====================================================================
# 1. PLANT HEALTH DATASET (Keras / TensorFlow)
# =====================================================================
def get_plant_health_datasets(base_path=None, img_size=(224, 224), batch_size=16):
    """
    Loads Plant Health train, validation, and test datasets using Keras.
    Returns: (train_ds, val_ds, test_ds, class_names)
    """
    import keras

    if base_path is None:
        base_path = os.path.join(BASE_DIR, "plant_health")

    train_dir = os.path.join(base_path, "train")
    val_dir = os.path.join(base_path, "validation")
    test_dir = os.path.join(base_path, "test")

    train_ds = keras.utils.image_dataset_from_directory(
        train_dir,
        image_size=img_size,
        batch_size=batch_size,
        label_mode="categorical",
        shuffle=True,
        seed=42
    )

    class_names = train_ds.class_names

    val_ds = keras.utils.image_dataset_from_directory(
        val_dir,
        image_size=img_size,
        batch_size=batch_size,
        label_mode="categorical",
        shuffle=False
    )

    test_ds = keras.utils.image_dataset_from_directory(
        test_dir,
        image_size=img_size,
        batch_size=batch_size,
        label_mode="categorical",
        shuffle=False
    )

    # Performance optimization: caching and prefetching
    AUTOTUNE = -1  # tf.data.AUTOTUNE / keras native autotune
    try:
        import tensorflow as tf
        AUTOTUNE = tf.data.AUTOTUNE
    except ImportError:
        pass

    if AUTOTUNE != -1:
        train_ds = train_ds.prefetch(buffer_size=AUTOTUNE)
        val_ds = val_ds.prefetch(buffer_size=AUTOTUNE)
        test_ds = test_ds.prefetch(buffer_size=AUTOTUNE)

    return train_ds, val_ds, test_ds, class_names


# =====================================================================
# 2. INTRUSION DETECTION DATASET (PyTorch)
# =====================================================================
class IntrusionDataset(Dataset):
    """
    PyTorch Dataset for Farm Intrusion Detection.
    Parses images and YOLO-format text labels:
    class_id x_center y_center width height (normalized)
    """
    CLASSES = ["person_intruder", "wild_boar", "deer", "cattle"]

    def __init__(self, data_dir=None, img_size=(256, 256), transform=None):
        if data_dir is None:
            data_dir = os.path.join(BASE_DIR, "intrusion_detection")

        self.img_dir = os.path.join(data_dir, "images")
        self.lbl_dir = os.path.join(data_dir, "labels")
        self.img_size = img_size
        self.transform = transform or T.Compose([
            T.Resize(img_size),
            T.ToTensor(),
            T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

        # Match existing image files
        self.image_files = sorted(glob.glob(os.path.join(self.img_dir, "*.jpg")) +
                                  glob.glob(os.path.join(self.img_dir, "*.png")))

    def __len__(self):
        return len(self.image_files)

    def __getitem__(self, idx):
        img_path = self.image_files[idx]
        base_name = os.path.splitext(os.path.basename(img_path))[0]
        lbl_path = os.path.join(self.lbl_dir, f"{base_name}.txt")

        # Load image
        img = Image.open(img_path).convert("RGB")
        orig_w, orig_h = img.size
        img_tensor = self.transform(img)

        # Parse annotations
        boxes = []
        labels = []

        if os.path.exists(lbl_path):
            with open(lbl_path, "r") as f:
                for line in f:
                    parts = line.strip().split()
                    if len(parts) >= 5:
                        cls_id = int(parts[0])
                        xc = float(parts[1])
                        yc = float(parts[2])
                        w = float(parts[3])
                        h = float(parts[4])
                        # Convert normalized xc, yc, w, h to [x1, y1, x2, y2] in [0, 1]
                        x1 = max(0.0, xc - w / 2.0)
                        y1 = max(0.0, yc - h / 2.0)
                        x2 = min(1.0, xc + w / 2.0)
                        y2 = min(1.0, yc + h / 2.0)

                        boxes.append([x1, y1, x2, y2])
                        labels.append(cls_id)

        if len(boxes) == 0:
            boxes = torch.zeros((0, 4), dtype=torch.float32)
            labels = torch.zeros((0,), dtype=torch.int64)
        else:
            boxes = torch.tensor(boxes, dtype=torch.float32)
            labels = torch.tensor(labels, dtype=torch.int64)

        target = {
            "boxes": boxes,
            "labels": labels,
            "image_id": torch.tensor([idx]),
            "orig_size": torch.tensor([orig_h, orig_w])
        }

        return img_tensor, target


def intrusion_collate_fn(batch):
    """Custom collate function for object detection with variable number of boxes."""
    images = torch.stack([item[0] for item in batch], dim=0)
    targets = [item[1] for item in batch]
    return images, targets


# =====================================================================
# 3. CROP DAMAGE SEGMENTATION DATASET (PyTorch)
# =====================================================================
class CropDamageDataset(Dataset):
    """
    PyTorch Dataset for Crop Damage Semantic Segmentation.
    Mask Classes:
    0: Background / Soil
    1: Healthy Crop
    2: Pest / Disease Damage
    3: Hail / Mechanical Damage
    """
    CLASSES = ["soil_background", "healthy_crop", "pest_damage", "mechanical_damage"]

    def __init__(self, data_dir=None, img_size=(256, 256)):
        if data_dir is None:
            data_dir = os.path.join(BASE_DIR, "crop_damage")

        self.img_dir = os.path.join(data_dir, "images")
        self.mask_dir = os.path.join(data_dir, "masks")
        self.img_size = img_size

        self.img_files = sorted(glob.glob(os.path.join(self.img_dir, "*.jpg")) +
                                glob.glob(os.path.join(self.img_dir, "*.png")))

        self.img_transform = T.Compose([
            T.Resize(img_size),
            T.ToTensor(),
            T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

    def __len__(self):
        return len(self.img_files)

    def __getitem__(self, idx):
        img_path = self.img_files[idx]
        base_name = os.path.splitext(os.path.basename(img_path))[0]
        mask_path = os.path.join(self.mask_dir, f"{base_name}.png")

        # Load RGB image
        img = Image.open(img_path).convert("RGB")
        img_tensor = self.img_transform(img)

        # Load mask
        if os.path.exists(mask_path):
            mask = Image.open(mask_path).convert("L")
            mask = mask.resize(self.img_size, resample=Image.NEAREST)
            mask_np = np.array(mask, dtype=np.int64)
            # Clip classes to valid range [0, 3]
            mask_np = np.clip(mask_np, 0, 3)
            mask_tensor = torch.from_numpy(mask_np)
        else:
            mask_tensor = torch.zeros(self.img_size, dtype=torch.int64)

        return img_tensor, mask_tensor


# =====================================================================
# 4. FLOOD MONITORING DATASET (Pandas / Scikit-Learn)
# =====================================================================
def load_flood_sensor_dataframe(csv_path=None):
    """
    Loads flood monitoring sensor records and engineers temporal/moving-window features.
    Returns: X (features DataFrame), y (ground truth risk level Series), df (full DataFrame)
    """
    if csv_path is None:
        csv_path = os.path.join(BASE_DIR, "flood_monitoring", "sensor_records.csv")

    df = pd.read_csv(csv_path)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values(by="timestamp").reset_index(drop=True)

    # Feature engineering for time-series sensor data
    df["hour"] = df["timestamp"].dt.hour
    df["dayofweek"] = df["timestamp"].dt.dayofweek

    # Rate of change & rolling statistics
    df["moisture_diff_1h"] = df["soil_moisture_pct"].diff().fillna(0.0)
    df["water_level_diff_1h"] = df["water_level_cm"].diff().fillna(0.0)
    df["rolling_mean_water_6h"] = df["water_level_cm"].rolling(window=6, min_periods=1).mean()
    df["rolling_max_rain_6h"] = df["rainfall_mm_per_hr"].rolling(window=6, min_periods=1).max()

    feature_cols = [
        "soil_moisture_pct",
        "water_level_cm",
        "rainfall_mm_per_hr",
        "cumulative_rain_24h_mm",
        "temperature_c",
        "humidity_pct",
        "drainage_flow_rate_lps",
        "river_distance_m",
        "hour",
        "dayofweek",
        "moisture_diff_1h",
        "water_level_diff_1h",
        "rolling_mean_water_6h",
        "rolling_max_rain_6h"
    ]

    X = df[feature_cols].copy()
    y = df["flood_risk_level"].astype(int).copy()

    return X, y, df
