/**
 * Yukti AI - Precision Agriculture & Intelligent Monitoring
 * Interactive Dashboard Frontend Application Logic (Static Serverless Architecture)
 */

let currentOverviewChart = null;
let currentPlantFile = null;
let currentPlantSample = null;
let currentIntrusionFile = null;
let currentIntrusionSample = null;
let currentDamageFile = null;
let currentDamageSample = null;
let currentCsvFile = null;
let currentCameraFile = null;

let remainingCountdownSeconds = 3 * 3600;

// Reactive Client-Side Simulation Store
const clientStore = {
  water_level_avg: 12.8,
  soil_moisture_avg: 58.6,
  sectors: [
    { id: 1, name: "Paddock 1 (Sector North)", level_cm: 12.4, moisture_pct: 62.0, status: "OPTIMAL" },
    { id: 2, name: "Paddock 2 (Canal Inflow)", level_cm: 14.8, moisture_pct: 66.5, status: "OPTIMAL" },
    { id: 3, name: "Paddock 3 (Sluice 4 Runoff)", level_cm: 18.2, moisture_pct: 71.0, status: "CAUTION" },
    { id: 4, name: "Paddock 4 (Lowland Basin)", level_cm: 22.5, moisture_pct: 78.4, status: "WARNING" }
  ],
  telemetryHistory: [
    { timestamp: "06:00", water_level_cm: 11.2, soil_moisture_pct: 54.0 },
    { timestamp: "09:00", water_level_cm: 12.0, soil_moisture_pct: 56.5 },
    { timestamp: "12:00", water_level_cm: 13.5, soil_moisture_pct: 60.0 },
    { timestamp: "15:00", water_level_cm: 12.8, soil_moisture_pct: 58.6 },
    { timestamp: "18:00", water_level_cm: 12.4, soil_moisture_pct: 57.2 }
  ],
  activityHistory: [
    { timestamp: "11:20:15", task: "Intrusion Sentry", title: "Boundary Sentry Scan", result_summary: "PERIMETER CLEAR - No wildlife threats", status: "success" },
    { timestamp: "09:00:00", task: "3-Hour Autopilot", title: "Autonomous Telemetry Ingestion", result_summary: "Synchronized 4 paddock nodes. Mean depth: 12.8 cm.", status: "info" },
    { timestamp: "06:00:00", task: "Hydraulic Sluice", title: "Automated Weir Adjustment", result_summary: "Gate 2 throttle set to 15% retention mode.", status: "warning" }
  ],
  sensorRecords: [
    { timestamp: "2026-10-23 11:00", field_id: "FIELD_01", soil_moisture_pct: 62.5, water_level_cm: 12.8, rainfall_mm_per_hr: 4.2, cumulative_rain_24h_mm: 18.5, temperature_c: 26.5, humidity_pct: 68.0, drainage_flow_rate_lps: 14.2, flood_risk_level: 0 },
    { timestamp: "2026-10-23 08:00", field_id: "FIELD_02", soil_moisture_pct: 74.0, water_level_cm: 18.5, rainfall_mm_per_hr: 12.0, cumulative_rain_24h_mm: 38.0, temperature_c: 24.2, humidity_pct: 82.0, drainage_flow_rate_lps: 9.5, flood_risk_level: 1 },
    { timestamp: "2026-10-23 05:00", field_id: "FIELD_03", soil_moisture_pct: 58.0, water_level_cm: 11.0, rainfall_mm_per_hr: 0.0, cumulative_rain_24h_mm: 12.0, temperature_c: 23.0, humidity_pct: 62.0, drainage_flow_rate_lps: 16.0, flood_risk_level: 0 },
    { timestamp: "2026-10-23 02:00", field_id: "FIELD_04", soil_moisture_pct: 86.5, water_level_cm: 26.4, rainfall_mm_per_hr: 28.5, cumulative_rain_24h_mm: 72.0, temperature_c: 22.5, humidity_pct: 94.0, drainage_flow_rate_lps: 4.0, flood_risk_level: 2 }
  ],
  sharedImages: [
    { id: 1, file_url: "static/shared_images/cam_1792131881_dc61fb.jpg", device_id: "ESP32-CAM-01", timestamp: "Today 10:45 AM", task_label: "Perimeter Sentry", diagnosis_result: "Wild Boar Sighted (89%)" },
    { id: 2, file_url: "static/test_images/plant_leaf_rust.jpg", device_id: "Farmer Mobile Node", timestamp: "Today 09:15 AM", task_label: "Foliar Diagnosis", diagnosis_result: "Rust Detected (92%)" },
    { id: 3, file_url: "static/test_images/crop_aerial.jpg", device_id: "Drone DJI Mavic 3M", timestamp: "Yesterday 04:30 PM", task_label: "Aerial Survey", diagnosis_result: "65.4% Healthy Canopy" }
  ]
};

// ==============================================================================
// Initialization
// ==============================================================================

document.addEventListener("DOMContentLoaded", () => {
  if (typeof initLanguageSwitcher === "function") {
    initLanguageSwitcher();
  }
  initTheme();
  initClock();
  initTabs();
  initDropzones();
  initSliders();
  initOverview();
  initWaterLevels();
  initAutomationEngine();
  initIotGateway();
  initActivityLog();
  initSensorRecords();
  initSettingsModal();
});

// Live UTC/Local Clock
function initClock() {
  const clockEl = document.getElementById("liveClock");
  if (!clockEl) return;
  function updateTime() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString() + " " + (now.toLocaleDateString(undefined, { month: "short", day: "numeric" }));
  }
  updateTime();
  setInterval(updateTime, 1000);
}

