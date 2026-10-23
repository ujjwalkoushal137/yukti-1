---
title: Yuktiii
emoji: 🌱
colorFrom: green
colorTo: blue
sdk: gradio
app_file: app.py
pinned: false
license: apache-2.0
short_description: Multi-modal AI for autonomous precision agriculture.
---

# 🌱 Yukti AI - Autonomous Precision Agriculture Platform

**Yukti AI** is a next-generation autonomous agritech intelligence suite designed for real-time field monitoring, multi-modal neural disease diagnostics, perimeter intrusion sentry, drone crop damage segmentation, and ultrasonic water level management with 3-hour automated predictive cycles.

---

## ✨ Features

- 🌓 **Dual Interface Architecture**:
  - **Farmer Phone View** (`/user`): Smartphone-optimized interface for field operators.
  - **Admin Command Center** (`/admin`): Real-time telemetry monitoring, risk alerts, and model diagnostics.
- ⏱️ **Autonomous 3-Hour Engine**: Continuously ingests telemetry, detects flood risk deltas, updates water depth levels, and actuates irrigation sluices every 3 hours.
- 📡 **Microcontroller Field Telemetry API (`POST /api/iot/feed`)**: Bidirectional telemetry gateway for ESP32, Arduino, Raspberry Pi, and LoRaWAN gateways. Returns automated actuator decisions (`pump_command`, `sluice_position_pct`).
- 📷 **Field Camera & Public Image Sharing API (`POST /api/iot/image-feed`)**: Accepts captures from ESP32-CAM, trail cameras, and drones. Runs real-time AI diagnosis and generates instant public sharing links (`GET /shared/view/<image_id>`).
- 🌾 **4 Production Multi-Modal AI Engines**:
  1. **Plant Health Diagnostic**: Deep Convolutional neural classifier distinguishing Healthy, Leaf Blight, Powdery Mildew, and Rust.
  2. **Intrusion Sentry**: PyTorch bounding box detector identifying wild boars, deer, human trespassers, and cattle.
  3. **Aerial Damage Segmentation**: U-Net pixel-level segmentation of lodging, flood submersion, pest infestation, and drought.
  4. **Flood & Waterlogging Early Warning**: Machine-learning pipeline with StandardScaler and probability estimations for proactive pump control.

---

## 🚀 API Endpoints

### 1. Send Field Sensor Telemetry
- **Endpoint**: `POST /api/iot/feed`
- **Content-Type**: `application/json`

```json
{
  "device_id": "ESP32-PADDY-01",
  "field_id": "FIELD_01",
  "water_level_cm": 15.2,
  "soil_moisture_pct": 68.0,
  "rainfall_mm_per_hr": 2.8,
  "temperature_c": 27.5,
  "humidity_pct": 72.0,
  "drainage_flow_rate_lps": 8.0,
  "river_distance_m": 95.0
}
```

### 2. Field Camera Image Analysis
- **Endpoint**: `POST /api/iot/image-feed`
- **Content-Type**: `multipart/form-data`
- **Parameters**: `file` (image), `device_id`, `task` (`plant_health` | `intrusion` | `crop_damage`)

---

## 🔑 Default Login Credentials

- **Farmer View (`/user`)**: `farmer` / `farmer123`
- **Admin Console (`/admin`)**: `admin` / `admin123`
- **Operator View (`/user`)**: `user` / `user123`
