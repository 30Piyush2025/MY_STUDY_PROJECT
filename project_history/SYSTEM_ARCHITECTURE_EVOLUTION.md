# StudyPulse System Architecture & Technical Specifications

This technical document details the engineering specifications, data models, rendering pipelines, and compilation toolchains of the **StudyPulse FOCUS ENGINE**.

---

## 🏗️ Architectural Topology

```
+-------------------------------------------------------------------------+
|                       StudyPulse Native Application                     |
|                                                                         |
|  +------------------------+  +-------------------+  +----------------+  |
|  | Android Material 3 UI  |  |  Theme Engine     |  |  State Engine  |  |
|  | (Bottom Nav / FAB)     |  |  (Dark / Light)   |  | (localStorage) |  |
|  +------------------------+  +-------------------+  +----------------+  |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  |                       Core Functional Engines                     |  |
|  |  +------------------+ +-------------------+ +------------------+  |  |
|  |  |  Pomodoro Focus  | |  Master Checklist | |  Active Recall   |  |  |
|  |  |  Chrono Engine   | |  Mastery Gauge    | |  FSRS v4.5       |  |  |
|  |  +------------------+ +-------------------+ +------------------+  |  |
|  +-------------------------------------------------------------------+  |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  |                       Interactive 3D & Simulators                 |  |
|  |  +------------------+ +-------------------+ +------------------+  |  |
|  |  | 3D Bookshelf     | | 3D Memory Palace  | | System Design    |  |  |
|  |  | (18 Volumes)     | | (Spatial FSRS)    | | Chaos Lab        |  |  |
|  |  +------------------+ +-------------------+ +------------------+  |  |
|  +-------------------------------------------------------------------+  |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  |                     Audio Biohacking Synthesizer                  |  |
|  |  +------------------+ +-------------------+ +------------------+  |  |
|  |  | Web Audio API    | | 4-Channel Mixer   | | Real-Time FFT    |  |  |
|  |  | Oscillators      | | (Gamma/Rain/Lofi) | | Canvas Spectrum  |  |  |
|  |  +------------------+ +-------------------+ +------------------+  |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
```

---

## 💾 LocalStorage Persistence Schemas

All application state is saved locally under isolated keys:

| Key | Type | Description |
| :--- | :--- | :--- |
| `studyPulseTheme` | `string` (`"dark"` \| `"light"`) | Current active visual theme palette |
| `studyPulseXP` | `string` (integer) | Cumulative user experience points |
| `studyPulseCheckedTopics` | `Array<string>` | List of mastered curriculum topic titles |
| `studyPulseTodayFocus` | `{"date": "YYYY-MM-DD", "minutes": number}` | Daily accumulated deep work focus duration |
| `studyPulseStreak` | `{"lastActiveDate": "YYYY-MM-DD", "count": number}` | Consecutive active study streak counter |
| `studyPulseActivityHistory` | `Record<string, number>` | Historical date-to-minutes map for cognitive density heatmap |
| `studyPulsePalaceStability` | `Record<string, number>` | FSRS memory recall stability percentages per card |
| `studyPulseReviews` | `Array<{id, author, rating, comment, date}>` | Real user/peer reviews submitted through drawer |

---

## 📦 Android Native APK Build Toolchain

The native Android application is compiled from source without external cloud dependencies:

1. **Manifest Configuration** (`AndroidManifest.xml`):
   * `package`: `com.studypulse.focusengine`
   * `minSdkVersion`: `26` (Android 8.0 Oreo+)
   * `targetSdkVersion`: `34` (Android 14/15 Modern Target)
   * Permissions: `INTERNET`, `ACCESS_NETWORK_STATE`, `VIBRATE`
   * Hardware Acceleration: `android:hardwareAccelerated="true"`
2. **Resource Compilation**:
   ```bash
   aapt package -m -J gen -M AndroidManifest.xml -S res -I android.jar
   ```
3. **Bytecode Compilation**:
   ```bash
   javac -source 8 -target 8 -cp android.jar -d obj gen/R.java src/MainActivity.java
   ```
4. **Dalvik Executable Generation**:
   ```bash
   dalvik-exchange --dex --output=bin/classes.dex obj
   ```
5. **Packaging, Alignment & Cryptographic Signing**:
   ```bash
   aapt package -f -M AndroidManifest.xml -S res -A assets -I android.jar -F bin/unaligned.apk
   cd bin && aapt add unaligned.apk classes.dex
   zipalign -f -p 4 bin/unaligned.apk bin/aligned.apk
   apksigner sign --ks debug.keystore --ks-pass pass:android --out StudyPulse.apk bin/aligned.apk
   ```
   Verified with **APK Signature Schemes v1, v2, and v3** for instant compatibility on Android 15.
