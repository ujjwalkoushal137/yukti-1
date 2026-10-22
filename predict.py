"""
Yukti AI - Unified Inference & Prediction Engine
Runs real-time inference on images or sensor inputs using the trained models:
- Plant Health: models/plant_health_model.keras
- Intrusion Detection: models/intrusion_detector.pt
- Crop Damage Segmentation: models/damage_segmenter.pt
- Flood Early Warning: models/flood_monitor_model.joblib
"""

import os
import argparse
import numpy as np
import pandas as pd
from PIL import Image

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")


def predict_plant_health(image_path):
    """Classifies plant leaf condition using Keras model."""
    import keras

    model_path = os.path.join(MODELS_DIR, "plant_health_model.keras")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found at {model_path}. Run training first.")

    print(f"-> Loading Plant Health model from: {model_path}")
    model = keras.models.load_model(model_path)

    # Preprocess image
    img = Image.open(image_path).convert("RGB").resize((224, 224))
    img_array = np.array(img, dtype=np.float32)
    img_batch = np.expand_dims(img_array, axis=0)

    classes = ["healthy", "leaf_blight", "powdery_mildew", "rust"]
    preds = model.predict(img_batch, verbose=0)[0]
    best_idx = np.argmax(preds)

    print(f"\n[Plant Health Prediction]")
    print(f"Image: {image_path}")
    print(f"Diagnosed Condition: {classes[best_idx].upper()} (Confidence: {preds[best_idx] * 100:.2f}%)")
    print("Class Probabilities:")
    for cls, prob in zip(classes, preds):
        print(f"  - {cls:16s}: {prob * 100:.2f}%")
    return classes[best_idx], preds