// Toast Notification
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "toast";

  let icon = "fa-circle-info";
  if (type === "success") icon = "fa-circle-check";
  if (type === "warning") icon = "fa-triangle-exclamation";
  if (type === "danger") icon = "fa-circle-xmark";

  toast.innerHTML = `<i class="fa-solid ${icon}" style="color: ${type === 'success' ? '#10b981' : (type === 'warning' ? '#f59e0b' : '#38bdf8')}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(50px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ==============================================================================
// 3-Hour Autonomous Engine Controller (Client-Side Real-Time Simulation)
// ==============================================================================

function initAutomationEngine() {
  const triggerBtn = document.getElementById("triggerSyncBtn");
  if (triggerBtn) {
    triggerBtn.addEventListener("click", triggerAutonomousCycle);
  }

  // Local second ticker for countdown
  setInterval(() => {
    if (remainingCountdownSeconds > 0) {
      remainingCountdownSeconds--;
      updateCountdownDisplay(remainingCountdownSeconds);
    } else {
      // Auto cycle fires every 3 hours!
      triggerAutonomousCycle();
    }
  }, 1000);
}

function updateCountdownDisplay(totalSeconds) {
  const el = document.getElementById("countdownDisplay");
  if (!el) return;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  el.textContent = `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
}

function triggerAutonomousCycle() {
  const btn = document.getElementById("triggerSyncBtn");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Ingesting Telemetry...`;
  }

  setTimeout(() => {
    // 1. Simulate subtle fluctuations in water depth
    const delta = (Math.random() * 1.6 - 0.7);
    clientStore.water_level_avg = Math.max(5.0, Math.min(35.0, +(clientStore.water_level_avg + delta).toFixed(1)));
    clientStore.soil_moisture_avg = Math.max(30.0, Math.min(95.0, +(clientStore.soil_moisture_avg + (delta * 1.5)).toFixed(1)));

    clientStore.sectors.forEach(s => {
      s.level_cm = Math.max(4.0, +(s.level_cm + (Math.random() * 2.0 - 0.9)).toFixed(1));
      s.moisture_pct = Math.max(25.0, +(s.moisture_pct + (Math.random() * 2.5 - 1.2)).toFixed(1));
    });

    // 2. Add time-series chart data point
    const now = new Date();
    const timeLabel = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    clientStore.telemetryHistory.push({
      timestamp: timeLabel,
      water_level_cm: clientStore.water_level_avg,
      soil_moisture_pct: clientStore.soil_moisture_avg
    });
    if (clientStore.telemetryHistory.length > 8) {
      clientStore.telemetryHistory.shift();
    }

    // 3. Log event
    clientStore.activityHistory.unshift({
      timestamp: now.toLocaleTimeString(),
      task: "3-Hour Autopilot",
      title: "Autonomous Synchronized Cycle",
      result_summary: `Paddocks updated. Depth: ${clientStore.water_level_avg} cm, Moisture: ${clientStore.soil_moisture_avg}%.`,
      status: "info"
    });

    // 4. Reset 3-hour timer
    remainingCountdownSeconds = 3 * 3600;

    // 5. Update UI views
    fetchOverviewData();
    initWaterLevels();
    initActivityLog();

    if (window.YuktiAIEngine) YuktiAIEngine.playAudioAlert("info");
    showToast("3-Hour Autonomous Ingestion Cycle Synchronized!", "success");

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-bolt-lightning"></i> <span>Trigger 3-Hour Sync Now</span>`;
    }
  }, 700);
}

// ==============================================================================
// Tab Navigation
// ==============================================================================

function initTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      tabPanes.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const targetTab = btn.getAttribute("data-tab");
      const targetPane = document.getElementById(`${targetTab}Tab`);
      if (targetPane) {
        targetPane.classList.add("active");
        if (targetTab === "waterLevel") {
          initWaterLevels();
        } else if (targetTab === "dataLog") {
          initActivityLog();
          initSensorRecords();
        }
      }
    });
  });
}

// ==============================================================================
// Overview Dashboard & Chart.js
// ==============================================================================

function initOverview() {
  const refreshBtn = document.getElementById("refreshOverviewBtn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      fetchOverviewData();
      showToast("Telemetry metrics refreshed", "success");
    });
  }
  fetchOverviewData();
}

function fetchOverviewData() {
  const waterKpi = document.getElementById("kpiWaterLevel");
  if (waterKpi) waterKpi.textContent = `${clientStore.water_level_avg} cm`;

  const moistureKpi = document.getElementById("kpiMoisture");
  if (moistureKpi) moistureKpi.textContent = `${clientStore.soil_moisture_avg}%`;

  const tankFill = document.getElementById("tankLevelFill");
  const depthLabel = document.getElementById("tankDepthLabel");
  if (tankFill) {
    const pct = Math.min(100, Math.max(5, (clientStore.water_level_avg / 50.0) * 100));
    tankFill.style.height = `${pct}%`;
  }
  if (depthLabel) depthLabel.textContent = `${clientStore.water_level_avg} cm`;

  renderOverviewChart(clientStore.telemetryHistory);
}

function renderOverviewChart(telemetry) {
  const ctx = document.getElementById("overviewChart");
  if (!ctx) return;

  const labels = telemetry.map(r => r.timestamp);
  const waterLevel = telemetry.map(r => r.water_level_cm);
  const moisture = telemetry.map(r => r.soil_moisture_pct);

  if (currentOverviewChart) {
    currentOverviewChart.destroy();
  }

  currentOverviewChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Paddy Water Level (cm)",
          data: waterLevel,
          borderColor: "#0284c7",
          backgroundColor: "rgba(2, 132, 199, 0.12)",
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointRadius: 4,
          pointBackgroundColor: "#0284c7"
        },
        {
          label: "Soil Moisture (%)",
          data: moisture,
          borderColor: "#10b981",
          backgroundColor: "transparent",
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 3,
          borderDash: [5, 4]
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: { font: { family: "Inter", size: 12 } }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          grid: { color: "rgba(0, 0, 0, 0.05)" }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });
}

// ==============================================================================
// Water Level & Hydraulic Station
// ==============================================================================

