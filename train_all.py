"""
Yukti AI - Master Training Orchestration Script
Trains all machine learning models in sequence:
1. Plant Health Classification (Keras)     -> models/plant_health_model.keras
2. Intrusion Detection (PyTorch)           -> models/intrusion_detector.pt
3. Crop Damage Segmentation (PyTorch)      -> models/damage_segmenter.pt
4. Flood Monitoring (Scikit-Learn)         -> models/flood_monitor_model.joblib
"""

import os
import sys
import argparse
import time

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")


def main():
    parser = argparse.ArgumentParser(description="Yukti AI - Master Training Pipeline")
    parser.add_argument("--all", action="store_true", default=True, help="Train all models in sequence")
    parser.add_argument("--plant-health", action="store_true", help="Train plant health classifier only")
    parser.add_argument("--intrusion", action="store_true", help="Train intrusion detector only")
    parser.add_argument("--crop-damage", action="store_true", help="Train crop damage segmenter only")
    parser.add_argument("--flood", action="store_true", help="Train flood monitor classifier only")
    parser.add_argument("--epochs-keras", type=int, default=8, help="Epochs for Keras plant health")
    parser.add_argument("--epochs-torch", type=int, default=8, help="Epochs for PyTorch models")
    args = parser.parse_args()

    # Determine which models to train
    train_plant = args.plant_health or (not (args.intrusion or args.crop_damage or args.flood))
    train_intru = args.intrusion or (not (args.plant_health or args.crop_damage or args.flood))
    train_crop = args.crop_damage or (not (args.plant_health or args.intrusion or args.flood))
    train_fld = args.flood or (not (args.plant_health or args.intrusion or args.crop_damage))

    os.makedirs(MODELS_DIR, exist_ok=True)
    start_total = time.time()

    print("================================================================")
    print("        Yukti AI - Comprehensive Model Training Suite           ")
    print("================================================================")
    print(f"Target Models Directory: {MODELS_DIR}")
    print(f"Tasks Selected:")
    print(f"  - Plant Health Model (.keras)   : {'YES' if train_plant else 'NO'}")
    print(f"  - Intrusion Detector (.pt)      : {'YES' if train_intru else 'NO'}")
    print(f"  - Damage Segmenter (.pt)        : {'YES' if train_crop else 'NO'}")
    print(f"  - Flood Monitoring Model (.joblib): {'YES' if train_fld else 'NO'}")
    print("================================================================\n")

    # 1. Plant Health Model
    if train_plant:
        t0 = time.time()
        print("\n>>> STEP 1/4: Training Plant Health Model (Keras) <<<")
        from train_plant_health import train_plant_health
        train_plant_health(epochs=args.epochs_keras, batch_size=16)
        print(f">>> Step 1 Completed in {time.time() - t0:.1f}s <<<\n")

    # 2. Intrusion Detection Model
    if train_intru:
        t0 = time.time()
        print("\n>>> STEP 2/4: Training Intrusion Detector (PyTorch) <<<")
        from train_intrusion_detector import train_intrusion_detector
        train_intrusion_detector(epochs=args.epochs_torch, batch_size=8)
        print(f">>> Step 2 Completed in {time.time() - t0:.1f}s <<<\n")

    # 3. Crop Damage Segmentation Model
    if train_crop:
        t0 = time.time()
        print("\n>>> STEP 3/4: Training Crop Damage U-Net Segmenter (PyTorch) <<<")
        from train_damage_segmenter import train_damage_segmenter
        train_damage_segmenter(epochs=args.epochs_torch, batch_size=8)
        print(f">>> Step 3 Completed in {time.time() - t0:.1f}s <<<\n")

    # 4. Flood Monitoring Model
    if train_fld:
        t0 = time.time()
        print("\n>>> STEP 4/4: Training Flood Monitoring Sensor Model <<<")
        from train_flood_monitoring import train_flood_monitoring
        train_flood_monitoring()
        print(f">>> Step 4 Completed in {time.time() - t0:.1f}s <<<\n")

    total_time = time.time() - start_total
    print("\n================================================================")
    print("                    TRAINING COMPLETE                           ")
    print("================================================================")
    print(f"Total pipeline execution time: {total_time:.1f}s")
    print("Generated Artifacts in models/:")
    for f in os.listdir(MODELS_DIR):
        fpath = os.path.join(MODELS_DIR, f)
        size_mb = os.path.getsize(fpath) / (1024 * 1024)
        print(f"  - {f:30s} ({size_mb:.2f} MB)")
    print("================================================================")


if __name__ == "__main__":
    main()
