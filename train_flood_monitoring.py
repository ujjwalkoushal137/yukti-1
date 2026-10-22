"""
Yukti AI - Flood Monitoring Sensor Model Trainer
Analyzes time-series agricultural IoT sensor records and trains a predictive early-warning classifier.
Inputs: flood_monitoring/sensor_records.csv
Outputs: models/flood_monitor_model.joblib
"""

import os
import argparse
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
import joblib

from datasets.dataset import load_flood_sensor_dataframe

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_SAVE_PATH = os.path.join(BASE_DIR, "models", "flood_monitor_model.joblib")


def train_flood_monitoring():
    print("==================================================")
    print("Training Flood Monitoring & Early Warning System")
    print("==================================================")
    os.makedirs(os.path.join(BASE_DIR, "models"), exist_ok=True)

    X, y, df = load_flood_sensor_dataframe()
    print(f"-> Loaded {len(df)} sensor records with {X.shape[1]} features.")
    print(f"-> Target distribution:\n{y.value_counts(normalize=True).round(3) * 100}%")

    # Chronological Split (ML Best Practice for Time-Series Data)
    n = len(X)
    train_end = int(n * 0.70)
    val_end = int(n * 0.85)

    X_train, y_train = X.iloc[:train_end], y.iloc[:train_end]
    X_val, y_val = X.iloc[train_end:val_end], y.iloc[train_end:val_end]
    X_test, y_test = X.iloc[val_end:], y.iloc[val_end:]

    print(f"-> Chronological Splits: Train={len(X_train)}, Val={len(X_val)}, Test={len(X_test)}")

    # Fit Scaler on training data only to prevent data leakage
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)

    # Train Model (Random Forest with balanced class weights)
    print("\n-> Training Random Forest Early Warning Classifier...")
    model = RandomForestClassifier(
        n_estimators=120,
        max_depth=8,
        min_samples_split=4,
        class_weight="balanced",
        random_state=42
    )
    model.fit(X_train_scaled, y_train)

    # Validation evaluation
    val_preds = model.predict(X_val_scaled)
    print("\n-> Validation Evaluation:")
    print(classification_report(y_val, val_preds, labels=[0, 1, 2], target_names=["Normal", "Warning", "Critical Flood"], zero_division=0))

    # Test set evaluation
    test_preds = model.predict(X_test_scaled)
    test_probs = model.predict_proba(X_test_scaled)
    print("-> Test Set Evaluation (Unseen Future Window):")
    print(classification_report(y_test, test_preds, labels=[0, 1, 2], target_names=["Normal", "Warning", "Critical Flood"], zero_division=0))

    print("-> Confusion Matrix (Test Set):")
    print(confusion_matrix(y_test, test_preds))

    # Feature Importance Analysis
    importances = model.feature_importances_
    feat_importances = sorted(zip(X.columns, importances), key=lambda x: x[1], reverse=True)
    print("\n-> Key Sensor Feature Importances:")
    for feat, imp in feat_importances[:6]:
        print(f"   - {feat:25s}: {imp * 100:.2f}%")

    # Save Pipeline (Model + Scaler + Feature Names)
    pipeline = {
        "model": model,
        "scaler": scaler,
        "feature_names": list(X.columns),
        "target_names": ["Normal", "Warning", "Critical Flood"]
    }
    joblib.dump(pipeline, MODEL_SAVE_PATH)
    print(f"\n-> Model pipeline saved successfully to: {MODEL_SAVE_PATH}")
    print("==================================================")
    return pipeline


if __name__ == "__main__":
    train_flood_monitoring()
