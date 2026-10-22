---
title: Yukti AI - Autonomous Precision Agriculture
emoji: 🌱
colorFrom: green
colorTo: emerald
sdk: docker
app_port: 7860
pinned: false
license: apache-2.0
short_description: Precision agritech platform with 3-hr IoT telemetry ingestion & multi-modal AI
---

# 🌱 Yukti AI - Autonomous Precision Agriculture Platform

**Yukti AI** is a next-generation autonomous agritech intelligence suite designed for real-time field monitoring, multi-modal neural disease diagnostics, perimeter intrusion sentry, drone crop damage segmentation, and ultrasonic water level management with 3-hour automated predictive cycles.

---

## ✨ Features

- 🌓 **Dark & Light Mode Switcher**: Seamless theme switcher persisting your visual preference via `localStorage`.
- ⏱️ **Autonomous 3-Hour Engine**: Continuously ingests telemetry, detects flood risk deltas, updates water depth levels, and actuates irrigation sluices every 3 hours.
- 📡 **Microcontroller Field Telemetry API (`POST /api/iot/feed`)**: Bidirectional telemetry gateway for ESP32, Arduino, Raspberry Pi, and LoRaWAN gateways. Returns automated actuator decisions (`pump_command`, `sluice_position_pct`).
- 📷 **Field Camera & Public Image Sharing API (`POST /api/iot/image-feed`)**: Accepts captures from ESP32-CAM, trail cameras, and drones. Runs real-time AI diagnosis and generates instant public sharing links (`GET /shared/view/<image_id>`).
- 🌾 **4 Production Multi-Modal AI Engines**:
  1. **Plant Health Diagnostic**: Convolutional neural classifier distinguishing Healthy, Leaf Blight, Powdery Mildew, and Rust.
  2. **Intrusion Sentry**: PyTorch bounding box detector identifying wild boars, deer, human trespassers, and cattle.
  3. **Aerial Damage Segmentation**: Pixel-level segmentation of lodging, flood submersion, pest infestation, and drought.
  4. **Flood & Waterlogging Early Warning**: Machine-learning pipeline with StandardScaler and probability estimations for proactive pump control.
- 🚀 **Hugging Face Space & Docker Native**: Built-in support for port `7860`, dynamic port environment variables, and containerization.

---

## 🚀 Microcontroller Integration & API Reference

### 1. Send Field Sensor Telemetry
- **Endpoint**: `POST https://<your-space>.hf.space/api/iot/feed`
- **Content-Type**: `application/json`

#### Request Payload:
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

#### Microcontroller Actuator Response:
```json
{
  "status": "success",
  "device_id": "ESP32-PADDY-01",
  "field_id": "FIELD_01",
  "timestamp": "2026-10-16 11:45:00",
  "prediction": {
    "risk_code": 1,
    "risk_label": "WARNING",
    "critical_probability_pct": 34.2
  },
  "actuator_directives": {
    "pump_command": "AUXILIARY_PUMP_1",
    "sluice_position_pct": 50,
    "advisory": "WARNING: Elevated waterlogging hazard"
  }
}
```

### 2. Upload Field Camera Image & Generate Shareable Link
- **Endpoint**: `POST https://<your-space>.hf.space/api/iot/image-feed`
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `file`: JPEG / PNG image binary
  - `device_id`: Camera identifier (e.g., `ESP32-CAM-NORTH`)
  - `task`: `plant_health` | `intrusion` | `crop_damage`

#### Response:
```json
{
  "status": "success",
  "image_id": "cam_1760601234_abc123",
  "device_id": "ESP32-CAM-NORTH",
  "share_url": "/shared/view/cam_1760601234_abc123",
  "image_url": "/static/shared_images/cam_1760601234_abc123.jpg",
  "ai_result": {
    "diagnosis": "Leaf Blight",
    "confidence_pct": 94.2
  }
}
```

---

## 🛠️ ESP32 (Arduino IDE) Firmware Example

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "https://<your-space>.hf.space/api/iot/feed";

const int WATER_SENSOR_PIN = 34;
const int PUMP_RELAY_PIN = 23;

void setup() {
  Serial.begin(115200);
  pinMode(PUMP_RELAY_PIN, OUTPUT);
  digitalWrite(PUMP_RELAY_PIN, LOW);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    int rawAdc = analogRead(WATER_SENSOR_PIN);
    float waterLevel = (rawAdc / 4095.0) * 35.0; // 0-35cm

    StaticJsonDocument<256> doc;
    doc["device_id"] = "ESP32-NODE-FIELD-01";
    doc["field_id"] = "FIELD_01";
    doc["water_level_cm"] = waterLevel;
    doc["soil_moisture_pct"] = 64.0;
    doc["rainfall_mm_per_hr"] = 0.0;

    String jsonPayload;
    serializeJson(doc, jsonPayload);

    int httpCode = http.POST(jsonPayload);
    if (httpCode > 0) {
      String res = http.getString();
      StaticJsonDocument<512> resDoc;
      deserializeJson(resDoc, res);

      const char* pumpCmd = resDoc["actuator_directives"]["pump_command"];
      if (strcmp(pumpCmd, "DISCHARGE_100_PERCENT") == 0 || strcmp(pumpCmd, "AUXILIARY_PUMP_1") == 0) {
        digitalWrite(PUMP_RELAY_PIN, HIGH); // Turn pump on
      } else {
        digitalWrite(PUMP_RELAY_PIN, LOW);  // Turn pump off
      }
    }
    http.end();
  }

  // Transmit every 3 hours (10,800,000 ms)
  delay(10800000);
}
```

---

## 🌐 Deploying to Hugging Face Spaces

1. **Create Space**:
   - Go to [Hugging Face Spaces](https://huggingface.co/spaces).
   - Click **Create new Space**.
   - Choose **Docker** as Space SDK.
2. **Push Code**:
   - Clone your Hugging Face Space repository:
     ```bash
     git clone https://huggingface.co/spaces/<your-username>/<your-space-name>
     ```
   - Copy the Yukti AI repository files into the Space directory.
   - Commit & push:
     ```bash
     git add .
     git commit -m "Deploy Yukti AI to Hugging Face Spaces"
     git push
     ```
3. **Automatic Build**:
   - Hugging Face automatically detects `Dockerfile`, exposes port `7860`, and boots the server.
   - Your API is immediately live at `https://<your-username>-<your-space-name>.hf.space`!

---

## 💻 Local Development

```bash
# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # Or on Windows: .venv\Scripts\activate

# Install requirements
pip install -r requirements-hf.txt

# Run server
python app.py
```
Open `http://127.0.0.1:5000` in your browser.