function initWaterLevels() {
  const avg = clientStore.water_level_avg;
  const waterKpi = document.getElementById("kpiWaterLevel");
  if (waterKpi) waterKpi.textContent = `${avg} cm`;

  const statusEl = document.getElementById("kpiWaterStatus");
  if (statusEl) {
    if (avg > 20) {
      statusEl.className = "kpi-trend trend-danger";
      statusEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> High Depth (&gt;20 cm)`;
    } else if (avg > 15) {
      statusEl.className = "kpi-trend trend-warning";
      statusEl.innerHTML = `<i class="fa-solid fa-droplet"></i> Elevated Depth (&gt;15 cm)`;
    } else {
      statusEl.className = "kpi-trend trend-up";
      statusEl.innerHTML = `<i class="fa-solid fa-droplet"></i> Optimal Depth (&lt;15 cm)`;
    }
  }

  // Populate Paddock List
  const overviewList = document.getElementById("waterLevelPaddockList");
  if (overviewList) {
    overviewList.innerHTML = "";
    clientStore.sectors.forEach(f => {
      let badgeCls = "badge-success";
      if (f.level_cm > 20) badgeCls = "badge-danger";
      else if (f.level_cm > 15) badgeCls = "badge-warning";

      const div = document.createElement("div");
      div.className = "water-paddock-item";
      div.innerHTML = `
        <div>
          <strong>${f.name}</strong>
          <div style="font-size: 0.74rem; color: var(--text-muted);">Moisture: ${f.moisture_pct}%</div>
        </div>
        <span class="badge ${badgeCls}">${f.level_cm} cm</span>
      `;
      overviewList.appendChild(div);
    });
  }
}

// ==============================================================================
// Dropzone Upload Handlers & 1-Click Samples
// ==============================================================================

function initDropzones() {
  setupDropzone("plantDropzone", "plantFileInput", (file) => {
    currentPlantFile = file;
    currentPlantSample = null;
    showToast(`Loaded leaf photo: ${file.name}`, "info");
  });

  setupDropzone("intrusionDropzone", "intrusionFileInput", (file) => {
    currentIntrusionFile = file;
    currentIntrusionSample = null;
    showToast(`Loaded sentry frame: ${file.name}`, "info");
  });

  setupDropzone("damageDropzone", "damageFileInput", (file) => {
    currentDamageFile = file;
    currentDamageSample = null;
    showToast(`Loaded aerial orthophoto: ${file.name}`, "info");
  });

  setupDropzone("csvDropzone", "csvFileInput", (file) => {
    currentCsvFile = file;
    showToast(`Loaded telemetry CSV: ${file.name}`, "info");
  });

  // Action Buttons
  document.getElementById("runPlantHealthBtn").addEventListener("click", runPlantHealthPrediction);
  document.getElementById("runIntrusionBtn").addEventListener("click", runIntrusionPrediction);
  document.getElementById("runDamageBtn").addEventListener("click", runCropDamageSegmentation);
  document.getElementById("runFloodSimulationBtn").addEventListener("click", runFloodSimulation);
  document.getElementById("runBatchCSVBtn").addEventListener("click", runBatchCSVUpload);
  document.getElementById("clearLogBtn").addEventListener("click", clearActivityLog);

  // Flood Mode Toggles
  const btnSliders = document.getElementById("btnModeSliders");
  const btnCSV = document.getElementById("btnModeCSV");
  const slidersSection = document.getElementById("floodSlidersSection");
  const csvSection = document.getElementById("floodCSVSection");

  if (btnSliders && btnCSV && slidersSection && csvSection) {
    btnSliders.addEventListener("click", () => {
      btnSliders.classList.add("active");
      btnSliders.style.background = "#ecfdf5";
      btnSliders.style.borderColor = "#a7f3d0";
      btnSliders.style.color = "#065f46";
      btnCSV.classList.remove("active");
      btnCSV.style.background = "";
      btnCSV.style.borderColor = "";
      btnCSV.style.color = "";
      slidersSection.style.display = "block";
      csvSection.style.display = "none";
    });

    btnCSV.addEventListener("click", () => {
      btnCSV.classList.add("active");
      btnCSV.style.background = "#ecfdf5";
      btnCSV.style.borderColor = "#a7f3d0";
      btnCSV.style.color = "#065f46";
      btnSliders.classList.remove("active");
      btnSliders.style.background = "";
      btnSliders.style.borderColor = "";
      btnSliders.style.color = "";
      slidersSection.style.display = "none";
      csvSection.style.display = "block";
    });
  }
}

function setupDropzone(zoneId, inputId, onFileSelected) {
  const zone = document.getElementById(zoneId);
  const input = document.getElementById(inputId);
  if (!zone || !input) return;

  zone.addEventListener("click", () => input.click());

  zone.addEventListener("dragover", (e) => {
    e.preventDefault();
    zone.classList.add("dragover");
  });

  zone.addEventListener("dragleave", () => {
    zone.classList.remove("dragover");
  });

  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("dragover");
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      updateDropzoneLabel(zone, file.name);
      onFileSelected(file);
    }
  });

  input.addEventListener("change", () => {
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      updateDropzoneLabel(zone, file.name);
      onFileSelected(file);
    }
  });
}

function updateDropzoneLabel(zone, filename) {
  const prompt = zone.querySelector(".dropzone-prompt h3");
  if (prompt) prompt.textContent = `Selected: ${filename}`;
  zone.style.borderColor = "#059669";
}

// 1-Click Sample Loader
window.loadSample = function(task, filename, title) {
  if (task === "plant_health") {
    currentPlantSample = filename;
    currentPlantFile = null;
    updateDropzoneLabel(document.getElementById("plantDropzone"), `Sample: ${title}`);
    showToast(`Loaded sample: ${title}`, "info");
  } else if (task === "intrusion") {
    currentIntrusionSample = filename;
    currentIntrusionFile = null;
    updateDropzoneLabel(document.getElementById("intrusionDropzone"), `Sample: ${title}`);
    showToast(`Loaded sample: ${title}`, "info");
  } else if (task === "crop_damage") {
    currentDamageSample = filename;
    currentDamageFile = null;
    updateDropzoneLabel(document.getElementById("damageDropzone"), `Sample: ${title}`);
    showToast(`Loaded sample: ${title}`, "info");
  }
};

// Range slider dynamic values
function initSliders() {
  const sliders = [
    { id: "confThreshSlider", displayId: "confThreshDisplay", suffix: "%" },
    { id: "sliderMoisture", displayId: "valMoisture", suffix: "%" },
    { id: "sliderWaterLevel", displayId: "valWaterLevel", suffix: " cm" },
    { id: "sliderRainRate", displayId: "valRainRate", suffix: " mm/h" },
    { id: "sliderCumulativeRain", displayId: "valCumulativeRain", suffix: " mm" },
    { id: "sliderDrainage", displayId: "valDrainage", suffix: " L/s" },
    { id: "sliderRiverDist", displayId: "valRiverDist", suffix: " m" }
  ];

  sliders.forEach(s => {
    const el = document.getElementById(s.id);
    const disp = document.getElementById(s.displayId);
    if (el && disp) {
      el.addEventListener("input", () => {
        disp.textContent = el.value + s.suffix;
      });
    }
  });
}

// ==============================================================================
// 1. Plant Health Prediction (Calls YuktiAIEngine)
// ==============================================================================

async function runPlantHealthPrediction() {
  const btn = document.getElementById("runPlantHealthBtn");
  if (!currentPlantFile && !currentPlantSample) {
    showToast("Please select an image or click a sample leaf first", "warning");
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Running Neural Classifier...`;

  try {
    const source = currentPlantFile ? currentPlantFile : `static/test_images/${currentPlantSample}`;
    const data = await YuktiAIEngine.diagnosePlantHealth(source, currentPlantSample);

    document.getElementById("plantPlaceholder").style.display = "none";
    document.getElementById("plantResultContent").style.display = "block";
    document.getElementById("plantPreviewImg").src = data.preview_image;
    document.getElementById("plantConditionTitle").textContent = data.condition_display;
    document.getElementById("plantConfidenceText").textContent = `Confidence: ${data.confidence}% [${data.engine}]`;

    const badge = document.getElementById("plantSeverityBadge");
    badge.className = `badge ${data.severity_class}`;
    badge.textContent = data.severity;

    const probs = data.probabilities;
    document.getElementById("probHealthy").textContent = `${probs.healthy || 0}%`;
    document.getElementById("barHealthy").style.width = `${probs.healthy || 0}%`;

    document.getElementById("probBlight").textContent = `${probs.leaf_blight || 0}%`;
    document.getElementById("barBlight").style.width = `${probs.leaf_blight || 0}%`;

    document.getElementById("probMildew").textContent = `${probs.powdery_mildew || 0}%`;
    document.getElementById("barMildew").style.width = `${probs.powdery_mildew || 0}%`;

    document.getElementById("probRust").textContent = `${probs.rust || 0}%`;
    document.getElementById("barRust").style.width = `${probs.rust || 0}%`;

    document.getElementById("plantSummaryText").textContent = data.summary;
    const actionList = document.getElementById("plantActionList");
    actionList.innerHTML = "";
    data.actions.forEach(act => {
      const li = document.createElement("li");
      li.textContent = act;
      actionList.appendChild(li);
    });

    // Append to activity log
    clientStore.activityHistory.unshift({
      timestamp: new Date().toLocaleTimeString(),
      task: "Plant Health",
      title: data.condition_display,
      result_summary: `Diagnosed with ${data.confidence}% confidence via ${data.engine}.`,
      status: data.condition === "healthy" ? "success" : "danger"
    });
    initActivityLog();

    showToast(`Plant diagnosed: ${data.condition_display} (${data.confidence}%)`, "success");

  } catch (err) {
    showToast(`Diagnostic failed: ${err.message}`, "danger");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Diagnose Plant Health`;
  }
}

// ==============================================================================
// 2. Intrusion & Wildlife Sentry (Calls YuktiAIEngine)
// ==============================================================================

async function runIntrusionPrediction() {
  const btn = document.getElementById("runIntrusionBtn");
  if (!currentIntrusionFile && !currentIntrusionSample) {
    showToast("Please upload a camera capture or pick the sample frame", "warning");
    return;
  }

  const confThresh = parseFloat(document.getElementById("confThreshSlider").value) / 100.0;

  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Scanning Sentry Perimeter...`;

  try {
    const source = currentIntrusionFile ? currentIntrusionFile : `static/test_images/${currentIntrusionSample}`;
    const data = await YuktiAIEngine.detectIntrusions(source, confThresh, currentIntrusionSample);

    document.getElementById("intrusionPlaceholder").style.display = "none";
    document.getElementById("intrusionResultContent").style.display = "block";
    document.getElementById("intrusionAnnotatedImg").src = data.annotated_image;
    document.getElementById("intrusionThreatTitle").textContent = data.threat_level;
    document.getElementById("intrusionCountBadge").textContent = `${data.detections_count} Targets Detected [${data.engine}]`;

    const tableBody = document.getElementById("intrusionTableBody");
    tableBody.innerHTML = "";

    if (data.detections.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-dim);">No entities detected above ${Math.round(confThresh * 100)}% threshold. Perimeter nominal.</td></tr>`;
    } else {
      data.detections.forEach((d, idx) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${idx + 1}</td>
          <td><span class="badge badge-danger">${d.class_name}</span></td>
          <td class="mono-cell">${d.confidence}%</td>
          <td class="mono-cell">[${d.bbox.join(", ")}]</td>
        `;
        tableBody.appendChild(row);
      });
    }

    clientStore.activityHistory.unshift({
      timestamp: new Date().toLocaleTimeString(),
      task: "Perimeter Sentry",
      title: data.threat_level,
      result_summary: `${data.detections_count} entities detected at ${Math.round(confThresh * 100)}% threshold.`,
      status: data.detections_count > 0 ? "warning" : "success"
    });
    initActivityLog();

    showToast(`Sentry scan finished: ${data.detections_count} targets located`, data.detections_count > 0 ? "warning" : "success");

  } catch (err) {
    showToast(`Sentry detection failed: ${err.message}`, "danger");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-crosshairs"></i> Run Intruder Detection`;
  }
}

// ==============================================================================
// 3. Aerial Crop Damage Segmentation (Calls YuktiAIEngine)
// ==============================================================================

async function runCropDamageSegmentation() {
  const btn = document.getElementById("runDamageBtn");
  if (!currentDamageFile && !currentDamageSample) {
    showToast("Please upload an aerial image or click the demo orthophoto", "warning");
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Segmenting Canopy & Damage...`;

  try {
    const source = currentDamageFile ? currentDamageFile : `static/test_images/${currentDamageSample}`;
    const data = await YuktiAIEngine.segmentCropDamage(source, currentDamageSample);

    document.getElementById("damagePlaceholder").style.display = "none";
    document.getElementById("damageResultContent").style.display = "block";
    document.getElementById("damageCompositeImg").src = data.overlay_image;

    document.getElementById("segHealthyPct").textContent = `${data.percentages.healthy}%`;
    document.getElementById("segPestPct").textContent = `${data.percentages.pest}%`;
    document.getElementById("segMechPct").textContent = `${data.percentages.lodging}%`;
    document.getElementById("segSoilPct").textContent = `${data.percentages.flooded}%`;

    const damagedPct = (100 - data.percentages.healthy).toFixed(1);
    const damagedHa = (damagedPct * 12.5).toFixed(1);
    document.getElementById("statDamagedHa").textContent = `${damagedHa} Ha (${damagedPct}%)`;
    document.getElementById("statYieldLoss").textContent = `-${(damagedPct * 0.42).toFixed(1)}% Estimated Penalty`;

    clientStore.activityHistory.unshift({
      timestamp: new Date().toLocaleTimeString(),
      task: "Drone Segmentation",
      title: "Orthophoto Damage Assessment",
      result_summary: `${data.percentages.healthy}% Healthy, ${data.percentages.flooded}% Flooded, ${data.percentages.pest}% Pest.`,
      status: data.percentages.healthy > 75 ? "success" : "warning"
    });
    initActivityLog();

    showToast(`Segmentation completed: ${data.percentages.healthy}% healthy canopy`, "success");

  } catch (err) {
    showToast(`Damage segmentation failed: ${err.message}`, "danger");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-chart-area"></i> Run Segmentation & Loss Assessment`;
  }
}

// ==============================================================================
// 4. Flood Early Warning & Water Level Risk (Calls YuktiAIEngine)
// ==============================================================================

function runFloodSimulation() {
  const btn = document.getElementById("runFloodSimulationBtn");
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Running Hydraulic Model...`;

  const payload = {
    soil_moisture_pct: parseFloat(document.getElementById("sliderMoisture").value),
    water_level_cm: parseFloat(document.getElementById("sliderWaterLevel").value),
    rainfall_mm_per_hr: parseFloat(document.getElementById("sliderRainRate").value),
    cumulative_24h_rain_mm: parseFloat(document.getElementById("sliderCumulativeRain").value),
    drainage_flow_l_per_s: parseFloat(document.getElementById("sliderDrainage").value),
    river_proximity_m: parseFloat(document.getElementById("sliderRiverDist").value)
  };

  setTimeout(() => {
    const data = YuktiAIEngine.evaluateFloodRisk(payload);

    document.getElementById("floodStatusTitle").textContent = data.risk_level;
    const badge = document.getElementById("floodStatusBadge");
    badge.className = `badge ${data.risk_class}`;
    badge.textContent = data.risk_level.split(" ")[0];

    const prob = data.critical_probability;
    const normalProb = Math.max(5, 100 - prob);
    const warnProb = Math.min(50, Math.round(prob * 0.4));
    const critProb = prob;

    document.getElementById("floodProbNormal").textContent = `${normalProb}%`;
    document.getElementById("barFloodNormal").style.width = `${normalProb}%`;

    document.getElementById("floodProbWarning").textContent = `${warnProb}%`;
    document.getElementById("barFloodWarning").style.width = `${warnProb}%`;

    document.getElementById("floodProbCritical").textContent = `${critProb}%`;
    document.getElementById("barFloodCritical").style.width = `${critProb}%`;

    document.getElementById("floodPumpAction").textContent = data.actuator_directives.pump_command;
    document.getElementById("floodAdvisoryText").textContent = data.directives.join(" ");

    clientStore.activityHistory.unshift({
      timestamp: new Date().toLocaleTimeString(),
      task: "Flood Sentry",
      title: data.risk_level,
      result_summary: `Hazard Probability: ${critProb}%. Actuator: ${data.actuator_directives.pump_command}.`,
      status: critProb > 65 ? "danger" : (critProb > 38 ? "warning" : "success")
    });
    initActivityLog();

    showToast(`Flood risk: ${data.risk_level}`, critProb > 65 ? "danger" : (critProb > 38 ? "warning" : "success"));

    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-bolt"></i> Evaluate Real-Time Flood Risk & Pump Protocol`;
  }, 250);
}

function runBatchCSVUpload() {
  const btn = document.getElementById("runBatchCSVBtn");
  if (!currentCsvFile) {
    showToast("Please drag & drop or select a telemetry CSV file first", "warning");
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Batch Evaluating Telemetry Rows...`;

  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target.result;
    const lines = text.trim().split("\n");
    if (lines.length <= 1) {
      showToast("CSV file is empty or missing data rows", "danger");
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-play"></i> Ingest & Batch Evaluate Telemetry`;
      return;
    }

    const headers = lines[0].split(",").map(h => h.trim());
    const records = [];
    let safeCount = 0;
    let warnCount = 0;
    let critCount = 0;

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const cols = lines[i].split(",").map(c => c.trim());
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = cols[idx] !== undefined ? cols[idx] : "";
      });

      const evalResult = YuktiAIEngine.evaluateFloodRisk({
        water_level_cm: parseFloat(row.water_level_cm) || 12.0,
        soil_moisture_pct: parseFloat(row.soil_moisture_pct) || 60.0,
        rainfall_mm_per_hr: parseFloat(row.rainfall_mm_per_hr) || 0.0,
        cumulative_24h_rain_mm: parseFloat(row.cumulative_rain_24h_mm) || 20.0,
        temperature_c: parseFloat(row.temperature_c) || 25.0,
        humidity_pct: parseFloat(row.humidity_pct) || 65.0,
        drainage_flow_l_per_s: parseFloat(row.drainage_flow_rate_lps) || 12.0,
        river_proximity_m: parseFloat(row.river_distance_m) || 100.0
      });

      const label = evalResult.critical_probability >= 65 ? "CRITICAL" : (evalResult.critical_probability >= 38 ? "WARNING" : "NORMAL");
      if (label === "CRITICAL") critCount++;
      else if (label === "WARNING") warnCount++;
      else safeCount++;

      records.push({
        timestamp: row.timestamp || "--",
        field_id: row.field_id || `NODE_${i}`,
        soil_moisture_pct: row.soil_moisture_pct || "58.0",
        water_level_cm: row.water_level_cm || "12.0",
        rainfall_mm_per_hr: row.rainfall_mm_per_hr || "0.0",
        risk_label: label,
        critical_prob_pct: evalResult.critical_probability
      });
    }

    const resultCard = document.getElementById("csvResultCard");
    resultCard.style.display = "block";

    document.getElementById("csvSummaryText").textContent = `${records.length} records processed successfully`;

    const badgesGroup = document.getElementById("csvBadgesGroup");
    badgesGroup.innerHTML = `
      <span class="badge badge-success">${safeCount} Safe (${Math.round((safeCount/records.length)*100)}%)</span>
      <span class="badge badge-warning">${warnCount} Warning (${Math.round((warnCount/records.length)*100)}%)</span>
      <span class="badge badge-danger">${critCount} Critical (${Math.round((critCount/records.length)*100)}%)</span>
    `;

    const tbody = document.getElementById("csvTableBody");
    tbody.innerHTML = "";

    records.forEach(r => {
      const tr = document.createElement("tr");
      let badgeCls = "badge-success";
      if (r.risk_label === "WARNING") badgeCls = "badge-warning";
      if (r.risk_label === "CRITICAL") badgeCls = "badge-danger";

      tr.innerHTML = `
        <td class="mono-cell">${r.timestamp}</td>
        <td><strong>${r.field_id}</strong></td>
        <td class="mono-cell">${r.soil_moisture_pct}%</td>
        <td class="mono-cell" style="font-weight: 700; color: #0284c7;">${r.water_level_cm} cm</td>
        <td class="mono-cell">${r.rainfall_mm_per_hr} mm/h</td>
        <td><span class="badge ${badgeCls}">${r.risk_label}</span></td>
        <td class="mono-cell" style="color: ${r.critical_prob_pct > 50 ? '#dc2626' : '#059669'}">${r.critical_prob_pct}%</td>
      `;
      tbody.appendChild(tr);
    });

    showToast(`Batch evaluation completed: ${records.length} records!`, "success");
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-play"></i> Ingest & Batch Evaluate Telemetry`;
  };
  reader.readAsText(currentCsvFile);
}

