/**
 * Yukti AI - Precision Agriculture & Intelligent Monitoring
 * Interactive Dashboard Frontend Application Logic (Clean White Theme & 6-Hour Automation)
 */

let currentOverviewChart = null;
let currentPlantFile = null;
let currentPlantSample = null;
let currentIntrusionFile = null;
let currentIntrusionSample = null;
let currentDamageFile = null;
let currentDamageSample = null;
let currentCsvFile = null;

let remainingCountdownSeconds = 3 * 3600;

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
});

// Live UTC/Local Clock
function initClock() {
  const clockEl = document.getElementById("liveClock");
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
// 6-Hour Autonomous Engine Controller
// ==============================================================================

function initAutomationEngine() {
  const triggerBtn = document.getElementById("triggerSyncBtn");
  if (triggerBtn) {
    triggerBtn.addEventListener("click", triggerAutonomousCycle);
  }

  // Poll automation status periodically
  fetchAutomationStatus();
  setInterval(fetchAutomationStatus, 15000);

  // Local second ticker for countdown
  setInterval(() => {
    if (remainingCountdownSeconds > 0) {
      remainingCountdownSeconds--;
      updateCountdownDisplay(remainingCountdownSeconds);
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

async function fetchAutomationStatus() {
  try {
    const res = await fetch("/api/automation/status");
    const data = await res.json();
    remainingCountdownSeconds = data.next_sync_in_seconds || (3 * 3600);
    updateCountdownDisplay(remainingCountdownSeconds);

    if (data.latest_summary) {
      renderAutomationReport(data.latest_summary);
    }
  } catch (err) {
    console.error("Failed to fetch automation status:", err);
  }
}

function renderAutomationReport(summary) {
  const tsEl = document.getElementById("autoReportTimestamp");
  const srcEl = document.getElementById("autoReportSource");
  const recEl = document.getElementById("autoReportRecords");
  const waterEl = document.getElementById("autoReportWater");
  const actEl = document.getElementById("autoReportAction");

  if (tsEl) tsEl.textContent = `Last cycle executed at: ${summary.timestamp}`;
  if (srcEl) srcEl.textContent = summary.source || "IoT Gateway Auto-Poll";
  if (recEl) recEl.textContent = `${summary.records_processed} Sector Packets`;
  if (waterEl) waterEl.textContent = `${summary.avg_water_level_cm} cm (Avg Depth)`;
  if (actEl) actEl.textContent = summary.automated_action || "Sluices & Drip nominal.";
}

async function triggerAutonomousCycle() {
  const btn = document.getElementById("triggerSyncBtn");
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Running Autonomous 6-Hr Ingestion...`;

  try {
    const res = await fetch("/api/automation/trigger", { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Autonomous cycle failed");

    showToast("Autonomous 6-Hour AI Ingestion & Analysis Completed!", "success");
    await fetchOverviewData();
    await fetchAutomationStatus();
    await initWaterLevels();
    await initActivityLog();
    await initSensorRecords();
  } catch (err) {
    showToast(`Automation error: ${err.message}`, "danger");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-bolt-lightning"></i> Trigger 6-Hour Sync Now`;
  }
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
// Overview Dashboard & Chart.js (Clean White Theme)
// ==============================================================================

async function initOverview() {
  const refreshBtn = document.getElementById("refreshOverviewBtn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      fetchOverviewData();
      showToast("Telemetry metrics refreshed", "success");
    });
  }
  await fetchOverviewData();
}

async function fetchOverviewData() {
  try {
    const res = await fetch("/api/overview-metrics");
    const data = await res.json();

    if (data.water_level_avg !== undefined) {
      const waterKpi = document.getElementById("kpiWaterLevel");
      if (waterKpi) waterKpi.textContent = `${data.water_level_avg} cm`;

      const tankFill = document.getElementById("tankLevelFill");
      const depthLabel = document.getElementById("tankDepthLabel");
      if (tankFill) {
        // 0 to 60cm range
        const pct = Math.min(100, Math.max(5, (data.water_level_avg / 60.0) * 100));
        tankFill.style.height = `${pct}%`;
      }
      if (depthLabel) depthLabel.textContent = `${data.water_level_avg} cm`;
    }

    if (data.soil_moisture_avg !== undefined) {
      const moistureKpi = document.getElementById("kpiMoisture");
      if (moistureKpi) moistureKpi.textContent = `${data.soil_moisture_avg}%`;
    }

    if (data.automation && data.automation.latest_summary) {
      renderAutomationReport(data.automation.latest_summary);
    }

    if (data.recent_telemetry && data.recent_telemetry.length > 0) {
      renderOverviewChart(data.recent_telemetry);
    }
  } catch (err) {
    console.error("Failed to fetch overview:", err);
  }
}

function renderOverviewChart(telemetry) {
  const ctx = document.getElementById("overviewChart");
  if (!ctx) return;

  const labels = telemetry.map((r, i) => r.timestamp ? r.timestamp.split(" ")[1].slice(0, 5) : `T-${telemetry.length - i}`);
  const waterLevel = telemetry.map(r => r.water_level_cm || 0);
  const moisture = telemetry.map(r => r.soil_moisture_pct || 0);

  if (currentOverviewChart) {
    currentOverviewChart.destroy();
  }

  currentOverviewChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Water Depth (cm)",
          data: waterLevel,
          borderColor: "#0284c7",
          backgroundColor: "rgba(2, 132, 199, 0.12)",
          borderWidth: 2.5,
          tension: 0.35,
          fill: true,
          yAxisID: "y"
        },
        {
          label: "Soil Moisture (%)",
          data: moisture,
          borderColor: "#059669",
          backgroundColor: "rgba(5, 150, 105, 0.1)",
          borderWidth: 2,
          borderDash: [5, 5],
          tension: 0.35,
          fill: false,
          yAxisID: "y1"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false
      },
      plugins: {
        legend: {
          labels: { color: "#334155", font: { family: "Inter", size: 12, weight: "600" } }
        }
      },
      scales: {
        x: {
          grid: { color: "#f1f5f9" },
          ticks: { color: "#64748b", font: { family: "JetBrains Mono", size: 11 } }
        },
        y: {
          type: "linear",
          display: true,
          position: "left",
          title: { display: true, text: "Water Depth (cm)", color: "#0284c7", font: { weight: "600" } },
          grid: { color: "#e2e8f0" },
          ticks: { color: "#334155" }
        },
        y1: {
          type: "linear",
          display: true,
          position: "right",
          title: { display: true, text: "Soil Moisture (%)", color: "#059669", font: { weight: "600" } },
          grid: { drawOnChartArea: false },
          ticks: { color: "#334155" }
        }
      }
    }
  });
}

