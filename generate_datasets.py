"""
SmartAgricultureAI - Dataset Generator
Populates realistic benchmark/sample agricultural datasets matching the exact directory structure:
├── plant_health/
│   ├── train/
│   ├── validation/
│   └── test/
├── intrusion_detection/
│   ├── images/
│   └── labels/
├── crop_damage/
│   ├── images/
│   └── masks/
└── flood_monitoring/
    └── sensor_records.csv
"""

import os
import random
import math
from datetime import datetime, timedelta
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SEED = 42
random.seed(SEED)
np.random.seed(SEED)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def create_leaf_image(condition: str, img_size=(224, 224)):
    """
    Generates a synthetic realistic leaf image for plant health classification.
    Conditions: 'healthy', 'leaf_blight', 'powdery_mildew', 'rust'
    """
    img = Image.new("RGB", img_size, color=(235, 230, 220))  # Neutral background
    draw = ImageDraw.Draw(img)

    w, h = img_size
    # Draw leaf contour (oval/pointed shape)
    leaf_color = (45 + random.randint(-5, 5), 140 + random.randint(-10, 10), 45 + random.randint(-5, 5))
    leaf_bbox = [int(w * 0.2), int(h * 0.1), int(w * 0.8), int(h * 0.9)]
    draw.ellipse(leaf_bbox, fill=leaf_color)

    # Leaf stem & main vein
    stem_color = (30, 100, 30)
    draw.line([(w // 2, int(h * 0.15)), (w // 2, int(h * 0.95))], fill=stem_color, width=3)
    # Side veins
    for y_pos in range(int(h * 0.25), int(h * 0.85), 25):
        draw.line([(w // 2, y_pos), (int(w * 0.3), y_pos - 15)], fill=stem_color, width=2)
        draw.line([(w // 2, y_pos), (int(w * 0.7), y_pos - 15)], fill=stem_color, width=2)

    # Add disease-specific visual signatures
    if condition == "leaf_blight":
        # Necrotic brown/yellow irregularly shaped patches with halos
        for _ in range(random.randint(4, 8)):
            cx = random.randint(int(w * 0.3), int(w * 0.7))
            cy = random.randint(int(h * 0.25), int(h * 0.75))
            r = random.randint(12, 28)
            # Yellow chlorotic halo
            draw.ellipse([cx - r - 4, cy - r - 4, cx + r + 4, cy + r + 4], fill=(185, 175, 45))
            # Necrotic brown center
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(95, 50, 20))
    elif condition == "powdery_mildew":
        # White / grayish powdery fungal dusting
        for _ in range(random.randint(6, 12)):
            cx = random.randint(int(w * 0.28), int(w * 0.72))
            cy = random.randint(int(h * 0.2), int(h * 0.8))
            r = random.randint(8, 20)
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(225, 230, 225))
    elif condition == "rust":
        # Small orange/reddish pustules scattered on the leaf surface
        for _ in range(random.randint(25, 45)):
            cx = random.randint(int(w * 0.25), int(w * 0.75))
            cy = random.randint(int(h * 0.18), int(h * 0.82))
            r = random.randint(2, 5)
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(195, 75, 15))

    # Add realistic texture noise
    np_img = np.array(img, dtype=np.float32)
    noise = np.random.normal(0, 5, np_img.shape)
    np_img = np.clip(np_img + noise, 0, 255).astype(np.uint8)
    return Image.fromarray(np_img)


def generate_plant_health_dataset():
    """Generates plant health train/validation/test sets."""
    print("-> Generating Plant Health Dataset...")
    splits = {
        "train": 60,       # 60 images per class for robust training
        "validation": 20,  # 20 images per class
        "test": 20         # 20 images per class
    }
    classes = ["healthy", "leaf_blight", "powdery_mildew", "rust"]

    for split, count in splits.items():
        for cls in classes:
            dir_path = os.path.join(BASE_DIR, "plant_health", split, cls)
            os.makedirs(dir_path, exist_ok=True)
            for i in range(count):
                img_path = os.path.join(dir_path, f"{cls}_{i:03d}.jpg")
                img = create_leaf_image(cls)
                img.save(img_path, quality=95)
    print("   [OK] Plant Health dataset created.")


def generate_intrusion_detection_dataset():
    """
    Generates agricultural field images with intruders and YOLO-format labels.
    Classes:
    0: person_intruder
    1: wild_boar
    2: deer
    3: cattle
    """
    print("-> Generating Intrusion Detection Dataset...")
    img_dir = os.path.join(BASE_DIR, "intrusion_detection", "images")
    lbl_dir = os.path.join(BASE_DIR, "intrusion_detection", "labels")
    os.makedirs(img_dir, exist_ok=True)
    os.makedirs(lbl_dir, exist_ok=True)

    class_names = ["person_intruder", "wild_boar", "deer", "cattle"]
    class_colors = {
        0: (50, 70, 150),   # blue/dark clothes
        1: (40, 35, 30),    # dark wild boar
        2: (160, 105, 50),  # brownish deer
        3: (180, 175, 160)  # spotted/light cattle
    }

    num_samples = 80
    img_w, img_h = 320, 320

    for idx in range(num_samples):
        # Generate farm landscape (sky, crop rows, ground)
        img = Image.new("RGB", (img_w, img_h), color=(140, 185, 230))  # Sky
        draw = ImageDraw.Draw(img)

        # Ground / field
        ground_top = int(img_h * 0.35)
        draw.rectangle([0, ground_top, img_w, img_h], fill=(85, 125, 45))

        # Crop rows (lines of perspective)
        for offset in range(-60, img_w + 60, 40):
            draw.line([(img_w // 2, ground_top), (offset, img_h)], fill=(60, 95, 35), width=3)

        # Place 1 to 3 intruders
        num_objects = random.randint(1, 3)
        labels = []

        for _ in range(num_objects):
            cls_id = random.randint(0, 3)
            # Bounding box coordinates
            bw = random.randint(30, 65)
            bh = random.randint(35, 75)
            bx1 = random.randint(10, img_w - bw - 10)
            by1 = random.randint(ground_top + 10, img_h - bh - 10)
            bx2 = bx1 + bw
            by2 = by1 + bh

            # Draw intruder body shape
            draw.rounded_rectangle([bx1, by1, bx2, by2], radius=6, fill=class_colors[cls_id])
            # Draw head / identifier
            head_r = bw // 4
            draw.ellipse([bx1 + bw//4, by1 - head_r//2, bx1 + 3*bw//4, by1 + head_r], fill=class_colors[cls_id])

            # YOLO format: class_id x_center y_center width height (normalized 0..1)
            x_center = (bx1 + bx2) / (2.0 * img_w)
            y_center = (by1 + by2) / (2.0 * img_h)
            norm_w = bw / float(img_w)
            norm_h = bh / float(img_h)
            labels.append(f"{cls_id} {x_center:.6f} {y_center:.6f} {norm_w:.6f} {norm_h:.6f}")

        # Add image noise for camera realism
        np_img = np.array(img, dtype=np.float32)
        noise = np.random.normal(0, 4, np_img.shape)
        np_img = np.clip(np_img + noise, 0, 255).astype(np.uint8)
        img = Image.fromarray(np_img)

        img_path = os.path.join(img_dir, f"frame_{idx:04d}.jpg")
        lbl_path = os.path.join(lbl_dir, f"frame_{idx:04d}.txt")
        img.save(img_path, quality=95)
        with open(lbl_path, "w") as f:
            f.write("\n".join(labels) + "\n")

    print("   [OK] Intrusion Detection dataset created.")


def generate_crop_damage_dataset():
    """
    Generates aerial / drone crop imagery with ground truth pixel segmentation masks.
    Semantic mask classes:
    0: Background / Soil
    1: Healthy Crop
    2: Pest / Disease Damage
    3: Hail / Mechanical Damage
    """
    print("-> Generating Crop Damage Segmentation Dataset...")
    img_dir = os.path.join(BASE_DIR, "crop_damage", "images")
    mask_dir = os.path.join(BASE_DIR, "crop_damage", "masks")
    os.makedirs(img_dir, exist_ok=True)
    os.makedirs(mask_dir, exist_ok=True)

    num_samples = 70
    w, h = 256, 256

    for idx in range(num_samples):
        # Base soil
        img = Image.new("RGB", (w, h), color=(105, 80, 50))  # Brown soil
        mask = Image.new("L", (w, h), color=0)  # Class 0: Background/soil

        draw_img = ImageDraw.Draw(img)
        draw_mask = ImageDraw.Draw(mask)

        # Draw crop canopy rows (Class 1: Healthy Crop)
        for y in range(15, h - 15, 30):
            draw_img.rectangle([10, y, w - 10, y + 20], fill=(45, 135, 45))
            draw_mask.rectangle([10, y, w - 10, y + 20], fill=1)

        # Insert Pest / Disease Damage patches (Class 2)
        for _ in range(random.randint(2, 4)):
            cx = random.randint(30, w - 30)
            cy = random.randint(30, h - 30)
            r = random.randint(12, 25)
            draw_img.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(160, 140, 30))  # Yellowish withered
            draw_mask.ellipse([cx - r, cy - r, cx + r, cy + r], fill=2)

        # Insert Hail / Lodging Mechanical Damage (Class 3)
        for _ in range(random.randint(1, 2)):
            cx = random.randint(30, w - 30)
            cy = random.randint(30, h - 30)
            rw = random.randint(20, 45)
            rh = random.randint(10, 20)
            draw_img.rectangle([cx - rw, cy - rh, cx + rw, cy + rh], fill=(110, 100, 75))  # Flattened / broken
            draw_mask.rectangle([cx - rw, cy - rh, cx + rw, cy + rh], fill=3)

        # Noise & texture
        np_img = np.array(img, dtype=np.float32)
        np_img += np.random.normal(0, 6, np_img.shape)
        np_img = np.clip(np_img, 0, 255).astype(np.uint8)

        img_path = os.path.join(img_dir, f"crop_aerial_{idx:03d}.jpg")
        mask_path = os.path.join(mask_dir, f"crop_aerial_{idx:03d}.png")
        Image.fromarray(np_img).save(img_path, quality=95)
        mask.save(mask_path)

    print("   [OK] Crop Damage Segmentation dataset created.")


def generate_flood_monitoring_dataset():
    """
    Generates rich time-series agricultural IoT sensor records in sensor_records.csv.
    """
    print("-> Generating Flood Monitoring Sensor Records...")
    flood_dir = os.path.join(BASE_DIR, "flood_monitoring")
    os.makedirs(flood_dir, exist_ok=True)
    csv_path = os.path.join(flood_dir, "sensor_records.csv")

    header = [
        "timestamp",
        "field_id",
        "soil_moisture_pct",
        "water_level_cm",
        "rainfall_mm_per_hr",
        "cumulative_rain_24h_mm",
        "temperature_c",
        "humidity_pct",
        "drainage_flow_rate_lps",
        "river_distance_m",
        "flood_risk_level"  # 0: Normal, 1: Warning, 2: Critical Flood
    ]

    rows = []
    base_time = datetime(2026, 4, 1, 0, 0, 0)
    num_hours = 24 * 30  # 30 days of hourly sensor data

    # State variables
    cumulative_rain = 0.0
    water_level = 5.0
    soil_moisture = 45.0

    for step in range(num_hours):
        current_time = base_time + timedelta(hours=step)
        field_id = f"FIELD_{random.randint(1, 4):02d}"

        # Weather cycle simulation: normal days vs heavy monsoon rain event
        is_monsoon_surge = (180 <= step <= 240) or (450 <= step <= 490)
        
        if is_monsoon_surge:
            rain = random.uniform(18.0, 55.0)
            temp = random.uniform(21.0, 26.0)
            humidity = random.uniform(85.0, 99.0)
            soil_moisture = min(100.0, soil_moisture + random.uniform(3.0, 8.0))
            water_level = min(48.0, water_level + random.uniform(2.5, 6.0))
            drainage_flow = random.uniform(25.0, 60.0)
        else:
            rain = random.uniform(0.0, 4.0) if random.random() < 0.25 else 0.0
            temp = 25.0 + 7.0 * math.sin(step * 2 * math.pi / 24) + random.uniform(-1.5, 1.5)
            humidity = 65.0 - 15.0 * math.sin(step * 2 * math.pi / 24) + random.uniform(-4.0, 4.0)
            soil_moisture = max(25.0, soil_moisture - random.uniform(0.3, 0.8) + (rain * 0.4))
            drain_amount = max(0.8, (water_level - 4.0) * 0.12)
            water_level = max(2.0, water_level - drain_amount + (rain * 0.5))
            drainage_flow = max(1.0, (water_level * 0.8) + random.uniform(-0.5, 1.5))

        cumulative_rain = max(0.0, cumulative_rain * 0.95 + rain)
        river_dist = 120.0  # meters from nearest drainage canal/river

        # Calculate ground truth flood risk level
        if water_level >= 35.0 or (soil_moisture > 92.0 and cumulative_rain > 80.0):
            risk = 2  # Critical Flood
        elif water_level >= 18.0 or (soil_moisture > 80.0 and cumulative_rain > 40.0):
            risk = 1  # Warning
        else:
            risk = 0  # Normal

        row = [
            current_time.strftime("%Y-%m-%d %H:%M:%S"),
            field_id,
            f"{soil_moisture:.2f}",
            f"{water_level:.2f}",
            f"{rain:.2f}",
            f"{cumulative_rain:.2f}",
            f"{temp:.2f}",
            f"{humidity:.2f}",
            f"{drainage_flow:.2f}",
            f"{river_dist:.1f}",
            str(risk)
        ]
        rows.append(",".join(row))

    with open(csv_path, "w") as f:
        f.write(",".join(header) + "\n")
        f.write("\n".join(rows) + "\n")

    print(f"   [OK] Flood Monitoring records saved to {csv_path} ({len(rows)} records).")


def main():
    print("==================================================")
    print("SmartAgricultureAI - Populating Project Datasets")
    print("==================================================")
    generate_plant_health_dataset()
    generate_intrusion_detection_dataset()
    generate_crop_damage_dataset()
    generate_flood_monitoring_dataset()
    print("==================================================")
    print("All datasets successfully generated!")
    print("==================================================")


if __name__ == "__main__":
    main()