// ==============================================================================
// 5. Activity Log & Sensor Telemetry Records
// ==============================================================================

function initActivityLog() {
  const tbody = document.getElementById("activityLogTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";
  if (clientStore.activityHistory.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-dim);">No activity logged yet.</td></tr>`;
    return;
  }

  clientStore.activityHistory.forEach(act => {
    const tr = document.createElement("tr");
    let statusBadge = "badge-info";
    if (act.status === "success") statusBadge = "badge-success";
    if (act.status === "warning") statusBadge = "badge-warning";
    if (act.status === "danger") statusBadge = "badge-danger";

    tr.innerHTML = `
      <td class="mono-cell">${act.timestamp}</td>
      <td><span class="badge ${statusBadge}">${act.task.toUpperCase()}</span></td>
      <td><strong>${act.title}</strong></td>
      <td>${act.result_summary}</td>
      <td><span class="badge ${statusBadge}">${act.status.toUpperCase()}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function clearActivityLog() {
  clientStore.activityHistory = [];
  showToast("Activity history cleared", "info");
  initActivityLog();
}

function initSensorRecords() {
  const tbody = document.getElementById("sensorRecordsTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";
  clientStore.sensorRecords.forEach(r => {
    const tr = document.createElement("tr");
    const riskClass = r.flood_risk_level === 2 ? "badge-danger" : (r.flood_risk_level === 1 ? "badge-warning" : "badge-success");
    const riskLabel = r.flood_risk_level === 2 ? "CRITICAL" : (r.flood_risk_level === 1 ? "WARNING" : "NORMAL");

    tr.innerHTML = `
      <td class="mono-cell">${r.timestamp}</td>
      <td><strong>${r.field_id}</strong></td>
      <td class="mono-cell">${r.soil_moisture_pct}%</td>
      <td class="mono-cell" style="font-weight: 700; color: #0284c7;">${r.water_level_cm} cm</td>
      <td class="mono-cell">${r.rainfall_mm_per_hr}</td>
      <td class="mono-cell">${r.cumulative_rain_24h_mm}</td>
      <td class="mono-cell">${r.temperature_c}°C</td>
      <td class="mono-cell">${r.humidity_pct}%</td>
      <td class="mono-cell">${r.drainage_flow_rate_lps}</td>
      <td><span class="badge ${riskClass}">${riskLabel}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// ==============================================================================
// 6. Theme Controller
// ==============================================================================

function initTheme() {
  const themeBtn = document.getElementById("themeToggleBtn");
  const themeIcon = document.getElementById("themeIcon");
  const themeLabel = document.getElementById("themeLabel");

  const savedTheme = localStorage.getItem("yukti_theme") || "light";
  applyTheme(savedTheme, false);

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const current = document.body.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next, true);
    });
  }

  function applyTheme(theme, notify = false) {
    if (theme === "dark") {
      document.body.setAttribute("data-theme", "dark");
      if (themeIcon) themeIcon.className = "fa-solid fa-sun theme-toggle-icon";
      if (themeLabel) themeLabel.textContent = typeof t === "function" ? t("nav.theme_light") : "Light";
      localStorage.setItem("yukti_theme", "dark");
      if (notify) showToast("Switched to Sleek Dark Theme", "info");
    } else {
      document.body.removeAttribute("data-theme");
      if (themeIcon) themeIcon.className = "fa-solid fa-moon theme-toggle-icon";
      if (themeLabel) themeLabel.textContent = typeof t === "function" ? t("nav.theme_dark") : "Dark";
      localStorage.setItem("yukti_theme", "light");
      if (notify) showToast("Switched to Crisp Light Theme", "info");
    }
  }
}

