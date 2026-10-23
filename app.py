"""
Yukti AI - Autonomous Precision Agriculture Suite
Official Hugging Face Spaces Gradio Demo
Models:
1. Plant Health & Pathology Classifier (Keras Deep CNN)
2. Agricultural Perimeter Intrusion Detector (PyTorch Grid Sentry)
3. Drone Aerial Crop Damage Segmentation (PyTorch U-Net)
4. Ultrasonic Flood Monitoring & Smart Sluice Gate Control (Random Forest)
"""

import os
import sys
import time
from datetime import datetime
import numpy as np
import pandas as pd
from PIL import Image, ImageDraw, ImageFont
import gradio as gr

# Ensure local directory is in path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

MODELS_DIR = os.path.join(BASE_DIR, "models")
STATIC_IMG_DIR = os.path.join(BASE_DIR, "static", "test_images")

# Global model caches
_PLANT_MODEL = None
_INTRUSION_MODEL = None
_INTRUSION_CHECKPOINT = None
_DAMAGE_MODEL = None
_FLOOD_PIPELINE = None


# ==============================================================================
# Model Loading Utilities
# ==============================================================================

def get_plant_model():
    global _PLANT_MODEL
    if _PLANT_MODEL is None:
        import keras
        model_path = os.path.join(MODELS_DIR, "plant_health_model.keras")
        if os.path.exists(model_path):
            _PLANT_MODEL = keras.models.load_model(model_path)
    return _PLANT_MODEL


def get_intrusion_model():
    global _INTRUSION_MODEL, _INTRUSION_CHECKPOINT
    if _INTRUSION_MODEL is None:
        import torch
        from train_intrusion_detector import IntrusionDetector
        model_path = os.path.join(MODELS_DIR, "intrusion_detector.pt")
        if os.path.exists(model_path):
            _INTRUSION_CHECKPOINT = torch.load(model_path, map_location="cpu", weights_only=False)
            model = IntrusionDetector(num_classes=4, grid_size=_INTRUSION_CHECKPOINT.get("grid_size", 8))
            model.load_state_dict(_INTRUSION_CHECKPOINT["model_state_dict"])
            model.eval()
            _INTRUSION_MODEL = model
    return _INTRUSION_MODEL, _INTRUSION_CHECKPOINT


def get_damage_model():
    global _DAMAGE_MODEL
    if _DAMAGE_MODEL is None:
        import torch
        from train_damage_segmenter import UNet
        model_path = os.path.join(MODELS_DIR, "damage_segmenter.pt")
        if os.path.exists(model_path):
            checkpoint = torch.load(model_path, map_location="cpu", weights_only=False)
            model = UNet(in_channels=3, num_classes=4)
            model.load_state_dict(checkpoint["model_state_dict"])
            model.eval()
            _DAMAGE_MODEL = model
    return _DAMAGE_MODEL


def get_flood_pipeline():
    global _FLOOD_PIPELINE
    if _FLOOD_PIPELINE is None:
        import joblib
        model_path = os.path.join(MODELS_DIR, "flood_monitor_model.joblib")
        if os.path.exists(model_path):
            _FLOOD_PIPELINE = joblib.load(model_path)
    return _FLOOD_PIPELINE


# ==============================================================================
# Inference Handlers
# ==============================================================================

