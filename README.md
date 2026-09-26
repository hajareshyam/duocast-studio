# DuoCast Studio 🎙️📹
### Free 2-Person Remote Live Recording Studio for Instagram Reels & Podcasts

**DuoCast Studio** is a 100% free, client-side, browser-based web application that allows two creators in different locations to connect via WebRTC, record split-screen video/audio in high definition, and download ready-to-post video files directly to their devices.

---

## ✨ Features

- **📱 9:16 Vertical Instagram Mode:** Perfect for Instagram Reels, TikTok, and YouTube Shorts (1080 x 1920).
- **🖥️ 16:9 Landscape Mode:** Side-by-side mode for YouTube videos, Facebook, and podcasts (1920 x 1080).
- **🔗 1-Click Invite Link:** Host clicks *"Copy Invite Link"* and sends it via WhatsApp or DM. When the co-host clicks the link, they automatically connect with zero configuration.
- **🎨 Custom Branding & Handle Overlays:** Type your Instagram handles (`@traveller.risha` & `@cohost`) and show title in real time.
- **🔊 Dual Audio Mixing (Web Audio API):** Merges both participants' audio streams into a single balanced track with noise suppression and echo cancellation.
- **📥 Local Recording & Instant Download:** Records using `MediaRecorder` directly in the browser and provides instant `.mp4` / `.webm` download with video preview.
- **⚡ 100% Free & Serverless:** Uses PeerJS free public broker for WebRTC signaling. Requires zero paid servers, zero databases, and zero subscriptions!

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