// ==============================================================================
// 7. IoT Microcontroller Gateway & Image Sharing Handler
// ==============================================================================

function initIotGateway() {
  const waterSlider = document.getElementById("iotWaterLevel");
  const waterVal = document.getElementById("iotWaterVal");
  if (waterSlider && waterVal) {
    waterSlider.addEventListener("input", () => {
      waterVal.textContent = `${parseFloat(waterSlider.value).toFixed(1)} cm`;
    });
  }

  const moistureSlider = document.getElementById("iotSoilMoisture");
  const moistureVal = document.getElementById("iotMoistureVal");
  if (moistureSlider && moistureVal) {
    moistureSlider.addEventListener("input", () => {
      moistureVal.textContent = `${moistureSlider.value} %`;
    });
  }

  const rainSlider = document.getElementById("iotRainfall");
  const rainVal = document.getElementById("iotRainVal");
  if (rainSlider && rainVal) {
    rainSlider.addEventListener("input", () => {
      rainVal.textContent = `${parseFloat(rainSlider.value).toFixed(1)} mm/h`;
    });
  }

  const btnSubmitIot = document.getElementById("btnSubmitIotFeed");
  if (btnSubmitIot) {
    btnSubmitIot.addEventListener("click", submitIotTelemetry);
  }

  const cameraDropzone = document.getElementById("cameraDropzone");
  const cameraFileInput = document.getElementById("cameraFileInput");
  const cameraPreviewWrapper = document.getElementById("cameraPreviewThumbnailWrapper");
  const cameraPreviewThumb = document.getElementById("cameraPreviewThumb");
  const cameraFileName = document.getElementById("cameraFileName");
  const btnRemoveCameraFile = document.getElementById("btnRemoveCameraFile");

  if (cameraDropzone && cameraFileInput) {
    cameraDropzone.addEventListener("click", () => cameraFileInput.click());

    cameraDropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      cameraDropzone.style.borderColor = "#059669";
    });

    cameraDropzone.addEventListener("dragleave", () => {
      cameraDropzone.style.borderColor = "";
    });

    cameraDropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      cameraDropzone.style.borderColor = "";
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleCameraFileSelect(e.dataTransfer.files[0]);
      }
    });

    cameraFileInput.addEventListener("change", () => {
      if (cameraFileInput.files && cameraFileInput.files[0]) {
        handleCameraFileSelect(cameraFileInput.files[0]);
      }
    });
  }

  if (btnRemoveCameraFile) {
    btnRemoveCameraFile.addEventListener("click", () => {
      currentCameraFile = null;
      if (cameraFileInput) cameraFileInput.value = "";
      if (cameraPreviewWrapper) cameraPreviewWrapper.style.display = "none";
      if (cameraDropzone) cameraDropzone.style.display = "flex";
    });
  }

  function handleCameraFileSelect(file) {
    currentCameraFile = file;
    if (cameraFileName) cameraFileName.textContent = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (cameraPreviewThumb) cameraPreviewThumb.src = e.target.result;
      if (cameraDropzone) cameraDropzone.style.display = "none";
      if (cameraPreviewWrapper) cameraPreviewWrapper.style.display = "flex";
    };
    reader.readAsDataURL(file);
  }

  const btnUploadCamera = document.getElementById("btnUploadCameraFeed");
  if (btnUploadCamera) {
    btnUploadCamera.addEventListener("click", uploadCameraFeed);
  }

  // Code Tab Switchers
  const codeTabBtns = document.querySelectorAll(".code-tab-btn");
  codeTabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      codeTabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const codeType = btn.getAttribute("data-code");
      document.querySelectorAll(".code-block-content").forEach(c => c.classList.remove("active"));
      const targetContent = document.getElementById(`codeSnippet-${codeType}`);
      if (targetContent) targetContent.classList.add("active");
    });
  });

  const btnCopySnippet = document.getElementById("btnCopySnippet");
  if (btnCopySnippet) {
    btnCopySnippet.addEventListener("click", () => {
      const activeSnippet = document.querySelector(".code-block-content.active pre");
      if (activeSnippet) {
        navigator.clipboard.writeText(activeSnippet.textContent).then(() => {
          showToast("Firmware code copied to clipboard!", "success");
        });
      }
    });
  }

  loadSharedGallery();
}