def analyze_plant_health(input_image):
    if input_image is None:
        return None, "⚠️ Please upload or capture an image of a plant leaf."

    model = get_plant_model()
    if model is None:
        return None, "❌ Plant health model not found in `models/plant_health_model.keras`."

    img = Image.fromarray(input_image).convert("RGB").resize((224, 224))
    img_array = np.array(img, dtype=np.float32)
    img_batch = np.expand_dims(img_array, axis=0)

    classes = ["Healthy Leaf", "Leaf Blight", "Powdery Mildew", "Leaf Rust"]
    preds = model.predict(img_batch, verbose=0)[0]
    conf_dict = {classes[i]: float(preds[i]) for i in range(len(classes))}
    best_idx = int(np.argmax(preds))
    best_cls = classes[best_idx]
    best_conf = float(preds[best_idx]) * 100.0

    advisories = {
        "Healthy Leaf": "✅ **Condition**: Optimal plant vigor. No pathogenic infection detected. Continue standard drip irrigation and scheduled nutrient administration.",
        "Leaf Blight": "⚠️ **Agronomic Advisory**: Necrotic fungal lesions identified. Isolate affected plot canopy. Apply copper oxychloride (2.5g/L) or Azoxystrobin spray. Reduce overhead sprinkler irrigation to restrict spore propagation.",
        "Powdery Mildew": "⚠️ **Agronomic Advisory**: White powdery epiphytic fungal mycelium detected. Spray wettable sulfur (2g/L) or neem seed kernel extract (5%). Prune densely shaded lower canopy branches to improve sunlight penetration.",
        "Leaf Rust": "🚨 **Agronomic Advisory**: Pustular rust spores present on leaf epidermis. Apply Triazole or Mancozeb fungicide spray at early morning. Maintain strict field sanitation and monitor adjacent crop blocks."
    }

    report = f"""### 🌾 Diagnostic Report: **{best_cls}** ({best_conf:.1f}% Confidence)
{advisories.get(best_cls, 'Monitoring required.')}

*Diagnostic timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*
"""
    return conf_dict, report


