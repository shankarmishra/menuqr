# MenusQR Studio Recording & OBS Production Protocol

> **PRODUCTION STATUS BANNER:**
> **Status:** ✅ Capture Protocols, Audio Chains & OBS Profiles Complete | ⏳ Live Video Ingestion & Final Render Exports Pending Production Execution
> **Purpose:** Standard Operating Procedure (SOP) for capturing high-fidelity UI walkthroughs, live mobile interactions, and B2B marketing footage for MenusQR.
> **Target Formats:** 16:9 Landscape (3840 × 2160 4K / 1920 × 1080 1080p60) & 9:16 Vertical (1080 × 1920 60fps).

---

## 1. OBS Studio Master Configuration

### 1.1 Video Resolution & Base Canvas Profiles

To ensure pixel-perfect rendering of responsive UI, smooth font rasterization, and 60fps fluid CSS/GSAP animations, maintain two distinct OBS Profile/Scene collections:

```
+--------------------------------------------------------------------------------------------------------+
|                                    OBS MASTER CANVAS PROFILES                                          |
+--------------------------------------------------------------------------------------------------------+
| PROFILE A: DESKTOP & KDS WALKTHROUGH (16:9 Landscape)                                                 |
| • Base (Canvas) Resolution: 3840 × 2160 (4K UHD) or 1920 × 1080 (FHD Native)                           |
| • Output (Scaled) Resolution: Matches Base (No downscaling filter applied)                             |
| • Common FPS Values: 60.00 fps (Strict Constant Frame Rate - CFR)                                      |
|                                                                                                        |
| PROFILE B: MOBILE WEB & SOCIAL REELS (9:16 Vertical)                                                  |
| • Base (Canvas) Resolution: 1080 × 1920 (Native 9:16)                                                 |
| • Output (Scaled) Resolution: 1080 × 1920 (No downscaling)                                             |
| • Common FPS Values: 60.00 fps (Strict CFR)                                                            |
+--------------------------------------------------------------------------------------------------------+
```

---

### 1.2 Video Encoder Settings (Lossless & High-Bitrate Archival)

Never record with variable frame rate (VFR) or aggressive streaming compression. Use dedicated GPU hardware encoders:

| Setting Category | NVIDIA NVENC (Windows / PC) | Apple VideoToolbox (macOS M-Series) | Software Fallback (x264 / CPU) |
| :--- | :--- | :--- | :--- |
| **Encoder** | `NVIDIA NVENC HEVC / H.265` or `AV1` | `Apple ProRes 422` or `HEVC` | `x264` (Preset: `Slow`) |
| **Rate Control** | **CQP** (Constant Quantization Parameter) | **Quality-based** or ProRes 422 Target | **CRF** (Constant Rate Factor) |
| **Quality Factor** | `CQ = 14` (Near-lossless visual master) | ProRes 422 Standard (`~150 Mbps`) | `CRF = 16` |
| **Keyframe Interval** | `2 seconds` (`120 frames` @ 60fps) | `2 seconds` | `2 seconds` |
| **Preset** | `P7: Slowest (Best Quality)` | `High Quality / Master` | `slow` |
| **Tuning** | `High Quality (HQ)` | N/A | N/A |
| **Color Space** | `Rec. 709` | `Rec. 709` / `Apple Wide Gamut` | `Rec. 709` |
| **Color Range** | `Partial` (Standard TV/Broadcast 16–235) | `Video Range` | `Partial` |
| **Audio Bitrate** | `320 kbps AAC` (Stereo, 48 kHz) | `Uncompressed Linear PCM (24-bit)` | `320 kbps AAC` |

> [!IMPORTANT]
> **Audio Sample Rate Alignment:** Ensure Windows Sound Settings, OBS Studio (`Settings > Audio > Sample Rate`), and the audio interface/microphone are all locked to **48.0 kHz**. Mismatched sample rates (e.g., 44.1 kHz vs 48 kHz) cause subtle audio-video drift over 90-second and 3-minute recordings.

---

## 2. Browser & Window Capture Checklist for MenusQR UI

### 2.1 Chrome & Edge Browser Pre-Flight Setup
1. **Disable Chrome Extension Clutter:** Launch a clean, dedicated guest or developer profile:
   ```bash
   # Windows PowerShell command to launch dedicated clean recording window
   chrome.exe --user-data-dir="C:\chrome-record-profile" --no-first-run --disable-features=TranslateUI --window-size=1920,1080
   ```
2. **Hide Scrollbars:** Inject clean CSS to eliminate distracting native operating system scrollbars while scrolling menus:
   ```css
   /* Global Recording Injector */
   ::-webkit-scrollbar {
     display: none !important;
     width: 0px !important;
   }
   body {
     -ms-overflow-style: none !important;
     scrollbar-width: none !important;
   }
   ```
3. **Hardware Acceleration:** Ensure `Use hardware acceleration when available` is **ENABLED** in Chrome settings to maintain silky 60fps rendering for glassmorphism and theme parallax cards.
4. **HiDPI Screen Capture:**
   * For Desktop Dashboard (`/app/orders` and `/app/cashier`): Set browser zoom to **100%** on a native 1080p or 4K monitor.
   * For Mobile Web Customer Menu (`/m/:slug`): Open Chrome DevTools (`F12`), toggle Device Toolbar (`Ctrl+Shift+M`), select **iPhone 15 Pro** (Device Pixel Ratio: `3.0`, Viewport: `393 × 852 px`), and enable "Show device frame".

### 2.2 OBS Source Configuration Matrix