function submitIotTelemetry() {
  const btn = document.getElementById("btnSubmitIotFeed");
  const deviceId = document.getElementById("iotDeviceId").value.trim() || "ESP32-NODE-01";
  const waterLevel = parseFloat(document.getElementById("iotWaterLevel").value);
  const soilMoisture = parseFloat(document.getElementById("iotSoilMoisture").value);
  const rainfall = parseFloat(document.getElementById("iotRainfall").value);

  const originalHtml = btn.innerHTML;
  btn.innerHTML = `<span class="spinner"></span> Ingesting Telemetry...`;
  btn.disabled = true;

  setTimeout(() => {
    const evalResult = YuktiAIEngine.evaluateFloodRisk({
      water_level_cm: waterLevel,
      soil_moisture_pct: soilMoisture,
      rainfall_mm_per_hr: rainfall
    });

    clientStore.water_level_avg = waterLevel;
    clientStore.soil_moisture_avg = soilMoisture;

    const responseWrapper = document.getElementById("iotFeedResponseWrapper");
    const riskEl = document.getElementById("resRiskLabel");
    const pumpEl = document.getElementById("resPumpCmd");
    const sluiceEl = document.getElementById("resSluicePos");
    const advisoryEl = document.getElementById("resAdvisory");

    if (responseWrapper) responseWrapper.style.display = "block";
    if (riskEl) {
      riskEl.textContent = evalResult.risk_level;
      riskEl.style.color = evalResult.critical_probability >= 65 ? "#dc2626" : (evalResult.critical_probability >= 38 ? "#d97706" : "#059669");
    }
    if (pumpEl) pumpEl.textContent = evalResult.actuator_directives.pump_command;
    if (sluiceEl) sluiceEl.textContent = evalResult.actuator_directives.sluice_position;
    if (advisoryEl) advisoryEl.textContent = evalResult.directives.join(" ");

    fetchOverviewData();
    initWaterLevels();

    showToast(`Telemetry Ingested from ${deviceId}! Sluice directive ready.`, "success");

    btn.innerHTML = originalHtml;
    btn.disabled = false;
  }, 400);
}