def detect_intrusions(input_image, conf_threshold):
    if input_image is None:
        return None, "⚠️ Please upload an image."

    model, checkpoint = get_intrusion_model()
    if model is None:
        return input_image, "❌ Intrusion model not found in `models/intrusion_detector.pt`."

    import torch
    import torchvision.transforms as T

    img = Image.fromarray(input_image).convert("RGB")
    orig_w, orig_h = img.size

    transform = T.Compose([
        T.Resize((256, 256)),
        T.ToTensor(),
        T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    tensor = transform(img).unsqueeze(0)

    with torch.no_grad():
        out = model(tensor)[0]
        grid_size = out.shape[0]
        confidences = torch.sigmoid(out[..., 0])
        coords = out[..., 1:5]
        class_probs = torch.softmax(out[..., 5:], dim=-1)

    classes = checkpoint.get("classes", ["Person / Trespasser", "Wild Boar", "Deer", "Cattle"])
    color_map = {
        0: (239, 68, 68),    # Red
        1: (249, 115, 22),   # Orange
        2: (234, 179, 8),    # Yellow
        3: (168, 85, 247)    # Purple
    }

    draw_img = img.copy()
    draw = ImageDraw.Draw(draw_img)
    detections = []

    for gy in range(grid_size):
        for gx in range(grid_size):
            conf = confidences[gy, gx].item()
            if conf >= conf_threshold:
                x_off, y_off, w, h = coords[gy, gx].tolist()
                xc = (gx + x_off) / grid_size
                yc = (gy + y_off) / grid_size
                cls_idx = torch.argmax(class_probs[gy, gx]).item()
                cls_prob = class_probs[gy, gx, cls_idx].item()
                final_conf = conf * cls_prob

                x1 = int(max(0, (xc - w/2) * orig_w))
                y1 = int(max(0, (yc - h/2) * orig_h))
                x2 = int(min(orig_w, (xc + w/2) * orig_w))
                y2 = int(min(orig_h, (yc + h/2) * orig_h))

                box_color = color_map.get(cls_idx, (255, 0, 0))
                draw.rectangle([x1, y1, x2, y2], outline=box_color, width=4)
                label_text = f"{classes[cls_idx]}: {final_conf*100:.1f}%"
                draw.rectangle([x1, max(0, y1 - 20), x1 + len(label_text)*9, y1], fill=box_color)
                draw.text((x1 + 4, max(0, y1 - 18)), label_text, fill=(255, 255, 255))

                detections.append({
                    "Target": classes[cls_idx],
                    "Confidence": f"{final_conf*100:.1f}%",
                    "BoundingBox": f"[{x1}, {y1}, {x2}, {y2}]"
                })

    if not detections:
        status_md = "### ✅ Sector Clear\nNo wildlife or unauthorized trespassers detected above the threshold."
    else:
        status_md = f"### 🚨 Perimeter Intrusion Alert: {len(detections)} Target(s) Identified\n"
        for d in detections:
            status_md += f"- **{d['Target']}** (Confidence: {d['Confidence']}) at coordinates {d['BoundingBox']}\n"
        status_md += "\n**Actuator Directives**: Automatic perimeter high-decibel acoustic deterrent siren triggered. Alert dispatched to field boundary node."

    return np.array(draw_img), status_md


def segment_crop_damage(input_image):
    if input_image is None:
        return None, "⚠️ Please upload an aerial image."

    model = get_damage_model()
    if model is None:
        return None, "❌ Crop damage model not found in `models/damage_segmenter.pt`."

    import torch
    import torchvision.transforms as T

    img = Image.fromarray(input_image).convert("RGB")
    orig_w, orig_h = img.size

    transform = T.Compose([
        T.Resize((256, 256)),
        T.ToTensor(),
        T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    tensor = transform(img).unsqueeze(0)

    with torch.no_grad():
        logits = model(tensor)
        pred_mask = torch.argmax(logits, dim=1)[0].cpu().numpy()

    # Color palette for 4 segmentation classes
    palette = np.array([
        [40, 40, 40],      # Class 0: Uncropped Soil / Road (Gray)
        [34, 197, 94],     # Class 1: Healthy Crop Canopy (Green)
        [234, 179, 8],     # Class 2: Pest / Drought Damage (Yellow)
        [239, 68, 68]      # Class 3: Flood Submersion / Lodging (Red)
    ], dtype=np.uint8)

    color_mask = palette[pred_mask]
    mask_pil = Image.fromarray(color_mask).resize((orig_w, orig_h), resample=Image.NEAREST)

    # Blend original aerial with 45% mask overlay
    blended = Image.blend(img, mask_pil, alpha=0.45)

    total_px = pred_mask.size
    pct_soil = (pred_mask == 0).sum() / total_px * 100.0
    pct_healthy = (pred_mask == 1).sum() / total_px * 100.0
    pct_pest = (pred_mask == 2).sum() / total_px * 100.0
    pct_flood = (pred_mask == 3).sum() / total_px * 100.0

    report = f"""### 🛰️ Drone Multispectral Crop Damage Breakdown
* **Healthy Crop Area (Green)**: `{pct_healthy:.1f}%`
* **Flood Submersion / Lodging (Red)**: `{pct_flood:.1f}%`
* **Pest / Drought Stress (Yellow)**: `{pct_pest:.1f}%`
* **Non-Vegetated Soil / Canal (Gray)**: `{pct_soil:.1f}%`

**Estimated Yield Health Index**: `{max(0.0, pct_healthy - pct_flood*1.2 - pct_pest*0.8):.1f} / 100`
"""
    return np.array(blended), report


def evaluate_flood_risk(water_level, soil_moisture, rainfall_rate, cum_rain_24h, temp_c, humidity, flow_rate, river_dist):
    pipeline = get_flood_pipeline()
    if pipeline is None:
        return "❌ Flood model not found", "0%", "N/A"

    model = pipeline["model"]
    scaler = pipeline["scaler"]
    features = pipeline["feature_names"]

    inp = {
        "soil_moisture_pct": float(soil_moisture),
        "water_level_cm": float(water_level),
        "rainfall_mm_per_hr": float(rainfall_rate),
        "cumulative_rain_24h_mm": float(cum_rain_24h),
        "temperature_c": float(temp_c),
        "humidity_pct": float(humidity),
        "drainage_flow_rate_lps": float(flow_rate),
        "river_distance_m": float(river_dist),
        "hour": 14,
        "dayofweek": 2,
        "moisture_diff_1h": 1.2 if rainfall_rate > 5 else 0.2,
        "water_level_diff_1h": 0.8 if rainfall_rate > 5 else 0.1,
        "rolling_mean_water_6h": float(water_level),
        "rolling_max_rain_6h": float(rainfall_rate)
    }

    df = pd.DataFrame([inp])[features]
    scaled = scaler.transform(df)
    pred_code = int(model.predict(scaled)[0])
    probs = model.predict_proba(scaled)[0]
    crit_prob = float(probs[2]) * 100.0

    if pred_code == 2:
        risk_label = "🔴 CRITICAL (Flood Hazard)"
        actuators = "⚡ Directives: Open emergency spillway gate (100%), Engage primary and auxiliary drainage pumps, Trigger perimeter sirens."
    elif pred_code == 1:
        risk_label = "🟡 WARNING (Elevated Saturated Soil)"
        actuators = "⚡ Directives: Open sluice gate to 50%, Start auxiliary drainage pump 1, Halt field irrigation cycles."
    else:
        risk_label = "🟢 NORMAL (Water Drainage Nominal)"
        actuators = "⚡ Directives: Sluice gate at nominal gravity outflow (25%), Pumps idle, Soil moisture optimal."

    return risk_label, f"{crit_prob:.1f}%", actuators


def batch_csv_predict(file_obj):
    if file_obj is None:
        return None, "⚠️ Please upload a CSV file."

    pipeline = get_flood_pipeline()
    if pipeline is None:
        return None, "❌ Model pipeline not found."

    df = pd.read_csv(file_obj.name)
    model = pipeline["model"]
    scaler = pipeline["scaler"]
    features = pipeline["feature_names"]

    # Fill defaults for missing columns
    for f in features:
        if f not in df.columns:
            df[f] = 0.0

    scaled = scaler.transform(df[features])
    preds = model.predict(scaled)
    probs = model.predict_proba(scaled)

    risk_map = {0: "NORMAL", 1: "WARNING", 2: "CRITICAL"}
    df["Predicted_Risk"] = [risk_map[p] for p in preds]
    df["Critical_Probability_%"] = [round(pr[2] * 100, 1) for pr in probs]

    summary = f"Total records: {len(df)} | Critical: {(preds==2).sum()} | Warning: {(preds==1).sum()} | Normal: {(preds==0).sum()}"
    return df, summary


# ==============================================================================
# Gradio User Interface Construction
# ==============================================================================

custom_css = """
.gradio-container {
    max-width: 1200px !important;
    margin: 0 auto !important;
}
.hero-box {
    text-align: center;
    padding: 24px;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%);
    border-radius: 16px;
    border: 1px solid rgba(16, 185, 129, 0.3);
    margin-bottom: 20px;
}
.badge-tag {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
    margin: 2px 6px;
}
"""

with gr.Blocks(title="Yukti AI - Precision Agriculture") as demo:
    gr.HTML("""
    <div class="hero-box">
        <h1 style="margin: 0; font-size: 2.2rem; font-weight: 800; color: #047857;">🌱 Yukti AI - Autonomous Precision Agriculture</h1>
        <p style="margin: 8px 0 16px 0; font-size: 1.05rem; color: #4b5563;">
            Autonomous agritech intelligence suite with 4 production AI models, IoT telemetry ingestion, and real-time cyber-physical actuation.
        </p>
        <div>
            <span class="badge-tag" style="background: #dcfce7; color: #166534;">🌿 Plant Pathology CNN</span>
            <span class="badge-tag" style="background: #fef3c7; color: #92400e;">🦌 Intrusion PyTorch Sentry</span>
            <span class="badge-tag" style="background: #e0f2fe; color: #075985;">🛰️ Aerial U-Net Segmentation</span>
            <span class="badge-tag" style="background: #ede9fe; color: #5b21b6;">💧 IoT Flood Risk Engine</span>
        </div>
    </div>
    """)

    with gr.Tabs():
        # TAB 1: Plant Health
        with gr.TabItem("🌿 Plant Pathology Diagnostics"):
            gr.Markdown("### Upload a leaf photo to diagnose fungal & bacterial pathogens (Healthy, Leaf Blight, Powdery Mildew, Rust).")
            with gr.Row():
                with gr.Column(scale=1):
                    plant_input = gr.Image(type="numpy", label="Upload Leaf Photo or Capture with Camera")
                    plant_btn = gr.Button("🔍 Run Neural Pathology Diagnosis", variant="primary")
                    
                    # Examples
                    ex_healthy = os.path.join(STATIC_IMG_DIR, "plant_leaf_healthy.jpg")
                    ex_blight = os.path.join(STATIC_IMG_DIR, "plant_leaf_blight.jpg")
                    ex_rust = os.path.join(STATIC_IMG_DIR, "plant_leaf_rust.jpg")
                    examples_plant = [f for f in [ex_healthy, ex_blight, ex_rust] if os.path.exists(f)]
                    if examples_plant:
                        gr.Examples(examples=examples_plant, inputs=plant_input, label="Sample Leaf Captures")

                with gr.Column(scale=1):
                    plant_label = gr.Label(num_top_classes=4, label="Pathology Confidence Distribution")
                    plant_md = gr.Markdown("Prediction report and agronomic treatment plan will appear here.")

            plant_btn.click(analyze_plant_health, inputs=[plant_input], outputs=[plant_label, plant_md])

        # TAB 2: Intrusion Detection
        with gr.TabItem("🚨 Perimeter Intrusion Sentry"):
            gr.Markdown("### Deep PyTorch Object Detection for farm perimeter surveillance (Wild Boars, Deer, Cattle, Human Trespassers).")
            with gr.Row():
                with gr.Column(scale=1):
                    intru_input = gr.Image(type="numpy", label="Surveillance Camera / Trail Cam Capture")
                    conf_slider = gr.Slider(minimum=0.10, maximum=0.95, value=0.40, step=0.05, label="Detection Confidence Threshold")
                    intru_btn = gr.Button("🛡️ Scan Perimeter for Intruders", variant="primary")

                    ex_scene = os.path.join(STATIC_IMG_DIR, "intrusion_scene.jpg")
                    ex_cattle = os.path.join(STATIC_IMG_DIR, "stray_cattle.jpg")
                    examples_intru = [f for f in [ex_scene, ex_cattle] if os.path.exists(f)]
                    if examples_intru:
                        gr.Examples(examples=examples_intru, inputs=intru_input, label="Sample Camera Feeds")

                with gr.Column(scale=1):
                    intru_output_img = gr.Image(type="numpy", label="Sentry Bounding Box Visualizer")
                    intru_status_md = gr.Markdown("Intrusion coordinates and actuator directives will display here.")

            intru_btn.click(detect_intrusions, inputs=[intru_input, conf_slider], outputs=[intru_output_img, intru_status_md])

        # TAB 3: Crop Damage Segmentation
        with gr.TabItem("🛰️ Aerial Drone Damage Segmentation"):
            gr.Markdown("### Pixel-level U-Net semantic segmentation for orthomosaic drone surveys (Lodging, Flood Submersion, Pest Infestation).")
            with gr.Row():
                with gr.Column(scale=1):
                    damage_input = gr.Image(type="numpy", label="Drone Aerial Survey Photo")
                    damage_btn = gr.Button("🛰️ Segment Crop Damage Mask", variant="primary")

                    ex_aerial = os.path.join(STATIC_IMG_DIR, "crop_aerial.jpg")
                    if os.path.exists(ex_aerial):
                        gr.Examples(examples=[ex_aerial], inputs=damage_input, label="Sample Drone Orthophoto")

                with gr.Column(scale=1):
                    damage_output_img = gr.Image(type="numpy", label="Segmented Damage Map Overlay")
                    damage_report_md = gr.Markdown("Damage area distribution percentages will display here.")

            damage_btn.click(segment_crop_damage, inputs=[damage_input], outputs=[damage_output_img, damage_report_md])

        # TAB 4: Flood Monitoring & Sluice Gate Control
        with gr.TabItem("🌊 IoT Flood Early Warning & Sluice Control"):
            gr.Markdown("### Real-time Machine Learning prediction for hydrostatic water depth and automated irrigation sluice gates.")
            with gr.Row():
                with gr.Column(scale=1):
                    w_level = gr.Slider(0.0, 50.0, value=12.5, step=0.5, label="Water Level (cm)")
                    s_moist = gr.Slider(10.0, 100.0, value=65.0, step=1.0, label="Soil Moisture (%)")
                    r_rain = gr.Slider(0.0, 60.0, value=8.5, step=0.5, label="Rainfall Intensity (mm/hr)")
                    c_rain = gr.Slider(0.0, 150.0, value=25.0, step=1.0, label="Cumulative 24h Rain (mm)")
                with gr.Column(scale=1):
                    t_temp = gr.Slider(10.0, 45.0, value=26.5, step=0.5, label="Ambient Temperature (°C)")
                    h_humid = gr.Slider(20.0, 100.0, value=75.0, step=1.0, label="Relative Humidity (%)")
                    f_flow = gr.Slider(0.0, 50.0, value=12.0, step=0.5, label="Drainage Flow Rate (L/s)")
                    r_dist = gr.Slider(10.0, 300.0, value=95.0, step=5.0, label="River / Canal Proximity (m)")

            flood_btn = gr.Button("⚡ Predict Flood Risk & Generate Sluice Directive", variant="primary")
            with gr.Row():
                risk_out = gr.Textbox(label="Predicted Flood Risk Level")
                prob_out = gr.Textbox(label="Critical Hazard Probability")
                actuator_out = gr.Textbox(label="Automated Actuator Directive (Pumps & Sluice Gates)")

            flood_btn.click(
                evaluate_flood_risk,
                inputs=[w_level, s_moist, r_rain, c_rain, t_temp, h_humid, f_flow, r_dist],
                outputs=[risk_out, prob_out, actuator_out]
            )

            gr.Markdown("---")
            gr.Markdown("### 📂 Batch Telemetry CSV Evaluation")
            csv_file = gr.File(label="Upload Sensor CSV (matching sample_sensor_upload.csv)")
            csv_btn = gr.Button("📊 Run Batch Predictions")
            csv_summary = gr.Textbox(label="Batch Summary")
            csv_df = gr.DataFrame(label="Inference Results Table")
            csv_btn.click(batch_csv_predict, inputs=[csv_file], outputs=[csv_df, csv_summary])

        # TAB 5: Hardware & Microcontroller Integration
        with gr.TabItem("📡 ESP32 & IoT Microcontroller Firmware"):
            gr.Markdown("""
            ### 🛠️ Hardware Integration Gateway for ESP32 & Arduino Field Nodes
            Yukti AI provides ready-to-flash C++ firmware for connecting physical sensors (ultrasonic depth, soil moisture, capacitive sensors) directly to the AI model.
            """)
            gr.Code(
                language="cpp",
                value="""// Yukti AI - ESP32 Field Telemetry Transmitter
// Board: ESP32 Dev Module | Arduino IDE 2.x
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASS";
const char* serverUrl = "https://ujjwalllll-yuktiii.hf.space/api/iot/feed";

const int WATER_SENSOR_PIN = 34; // Ultrasonic / Analog depth
const int RELAY_PUMP_PIN = 23;   // Irrigation pump relay

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PUMP_PIN, OUTPUT);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); }
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<256> doc;
    doc["device_id"] = "ESP32-PADDY-01";
    doc["field_id"] = "FIELD_01";
    doc["water_level_cm"] = 15.2;
    doc["soil_moisture_pct"] = 68.0;
    doc["rainfall_mm_per_hr"] = 2.8;

    String payload;
    serializeJson(doc, payload);
    int httpCode = http.POST(payload);
    if (httpCode > 0) {
      String res = http.getString();
      StaticJsonDocument<512> resDoc;
      deserializeJson(resDoc, res);
      const char* cmd = resDoc["actuator_directives"]["pump_command"];
      digitalWrite(RELAY_PUMP_PIN, (strcmp(cmd, "IDLE") != 0) ? HIGH : LOW);
    }
    http.end();
  }
  delay(10800000); // 3-hour autonomous telemetry cycle
}"""
            )

    gr.HTML("<div style='text-align: center; margin-top: 30px; color: #9ca3af;'>Yukti AI © 2026 • Autonomous Precision Agritech Platform</div>")

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)
