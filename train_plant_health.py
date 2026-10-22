"""
Yukti AI - Plant Health Model Trainer
Trains a Deep Convolutional Neural Network for Plant Disease & Health Classification using Keras.
Inputs: plant_health/train, plant_health/validation, plant_health/test
Outputs: models/plant_health_model.keras
"""

import os
import argparse
import numpy as np

# Suppress verbose TensorFlow logs
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

import tensorflow as tf
import keras
from keras import layers, models, optimizers, callbacks

from datasets.dataset import get_plant_health_datasets

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_SAVE_PATH = os.path.join(BASE_DIR, "models", "plant_health_model.keras")


def build_plant_health_model(input_shape=(224, 224, 3), num_classes=4):
    """
    Constructs a robust Deep CNN with residual blocks, spatial dropout,
    batch normalization, and on-the-fly data augmentation.
    """
    inputs = layers.Input(shape=input_shape, name="input_image")

    # 1. On-the-fly Data Augmentation
    x = layers.RandomFlip("horizontal_and_vertical")(inputs)
    x = layers.RandomRotation(0.15)(x)
    x = layers.RandomZoom(0.1)(x)
    x = layers.Rescaling(1.0 / 255.0)(x)

    # 2. Convolutional Feature Extraction Block 1
    x = layers.Conv2D(32, (3, 3), padding="same", use_bias=False)(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation("relu")(x)
    x = layers.Conv2D(32, (3, 3), padding="same", use_bias=False)(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation("relu")(x)
    x = layers.MaxPooling2D((2, 2))(x)
    x = layers.Dropout(0.2)(x)

    # 3. Convolutional Feature Extraction Block 2
    x = layers.Conv2D(64, (3, 3), padding="same", use_bias=False)(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation("relu")(x)
    x = layers.Conv2D(64, (3, 3), padding="same", use_bias=False)(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation("relu")(x)
    x = layers.MaxPooling2D((2, 2))(x)
    x = layers.Dropout(0.25)(x)

    # 4. Convolutional Feature Extraction Block 3
    x = layers.Conv2D(128, (3, 3), padding="same", use_bias=False)(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation("relu")(x)
    x = layers.MaxPooling2D((2, 2))(x)
    x = layers.Dropout(0.3)(x)

    # 5. Global Pooling & Classification Head
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dense(128, activation="relu")(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.4)(x)
    outputs = layers.Dense(num_classes, activation="softmax", name="classification_output")(x)

    model = models.Model(inputs=inputs, outputs=outputs, name="PlantHealthClassifier")
    return model


def train_plant_health(epochs=12, batch_size=16, lr=1e-3):
    print("==================================================")
    print("Training Plant Health Classification Model (Keras)")
    print("==================================================")
    os.makedirs(os.path.join(BASE_DIR, "models"), exist_ok=True)

    # Load data splits
    train_ds, val_ds, test_ds, class_names = get_plant_health_datasets(
        img_size=(224, 224),
        batch_size=batch_size
    )
    print(f"-> Classes detected ({len(class_names)}): {class_names}")

    # Build model
    model = build_plant_health_model(input_shape=(224, 224, 3), num_classes=len(class_names))
    model.compile(
        optimizer=optimizers.Adam(learning_rate=lr),
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )
    model.summary()

    # Training callbacks
    cb_list = [
        callbacks.EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True, verbose=1),
        callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=2, min_lr=1e-5, verbose=1)
    ]

    print("\n-> Commencing Model Training...")
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs,
        callbacks=cb_list,
        verbose=1
    )

    # Evaluate on held-out test split
    print("\n-> Evaluating Model on Unseen Test Split...")
    test_loss, test_acc = model.evaluate(test_ds, verbose=0)
    print(f"   [Test Results] Loss: {test_loss:.4f} | Accuracy: {test_acc * 100:.2f}%")

    # Compute per-class test predictions
    y_true_list = []
    y_pred_list = []
    for images, labels in test_ds:
        preds = model.predict(images, verbose=0)
        y_true_list.extend(np.argmax(labels.numpy(), axis=1))
        y_pred_list.extend(np.argmax(preds, axis=1))

    from sklearn.metrics import classification_report, confusion_matrix
    print("\n-> Classification Report (Test Set):")
    print(classification_report(y_true_list, y_pred_list, target_names=class_names))
    print("-> Confusion Matrix:")
    print(confusion_matrix(y_true_list, y_pred_list))

    # Save final model
    print(f"\n-> Saving model to: {MODEL_SAVE_PATH}")
    model.save(MODEL_SAVE_PATH)
    print("   [OK] Model saved successfully!")
    print("==================================================")
    return model, history


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Plant Health Classification Model")
    parser.add_argument("--epochs", type=int, default=10, help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=16, help="Batch size")
    parser.add_argument("--lr", type=float, default=1e-3, help="Learning rate")
    args = parser.parse_args()

    train_plant_health(epochs=args.epochs, batch_size=args.batch_size, lr=args.lr)