// ==============================================================================
// Water Level & Hydraulic Station Tab
// ==============================================================================

async function initWaterLevels() {
  try {
    const res = await fetch("/api/water-levels");
    const data = await res.json();
    const tbody = document.getElementById("waterLevelTableBody");
    const overviewList = document.getElementById("overviewPaddockList");

    if (data.fields) {
      if (tbody) tbody.innerHTML = "";
      if (overviewList) overviewList.innerHTML = "";

      for (const [key, f] of Object.entries(data.fields)) {
        let badgeCls = "badge-success";
        if (f.status.includes("Elevated") || f.level_cm >= 20) badgeCls = "badge-warning";
        if (f.status.includes("Critical") || f.level_cm >= 30) badgeCls = "badge-danger";

        // Table row
        if (tbody) {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td><strong>${f.name}</strong></td>
            <td class="mono-cell" style="font-weight: 700; color: #0284c7;">${f.level_cm} cm</td>
            <td class="mono-cell">${f.moisture_pct}%</td>
            <td><span class="badge ${badgeCls}">${f.status}</span></td>
            <td>${f.level_cm > 20 ? 'Sluice Open (35%)' : 'Gravity Flow (Closed)'}</td>
          `;
          tbody.appendChild(tr);
        }

        // Overview sidebar item
        if (overviewList) {
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
        }
      }
    }
  } catch (err) {
    console.error("Failed to load water levels:", err);
  }
}

// ==============================================================================
// Drag & Drop File Upload Handlers
// ==============================================================================

function initDropzones() {
  setupDropzone("plantDropzone", "plantFileInput", (file) => {
    currentPlantFile = file;
    currentPlantSample = null;
    showToast(`Loaded leaf file: ${file.name}`, "info");
  });

  setupDropzone("intrusionDropzone", "intrusionFileInput", (file) => {
    currentIntrusionFile = file;
    currentIntrusionSample = null;
    showToast(`Loaded sentry frame: ${file.name}`, "info");
  });

  setupDropzone("damageDropzone", "damageFileInput", (file) => {
    currentDamageFile = file;
    currentDamageSample = null;
    showToast(`Loaded drone orthophoto: ${file.name}`, "info");
  });

  setupDropzone("csvDropzone", "csvFileInput", (file) => {
    currentCsvFile = file;
    showToast(`Loaded telemetry CSV: ${file.name}`, "info");
  });

  // Action Button Listeners
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
  zone.style.borderColor = "var(--emerald-primary)";
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
// 1. Plant Health Prediction
// ==============================================================================

async function runPlantHealthPrediction() {
  const btn = document.getElementById("runPlantHealthBtn");
  if (!currentPlantFile && !currentPlantSample) {
    showToast("Please select an image or click a sample first", "warning");
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Running Neural Classifier...`;

  try {
    let res;
    if (currentPlantFile) {
      const fd = new FormData();
      fd.append("file", currentPlantFile);
      res = await fetch("/api/predict/plant-health", { method: "POST", body: fd });
    } else {
      res = await fetch("/api/predict/plant-health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sample_name: currentPlantSample })
      });
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Inference failed");

    document.getElementById("plantPlaceholder").style.display = "none";
    document.getElementById("plantResultContent").style.display = "block";
    document.getElementById("plantPreviewImg").src = data.preview_image;
    document.getElementById("plantConditionTitle").textContent = data.condition_display;
    document.getElementById("plantConfidenceText").textContent = `Confidence: ${data.confidence}%`;

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

    showToast(`Plant diagnosed: ${data.condition_display} (${data.confidence}%)`, "success");
    initActivityLog();

  } catch (err) {
    showToast(`Diagnostic failed: ${err.message}`, "danger");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Diagnose Plant Health`;
  }
}

// ==============================================================================
// 2. Intrusion & Wildlife Sentry
// ==============================================================================

async function runIntrusionPrediction() {
  const btn = document.getElementById("runIntrusionBtn");
  if (!currentIntrusionFile && !currentIntrusionSample) {
    showToast("Please upload a camera capture or pick the sample frame", "warning");
    return;
  }

  const confThresh = (parseFloat(document.getElementById("confThreshSlider").value) / 100.0).toFixed(2);

  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Scanning Sentry Perimeter...`;

  try {
    let res;
    if (currentIntrusionFile) {
      const fd = new FormData();
      fd.append("file", currentIntrusionFile);
      fd.append("conf_thresh", confThresh);
      res = await fetch("/api/predict/intrusion", { method: "POST", body: fd });
    } else {
      res = await fetch("/api/predict/intrusion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sample_name: currentIntrusionSample, conf_thresh: confThresh })
      });
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Inference failed");

    document.getElementById("intrusionPlaceholder").style.display = "none";
    document.getElementById("intrusionResultContent").style.display = "block";
    document.getElementById("intrusionAnnotatedImg").src = data.annotated_image;
    document.getElementById("intrusionThreatTitle").textContent = data.threat_level;
    document.getElementById("intrusionCountBadge").textContent = `${data.total_detected} Targets Detected`;

    const tableBody = document.getElementById("intrusionTableBody");
    tableBody.innerHTML = "";

    if (data.detections.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-dim);">No entities detected at ${Math.round(confThresh * 100)}% threshold.</td></tr>`;
    } else {
      data.detections.forEach((d, idx) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${idx + 1}</td>
          <td><span class="badge" style="background: #f1f5f9; border: 1px solid ${d.color}; color: ${d.color};">${d.class_display}</span></td>
          <td class="mono-cell">${d.confidence}%</td>
          <td class="mono-cell">[${d.box.join(", ")}]</td>
        `;
        tableBody.appendChild(row);
      });
    }

    showToast(`Sentry scan finished: ${data.total_detected} targets found`, data.threat_level === "High Alert" ? "warning" : "success");
    initActivityLog();

  } catch (err) {
    showToast(`Sentry detection failed: ${err.message}`, "danger");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-crosshairs"></i> Run Intruder Detection`;
  }
}

// ==============================================================================
// 3. Aerial Crop Damage Segmentation
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
    let res;
    if (currentDamageFile) {
      const fd = new FormData();
      fd.append("file", currentDamageFile);
      res = await fetch("/api/predict/crop-damage", { method: "POST", body: fd });
    } else {
      res = await fetch("/api/predict/crop-damage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sample_name: currentDamageSample })
      });
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Inference failed");

    document.getElementById("damagePlaceholder").style.display = "none";
    document.getElementById("damageResultContent").style.display = "block";
    document.getElementById("damageCompositeImg").src = data.composite_image;

    document.getElementById("segHealthyPct").textContent = `${data.healthy_pct}%`;
    document.getElementById("segPestPct").textContent = `${data.pest_pct}%`;
    document.getElementById("segMechPct").textContent = `${data.mechanical_pct}%`;
    const soil = data.distribution.find(d => d.class_id === 0);
    document.getElementById("segSoilPct").textContent = `${soil ? soil.percentage : 0}%`;

    document.getElementById("statDamagedHa").textContent = `${data.damaged_hectares} Ha (${data.damaged_pct}%)`;
    document.getElementById("statYieldLoss").textContent = `-${data.estimated_yield_loss_pct}% Estimated Penalty`;

    showToast(`Segmentation completed: ${data.healthy_pct}% healthy canopy`, "success");
    initActivityLog();

  } catch (err) {
    showToast(`Damage segmentation failed: ${err.message}`, "danger");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-chart-area"></i> Run Segmentation & Loss Assessment`;
  }
}

// ==============================================================================
// 4. Flood Early Warning & Water Level Risk
// ==============================================================================

async function runFloodSimulation() {
  const btn = document.getElementById("runFloodSimulationBtn");
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Running Hydraulic Model...`;

  const payload = {
    soil_moisture_pct: parseFloat(document.getElementById("sliderMoisture").value),
    water_level_cm: parseFloat(document.getElementById("sliderWaterLevel").value),
    rainfall_mm_per_hr: parseFloat(document.getElementById("sliderRainRate").value),
    cumulative_rain_24h_mm: parseFloat(document.getElementById("sliderCumulativeRain").value),
    drainage_flow_rate_lps: parseFloat(document.getElementById("sliderDrainage").value),
    river_distance_m: parseFloat(document.getElementById("sliderRiverDist").value)
  };

  try {
    const res = await fetch("/api/predict/flood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Prediction failed");

    document.getElementById("floodStatusTitle").textContent = data.status;
    const badge = document.getElementById("floodStatusBadge");
    badge.className = `badge ${data.badge_class}`;
    badge.textContent = data.status.split(" ")[0];

    document.getElementById("floodProbNormal").textContent = `${data.probabilities.normal}%`;
    document.getElementById("barFloodNormal").style.width = `${data.probabilities.normal}%`;

    document.getElementById("floodProbWarning").textContent = `${data.probabilities.warning}%`;
    document.getElementById("barFloodWarning").style.width = `${data.probabilities.warning}%`;

    document.getElementById("floodProbCritical").textContent = `${data.probabilities.critical}%`;
    document.getElementById("barFloodCritical").style.width = `${data.probabilities.critical}%`;

    document.getElementById("floodPumpAction").textContent = data.pump_action;
    document.getElementById("floodAdvisoryText").textContent = data.advisory;

    showToast(`Flood risk: ${data.status}`, data.risk_code === 2 ? "danger" : (data.risk_code === 1 ? "warning" : "success"));
    initActivityLog();

  } catch (err) {
    showToast(`Flood evaluation failed: ${err.message}`, "danger");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-bolt"></i> Evaluate Real-Time Flood Risk & Pump Protocol`;
  }
}

async function runBatchCSVUpload() {
  const btn = document.getElementById("runBatchCSVBtn");
  if (!currentCsvFile) {
    showToast("Please drag & drop or select a telemetry CSV file first", "warning");
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Batch Evaluating Telemetry Rows...`;

  const fd = new FormData();
  fd.append("file", currentCsvFile);

  try {
    const res = await fetch("/api/upload/sensor-csv", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Batch upload failed");

    const resultCard = document.getElementById("csvResultCard");
    resultCard.style.display = "block";

    document.getElementById("csvSummaryText").textContent = `${data.total_records} records processed successfully`;

    const badgesGroup = document.getElementById("csvBadgesGroup");
    badgesGroup.innerHTML = `
      <span class="badge badge-success">${data.summary_counts.normal} Safe (${data.summary_percentages.normal}%)</span>
      <span class="badge badge-warning">${data.summary_counts.warning} Warning (${data.summary_percentages.warning}%)</span>
      <span class="badge badge-danger">${data.summary_counts.critical} Critical (${data.summary_percentages.critical}%)</span>
    `;

    const tbody = document.getElementById("csvTableBody");
    tbody.innerHTML = "";

    data.records.forEach(r => {
      const tr = document.createElement("tr");
      let badgeCls = "badge-success";
      if (r.risk_label === "WARNING") badgeCls = "badge-warning";
      if (r.risk_label === "CRITICAL") badgeCls = "badge-danger";

      tr.innerHTML = `
        <td class="mono-cell">${r.timestamp || "--"}</td>
        <td><strong>${r.field_id || "--"}</strong></td>
        <td class="mono-cell">${r.soil_moisture_pct}%</td>
        <td class="mono-cell" style="font-weight: 700; color: #0284c7;">${r.water_level_cm} cm</td>
        <td class="mono-cell">${r.rainfall_mm_per_hr} mm/h</td>
        <td><span class="badge ${badgeCls}">${r.risk_label}</span></td>
        <td class="mono-cell" style="color: ${r.critical_prob_pct > 50 ? '#dc2626' : '#059669'}">${r.critical_prob_pct}%</td>
      `;
      tbody.appendChild(tr);
    });

    showToast(`Processed ${data.total_records} sensor records!`, "success");
    initActivityLog();

  } catch (err) {
    showToast(`CSV evaluation failed: ${err.message}`, "danger");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-play"></i> Ingest & Batch Evaluate Telemetry`;
  }
}

// ==============================================================================
// 5. Activity Log & Sensor Telemetry Records
// ==============================================================================

async function initActivityLog() {
  try {
    const res = await fetch("/api/history");
    const data = await res.json();
    const tbody = document.getElementById("activityLogTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";
    if (data.history.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-dim);">No activity logged yet.</td></tr>`;
      return;
    }

    data.history.forEach(act => {
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
  } catch (err) {
    console.error("Failed to load activity log:", err);
  }
}

async function clearActivityLog() {
  try {
    await fetch("/api/history/clear", { method: "POST" });
    showToast("Activity history cleared", "info");
    initActivityLog();
  } catch (err) {
    showToast("Failed to clear history", "danger");
  }
}

async function initSensorRecords() {
  try {
    const res = await fetch("/api/sensor-records");
    const data = await res.json();
    const tbody = document.getElementById("sensorRecordsTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";
    if (!data.records || data.records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--text-dim);">No sensor records found in dataset.</td></tr>`;
      return;
    }

    data.records.forEach(r => {
      const tr = document.createElement("tr");
      const riskClass = r.flood_risk_level === 2 ? "badge-danger" : (r.flood_risk_level === 1 ? "badge-warning" : "badge-success");
      const riskLabel = r.flood_risk_level === 2 ? "CRITICAL" : (r.flood_risk_level === 1 ? "WARNING" : "NORMAL");

      tr.innerHTML = `
        <td class="mono-cell">${r.timestamp || "--"}</td>
        <td><strong>${r.field_id || "--"}</strong></td>
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
  } catch (err) {
    console.error("Failed to load sensor records:", err);
  }
}

// ==============================================================================
// Dark and Light Mode Theme Controller
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
      if (themeIcon) {
        themeIcon.className = "fa-solid fa-sun theme-toggle-icon";
      }
      if (themeLabel) themeLabel.textContent = typeof t === "function" ? t("nav.theme_light") : "Light";
      localStorage.setItem("yukti_theme", "dark");
      if (notify) showToast("Switched to Sleek Dark Theme", "info");
    } else {
      document.body.removeAttribute("data-theme");
      if (themeIcon) {
        themeIcon.className = "fa-solid fa-moon theme-toggle-icon";
      }
      if (themeLabel) themeLabel.textContent = typeof t === "function" ? t("nav.theme_dark") : "Dark";
      localStorage.setItem("yukti_theme", "light");
      if (notify) showToast("Switched to Crisp Light Theme", "info");
    }
  }
}

// ==============================================================================
// IoT Microcontroller Gateway & Image Sharing Handler
// ==============================================================================

let currentCameraFile = null;

function initIotGateway() {
  // 1. Sync live slider value labels for IoT Simulator
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

  // 2. Transmit Telemetry Feed Button
  const btnSubmitIot = document.getElementById("btnSubmitIotFeed");
  if (btnSubmitIot) {
    btnSubmitIot.addEventListener("click", submitIotTelemetry);
  }

  // 3. Camera Dropzone & File Input
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

  // 4. Upload Camera Feed & Share Button
  const btnUploadCamera = document.getElementById("btnUploadCameraFeed");
  if (btnUploadCamera) {
    btnUploadCamera.addEventListener("click", uploadCameraFeed);
  }

  // 5. Copy Share URL Button
  const btnCopyShareUrl = document.getElementById("btnCopyShareUrl");
  if (btnCopyShareUrl) {
    btnCopyShareUrl.addEventListener("click", () => {
      const input = document.getElementById("shareUrlDisplay");
      if (input && input.value) {
        navigator.clipboard.writeText(input.value).then(() => {
          showToast("Shareable link copied to clipboard!", "success");
        }).catch(() => {
          input.select();
          document.execCommand("copy");
          showToast("Shareable link copied!", "success");
        });
      }
    });
  }

  // 6. Code Snippet Tab Switcher
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

  // 7. Copy Code Snippet Button
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

  // 8. Shared Gallery Loader
  const refreshGalleryBtn = document.getElementById("refreshSharedGalleryBtn");
  if (refreshGalleryBtn) {
    refreshGalleryBtn.addEventListener("click", loadSharedGallery);
  }
  loadSharedGallery();
}

async function submitIotTelemetry() {
  const btn = document.getElementById("btnSubmitIotFeed");
  const deviceId = document.getElementById("iotDeviceId").value.trim() || "ESP32-NODE-01";
  const fieldId = document.getElementById("iotFieldId").value;
  const waterLevel = parseFloat(document.getElementById("iotWaterLevel").value);
  const soilMoisture = parseFloat(document.getElementById("iotSoilMoisture").value);
  const rainfall = parseFloat(document.getElementById("iotRainfall").value);
  const temp = parseFloat(document.getElementById("iotTemp").value) || 26.0;

  const originalHtml = btn.innerHTML;
  btn.innerHTML = `<span class="spinner"></span> Transmitting to /api/iot/feed...`;
  btn.disabled = true;

  try {
    const payload = {
      device_id: deviceId,
      field_id: fieldId,
      water_level_cm: waterLevel,
      soil_moisture_pct: soilMoisture,
      rainfall_mm_per_hr: rainfall,
      temperature_c: temp,
      humidity_pct: 65.0,
      drainage_flow_rate_lps: 6.0,
      river_distance_m: 100.0
    };

    const res = await fetch("/api/iot/feed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.status === "success") {
      showToast(`Telemetry Ingested from ${deviceId}! Risk: ${data.prediction.risk_label}`, "success");

      const responseWrapper = document.getElementById("iotFeedResponseWrapper");
      const riskEl = document.getElementById("resRiskLabel");
      const pumpEl = document.getElementById("resPumpCmd");
      const sluiceEl = document.getElementById("resSluicePos");
      const advisoryEl = document.getElementById("resAdvisory");

      if (responseWrapper) responseWrapper.style.display = "block";
      if (riskEl) {
        riskEl.textContent = data.prediction.risk_label;
        riskEl.style.color = data.prediction.risk_code === 2 ? "#dc2626" : (data.prediction.risk_code === 1 ? "#d97706" : "#059669");
      }
      if (pumpEl) pumpEl.textContent = data.actuator_directives.pump_command;
      if (sluiceEl) sluiceEl.textContent = `${data.actuator_directives.sluice_position_pct}%`;
      if (advisoryEl) advisoryEl.textContent = data.actuator_directives.advisory;

      // Refresh overview, water levels, and sensor tables dynamically
      initWaterLevels();
      initActivityLog();
      initSensorRecords();
    } else {
      showToast(data.message || "IoT transmission failed", "danger");
    }
  } catch (err) {
    showToast(`Transmission error: ${err.message}`, "danger");
  } finally {
    btn.innerHTML = originalHtml;
    btn.disabled = false;
  }
}

async function uploadCameraFeed() {
  const btn = document.getElementById("btnUploadCameraFeed");
  const deviceId = document.getElementById("cameraDeviceId").value.trim() || "CAM_01";
  const task = document.getElementById("cameraTaskSelect").value;

  if (!currentCameraFile) {
    showToast("Please select or drop an image first!", "warning");
    return;
  }

  const originalHtml = btn.innerHTML;
  btn.innerHTML = `<span class="spinner"></span> Transmitting & Analyzing...`;
  btn.disabled = true;

  try {
    const formData = new FormData();
    formData.append("file", currentCameraFile);
    formData.append("device_id", deviceId);
    formData.append("task", task);

    const res = await fetch("/api/iot/image-feed", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    if (data.status === "success") {
      showToast("Image captured, analyzed & shareable link ready!", "success");

      const resultBox = document.getElementById("cameraShareResultBox");
      const shareUrlInput = document.getElementById("shareUrlDisplay");
      const openShareUrl = document.getElementById("btnOpenShareUrl");
      const diagBadge = document.getElementById("shareDiagnosisBadge");

      const fullShareUrl = window.location.origin + data.share_url;

      if (resultBox) resultBox.style.display = "block";
      if (shareUrlInput) shareUrlInput.value = fullShareUrl;
      if (openShareUrl) openShareUrl.href = data.share_url;

      if (diagBadge && data.ai_result) {
        diagBadge.textContent = `${data.ai_result.diagnosis || 'Analyzed'} (${data.ai_result.confidence_pct || 95}%)`;
      }

      loadSharedGallery();
      initActivityLog();
    } else {
      showToast(data.message || "Failed to upload image", "danger");
    }
  } catch (err) {
    showToast(`Upload error: ${err.message}`, "danger");
  } finally {
    btn.innerHTML = originalHtml;
    btn.disabled = false;
  }
}

async function loadSharedGallery() {
  const container = document.getElementById("sharedGalleryContainer");
  if (!container) return;

  try {
    const res = await fetch("/api/shared-images");
    const data = await res.json();

    if (!data.images || data.images.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: var(--text-muted); background: var(--bg-subtle); border-radius: 10px; border: 1px dashed var(--border-medium);">
          <i class="fa-solid fa-camera" style="font-size: 2rem; margin-bottom: 0.5rem; color: var(--text-dim); display: block;"></i>
          No shared field camera captures yet. Transmit an image using the form above or via the <code>/api/iot/image-feed</code> API.
        </div>
      `;
      return;
    }

    container.innerHTML = "";
    data.images.slice().reverse().forEach(img => {
      const card = document.createElement("div");
      card.className = "shared-gallery-card";
      const diag = img.result && img.result.diagnosis ? img.result.diagnosis : "Field Capture";
      const conf = img.result && img.result.confidence_pct ? `${img.result.confidence_pct}%` : "Verified";

      card.innerHTML = `
        <div class="shared-gallery-thumb">
          <img src="${img.url}" alt="${diag}">
        </div>
        <div class="shared-gallery-info">
          <div class="shared-gallery-title">
            <span>${diag}</span>
            <span class="badge badge-success" style="font-size: 0.7rem;">${conf}</span>
          </div>
          <div class="shared-gallery-meta">
            Node: ${img.device_id} • ${img.timestamp}
          </div>
          <div class="shared-gallery-btn">
            <a href="${img.share_url}" target="_blank" style="color: #059669; font-size: 0.82rem; font-weight: 600; text-decoration: none; display: flex; align-items: center; gap: 0.35rem;">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> Open Public View
            </a>
            <button class="btn-secondary" onclick="navigator.clipboard.writeText(window.location.origin + '${img.share_url}'); showToast('Share link copied!', 'success');" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;">
              <i class="fa-solid fa-copy"></i>
            </button>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to load shared gallery:", err);
  }
}