| Capture Target | OBS Source Type | Recommended Properties | Transform & Crop |
| :--- | :--- | :--- | :--- |
| **Live Customer Menu** | `Window Capture` (Chrome) | Method: `Windows Graphics Capture (WGC)`<br>Capture Cursor: `YES` | Crop to phone viewport or place within 1080 × 1920 phone mockup graphic. |
| **Kitchen Panel (`/app/orders`)** | `Window Capture` or `Browser Source` | Client Area Only; Capture Audio: `YES` | Full 1920 × 1080 canvas without browser URL bar. |
| **Cashier Panel (`/app/cashier`)** | `Window Capture` | Method: `WGC`<br>SDR White Level: `300 nits` | Full 1920 × 1080 canvas with visible table grid. |
| **Phone-in-Hand B-Roll** | `Video Capture Device` (Cam Link 4K) | Sony Alpha / mirrorless 4K HDMI out @ 60fps | 16:9 full sensor with shallow f/1.8 depth of field. |

---

## 3. Audio Engineering & Voice Recording Chain

### 3.1 Hardware Setup & Signal Flow
* **Microphone Choice:** Dynamic broadcast mic (Shure SM7B / Electro-Voice RE20) or directional shotgun (Rode NTG5 / Sennheiser MKH 416).
* **Distance & Angle:** 4 to 6 inches from speaker's mouth, positioned 30° off-axis to eliminate plosives ("P" and "B" bursts) without muddying proximity bass.
* **Acoustic Environment:** Minimum -45 dB ambient noise floor. Soft furnishings, acoustic absorption baffles, and closed doors to prevent room echo.

### 3.2 OBS DSP Audio Filter Chain (Applied in Exact Order)

```
[Mic Input (Analog Gain Staged to -18 dB)]
        │
        ▼
1. Noise Suppressor (RNNoise - Neural Network suppression)
        │
        ▼
2. High-Pass Filter (Low Cut at 80 Hz, 18 dB/oct slope)
        │
        ▼
3. Parametric EQ (Subtle mud dip at 320 Hz; presence lift +2.5 dB at 3.5 kHz)
        │
        ▼
4. Compressor (Ratio: 3.5:1 | Attack: 4ms | Release: 50ms | Threshold: -16 dB)
        │
        ▼
5. Sidechain Ducking (Ducks background music by -5.5 dB when VO exceeds -28 dB)
        │
        ▼
6. True Peak Limiter (Ceiling: -1.0 dBFS to prevent digital clipping)
```

---

## 4. Studio Lighting & Production Stage Design

### 4.1 Color Temperature & Three-Point Lighting Guide

```
                         [Back / Rim Light]
                     (5600K Daylight, 30% Power)
                     Separates subject from background
                                  │
                                  ▼
      [Camera 4K] ───► [Actor / Teak Dining Table with Gold Standee]
                                  ▲
                         ┌────────┴────────┐
                         │                 │
                [Key Light (Softbox)]   [Fill Light / Bounce]
              (4500K Warm Golden, 75%) (4500K Warm, 25% or White Card)
              Muted warm hospitality    Softens shadow under jaw
```

### 4.2 Gold Standee Glare Elimination
* **Circular Polarizing Filter (CPL):** Mount a high-index CPL filter on the camera lens. Rotate the filter until specular glare from the brushed 24K gold standee is eliminated while preserving metallic luster.
* **Diffused Lighting:** Use double-diffused octaboxes or scrims rather than bare LEDs to prevent hot white pin-point reflections on acrylic standees and smartphone screens.

---

## 5. Post-Production Editing & Master Export Specifications

### 5.1 Non-Linear Editor (NLE) Project Settings (DaVinci Resolve / Adobe Premiere)
* **Timeline Timebase:** Strictly **60.00 fps** (prevents frame skipping or dropped frames on rapid UI transitions).
* **Color Science:** DaVinci YRGB Color Managed or Rec.709 Gamma 2.4.
* **Working Audio Submixes:**
  * Track A1: Spoken Voiceover (Dialogue Master) -> Target: **-16 LUFS Integrated**.
  * Track A2: UI Foley / Sound FX (Haptic clicks, chimes, printer sound) -> Peak: **-10 dBFS**.
  * Track A3: Ambient Hospitality Background (Restaurant murmur) -> Level: **-24 dBFS**.
  * Track A4: Music Bed (Acoustic/Electro-Fusion) -> Normal: **-14 dBFS**; Ducked: **-20 dBFS**.

### 5.2 Master Export Presets

#### A. Master Archive (Long-Term Preservation)
* **Format:** QuickTime (`.mov`)
* **Codec:** Apple ProRes 422 HQ (or Avid DNxHR HQX)
* **Resolution:** 3840 × 2160 (16:9) and 1080 × 1920 (9:16)
* **Frame Rate:** 60.00 fps Constant
* **Audio:** 24-bit 48 kHz Linear PCM Stereo

#### B. Web & Social Distribution (MenusQR Official Website, YouTube, Meta Ads)
* **Format:** MP4 (`.mp4`)
* **Codec:** H.264 / MPEG-4 AVC (High Profile, Level 5.2)
* **Bitrate:**
  * 4K Landscape: **55 Mbps VBR 2-Pass**
  * 1080p Landscape: **22 Mbps VBR 2-Pass**
  * 1080p Vertical: **18 Mbps VBR 2-Pass**
* **Audio:** AAC Stereo, 320 kbps, 48 kHz
* **Loudness Compliance:** Standard -14 to -16 LUFS Integrated, True Peak ≤ -1.0 dBTP.
