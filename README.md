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
- **⚡ 100% Free & Serverless:** Built for GitHub Pages using WebRTC and PeerJS cloud broker.

---

## 🚀 How to Deploy to GitHub Pages (2 Minutes)

Because this app uses only standard web technologies (`index.html`, `style.css`, and `app.js`), it can be hosted completely free on **GitHub Pages**:

### Step 1: Create a GitHub Repository
1. Go to [github.com/new](https://github.com/new).
2. Repository name: `duocast-studio` (or any name you prefer).
3. Set visibility to **Public**.
4. Click **Create repository**.

### Step 2: Push the Files to GitHub
Open your terminal in this project folder and run:
```bash
git init
git add .
git commit -m "Initial commit of DuoCast Studio"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/duocast-studio.git
git push -u origin main
```
*(Or simply drag and drop `index.html`, `style.css`, and `app.js` into GitHub's web interface via the **Upload files** button).*

### Step 3: Enable GitHub Pages
1. Go to your repository on GitHub.
2. Click **Settings** (tab at the top right).
3. In the left sidebar, click **Pages**.
4. Under **Build and deployment > Branch**:
   - Select **`main`** from the branch dropdown.
   - Folder: **`/(root)`**.
   - Click **Save**.

### Step 4: Access Your Live Link!
Within 30–60 seconds, GitHub will provide your live URL:
`https://YOUR_GITHUB_USERNAME.github.io/duocast-studio/`

Both you and your co-host can open this link on iPhone, Android, Mac, or Windows.

---

## 🧪 Testing Locally (On Your Computer)

To test the application locally on your machine:

```bash
# Start a local static HTTP server
python3 -m http.server 8000
```
Then open [http://localhost:8000](http://localhost:8000) in your browser.
*(Tip: Open a second Incognito window or test on a phone using your local Wi-Fi IP to test 2-person connection).*

---

## 💡 Best Practices for Recording
1. **Always wear headphones or earphones:** This eliminates any microphone feedback loop.
2. **Lighting:** Keep your light source in front of your face (window or ring light).
3. **Camera framing:** Align your face in the upper third of your video feed for optimal split-screen aesthetics.
