# ⚡ StudyPulse FOCUS ENGINE
### Cybernetic Engineering & Cognitive Mastery Station

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-00f0ff?style=for-the-badge&logo=github&logoColor=black)](https://30piyush2025.github.io/MY_STUDY_PROJECT/)
[![Download APK](https://img.shields.io/badge/Download%20APK-Android%208.0%2B-00e676?style=for-the-badge&logo=android&logoColor=white)](https://30piyush2025.github.io/MY_STUDY_PROJECT/StudyPulse.apk)
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Android%20APK%20%7C%20PWA-7000ff?style=for-the-badge)](https://30piyush2025.github.io/MY_STUDY_PROJECT/)
[![License](https://img.shields.io/badge/License-MIT-ff007f?style=for-the-badge)](#)

> **Developed by [Piyush Tiwari](https://github.com/30Piyush2025)**  
> *A high-performance, responsive learning workstation and native Android application engineered for deep work, distributed systems simulation, spatial 3D memorization, and real-time focus tracking.*

---

## 🌟 Overview

**StudyPulse FOCUS ENGINE** is an advanced learning station combining deep-work productivity with immersive 3D graphics and system engineering simulations. Built with a responsive hybrid architecture, StudyPulse delivers an ultra-wide cybernetic dark workstation on desktop and transforms into a native **Material Design 3** mobile experience on Android smartphones.

All learning data, completed topics, focus durations, streaks, and memory retention metrics are stored **100% client-side** in browser `localStorage`. When you close or reopen the app, your real progress is preserved instantly without requiring external accounts or cloud databases.

---

## 📱 Standalone Android App (APK)

StudyPulse is available as a signed, standalone Android APK with zero external runtime dependencies.

* **Package ID**: `com.studypulse.focusengine`
* **Compatibility**: Android 8.0 (API 26) through Android 15 (API 35)
* **Build Architecture**: Hardware-accelerated native WebView wrapper with offline assets, WebGL, and Web Audio API support.
* **Signature Schemes**: APK Signature Scheme v1 (JAR), v2 (Full APK), and v3 (Key rotation enabled).
* **Binary Size**: ~370 KB (ultra-lightweight).

### How to Install on Your Android Device:

1. **Direct Download**: Download [`StudyPulse.apk`](StudyPulse.apk) directly to your device.
2. **From Termux / Shell**:
   ```bash
   termux-open /sdcard/Download/StudyPulse.apk
   ```
3. **From Browser**:
   * Open the [Live Web Application](https://30piyush2025.github.io/MY_STUDY_PROJECT/).
   * Tap **`⋮ More`** in the bottom navigation bar and tap **`📦 Download APK`**.
4. **PWA Standalone Mode**:
   * Open in Chrome or Brave on Android, tap the three dots (`⋮`) in the browser menu, and select **Add to Home screen** / **Install app**.

---

## 🚀 Key Functional Modules & Features

### 1. ⏱️ Chrono-Block Pomodoro & Real-Time Focus Tracker
* Precision 25-minute deep focus intervals and active rest cycles.
* Real-time session time accumulation logged directly into daily focus metrics.
* Dynamic consecutive-day study streak monitor (`🔥 N-Day Streak`) computed from actual study timestamps.
* Interactive cognitive activity heatmap plotting your real study volume over the last 30 days.

### 2. 🏛️ 3D WebGL Memory Palace Sanctuary (`Method of Loci`)
* Powered by Three.js with hardware-accelerated rendering.
* 8 illuminated architectural pedestals holding floating holographic crystal cards.
* Interactive 3D card flips displaying core architectural derivations, data structure proofs, and algorithmic invariants.
* Dynamic FSRS memory stability indicators:
  * 🟢 **Emerald (Stability > 75%)**: Solid retention.
  * 🟡 **Amber (Stability 40%–75%)**: Approaching review threshold.
  * 🔴 **Crimson (Stability < 40%)**: Critical decay requiring immediate active recall.

### 3. 🛡️ Distributed System Design Chaos Engineering Lab
* Interactive visual simulator modelling 3 mission-critical production architectures:
  1. **High-Throughput API Gateway & Redis Cache Cluster**
  2. **Raft Distributed Consensus & Quorum Leader Election**
  3. **Event-Driven Kafka Streaming & Microservices Pipeline**
* Real-time Chaos Monkey attack injections:
  * **100k RPS Surge**: Simulates traffic spikes, token-bucket throttling, and cache hits.
  * **Terminate Leader**: Simulates server crashes, heartbeat timeouts, and automatic raft quorum re-elections in 180ms.
  * **250ms Latency Jitter**: Triggers circuit breaker transitions from `CLOSED` to `OPEN`.
  * **Heal Cluster**: Restores all cluster nodes to 100% operational health.

### 4. 🎛️ Biohacking Audio Synthesizer & Real-Time FFT Visualizer
* Real-time procedural audio synthesis using the Web Audio API (zero external audio files needed).
* 4-channel customizable soundscape mixer:
  * **40Hz Gamma Focus Waves**: Binaural beat oscillation for intense cognitive flow.
  * **Nordic Rain**: Procedural pink-noise filter simulating ambient precipitation.
  * **Deep Brown Noise**: Low-frequency acoustic damping to eliminate distractions.
  * **Lo-Fi Rhodes Chords**: Gentle ambient chord generator.
* Live HTML5 Canvas frequency spectrum visualizer linked to an `AnalyserNode`.

### 5. 📚 Tactile 3D Curriculum Bookshelf
* Procedural Three.js 3D library containing 18 leather-bound reference volumes.
* Realistic leather spine textures, gold foil embossing, and dynamic shadow rendering.
* Interactive raycast selection with cinematic camera flight animations.
* Tactile procedural audio feedback (shelf impact and paper flutter sounds).

### 6. 📋 Curriculum Master Matrix & RPG Level System
* Multi-track curriculum checklist covering 210 topics across:
  * **AI & Machine Learning Foundations**
  * **Deep Learning & Transformer Architectures**
  * **Production MLOps & CI/CD Pipelines**
  * **Data Structures, Algorithms & LeetCode Patterns**
  * **Mathematical Foundations (Linear Algebra, Calculus, Statistics)**
  * **Cloud Distributed Systems & Big Data Engineering**
* **RPG XP & Level Engine**: Earn **+150 XP** for each topic mastered, advancing from **Level 1 (Code Initiate)** to **Level 20 (AI Sovereign)**.
* Dynamic SVG circular mastery gauge updating in real time as topics are completed.

### 7. 🌗 Obsidian Dark & Material Light Themes
* **Obsidian Dark (AMOLED)**: High-contrast deep cybernetic black (`#060913`) with cyan and purple laser accents.
* **Material Light Studio**: Crisp white cards (`#ffffff`), soft drop shadows, and high-contrast slate typography (`#0f172a`).
* Instant toggle switch (`☀️ / 🌙`) with persistent user preference storage.

---

## 💾 Zero False Data & Data Persistence

StudyPulse has been scrubbed of all hardcoded mock numbers and simulated reviews:
* **Initial State**: Focus hours start at `0m`, completed topics start at `0 of 210` (0%), and active streak begins at `0 Days`.
* **State Persistence**: All user interactions are automatically serialized to browser `localStorage`:
  * `studyPulseCheckedTopics`: List of mastered curriculum topic keys.
  * `studyPulseTodayFocus`: Daily accumulated deep work focus duration.
  * `studyPulseStreak`: Real calculated consecutive study streak.
  * `studyPulseActivityHistory`: Historical date-to-minutes activity map.
  * `studyPulsePalaceStability`: FSRS card retention percentages.
  * `studyPulseXP`: Cumulative user XP and tier level.
  * `studyPulseTheme`: Visual palette preference (`"dark"` or `"light"`).
* **Reset Anytime**: A clean reset button is available in the settings drawer to wipe state whenever you want a fresh start.

---

## 📁 Repository Structure & History Archive

```
MY_STUDY_PROJECT/
├── index.html                   # Core single-page application & mobile shell
├── studypulse.js                # State engine, audio synth, timer & theme coordinator
├── studypulse.css               # Cybernetic design system & Android Material 3 styles
├── StudyPulse.apk               # Precompiled signed native Android APK
├── js/
│   ├── memory-palace-3d.js      # Three.js 3D Memory Palace & FSRS spatial cards
│   ├── chaos-simulator.js       # System design canvas & Chaos Monkey engine
│   ├── galaxy-3d.js             # 3D Celestial knowledge graph
│   └── bookshelf-3d.js          # Tactile 18-volume curriculum library
├── project_history/             # Complete Project Trajectory & Conversations
│   ├── README.md                # Project history index
│   ├── PROJECT_TIMELINE_AND_CONVERSATIONS.md # Chronological log of all milestones
│   └── SYSTEM_ARCHITECTURE_EVOLUTION.md    # Architecture diagrams & build toolchains
├── curriculum-data.js           # Full 210-topic master syllabus database
├── manifest.json                # PWA configuration for installable home screen app
└── start.sh                     # Local development startup script
```

> Read the complete chronicle of conversations, architectural milestones, and design iterations in [`project_history/PROJECT_TIMELINE_AND_CONVERSATIONS.md`](project_history/PROJECT_TIMELINE_AND_CONVERSATIONS.md).

---

## 🛠️ Local Development & Running

### Starting the Local Web Server
```bash
# Using the bundled runner (Port 5000)
bash start.sh 5000

# Or standard Python 3 HTTP server
python3 -m http.server 5000 --bind 0.0.0.0
```
Open **`http://localhost:5000`** in your browser.

### Rebuilding the Android APK
The APK can be recompiled on any Linux/Debian or Termux system with Android SDK tools:
```bash
# Packaging resources and Dalvik DEX
aapt package -f -M AndroidManifest.xml -S res -A assets -I android.jar -F bin/unaligned.apk
cd bin && aapt add unaligned.apk classes.dex

# Zipalign 4-byte boundary optimization
zipalign -f -p 4 bin/unaligned.apk bin/aligned.apk

# Cryptographic signing (v1, v2, v3 schemes)
apksigner sign --ks debug.keystore --ks-pass pass:android --out StudyPulse.apk bin/aligned.apk
```

---

## 🚢 GitHub Pages Deployment

The application is deployed on GitHub Pages:
1. Navigate to **Settings** → **Pages** on GitHub.
2. Under **Build and deployment** → **Source**, select **Deploy from a branch**.
3. Choose branch **`main`** and directory **`/(root)`**, then click **Save**.
4. The live application will be available at:
   **[https://30piyush2025.github.io/MY_STUDY_PROJECT/](https://30piyush2025.github.io/MY_STUDY_PROJECT/)**

---

## 📄 License

This project is licensed under the MIT License — see the repository for details.

*Crafted with precision by **[Piyush Tiwari](https://github.com/30Piyush2025)**.*