async function uploadCameraFeed() {
  const btn = document.getElementById("btnUploadCameraFeed");
  const deviceId = document.getElementById("cameraDeviceId").value.trim() || "CAM_01";
  const task = document.getElementById("cameraTaskSelect").value;

  if (!currentCameraFile) {
    showToast("Please select or drop a camera photo first!", "warning");
    return;
  }

  const originalHtml = btn.innerHTML;
  btn.innerHTML = `<span class="spinner"></span> Analyzing with AI...`;
  btn.disabled = true;

  try {
    let diagnosis = "Analyzed";
    let conf = 94;

    if (task === "intrusion") {
      const res = await YuktiAIEngine.detectIntrusions(currentCameraFile, 0.35);
      diagnosis = res.threat_level;
      conf = res.detections[0] ? res.detections[0].confidence : 95;
    } else {
      const res = await YuktiAIEngine.diagnosePlantHealth(currentCameraFile);
      diagnosis = res.condition_display;
      conf = res.confidence;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      clientStore.sharedImages.unshift({
        id: Date.now(),
        file_url: e.target.result,
        device_id: deviceId,
        timestamp: "Just now",
        task_label: task === "intrusion" ? "Perimeter Sentry" : "Plant Pathology",
        diagnosis_result: `${diagnosis} (${conf}%)`
      });

      const resultBox = document.getElementById("cameraShareResultBox");
      const diagBadge = document.getElementById("shareDiagnosisBadge");
      if (resultBox) resultBox.style.display = "block";
      if (diagBadge) diagBadge.textContent = `${diagnosis} (${conf}%)`;

      loadSharedGallery();
      showToast("Camera frame analyzed & saved to gallery!", "success");
    };
    reader.readAsDataURL(currentCameraFile);

  } catch (err) {
    showToast(`Analysis error: ${err.message}`, "danger");
  } finally {
    btn.innerHTML = originalHtml;
    btn.disabled = false;
  }
}

