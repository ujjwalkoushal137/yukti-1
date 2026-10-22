/**
 * Yukti AI - Multilingual Localization (English, हिन्दी - Hindi, ਪੰਜਾਬੀ - Punjabi)
 * Complete i18n Translation Dictionary and Runtime Switcher
 */

const TRANSLATIONS = {
  en: {
    // Brand & Header
    "brand.title": "Yukti AI",
    "brand.subtitle": "Autonomous Precision Agriculture & Field Intelligence",
    "nav.autopilot_full": "3-Hour AI Autopilot: <strong>ACTIVE</strong>",
    "nav.autopilot_compact": "3h AI",
    "nav.theme_dark": "Dark",
    "nav.theme_light": "Light",

    // Banner
    "banner.watcher": "AI Autonomous Watcher: Ingesting & processing telemetry every <strong>3 hours</strong>",
    "banner.next_sync": "Next Automated Ingestion in:",
    "banner.trigger_btn": "Trigger 3-Hour Sync Now",

    // Tabs
    "tab.overview": "Overview & Metrics",
    "tab.iot": "IoT Microcontroller & Camera Feed",
    "tab.water": "Water Level & Hydraulics",
    "tab.plant": "Plant Health Diagnostic",
    "tab.intrusion": "Intrusion & Wildlife Sentry",
    "tab.damage": "Aerial Damage Segmentation",
    "tab.flood": "Flood Risk & Actuation",
    "tab.datalog": "Telemetry & Activity Logs",

    // Overview Tab
    "overview.title": "Farm Intelligence Overview",
    "overview.subtitle": "Real-time situational telemetry, automated water levels, and neural inference performance.",
    "overview.refresh_btn": "Refresh Telemetry",
    "kpi.water_title": "Optimal Irrigation Level",
    "kpi.water_status": "Optimal Depth (<15 cm)",
    "kpi.alerts_title": "Active Sentry Alerts",
    "kpi.alerts_status": "Wildlife detected in Sec 4",
    "kpi.moisture_title": "Soil Moisture Mean",
    "kpi.moisture_status": "Vegetative Root Zone",
    "kpi.accuracy_title": "Multi-Modal Inference",
    "kpi.accuracy_status": "Continuous Self-Check",
    "chart.water_vs_moisture": "Water Level (cm) vs Soil Moisture Trend",
    "chart.sync_badge": "3-Hr Auto-Synchronized",
    "gauge.title": "Live Water Level Gauge",
    "gauge.badge": "Paddock Depths",
    "gauge.mean_depth": "Mean Water Depth",
    "report.title": "Latest 3-Hour AI Ingestion & Analysis Report",
    "report.cycle_done": "Cycle Completed",
    "report.source_label": "Data Source Detected",
    "report.records_label": "Records Ingested",
    "report.water_label": "Avg Water Depth",
    "report.action_label": "Automated Hydraulic Action",

    // Water Level Tab
    "water.title": "Canal & Paddock Water Level Management",
    "water.subtitle": "Real-time water depth gauges, sluice gate positions, and automated irrigation canal telemetry.",
    "water.badge": "Ultrasonic Depth Transducers Online",
    "water.table_title": "Paddock Water Level Breakdown",
    "water.col_sector": "Sector / Field",
    "water.col_level": "Water Level (cm)",
    "water.col_moisture": "Soil Moisture",
    "water.col_status": "Safety Status",
    "water.col_valve": "Automated Valve",

    // Plant Health Tab
    "plant.title": "Neural Foliar Health & Pathology Diagnostic",
    "plant.subtitle": "Deep CNN classification of crop leaf lesions with targeted agronomic remediation prescriptions.",
    "plant.model_badge": "CNN Foliar Classifier v2.4",
    "plant.dropzone_title": "Drop leaf photograph here",
    "plant.dropzone_or": "or",
    "plant.dropzone_browse": "browse local file",
    "plant.dropzone_hint": "Supports High-Res JPG, PNG from field cameras & smartphones",
    "plant.sample_title": "Or test instant field samples:",
    "plant.sample_healthy": "Healthy Leaf",
    "plant.sample_blight": "Leaf Blight",
    "plant.sample_rust": "Rust Disease",
    "plant.analyze_btn": "Run Neural Pathology Diagnosis",
    "plant.results_placeholder": "Upload or select a leaf specimen to view AI foliar diagnostics",
    "plant.action_protocol_title": "Agronomic Action Protocol & Remedy:",

    // Intrusion Tab
    "intrusion.title": "Perimeter Intrusion & Wildlife Sentry",
    "intrusion.subtitle": "Real-time automated edge detection of wild boars, stray cattle, deer, and human trespassers.",
    "intrusion.model_badge": "Sentry Object Detector (YOLO/PyTorch)",
    "intrusion.dropzone_title": "Drop trail cam / perimeter frame here",
    "intrusion.sample_title": "Or test sentry test capture:",
    "intrusion.sample_btn": "Field Intrusion Scene",
    "intrusion.analyze_btn": "Analyze Perimeter Frame",
    "intrusion.placeholder": "Upload a camera capture to initiate perimeter threat localization",

    // Damage Tab
    "damage.title": "Aerial Drone Crop Damage Segmentation",
    "damage.subtitle": "Multi-spectral pixel-level segmentation mapping flood submersion, wind lodging, drought stress, and pest vectors.",
    "damage.model_badge": "Aerial UNet Damage Segmenter",
    "damage.dropzone_title": "Drop aerial drone / satellite capture here",
    "damage.sample_btn": "Aerial Field Survey",
    "damage.analyze_btn": "Segment Crop Damage Zones",
    "damage.placeholder": "Upload an aerial or multispectral capture to visualize crop damage zones",

    // Flood Tab
    "flood.title": "Predictive Flood Early Warning & Canal Actuation",
    "flood.subtitle": "Multi-variate predictive modeling for waterlogging hazards, soil saturation, and emergency pump control.",
    "flood.model_badge": "Predictive Flood Classifier",
    "flood.simulator_title": "Field Hydrological Telemetry Simulator",
    "flood.run_btn": "Evaluate Flood Risk & Compute Directives",
    "flood.batch_title": "Batch Field Sensor Ingestion (CSV Upload)",
    "flood.download_sample": "Download Sample CSV",

    // Telemetry & Logs Tab
    "logs.title": "Telemetry Records & Audit Logs",
    "logs.subtitle": "Full historical activity log of user uploads, automated 3-hour cycles, and IoT sensor records.",
    "logs.clear_btn": "Clear Activity History",
    "logs.activity_title": "Unified AI Inference & Autonomous Cycle Activity Stream",
    "logs.dataset_title": "Persistent Field Sensor Telemetry (Dataset View)",

    // IoT Gateway Tab
    "iot.title": "Microcontroller Gateway & Camera Feed Hub",
    "iot.subtitle": "Real-time bidirectional API hub for field microcontrollers (ESP32 / Arduino / LoRa) and remote cameras with automated 3-hour AI inference.",
    "iot.hf_info_title": "Hugging Face Space & Remote Field Integration",
    "iot.hf_info_desc": "When hosted on Hugging Face Spaces (port <strong>7860</strong>), point your field microcontrollers and cameras directly to:",
    "iot.sim_title": "Microcontroller Telemetry Test Bench",
    "iot.sim_desc": "Simulate an incoming sensor packet from an ESP32 or LoRa gateway to test AI risk prediction and actuator instructions.",
    "iot.dev_id": "Device ID",
    "iot.sector": "Monitored Sector",
    "iot.water_level": "Water Level:",
    "iot.soil_moisture": "Soil Moisture:",
    "iot.rainfall": "Rainfall (mm/h):",
    "iot.temp": "Temperature (°C)",
    "iot.send_btn": "Transmit Telemetry (POST /api/iot/feed)",
    "iot.directives_title": "⚡ Returned Actuator Directives:",
    "iot.risk_status": "AI Risk Status",
    "iot.pump_directive": "Pump Directives",
    "iot.sluice_gate": "Sluice Gate",
    "iot.camera_portal_title": "Field Camera Feed & Sharing Portal",
    "iot.camera_portal_desc": "Upload field captures from ESP32-CAM, drones, or trail cameras. Yukti AI analyzes the image, generates an instant shareable link, and preserves public viewability.",
    "iot.camera_id": "Camera Node ID",
    "iot.mission": "Analysis Mission",
    "iot.mission_plant": "Foliar Diagnostic (Plant Health)",
    "iot.mission_intrusion": "Perimeter Sentry (Intrusion)",
    "iot.mission_damage": "Aerial Survey (Crop Damage)",
    "iot.camera_dropzone": "Drag camera image here or browse",
    "iot.camera_hint": "ESP32-CAM JPEG, drone photo, or trail cam capture",
    "iot.share_btn": "Transmit & Generate Shareable Link",
    "iot.share_success": "Image Shared & Analyzed",
    "iot.copy_btn": "Copy",
    "iot.code_library_title": "Microcontroller Code Library (ESP32 / Arduino / Python)",
    "iot.code_library_desc": "Copy-ready, production-grade firmware examples for your field hardware to push telemetry and photos directly to Yukti AI.",
    "iot.gallery_title": "Shared Field Captures & Remote Camera Gallery",
    "iot.gallery_subtitle": "Photographs transmitted by edge cameras with automated AI foliar and intrusion diagnoses.",
    "iot.refresh_gallery": "Refresh Gallery"
  },

  hi: {
    // Brand & Header
    "brand.title": "युक्ति एआई",
    "brand.subtitle": "स्वायत्त सटीक कृषि एवं खेत बुद्धिमत्ता प्रणाली",
    "nav.autopilot_full": "3-घंटे एआई ऑटोपायलट: <strong>सक्रिय</strong>",
    "nav.autopilot_compact": "3घं एआई",
    "nav.theme_dark": "डार्क",
    "nav.theme_light": "लाइट",

    // Banner
    "banner.watcher": "एआई स्वायत्त प्रहरी: हर <strong>3 घंटे</strong> में टेलीमेट्री विश्लेषण एवं फसल सुरक्षा भविष्यवाणी",
    "banner.next_sync": "अगला स्वचालित विश्लेषण:",
    "banner.trigger_btn": "3-घंटे सिंक तुरंत चलाएं",

    // Tabs
    "tab.overview": "अवलोकन एवं मेट्रिक्स",
    "tab.iot": "आईओटी माइक्रोकंट्रोलर एवं कैमरा",
    "tab.water": "जल स्तर एवं हाइड्रोलिक्स",
    "tab.plant": "पादप रोग निदान",
    "tab.intrusion": "घुसपैठ एवं वन्यजीव सुरक्षा",
    "tab.damage": "हवाई फसल क्षति मानचित्रण",
    "tab.flood": "बाढ़ जोखिम एवं स्वचालित पंप",
    "tab.datalog": "टेलीमेट्री एवं गतिविधि लॉग",

    // Overview Tab
    "overview.title": "खेत बुद्धिमत्ता अवलोकन",
    "overview.subtitle": "वास्तविक समय की स्थितिजन्य टेलीमेट्री, स्वचालित जल स्तर और न्यूरल एआई कार्यक्षमता।",
    "overview.refresh_btn": "टेलीमेट्री रीफ्रेश करें",
    "kpi.water_title": "अनुकूलतम सिंचाई स्तर",
    "kpi.water_status": "इष्टतम गहराई (<15 सेमी)",
    "kpi.alerts_title": "सक्रिय सुरक्षा चेतावनियां",
    "kpi.alerts_status": "सेक्टर 4 में वन्यजीव देखा गया",
    "kpi.moisture_title": "औसत मिट्टी की नमी",
    "kpi.moisture_status": "सक्रिय जड़ क्षेत्र",
    "kpi.accuracy_title": "मल्टी-मॉडल एआई सटीकता",
    "kpi.accuracy_status": "निरंतर स्व-सत्यापन",
    "chart.water_vs_moisture": "जल स्तर (सेमी) बनाम मिट्टी नमी रुझान",
    "chart.sync_badge": "3-घंटे स्वतः समकालिक",
    "gauge.title": "लाइव जल स्तर गेज",
    "gauge.badge": "खेत खंड गहराई",
    "gauge.mean_depth": "औसत जल गहराई",
    "report.title": "नवीनतम 3-घंटे एआई विश्लेषण रिपोर्ट",
    "report.cycle_done": "चक्र पूर्ण",
    "report.source_label": "डेटा स्रोत पहचाना गया",
    "report.records_label": "रिकॉर्ड संसाधित",
    "report.water_label": "औसत जल गहराई",
    "report.action_label": "स्वचालित हाइड्रोलिक कार्रवाई",

    // Water Level Tab
    "water.title": "नहर एवं खेत जल स्तर प्रबंधन",
    "water.subtitle": "वास्तविक समय के अल्ट्रासोनिक जल गेज, स्लुइस गेट की स्थिति और स्वचालित नहर टेलीमेट्री।",
    "water.badge": "अल्ट्रासोनिक ट्रांसड्यूसर ऑनलाइन",
    "water.table_title": "खेत-वार जल स्तर विवरण",
    "water.col_sector": "सेक्टर / खेत",
    "water.col_level": "जल स्तर (सेमी)",
    "water.col_moisture": "मिट्टी की नमी",
    "water.col_status": "सुरक्षा स्थिति",
    "water.col_valve": "स्वचालित वाल्व",

    // Plant Health Tab
    "plant.title": "न्यूरल पादप स्वास्थ्य एवं रोग निदान",
    "plant.subtitle": "फसल की पत्तियों के घावों का डीप सीएनएन वर्गीकरण और लक्षित उपचार सलाह।",
    "plant.model_badge": "सीएनएन पत्ती रोग पहचानकर्ता v2.4",
    "plant.dropzone_title": "पत्ती की तस्वीर यहाँ खींचें या छोड़ें",
    "plant.dropzone_or": "या",
    "plant.dropzone_browse": "स्थानीय फ़ाइल चुनें",
    "plant.dropzone_hint": "स्मार्टफोन और फील्ड कैमरों से उच्च-रिज़ॉल्यूशन जेपीजी, पीएनजी समर्थित",
    "plant.sample_title": "या तैयार नमूना पत्तियां जांचें:",
    "plant.sample_healthy": "स्वस्थ पत्ती",
    "plant.sample_blight": "झुलसा रोग (ब्लाइट)",
    "plant.sample_rust": "रतुआ रोग (रस्ट)",
    "plant.analyze_btn": "न्यूरल रोग निदान शुरू करें",
    "plant.results_placeholder": "एआई निदान देखने के लिए पत्ती की फोटो अपलोड करें या नमूना चुनें",
    "plant.action_protocol_title": "कृषि उपचार प्रोटोकॉल एवं निवारण:",

    // Intrusion Tab
    "intrusion.title": "खेत परिधि सुरक्षा एवं वन्यजीव संतरी",
    "intrusion.subtitle": "जंगली सूअर, छुट्टा पशु, हिरण और अवैध घुसपैठियों का वास्तविक समय स्वचालित पता लगाना।",
    "intrusion.model_badge": "संतरी ऑब्जेक्ट डिटेक्टर (YOLO/PyTorch)",
    "intrusion.dropzone_title": "ट्रेल कैमरा / परिधि फ्रेम यहाँ छोड़ें",
    "intrusion.sample_title": "या सुरक्षा नमूना जांचें:",
    "intrusion.sample_btn": "खेत घुसपैठ दृश्य",
    "intrusion.analyze_btn": "परिधि फ्रेम का विश्लेषण करें",
    "intrusion.placeholder": "खेत परिधि में खतरे की पहचान के लिए कैमरा फोटो अपलोड करें",

    // Damage Tab
    "damage.title": "हवाई ड्रोन फसल क्षति विभाजन",
    "damage.subtitle": "जलभराव, हवा से फसल गिरने, सूखा तनाव और कीट प्रकोप का पिक्सेल-स्तरीय मानचित्रण।",
    "damage.model_badge": "हवाई यू-नेट क्षति विश्लेषक",
    "damage.dropzone_title": "हवाई ड्रोन / उपग्रह तस्वीर यहाँ छोड़ें",
    "damage.sample_btn": "हवाई फसल सर्वेक्षण",
    "damage.analyze_btn": "फसल क्षति क्षेत्रों का विभाजन करें",
    "damage.placeholder": "फसल क्षति का सटीक नक्शा देखने के लिए हवाई तस्वीर अपलोड करें",

    // Flood Tab
    "flood.title": "पूर्वानुमानित बाढ़ पूर्व चेतावनी एवं नहर नियंत्रण",
    "flood.subtitle": "जलभराव के खतरों, मिट्टी की संतृप्ति और आपातकालीन पंप नियंत्रण के लिए भविष्यवाणी मॉडल।",
    "flood.model_badge": "बाढ़ जोखिम वर्गीकरण मॉडल",
    "flood.simulator_title": "खेत हाइड्रोलॉजिकल टेलीमेट्री सिम्युलेटर",
    "flood.run_btn": "बाढ़ जोखिम का मूल्यांकन करें एवं निर्देश पाएं",
    "flood.batch_title": "थोक सेंसर डेटा इनपुट (सीएसवी अपलोड)",
    "flood.download_sample": "नमूना सीएसवी डाउनलोड करें",

    // Telemetry & Logs Tab
    "logs.title": "टेलीमेट्री रिकॉर्ड एवं ऑडिट लॉग",
    "logs.subtitle": "उपयोगकर्ता अपलोड, स्वचालित 3-घंटे चक्र और आईओटी सेंसर रिकॉर्ड का ऐतिहासिक लॉग।",
    "logs.clear_btn": "गतिविधि इतिहास मिटाएं",
    "logs.activity_title": "एकीकृत एआई अनुमान एवं चक्र गतिविधि स्ट्रीम",
    "logs.dataset_title": "स्थायी फील्ड सेंसर टेलीमेट्री (डेटासेट दृश्य)",

    // IoT Gateway Tab
    "iot.title": "माइक्रोकंट्रोलर गेटवे एवं कैमरा फीड हब",
    "iot.subtitle": "खेत माइक्रोकंट्रोलर (ESP32 / Arduino / LoRa) और रिमोट कैमरों के लिए 3-घंटे एआई भविष्यवाणी हब।",
    "iot.hf_info_title": "हगिंग फेस स्पेस एवं रिमोट फील्ड एकीकरण",
    "iot.hf_info_desc": "हगिंग फेस स्पेस (पोर्ट <strong>7860</strong>) पर होस्ट होने पर, अपने माइक्रोकंट्रोलर को सीधे जोड़ें:",
    "iot.sim_title": "माइक्रोकंट्रोलर टेलीमेट्री टेस्ट बेंच",
    "iot.sim_desc": "एआई जोखिम भविष्यवाणी और एक्ट्यूएटर निर्देशों का परीक्षण करने के लिए ईएसपी32 पैकेट का अनुकरण करें।",
    "iot.dev_id": "डिवाइस आईडी",
    "iot.sector": "निगरानी किया गया सेक्टर",
    "iot.water_level": "जल स्तर:",
    "iot.soil_moisture": "मिट्टी की नमी:",
    "iot.rainfall": "वर्षा दर (मिमी/घंटा):",
    "iot.temp": "तापमान (°C)",
    "iot.send_btn": "टेलीमेट्री भेजें (POST /api/iot/feed)",
    "iot.directives_title": "⚡ माइक्रोकंट्रोलर को लौटाए गए एक्ट्यूएटर निर्देश:",
    "iot.risk_status": "एआई जोखिम स्थिति",
    "iot.pump_directive": "पंप निर्देश",
    "iot.sluice_gate": "स्लुइस गेट",
    "iot.camera_portal_title": "फील्ड कैमरा फीड एवं शेयरिंग पोर्टल",
    "iot.camera_portal_desc": "ESP32-CAM, ड्रोन या ट्रेल कैमरों से तस्वीरें अपलोड करें। युक्ति एआई तुरंत शेयर करने योग्य लिंक बनाता है।",
    "iot.camera_id": "कैमरा नोड आईडी",
    "iot.mission": "विश्लेषण मिशन",
    "iot.mission_plant": "पत्ती स्वास्थ्य निदान (प्लांट हेल्थ)",
    "iot.mission_intrusion": "परिधि संतरी (घुसपैठ)",
    "iot.mission_damage": "हवाई सर्वेक्षण (फसल क्षति)",
    "iot.camera_dropzone": "कैमरा तस्वीर यहाँ खींचें या चुनें",
    "iot.camera_hint": "ESP32-CAM जेपीईजी, ड्रोन फोटो या ट्रेल कैम तस्वीर",
    "iot.share_btn": "अपलोड करें एवं शेयर लिंक बनाएं",
    "iot.share_success": "तस्वीर साझा एवं विश्लेषित",
    "iot.copy_btn": "कॉपी करें",
    "iot.code_library_title": "माइक्रोकंट्रोलर कोड लाइब्रेरी (ESP32 / Arduino / Python)",
    "iot.code_library_desc": "युक्ति एआई को डेटा और तस्वीरें भेजने के लिए तैयार फर्मवेयर कोड उदाहरण।",
    "iot.gallery_title": "साझा फील्ड तस्वीरें एवं कैमरा गैलरी",
    "iot.gallery_subtitle": "स्वचालित एआई निदान के साथ एज कैमरों द्वारा भेजी गई तस्वीरें।",
    "iot.refresh_gallery": "गैलरी रीफ्रेश करें"
  },

  pa: {
    // Brand & Header
    "brand.title": "ਯੁਕਤੀ ਏਆਈ",
    "brand.subtitle": "ਸਵੈ-ਚਾਲਿਤ ਸ਼ੁੱਧ ਖੇਤੀਬਾੜੀ ਅਤੇ ਖੇਤ ਖੁਫੀਆ ਪ੍ਰਣਾਲੀ",
    "nav.autopilot_full": "3-ਘੰਟੇ ਏਆਈ ਆਟੋਪਾਇਲਟ: <strong>ਸਰਗਰਮ</strong>",
    "nav.autopilot_compact": "3ਘੰ ਏਆਈ",
    "nav.theme_dark": "ਡਾਰਕ",
    "nav.theme_light": "ਲਾਈਟ",

    // Banner
    "banner.watcher": "ਏਆਈ ਖੇਤ ਰਖਵਾਲਾ: ਹਰ <strong>3 ਘੰਟਿਆਂ</strong> ਵਿੱਚ ਟੈਲੀਮੈਟਰੀ ਪ੍ਰਾਪਤ ਅਤੇ ਸਵੈ-ਚਾਲਿਤ ਵਿਸ਼ਲੇਸ਼ਣ",
    "banner.next_sync": "ਅਗਲਾ ਸਵੈ-ਚਾਲਿਤ ਵਿਸ਼ਲੇਸ਼ਣ:",
    "banner.trigger_btn": "3-ਘੰਟੇ ਸਿੰਕ ਤੁਰੰਤ ਸ਼ੁਰੂ ਕਰੋ",

    // Tabs
    "tab.overview": "ਸੰਖੇਪ ਜਾਣਕਾਰੀ ਅਤੇ ਮਾਪਦੰਡ",
    "tab.iot": "ਆਈਓਟੀ ਮਾਈਕ੍ਰੋਕੰਟਰੋਲਰ ਅਤੇ ਕੈਮਰਾ",
    "tab.water": "ਪਾਣੀ ਦਾ ਪੱਧਰ ਅਤੇ ਹਾਈਡ੍ਰੌਲਿਕਸ",
    "tab.plant": "ਫਸਲ ਦੀ ਸਿਹਤ ਅਤੇ ਰੋਗ ਜਾਂਚ",
    "tab.intrusion": "ਘੁਸਪੈਠ ਅਤੇ ਜੰਗਲੀ ਜੀਵ ਸੁਰੱਖਿਆ",
    "tab.damage": "ਹਵਾਈ ਫਸਲ ਦੇ ਨੁਕਸਾਨ ਦਾ ਮੁਲਾਂਕਣ",
    "tab.flood": "ਹੜ੍ਹ ਦਾ ਖ਼ਤਰਾ ਅਤੇ ਪੰਪ ਕੰਟਰੋਲ",
    "tab.datalog": "ਟੈਲੀਮੈਟਰੀ ਅਤੇ ਗਤੀਵਿਧੀ ਲੌਗ",

    // Overview Tab
    "overview.title": "ਖੇਤ ਖੁਫੀਆ ਸੰਖੇਪ ਜਾਣਕਾਰੀ",
    "overview.subtitle": "ਅਸਲ-ਸਮੇਂ ਦੀ ਟੈਲੀਮੈਟਰੀ, ਸਵੈ-ਚਾਲਿਤ ਪਾਣੀ ਦੇ ਪੱਧਰ ਅਤੇ ਨਿਊਰਲ ਏਆਈ ਕਾਰਜਕੁਸ਼ਲਤਾ।",
    "overview.refresh_btn": "ਟੈਲੀਮੈਟਰੀ ਤਾਜ਼ਾ ਕਰੋ",
    "kpi.water_title": "ਸਿੰਚਾਈ ਲਈ ਅਨੁਕੂਲ ਪਾਣੀ",
    "kpi.water_status": "ਅਨੁਕੂਲ ਡੂੰਘਾਈ (<15 ਸੈਂ.ਮੀ.)",
    "kpi.alerts_title": "ਸਰਗਰਮ ਸੁਰੱਖਿਆ ਚਿਤਾਵਨੀਆਂ",
    "kpi.alerts_status": "ਸੈਕਟਰ 4 ਵਿੱਚ ਜੰਗਲੀ ਜੀਵ ਦੇਖਿਆ ਗਿਆ",
    "kpi.moisture_title": "ਮਿੱਟੀ ਦੀ ਔਸਤ ਨਮੀ",
    "kpi.moisture_status": "ਜੜ੍ਹ ਖੇਤਰ ਵਿੱਚ ਉਚਿਤ ਨਮੀ",
    "kpi.accuracy_title": "ਮਲਟੀ-ਮਾਡਲ ਏਆਈ ਸ਼ੁੱਧਤਾ",
    "kpi.accuracy_status": "ਨਿਰੰਤਰ ਸਵੈ-ਜਾਂਚ",
    "chart.water_vs_moisture": "ਪਾਣੀ ਦਾ ਪੱਧਰ (ਸੈਂ.ਮੀ.) ਬਨਾਮ ਮਿੱਟੀ ਦੀ ਨਮੀ ਦਾ ਰੁਝਾਨ",
    "chart.sync_badge": "3-ਘੰਟੇ ਸਵੈ-ਸਮਕਾਲੀ",
    "gauge.title": "ਲਾਈਵ ਪਾਣੀ ਦਾ ਪੱਧਰ ਗੇਜ",
    "gauge.badge": "ਕਿਆਰੇ ਦੀ ਡੂੰਘਾਈ",
    "gauge.mean_depth": "ਔਸਤ ਪਾਣੀ ਦੀ ਡੂੰਘਾਈ",
    "report.title": "ਤਾਜ਼ਾ 3-ਘੰਟੇ ਏਆਈ ਵਿਸ਼ਲੇਸ਼ਣ ਰਿਪੋਰਟ",
    "report.cycle_done": "ਗੇੜ ਪੂਰਾ ਹੋਇਆ",
    "report.source_label": "ਡੇਟਾ ਸਰੋਤ ਮਿਲਿਆ",
    "report.records_label": "ਪ੍ਰੋਸੈਸ ਕੀਤੇ ਰਿਕਾਰਡ",
    "report.water_label": "ਔਸਤ ਪਾਣੀ ਦੀ ਡੂੰਘਾਈ",
    "report.action_label": "ਸਵੈ-ਚਾਲਿਤ ਹਾਈਡ੍ਰੌਲਿਕ ਕਾਰਵਾਈ",

    // Water Level Tab
    "water.title": "ਨਹਿਰ ਅਤੇ ਕਿਆਰੇ ਦੇ ਪਾਣੀ ਦੇ ਪੱਧਰ ਦਾ ਪ੍ਰਬੰਧਨ",
    "water.subtitle": "ਅਸਲ ਸਮੇਂ ਦੇ ਅਲਟਰਾਸੋਨਿਕ ਗੇਜ, ਸਲੂਇਸ ਗੇਟ ਦੀ ਸਥਿਤੀ ਅਤੇ ਸਵੈ-ਚਾਲਿਤ ਸਿੰਚਾਈ ਟੈਲੀਮੈਟਰੀ।",
    "water.badge": "ਅਲਟਰਾਸੋਨਿਕ ਸੈਂਸਰ ਆਨਲਾਈਨ",
    "water.table_title": "ਕਿਆਰਾ-ਵਾਰ ਪਾਣੀ ਦੇ ਪੱਧਰ ਦਾ ਵੇਰਵਾ",
    "water.col_sector": "ਸੈਕਟਰ / ਖੇਤ",
    "water.col_level": "ਪਾਣੀ ਦਾ ਪੱਧਰ (ਸੈਂ.ਮੀ.)",
    "water.col_moisture": "ਮਿੱਟੀ ਦੀ ਨਮੀ",
    "water.col_status": "ਸੁਰੱਖਿਆ ਸਥਿਤੀ",
    "water.col_valve": "ਸਵੈ-ਚਾਲਿਤ ਵਾਲਵ",

    // Plant Health Tab
    "plant.title": "ਫਸਲ ਦੀ ਸਿਹਤ ਅਤੇ ਪੱਤਿਆਂ ਦੇ ਰੋਗਾਂ ਦੀ ਜਾਂਚ",
    "plant.subtitle": "ਪੱਤਿਆਂ ਦੇ ਰੋਗਾਂ ਦਾ ਡੂੰਘਾ ਸੀਐਨਐਨ ਵਿਸ਼ਲੇਸ਼ਣ ਅਤੇ ਖੇਤੀ ਮਾਹਰਾਂ ਦੁਆਰਾ ਸਿਫਾਰਸ਼ ਕੀਤੇ ਉਪਾਅ।",
    "plant.model_badge": "ਸੀਐਨਐਨ ਪੱਤਾ ਰੋਗ ਪਛਾਣਕਰਤਾ v2.4",
    "plant.dropzone_title": "ਪੱਤੇ ਦੀ ਫੋਟੋ ਇੱਥੇ ਖਿੱਚੋ ਜਾਂ ਸੁੱਟੋ",
    "plant.dropzone_or": "ਜਾਂ",
    "plant.dropzone_browse": "ਫਾਈਲ ਚੁਣੋ",
    "plant.dropzone_hint": "ਮੋਬਾਈਲ ਅਤੇ ਕੈਮਰੇ ਤੋਂ ਉੱਚ-ਗੁਣਵੱਤਾ ਵਾਲੀਆਂ ਜੇਪੀਜੀ, ਪੀਐਨਜੀ ਫੋਟੋਆਂ",
    "plant.sample_title": "ਜਾਂ ਤਿਆਰ ਨਮੂਨਾ ਪੱਤੇ ਪਰਖੋ:",
    "plant.sample_healthy": "ਸਿਹਤਮੰਦ ਪੱਤਾ",
    "plant.sample_blight": "ਝੁਲਸਾ ਰੋਗ (ਬਲਾਈਟ)",
    "plant.sample_rust": "ਕੁੰਗੀ ਰੋਗ (ਰਸਟ)",
    "plant.analyze_btn": "ਨਿਊਰਲ ਰੋਗ ਜਾਂਚ ਸ਼ੁਰੂ ਕਰੋ",
    "plant.results_placeholder": "ਏਆਈ ਜਾਂਚ ਦੇਖਣ ਲਈ ਪੱਤੇ ਦੀ ਫੋਟੋ ਅਪਲੋਡ ਕਰੋ ਜਾਂ ਨਮੂਨਾ ਚੁਣੋ",
    "plant.action_protocol_title": "ਫਸਲ ਬਚਾਅ ਅਤੇ ਇਲਾਜ ਦੇ ਉਪਾਅ:",

    // Intrusion Tab
    "intrusion.title": "ਖੇਤ ਦੀ ਰਾਖੀ ਅਤੇ ਜੰਗਲੀ ਜੀਵ ਘੁਸਪੈਠ ਸੁਰੱਖਿਆ",
    "intrusion.subtitle": "ਜੰਗਲੀ ਸੂਰ, ਆਵਾਰਾ ਪਸ਼ੂ, ਹਿਰਨ ਅਤੇ ਅਣਅਧਿਕਾਰਤ ਵਿਅਕਤੀਆਂ ਦੀ ਤੁਰੰਤ ਪਛਾਣ।",
    "intrusion.model_badge": "ਸੁਰੱਖਿਆ ਆਬਜੈਕਟ ਡਿਟੈਕਟਰ (YOLO/PyTorch)",
    "intrusion.dropzone_title": "ਕੈਮਰਾ ਫੋਟੋ ਇੱਥੇ ਖਿੱਚੋ ਜਾਂ ਸੁੱਟੋ",
    "intrusion.sample_title": "ਜਾਂ ਸੁਰੱਖਿਆ ਨਮੂਨਾ ਪਰਖੋ:",
    "intrusion.sample_btn": "ਖੇਤ ਘੁਸਪੈਠ ਸੀਨ",
    "intrusion.analyze_btn": "ਸੁਰੱਖਿਆ ਫਰੇਮ ਦੀ ਜਾਂਚ ਕਰੋ",
    "intrusion.placeholder": "ਖੇਤ ਵਿੱਚ ਖਤਰੇ ਦੀ ਪਛਾਣ ਕਰਨ ਲਈ ਕੈਮਰਾ ਫੋਟੋ ਅਪਲੋਡ ਕਰੋ",

    // Damage Tab
    "damage.title": "ਹਵਾਈ ਡਰੋਨ ਫਸਲ ਨੁਕਸਾਨ ਮੁਲਾਂਕਣ",
    "damage.subtitle": "ਮੀਂਹ/ਹਨੇਰੀ ਨਾਲ ਡਿੱਗੀ ਫਸਲ, ਪਾਣੀ ਦਾ ਭਰਾਅ, ਸੋਕਾ ਅਤੇ ਕੀੜਿਆਂ ਦੇ ਹਮਲੇ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ।",
    "damage.model_badge": "ਹਵਾਈ ਯੂ-ਨੈੱਟ ਨੁਕਸਾਨ ਵਿਸ਼ਲੇਸ਼ਕ",
    "damage.dropzone_title": "ਡਰੋਨ ਜਾਂ ਸੈਟੇਲਾਈਟ ਫੋਟੋ ਇੱਥੇ ਸੁੱਟੋ",
    "damage.sample_btn": "ਹਵਾਈ ਖੇਤ ਸਰਵੇਖਣ",
    "damage.analyze_btn": "ਨੁਕਸਾਨ ਵਾਲੇ ਖੇਤਰਾਂ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ",
    "damage.placeholder": "ਫਸਲ ਦੇ ਨੁਕਸਾਨ ਦਾ ਨਕਸ਼ਾ ਦੇਖਣ ਲਈ ਹਵਾਈ ਫੋਟੋ ਅਪਲੋਡ ਕਰੋ",

    // Flood Tab
    "flood.title": "ਹੜ੍ਹ ਦੀ ਅਗੇਤੀ ਚੇਤਾਵਨੀ ਅਤੇ ਪੰਪ ਕੰਟਰੋਲ",
    "flood.subtitle": "ਪਾਣੀ ਦੇ ਭਰਾਅ, ਮਿੱਟੀ ਵਿੱਚ ਪਾਣੀ ਦੀ ਮਾਤਰਾ ਅਤੇ ਐਮਰਜੈਂਸੀ ਪੰਪ ਚਲਾਉਣ ਲਈ ਭਵਿੱਖਬਾਣੀ ਮਾਡਲ।",
    "flood.model_badge": "ਹੜ੍ਹ ਖ਼ਤਰਾ ਵਰਗੀਕਰਨ ਮਾਡਲ",
    "flood.simulator_title": "ਖੇਤ ਪਾਣੀ ਟੈਲੀਮੈਟਰੀ ਸਿਮੂਲੇਟਰ",
    "flood.run_btn": "ਹੜ੍ਹ ਖ਼ਤਰੇ ਦਾ ਮੁਲਾਂਕਣ ਕਰੋ ਅਤੇ ਹਦਾਇਤਾਂ ਲਵੋ",
    "flood.batch_title": "ਸੈਂਸਰ ਡੇਟਾ ਫਾਈਲ ਅਪਲੋਡ (CSV)",
    "flood.download_sample": "ਨਮੂਨਾ CSV ਡਾਊਨਲੋਡ ਕਰੋ",

    // Telemetry & Logs Tab
    "logs.title": "ਟੈਲੀਮੈਟਰੀ ਰਿਕਾਰਡ ਅਤੇ ਗਤੀਵਿਧੀ ਲੌਗ",
    "logs.subtitle": "ਵਰਤੋਂਕਾਰ ਅਪਲੋਡ, ਸਵੈ-ਚਾਲਿਤ 3-ਘੰਟੇ ਗੇੜ ਅਤੇ ਆਈਓਟੀ ਸੈਂਸਰ ਰਿਕਾਰਡਾਂ ਦਾ ਇਤਿਹਾਸ।",
    "logs.clear_btn": "ਇਤਿਹਾਸ ਸਾਫ਼ ਕਰੋ",
    "logs.activity_title": "ਏਕੀਕ੍ਰਿਤ ਏਆਈ ਨਤੀਜੇ ਅਤੇ ਗਤੀਵਿਧੀ ਲੜੀ",
    "logs.dataset_title": "ਸੈਂਸਰ ਟੈਲੀਮੈਟਰੀ ਡੇਟਾਸੈੱਟ",

    // IoT Gateway Tab
    "iot.title": "ਮਾਈਕ੍ਰੋਕੰਟਰੋਲਰ ਗੇਟਵੇਅ ਅਤੇ ਕੈਮਰਾ ਫੀਡ",
    "iot.subtitle": "ਖੇਤ ਮਾਈਕ੍ਰੋਕੰਟਰੋਲਰਾਂ (ESP32 / Arduino / LoRa) ਅਤੇ ਕੈਮਰਿਆਂ ਲਈ 3-ਘੰਟੇ ਏਆਈ ਹੱਬ।",
    "iot.hf_info_title": "ਹਗਿੰਗ ਫੇਸ ਸਪੇਸ ਅਤੇ ਰਿਮੋਟ ਫੀਲਡ ਕੁਨੈਕਸ਼ਨ",
    "iot.hf_info_desc": "ਹਗਿੰਗ ਫੇਸ ਸਪੇਸ (ਪੋਰਟ <strong>7860</strong>) 'ਤੇ ਹੋਸਟ ਹੋਣ 'ਤੇ, ਆਪਣੇ ਮਾਈਕ੍ਰੋਕੰਟਰੋਲਰ ਨੂੰ ਸਿੱਧਾ ਜੋੜੋ:",
    "iot.sim_title": "ਮਾਈਕ੍ਰੋਕੰਟਰੋਲਰ ਟੈਲੀਮੈਟਰੀ ਟੈਸਟ ਬੈਂਚ",
    "iot.sim_desc": "ਏਆਈ ਖ਼ਤਰਾ ਭਵਿੱਖਬਾਣੀ ਅਤੇ ਪੰਪ ਹਦਾਇਤਾਂ ਦੀ ਪਰਖ ਕਰਨ ਲਈ ESP32 ਪੈਕੇਟ ਭੇਜੋ।",
    "iot.dev_id": "ਡਿਵਾਈਸ ਆਈਡੀ",
    "iot.sector": "ਨਿਗਰਾਨੀ ਅਧੀਨ ਖੇਤਰ",
    "iot.water_level": "ਪਾਣੀ ਦਾ ਪੱਧਰ:",
    "iot.soil_moisture": "ਮਿੱਟੀ ਦੀ ਨਮੀ:",
    "iot.rainfall": "ਮੀਂਹ ਦੀ ਦਰ (ਮਿ.ਮੀ./ਘੰਟਾ):",
    "iot.temp": "ਤਾਪਮਾਨ (°C)",
    "iot.send_btn": "ਟੈਲੀਮੈਟਰੀ ਭੇਜੋ (POST /api/iot/feed)",
    "iot.directives_title": "⚡ ਮਾਈਕ੍ਰੋਕੰਟਰੋਲਰ ਨੂੰ ਵਾਪਸ ਮਿਲੀਆਂ ਐਕਚੂਏਟਰ ਹਦਾਇਤਾਂ:",
    "iot.risk_status": "ਏਆਈ ਖ਼ਤਰਾ ਸਥਿਤੀ",
    "iot.pump_directive": "ਪੰਪ ਹਦਾਇਤਾਂ",
    "iot.sluice_gate": "ਸਲੂਇਸ ਗੇਟ",
    "iot.camera_portal_title": "ਖੇਤ ਕੈਮਰਾ ਫੀਡ ਅਤੇ ਸ਼ੇਅਰਿੰਗ ਪੋਰਟਲ",
    "iot.camera_portal_desc": "ESP32-CAM, ਡਰੋਨ ਜਾਂ ਕੈਮਰਿਆਂ ਤੋਂ ਫੋਟੋਆਂ ਅਪਲੋਡ ਕਰੋ। ਯੁਕਤੀ ਏਆਈ ਤੁਰੰਤ ਸ਼ੇਅਰ ਕਰਨ ਯੋਗ ਲਿੰਕ ਤਿਆਰ ਕਰਦੀ ਹੈ।",
    "iot.camera_id": "ਕੈਮਰਾ ਨੋਡ ਆਈਡੀ",
    "iot.mission": "ਜਾਂਚ ਮਿਸ਼ਨ",
    "iot.mission_plant": "ਪੱਤਾ ਸਿਹਤ ਜਾਂਚ (ਪਲਾਂਟ ਹੈਲਥ)",
    "iot.mission_intrusion": "ਸੁਰੱਖਿਆ ਪਹਿਰੇਦਾਰੀ (ਘੁਸਪੈਠ)",
    "iot.mission_damage": "ਹਵਾਈ ਸਰਵੇਖਣ (ਫਸਲ ਨੁਕਸਾਨ)",
    "iot.camera_dropzone": "ਕੈਮਰਾ ਫੋਟੋ ਇੱਥੇ ਸੁੱਟੋ ਜਾਂ ਚੁਣੋ",
    "iot.camera_hint": "ESP32-CAM ਜੇਪੀਈਜੀ, ਡਰੋਨ ਫੋਟੋ ਜਾਂ ਕੈਮਰਾ ਕੈਪਚਰ",
    "iot.share_btn": "ਅਪਲੋਡ ਕਰੋ ਅਤੇ ਸ਼ੇਅਰ ਲਿੰਕ ਬਣਾਓ",
    "iot.share_success": "ਫੋਟੋ ਸਾਂਝੀ ਅਤੇ ਵਿਸ਼ਲੇਸ਼ਿਤ",
    "iot.copy_btn": "ਕਾਪੀ ਕਰੋ",
    "iot.code_library_title": "ਮਾਈਕ੍ਰੋਕੰਟਰੋਲਰ ਕੋਡ ਲਾਇਬ੍ਰੇਰੀ (ESP32 / Arduino / Python)",
    "iot.code_library_desc": "ਯੁਕਤੀ ਏਆਈ ਨੂੰ ਡੇਟਾ ਅਤੇ ਫੋਟੋਆਂ ਭੇਜਣ ਲਈ ਤਿਆਰ ਫਰਮਵੇਅਰ ਕੋਡ ਉਦਾਹਰਣਾਂ।",
    "iot.gallery_title": "ਸਾਂਝੀਆਂ ਕੀਤੀਆਂ ਖੇਤ ਫੋਟੋਆਂ ਅਤੇ ਕੈਮਰਾ ਗੈਲਰੀ",
    "iot.gallery_subtitle": "ਸਵੈ-ਚਾਲਿਤ ਏਆਈ ਜਾਂਚ ਦੇ ਨਾਲ ਕੈਮਰਿਆਂ ਦੁਆਰਾ ਭੇਜੀਆਂ ਗਈਆਂ ਫੋਟੋਆਂ।",
    "iot.refresh_gallery": "ਗੈਲਰੀ ਤਾਜ਼ਾ ਕਰੋ"
  }
};

