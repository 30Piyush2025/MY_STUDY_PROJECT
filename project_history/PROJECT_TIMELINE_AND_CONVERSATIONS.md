# StudyPulse FOCUS ENGINE — Project Evolution & Development History

This document logs the comprehensive development trajectory, architectural milestones, user iterations, and technical breakthroughs that shaped **StudyPulse FOCUS ENGINE** from initial concept to a production-grade WebGL platform and Android application.

---

## 📌 Project Overview
* **Repository**: [https://github.com/30Piyush2025/MY_STUDY_PROJECT](https://github.com/30Piyush2025/MY_STUDY_PROJECT)
* **Author / Developer**: Piyush Tiwari
* **Platform**: Progressive Web App (PWA) & Standalone Android APK (API 26–35 compatible)
* **Core Domains**: Distributed Systems, Deep Learning, Foundation Models, MLOps, Data Structures & Algorithms, Mathematical Foundations.

---

## 🗓️ Phase-by-Phase Development Chronology

### Phase 1: Genesis & Blueprint Implementation
* **Objective**: Reconstruct the exact dark cybernetic research workstation depicted across 6 original UI/UX design mockups.
* **Key Components Implemented**:
  * **Chrono-Block Pomodoro Engine**: 25-minute flow state timer synced with active recall intervals.
  * **2D Active Knowledge Topology**: Canvas-based interconnected dynamic nodes with simulated live velocity physics.
  * **Curriculum Master Matrix**: Multi-track module checklist covering 210 topics with dynamic progress tracking.
  * **FSRS v4.5 Spaced Repetition Engine**: Spaced repetition interval calculator based on memory decay curves.
  * **Tactile 3D Bookshelf**: Integrated Three.js WebGL library housing 18 realistic curriculum volumes with embossed leather spine textures and cinematic camera flight.

### Phase 2: Bug Fixes & 3D Pointer Event Delegation
* **Challenge**: The 3D bookshelf could not open books when clicked due to canvas pointer event propagation issues and raycaster coordinate mismatch.
* **Resolution**:
  * Bound pointer events directly to the viewport container calculating exact relative offsets via `container.getBoundingClientRect()`.
  * Implemented an 8px drag vs. click threshold to separate camera orbit rotation from book selection clicks.
  * Built a floating glassmorphic curriculum dossier overlay with tactile sound effects (procedural Web Audio shelf thuds and paper flutter).

### Phase 3: Spatial Constellations & Gamification
* **3D Knowledge Galaxy (`js/galaxy-3d.js`)**:
  * Built a celestial constellation of 28 curriculum domain nodes with directed prerequisite laser connections.
  * Integrated interactive orbit controls and click-to-syllabus jumps.
* **RPG Progression Engine**:
  * Introduced an XP reward system awarding +150 XP per topic mastered.
  * Progressive ranking from Level 1 (*Code Initiate*) to Level 20 (*AI Sovereign*).
* **Soundscapes 1.0**:
  * Procedural Web Audio synthesis of 40Hz Gamma focus waves, Nordic rain, and brown noise.
* **Peer Review Slide-Over Drawer**:
  * Interactive peer feedback panel allowing reviewers to rate curriculum depth and leave testimonials.

### Phase 4: Frontier Engineering Workstations
* **🛡️ System Design Chaos Engineering Lab (`js/chaos-simulator.js`)**:
  * Interactive canvas simulator with 3 real-world distributed architectures:
    1. *High-Throughput API Gateway & Redis Cache Cluster*
    2. *Raft Distributed Consensus & Quorum Leader Election*
    3. *Event-Driven Kafka Streaming & Microservices*
  * Chaos Monkey attack actions:
    * **100k RPS Surge**: Tests token-bucket rate limiting and cache hit offloading.
    * **Terminate Leader**: Triggers heartbeat timeouts and live candidate quorum election in 180ms.
    * **250ms Latency Jitter**: Forces circuit breakers from `CLOSED` to `OPEN`.
    * **Heal Cluster**: Restores all cluster nodes to 100% operational health.
* **🏛️ 3D Memory Palace Sanctuary (`js/memory-palace-3d.js`)**:
  * Method of Loci spatial memorization in WebGL Three.js.
  * 8 illuminated architectural pedestals holding floating holographic crystal cards.
  * Crystal colors dynamically reflect FSRS stability (Emerald Green = high retention, Solar Amber = due soon, Crimson Red = memory decay).
  * 3D card flip animation revealing architectural derivations and code invariants.
* **🎛️ Biohacking Audio Synthesizer & Real-Time FFT Visualizer**:
  * HTML5 Canvas frequency spectrum visualizer powered by Web Audio `AnalyserNode`.
  * Multi-channel DJ mixer with independent volume sliders for 40Hz Binaural Beats, Nordic Rain, Deep Brown Noise, and Lo-Fi Rhodes Chords.
  * Web Speech API voice protocol prompts.

### Phase 5: Android App Interface & Native APK Compilation
* **Android Material Design 3 Transformation**:
  * Replaced desktop tabs with a fixed, frosted-glass **Bottom Navigation Bar** (`Focus`, `Matrix`, `Chaos`, `Recall`, `3D Shelf`, `More`).
  * Android Top App Bar with level pill and overflow menu (`⋮`).
  * Android Bottom Sheet drawer with native pull handle (`━`).
  * Material Floating Action Button (FAB) for instant sprint initiation.
  * Touch ergonomics: zero scrollbars, spring touch feedback (`active: scale(0.94)`), haptic vibration (`navigator.vibrate(14)`), and Android Back button navigation (`popstate`).
* **Compiling & Signing `StudyPulse.apk`**:
  * Packaged using native Android SDK tools (`aapt`, `dalvik-exchange`, `zipalign`, `apksigner`).
  * Built as a hardware-accelerated WebView app with 100% offline assets, WebGL, and Web Audio.
* **Resolving Android 15 (API 35) Compatibility**:
  * Modern Android versions block legacy SDK targets.
  * Configured `minSdkVersion = 26` and `targetSdkVersion = 34`.
  * Signed with **APK Signature Schemes v1, v2, and v3**, fully verified by `apksigner`.

### Phase 6: Dark & Light Themes and Real State Persistence
* **Dynamic Theme Engine**:
  * **Obsidian Dark (AMOLED)**: High-contrast deep cybernetic black (`#060913`).
  * **Material Light Studio**: Crisp white cards (`#ffffff`), soft elevation shadows, and slate typography (`#0f172a`).
  * Real-time switcher (`☀️/🌙`) syncing with system `<meta name="theme-color">`.
* **State Persistence (No Fake Data)**:
  * Purged all mock placeholder numbers and fake reviews.
  * Dynamic `localStorage` persistence across all features:
    * Completed checklist topics (`studyPulseCheckedTopics`).
    * Today's focus time and daily streak calculation (`studyPulseTodayFocus`, `studyPulseStreak`).
    * Real activity history rendering the daily cognitive heatmap (`studyPulseActivityHistory`).
    * 3D Memory Palace card recall stabilities (`studyPulsePalaceStability`).
    * RPG XP and level progression (`studyPulseXP`).

### Phase 7: Mobile Viewport & Native Horizontal Scroll Lock
* **Challenge**: The screen wobbled or scrolled left and right on mobile touch and within the Android WebView due to wide desktop elements, header action bars exceeding 360px viewport bounds, negative offscreen drawer offsets (`right: -480px`), and default WebView rubberband overscroll.
* **Resolution**:
  * **Strict Viewport Containment**: Configured `html, body` with `overflow-x: hidden !important;`, `overscroll-behavior-x: none !important;`, and `touch-action: pan-y pinch-zoom;`.
  * **WebView Hardening (`MainActivity.java`)**: Configured `webView.setHorizontalScrollBarEnabled(false);`, `webView.setOverScrollMode(View.OVER_SCROLL_NEVER);`, `s.setSupportZoom(false);`, and `s.setBuiltInZoomControls(false);`.
  * **Responsive UI Re-architecting**: Wrapped flex rows (`.hero-btn-row`, `.pomo-controls-row`, `.filter-controls-row`), made buttons stack vertically on mobile, and reduced the mobile top header footprint on `<= 600px` screens.
  * **Runtime Scroll Clamping (`studypulse.js`)**: Real-time event listener locking `window.scrollX` to 0 on scroll and touchmove events.

---

## 🏆 Key Architectural Principles
1. **Zero External Backend Dependencies**: The entire web app runs completely client-side. Web Audio is synthesized in real time; 3D models and leather textures are generated procedurally in memory.
2. **Local-First Data Storage**: All progress is stored in browser `localStorage`, ensuring 100% privacy, instantaneous load times, and persistence across app restarts.
3. **Responsive Hybrid Platform**: A single responsive codebase provides a rich desktop cybernetic workstation and seamlessly adapts into a Material 3 native app interface on mobile screens.
