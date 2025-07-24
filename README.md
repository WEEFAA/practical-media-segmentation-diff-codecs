## 🎥 AV1 Codec — Summary & FFmpeg Relevance (for Media Segmentation)

## How to run

```bash
npm run dev
```

Use network debugging tool to throttle and disable cache.
<img width="139" height="22" alt="image" src="https://github.com/user-attachments/assets/ce3ac6cb-2c9f-435e-9ff4-8e1f7b7a6631" />

### 🧠 What is AV1?

- **AV1** is a next-generation, royalty-free video codec developed by the Alliance for Open Media (AOM).
- It achieves **~30–50% better compression** than H.264 and VP9 while maintaining similar visual quality.

---

### 🔄 Bitrate Efficiency

- Bitrate = amount of data per second used to represent audio/video.
- AV1 is designed to **retain quality even at lower bitrates**:
  - H.264 @ 3000 kbps ≈ AV1 @ 1500 kbps (for 1080p video)
  - Saves data, reduces file sizes, and decreases network load.

---

### 🖥 Where AV1 Benefits Are Realized

- **Encoding time (backend):** Video is compressed using AV1.
- **Frontend (browsers/devices):** Sees faster load times, less buffering, lower data use — especially on low bandwidth or mobile.
- **Streaming services** benefit the most (e.g. YouTube, Netflix, Twitch).

---

### ⚡ Hardware Decode

- AV1 decoding can be offloaded to **dedicated hardware blocks** in GPUs or SoCs.
- ✅ Reduces CPU load
- ✅ Saves battery
- ✅ Enables smooth playback of high-res AV1 content on mobile & laptops

I want to test it in devices where there's an actual silicon / circuit to see the diff... :<

### Examples:

- ✅ Intel 11th-gen+, AMD RDNA2, NVIDIA RTX 30/40 series
- ✅ Snapdragon 8 Gen 2, MediaTek Dimensity, Apple M-series

---

### 🛠 Using FFmpeg with AV1

### Encode to AV1:

```bash
bash
ffmpeg -i input.mp4 -c:v libaom-av1 -crf 30 -b:v 0 output.webm
```

- `c:v libaom-av1` → AV1 encoder
- `crf 30` → quality level (lower is better)
- `b:v 0` → enables constant quality mode (VBR)
  > you can adjust this if you want increase speed 😉

### Encode to AV1 using alternative encoders:

- `libaom-av1` → official reference (😎 supported by default in ffmpeg, EXTREMELY SLOW)
- `svtav1` → fast, multithreaded (limited)
- `rav1e` → simpler? (limited)

### Check support:

```bash
bash
ffmpeg -codecs | findstr av1
```

I only test this example using libaom-av1. I'm on a crappy laptop

---

### 🎯 Use Cases for AV1

- Streaming to mobile/low-bandwidth users
- Archiving high-quality videos with small file sizes
- Reducing CDN and storage costs

## 🎚 Recommended Bitrates by Resolution (for Streaming / Encoding)

| Resolution     | Frame Rate | H.264 Bitrate      | AV1 Bitrate (est.) |
| -------------- | ---------- | ------------------ | ------------------ |
| **360p**       | 30 fps     | 400–800 kbps       | 200–400 kbps       |
| **480p**       | 30 fps     | 800–1,200 kbps     | 400–600 kbps       |
| **720p**       | 30 fps     | 1,500–3,000 kbps   | 750–1,500 kbps     |
| **720p**       | 60 fps     | 2,500–4,000 kbps   | 1,200–2,000 kbps   |
| **1080p**      | 30 fps     | 3,000–5,000 kbps   | 1,500–2,500 kbps   |
| **1080p**      | 60 fps     | 4,500–6,000 kbps   | 2,000–3,500 kbps   |
| **1440p (2K)** | 30 fps     | 6,000–10,000 kbps  | 3,000–5,000 kbps   |
| **1440p (2K)** | 60 fps     | 9,000–13,000 kbps  | 4,500–6,500 kbps   |
| **2160p (4K)** | 30 fps     | 13,000–20,000 kbps | 6,500–12,000 kbps  |
| **2160p (4K)** | 60 fps     | 20,000–35,000 kbps | 10,000–20,000 kbps |

## References

- [Recommended latest guide for fundamental out there](https://img.ly/blog/ultimate-guide-to-ffmpeg)
- [ffmpeg](https://ffmpeg.org/ffmpeg.html)

## Sample Segmentation or Media Segmentation script

```bash
ffmpeg -i input.mp4 \
  -map 0:v:0 -map 0:a:0 \
  -c:v libaom-av1 -b:v 300k \
  -c:a libopus -b:a 128k \
  -f dash \
  -seg_duration 4 \
  -init_seg_name init-$RepresentationID$.m4s \
  -media_seg_name chunk-$RepresentationID$-$Number$.m4s \
  -use_timeline 0 -use_template 1 \
  manifest.mpd
```