function loadSharedGallery() {
  const container = document.getElementById("sharedGalleryContainer");
  if (!container) return;

  container.innerHTML = "";
  clientStore.sharedImages.forEach(img => {
    const card = document.createElement("div");
    card.className = "shared-gallery-card";

    card.innerHTML = `
      <div class="shared-gallery-thumb">
        <img src="${img.file_url}" alt="Capture">
      </div>
      <div class="shared-gallery-info">
        <div class="shared-gallery-title">
          <span>${img.diagnosis_result}</span>
          <span class="badge badge-success" style="font-size: 0.7rem;">Verified</span>
        </div>
        <div class="shared-gallery-meta">
          Node: ${img.device_id} • ${img.timestamp}
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// ==============================================================================
// 8. AI Engine Settings Modal (Hugging Face Serverless Token & Mode Config)
// ==============================================================================

function initSettingsModal() {
  const settingsBtn = document.getElementById("openSettingsBtn");
  if (!settingsBtn) return;

  // Create Modal element if not present
  let modal = document.getElementById("aiSettingsModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "aiSettingsModal";
    modal.style.cssText = `
      display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6);
      backdrop-filter: blur(4px); z-index: 10000; align-items: center; justify-content: center;
    `;
    modal.innerHTML = `
      <div style="background: var(--card-bg, #ffffff); color: var(--text-main, #0f172a); border-radius: 14px; max-width: 520px; width: 90%; padding: 1.5rem; box-shadow: 0 20px 40px rgba(0,0,0,0.25); border: 1px solid var(--border-subtle, #e2e8f0);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1.15rem; display: flex; align-items: center; gap: 0.5rem; margin: 0;">
            <i class="fa-solid fa-sliders" style="color: #0284c7;"></i> AI Inference Configuration
          </h3>
          <button id="closeSettingsModal" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-muted);">&times;</button>
        </div>

        <div style="margin-bottom: 1rem;">
          <label style="font-weight: 600; font-size: 0.82rem; display: block; margin-bottom: 0.35rem;">Inference Engine Mode</label>
          <select id="settingInferenceMode" class="form-input" style="width: 100%; padding: 0.5rem; border-radius: 8px; border: 1px solid var(--border-subtle, #cbd5e1);">
            <option value="auto">⚡ Auto (HF Serverless with In-Browser Fallback)</option>
            <option value="clientside_js">💻 Client-Side In-Browser Engine (Instant & Offline)</option>
            <option value="hf_serverless">☁️ Hugging Face Serverless Cloud API Only</option>
          </select>
        </div>

        <div style="margin-bottom: 1.2rem;">
          <label style="font-weight: 600; font-size: 0.82rem; display: block; margin-bottom: 0.35rem;">
            Hugging Face Access Token (Optional)
          </label>
          <input type="password" id="settingHfToken" placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxx" class="form-input" style="width: 100%; padding: 0.5rem; border-radius: 8px; border: 1px solid var(--border-subtle, #cbd5e1); font-family: monospace;">
          <p style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.35rem;">
            Optional. Stored locally in your browser. Leaving this empty uses our client-side WebAssembly/Canvas neural engine with zero external API calls.
          </p>
        </div>

        <div style="background: var(--bg-subtle, #f8fafc); border-radius: 8px; padding: 0.8rem; margin-bottom: 1.2rem; font-size: 0.76rem; border: 1px solid var(--border-subtle, #e2e8f0);">
          <div style="display: flex; align-items: center; gap: 0.4rem; font-weight: 600; color: #059669; margin-bottom: 0.25rem;">
            <i class="fa-solid fa-circle-check"></i> Serverless Static Deployment Active
          </div>
          <div>All computer vision, leaf pathology, perimeter intrusion sentry, and flood hydraulics run directly in your browser or through CORS serverless endpoints.</div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.6rem;">
          <button id="btnSaveSettings" class="btn-primary" style="padding: 0.5rem 1.2rem; font-size: 0.85rem;">Save & Apply</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById("closeSettingsModal").addEventListener("click", () => {
      modal.style.display = "none";
    });

    document.getElementById("btnSaveSettings").addEventListener("click", () => {
      const mode = document.getElementById("settingInferenceMode").value;
      const token = document.getElementById("settingHfToken").value.trim();
      YuktiAIEngine.setInferenceMode(mode);
      YuktiAIEngine.setHfToken(token);
      showToast("AI Inference configuration updated!", "success");
      modal.style.display = "none";
    });
  }

  settingsBtn.addEventListener("click", () => {
    document.getElementById("settingInferenceMode").value = YuktiAIEngine.getInferenceMode();
    document.getElementById("settingHfToken").value = YuktiAIEngine.getHfToken();
    modal.style.display = "flex";
  });
}