def predict_intrusion(image_path, conf_thresh=0.45):
    """Detects intruders and bounding boxes using PyTorch model."""
    import torch
    import torchvision.transforms as T
    from train_intrusion_detector import IntrusionDetector

    model_path = os.path.join(MODELS_DIR, "intrusion_detector.pt")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found at {model_path}. Run training first.")

    checkpoint = torch.load(model_path, map_location="cpu", weights_only=False)
    model = IntrusionDetector(num_classes=4, grid_size=checkpoint.get("grid_size", 8))
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    img = Image.open(image_path).convert("RGB")
    orig_w, orig_h = img.size

    transform = T.Compose([
        T.Resize((256, 256)),
        T.ToTensor(),
        T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    tensor = transform(img).unsqueeze(0)

    with torch.no_grad():
        out = model(tensor)[0]  # (S, S, 5 + C)
        grid_size = out.shape[0]

        confidences = torch.sigmoid(out[..., 0])
        coords = out[..., 1:5]
        class_probs = torch.softmax(out[..., 5:], dim=-1)

    classes = checkpoint.get("classes", ["person_intruder", "wild_boar", "deer", "cattle"])
    detections = []

    for gy in range(grid_size):
        for gx in range(grid_size):
            conf = confidences[gy, gx].item()
            if conf >= conf_thresh:
                x_off, y_off, w, h = coords[gy, gx].tolist()
                xc = (gx + x_off) / grid_size
                yc = (gy + y_off) / grid_size
                cls_idx = torch.argmax(class_probs[gy, gx]).item()
                cls_prob = class_probs[gy, gx, cls_idx].item()

                x1 = int(max(0, (xc - w/2) * orig_w))
                y1 = int(max(0, (yc - h/2) * orig_h))
                x2 = int(min(orig_w, (xc + w/2) * orig_w))
                y2 = int(min(orig_h, (yc + h/2) * orig_h))

                detections.append({
                    "class": classes[cls_idx],
                    "confidence": conf * cls_prob,
                    "box": [x1, y1, x2, y2]
                })

    print(f"\n[Intrusion Detection Results]")
    print(f"Image: {image_path}")
    print(f"Total Intruders Detected: {len(detections)}")
    for i, det in enumerate(detections, 1):
        print(f"  {i}. {det['class'].upper()} (Conf: {det['confidence']*100:.1f}%) Box: {det['box']}")
    return detections


def predict_crop_damage(image_path, output_mask_path=None):
    """Predicts pixel segmentation mask for crop damage."""
    import torch
    import torchvision.transforms as T
    from train_damage_segmenter import UNet

    model_path = os.path.join(MODELS_DIR, "damage_segmenter.pt")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found at {model_path}. Run training first.")

    checkpoint = torch.load(model_path, map_location="cpu", weights_only=False)
    model = UNet(in_channels=3, num_classes=4)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    img = Image.open(image_path).convert("RGB")
    orig_size = img.size

    transform = T.Compose([
        T.Resize((256, 256)),
        T.ToTensor(),
        T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    tensor = transform(img).unsqueeze(0)

    with torch.no_grad():
        logits = model(tensor)
        pred_mask = torch.argmax(logits, dim=1)[0].cpu().numpy()

    # Calculate class percentages
    total_pixels = pred_mask.size
    class_names = ["Soil/Background", "Healthy Crop", "Pest Damage", "Mechanical/Hail Damage"]
    print(f"\n[Crop Damage Semantic Segmentation]")
    print(f"Image: {image_path}")
    print("Field Area Distribution:")
    for idx, name in enumerate(class_names):
        pct = (pred_mask == idx).sum() / float(total_pixels) * 100
        print(f"  - {name:25s}: {pct:.2f}%")

    if output_mask_path:
        mask_img = Image.fromarray(pred_mask.astype(np.uint8)).resize(orig_size, resample=Image.NEAREST)
        mask_img.save(output_mask_path)
        print(f"Saved segmentation mask to: {output_mask_path}")

    return pred_mask


def predict_flood(sensor_dict=None):
    """Predicts flood risk from real-time IoT sensor readings."""
    import joblib

    model_path = os.path.join(MODELS_DIR, "flood_monitor_model.joblib")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found at {model_path}. Run training first.")

    pipeline = joblib.load(model_path)
    model = pipeline["model"]
    scaler = pipeline["scaler"]
    features = pipeline["feature_names"]

    # Default reading if not provided
    if sensor_dict is None:
        sensor_dict = {
            "soil_moisture_pct": 88.5,
            "water_level_cm": 28.0,
            "rainfall_mm_per_hr": 24.5,
            "cumulative_rain_24h_mm": 65.0,
            "temperature_c": 23.5,
            "humidity_pct": 94.0,
            "drainage_flow_rate_lps": 38.0,
            "river_distance_m": 120.0,
            "hour": 14,
            "dayofweek": 2,
            "moisture_diff_1h": 4.5,
            "water_level_diff_1h": 5.2,
            "rolling_mean_water_6h": 22.0,
            "rolling_max_rain_6h": 28.0
        }

    input_df = pd.DataFrame([sensor_dict])[features]
    scaled = scaler.transform(input_df)
    pred_idx = model.predict(scaled)[0]
    probs = model.predict_proba(scaled)[0]

    levels = ["NORMAL (Safe)", "WARNING (Elevated Risk)", "CRITICAL (Flood Emergency)"]
    print(f"\n[Flood Monitoring Early Warning System]")
    print(f"Current Soil Moisture: {sensor_dict['soil_moisture_pct']}% | Water Level: {sensor_dict['water_level_cm']} cm")
    print(f"Predicted Status: {levels[pred_idx]}")
    print(f"Risk Probabilities:")
    for lvl, p in zip(levels, probs):
        print(f"  - {lvl:26s}: {p*100:.2f}%")
    return levels[pred_idx], probs


def test_all():
    """Runs end-to-end verification tests on all 4 models using sample test data."""
    print("=" * 65)
    print(" Yukti AI - Complete System Verification Test")
    print("=" * 65)

    test_dir = os.path.join(BASE_DIR, "test_images")

    print("\n[1/4] Testing Plant Health Classification...")
    plant_img = os.path.join(test_dir, "plant_leaf_healthy.jpg")
    predict_plant_health(plant_img)

    print("\n[2/4] Testing Intrusion Detection...")
    intrusion_img = os.path.join(test_dir, "intrusion_scene.jpg")
    predict_intrusion(intrusion_img)

    print("\n[3/4] Testing Crop Damage Semantic Segmentation...")
    crop_img = os.path.join(test_dir, "crop_aerial.jpg")
    out_mask = os.path.join(test_dir, "crop_aerial_pred_mask.png")
    predict_crop_damage(crop_img, output_mask_path=out_mask)

    print("\n[4/4] Testing Flood Monitoring Early Warning System...")
    predict_flood()

    print("\n" + "=" * 65)
    print(" [SUCCESS] All 4 Yukti AI models verified successfully!")
    print("=" * 65)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Yukti AI - Inference Utility")
    parser.add_argument(
        "--task",
        choices=["all", "plant_health", "intrusion", "crop_damage", "flood"],
        default="all",
        help="Task to run prediction for (default: 'all' to verify all models)"
    )
    parser.add_argument("--image", type=str, default=None, help="Path to input image")
    parser.add_argument("--out-mask", type=str, default=None, help="Output path for segmentation mask")
    args = parser.parse_args()

    if args.task == "all":
        test_all()
    elif args.task == "plant_health":
        img = args.image or os.path.join(BASE_DIR, "test_images", "plant_leaf_healthy.jpg")
        predict_plant_health(img)
    elif args.task == "intrusion":
        img = args.image or os.path.join(BASE_DIR, "test_images", "intrusion_scene.jpg")
        predict_intrusion(img)
    elif args.task == "crop_damage":
        img = args.image or os.path.join(BASE_DIR, "test_images", "crop_aerial.jpg")
        mask = args.out_mask or os.path.join(BASE_DIR, "test_images", "crop_aerial_pred_mask.png")
        predict_crop_damage(img, output_mask_path=mask)
    elif args.task == "flood":
        predict_flood()