let currentLanguage = localStorage.getItem("yukti_language") || "en";

function t(key) {
  const lang = currentLanguage || "en";
  if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
    return TRANSLATIONS[lang][key];
  }
  if (TRANSLATIONS["en"] && TRANSLATIONS["en"][key]) {
    return TRANSLATIONS["en"][key];
  }
  return key;
}

function setLanguage(lang) {
  if (!TRANSLATIONS[lang]) {
    lang = "en";
  }
  currentLanguage = lang;
  localStorage.setItem("yukti_language", lang);

  // Update HTML lang attribute and body font classes
  document.documentElement.setAttribute("lang", lang);
  document.body.setAttribute("data-lang", lang);

  // Update dropdown value
  const select = document.getElementById("langSelect");
  if (select && select.value !== lang) {
    select.value = lang;
  }

  // Translate all elements with data-i18n
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    const translated = t(key);
    if (translated) {
      el.innerHTML = translated;
    }
  });

  // Translate placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    const translated = t(key);
    if (translated) {
      el.placeholder = translated;
    }
  });

  // Translate titles / aria-labels
  document.querySelectorAll("[data-i18n-title]").forEach(el => {
    const key = el.getAttribute("data-i18n-title");
    const translated = t(key);
    if (translated) {
      el.title = translated;
    }
  });

  // Update Theme toggle text based on current theme and language
  const themeLabel = document.getElementById("themeLabel");
  if (themeLabel) {
    const isDark = document.body.getAttribute("data-theme") === "dark";
    themeLabel.textContent = isDark ? t("nav.theme_light") : t("nav.theme_dark");
  }

  // Dispatch custom event for dynamic charts or components
  document.dispatchEvent(new CustomEvent("languageChanged", { detail: { language: lang } }));
}

function initLanguageSwitcher() {
  const select = document.getElementById("langSelect");
  if (select) {
    select.value = currentLanguage;
    select.addEventListener("change", (e) => {
      setLanguage(e.target.value);
    });
  }
  // Apply saved language on load
  setLanguage(currentLanguage);
}
