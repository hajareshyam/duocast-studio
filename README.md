# DuoCast Studio 🎙️📹
### Free 2-Person Remote Live Recording Studio for Instagram Reels & Podcasts

**DuoCast Studio** is a 100% free, client-side, browser-based web application that allows two creators in different locations to connect via WebRTC, record split-screen video/audio in high definition, and download ready-to-post video files directly to their devices.

---

## ✨ Features

- **📱 9:16 Vertical Instagram Mode & 16:9 Landscape:** Default 1080 x 1920 for Reels, Shorts, and TikTok with one-click toggle to 16:9 for YouTube.
- **📐 5 Studio Layouts:**
  - **Split (50/50):** Top/Bottom or Side-by-Side with glowing neon divider.
  - **Picture-in-Picture (PiP):** Full-screen host with co-host in a floating corner bubble.
  - **Solo Host & Solo Co-Host:** Focused single speaker spotlight.
  - **🖥️ Screen + Duo:** Screen sharing / slide presentation with both co-hosts side-by-side!
- **⚡ Active Speaker Neon Glow:** Feeds dynamically illuminate with a glowing neon aura whenever a creator is actively speaking.
- **📝 Creator Teleprompter:** Built-in floating script drawer with adjustable auto-scroll speed (1x-6x) and font sizing right next to the camera lens.
- **⏸️ Pause & Resume Recording:** Pause recording anytime if interrupted, sneeze, or need a breath, and resume without creating separate files.
- **🎙️ Studio Audio DSP (Compressor + Limiter):** Web Audio Dynamics Compressor prevents clipping and distortion when shouting or laughing.
- **🎛️ Audio Sync Delay Slider (0ms – 500ms):** Fix Bluetooth / AirPods lip-sync latency with a live calibration slider in Settings.
- **🔊 Live Audio VU Meters & Mic Level Test:** Real-time animated 4-bar equalizers on canvas and in Settings.
- **🎧 Audio-Only Podcast Track Export:** Instantly download high-quality audio track (.webm/.wav) in addition to master video.
- **⌨️ Stream Deck Hotkeys:** Full keyboard control (`Space`/`M` mute, `V` camera, `R` record, `P` pause, `1-5` layouts, `S` soundboard, `C` chat, `T` prompter, `?` help).
- **🎨 Studio Themes & Quick Topic Chips:** Switch between Studio Indigo, Cyberpunk Neon, Sunset Gold, and Emerald Slate, plus one-click topic presets.
- **⏱️ 3-2-1 Recording Countdown:** Visual countdown with sync chime sounds so both participants prepare and speak at the exact same second.
- **🎉 Creator Soundboard (SFX):** Built-in Web Audio soundboard with Applause 👏, Ding 🔔, Airhorn 🚨, Drumroll 🥁, and Laughter 😂 mixed into the master recording.
- **📢 Scrolling Lower-Third Ticker:** Live marquee banner across the bottom for announcements, handles, and CTAs.
- **💬 Private Backstage Chat:** Silent text channel between Host and Co-Host over WebRTC data connection.
- **🔗 1-Click Invite Link & Room Persistence:** Host shares link, co-host joins instantly. Refreshing the browser preserves the active room and host privileges.
- **📥 Local Recording & Instant Download:** Direct client-side recording with zero watermarks.
- **⚡ 100% Free & Serverless:** Built for Cloudflare Pages & GitHub Pages using WebRTC and PeerJS cloud broker.

---

## ⚡ How to Deploy to Cloudflare Pages (100% Free Forever)

**Cloudflare Pages** offers unlimited bandwidth, instant global CDN edge caching, and automated Git CI/CD deployments for free:

### Method 1: Git Integration (Zero-Maintenance Auto Deploys)
1. Push your repository to GitHub: `https://github.com/hajareshyam/duocast-studio`.
2. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select your `duocast-studio` repository.
4. Set the build configuration:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Click **Save and Deploy**. In under 60 seconds, Cloudflare will deploy your studio with a free custom SSL domain (e.g., `https://duocast-studio.pages.dev`). Every future `git push` to `main` deploys automatically!

### Method 2: Direct CLI Deployment (Wrangler)
If you prefer deploying directly from your terminal:
1. Log in to your Cloudflare account once:
   ```bash
   npx wrangler login
   ```
2. Build and deploy:
   ```bash
   npm run build
   npm run deploy
   ```

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start local dev server with Hot Module Replacement (HMR)
npm run dev

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 💡 Best Practices for Recording
1. **Always wear headphones or earphones:** This eliminates any microphone feedback loop.
2. **Lighting:** Keep your light source in front of your face (window or ring light).
3. **Camera framing:** Align your face in the upper third of your video feed for optimal split-screen aesthetics.
