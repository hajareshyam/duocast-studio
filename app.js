/**
 * DuoCast Studio • Client-Side 2-Person Live Recorder
 * 100% Free & Open-Source (Runs directly on GitHub Pages)
 */

(function () {
  'use strict';

  // --- State Configuration ---
  const state = {
    peer: null,
    peerId: null,
    remotePeerId: null,
    activeCall: null,
    dataConn: null,        // WebRTC Data Connection for syncing names and recording status
    isHost: true,          // Room Owner = true, Guest = false
    roomCode: '',
    
    // User Identity
    userName: '',
    
    // Media Streams
    localStream: null,
    remoteStream: null,
    facingMode: 'user',    // 'user' or 'environment'
    isMicMuted: false,
    isCamOff: false,
    
    // Layout
    layoutMode: 'vertical', // 'vertical' (9:16) or 'landscape' (16:9)
    swapPositions: false,   // swap local & remote feeds
    
    // Audio Context Mixer
    audioCtx: null,
    audioDestination: null,
    localAudioSource: null,
    remoteAudioSource: null,
    
    // Recording (Host Exclusive)
    mediaRecorder: null,
    recordedChunks: [],
    isRecording: false,
    recordStartTime: 0,
    recordTimerInterval: null,
    recordedBlob: null,
    
    // Branding & Overlay
    hostName: '@traveller.risha',
    guestName: '@guest.creator',
    showTitle: 'Live Travel & Mom-Life Talk 🎙️'
  };

  // --- DOM Elements ---
  const studioCanvas = document.getElementById('studioCanvas');
  const canvasCtx = studioCanvas.getContext('2d');
  const canvasWrapper = document.getElementById('canvasWrapper');
  
  const localVideo = document.getElementById('localVideo');
  const remoteVideo = document.getElementById('remoteVideo');
  
  // Status Badges
  const connectionStatusBadge = document.getElementById('connectionStatusBadge');
  const connectionStatusText = document.getElementById('connectionStatusText');
  const recordingTimerBadge = document.getElementById('recordingTimerBadge');
  const recordingTimerDisplay = document.getElementById('recordingTimerDisplay');
  const currentRoomCodeEl = document.getElementById('currentRoomCode');
  const hudResolutionTag = document.getElementById('hudResolutionTag');
  const hudLiveTag = document.getElementById('hudLiveTag');

  // Action Buttons
  const copyInviteBtn = document.getElementById('copyInviteBtn');
  const joinDifferentRoomBtn = document.getElementById('joinDifferentRoomBtn');
  const layoutToggleBtn = document.getElementById('layoutToggleBtn');
  const layoutModeText = document.getElementById('layoutModeText');
  const toggleMicBtn = document.getElementById('toggleMicBtn');
  const toggleCamBtn = document.getElementById('toggleCamBtn');
  const flipCameraBtn = document.getElementById('flipCameraBtn');
  const swapLayoutBtn = document.getElementById('swapLayoutBtn');
  
  // Recording Controls
  const recordToggleBtn = document.getElementById('recordToggleBtn');
  const recordBtnLabel = document.getElementById('recordBtnLabel');
  const guestRecordBadge = document.getElementById('guestRecordBadge');
  const guestRecordLabel = document.getElementById('guestRecordLabel');

  // Welcome / Onboarding Modal
  const welcomeModal = document.getElementById('welcomeModal');
  const welcomeForm = document.getElementById('welcomeForm');
  const welcomeSubtitle = document.getElementById('welcomeSubtitle');
  const userNameInput = document.getElementById('userNameInput');
  const hostOnlyFields = document.getElementById('hostOnlyFields');
  const initialTopicInput = document.getElementById('initialTopicInput');
  const roleNoticeBadge = document.getElementById('roleNoticeBadge');
  const enterStudioBtn = document.getElementById('enterStudioBtn');
  const closeWelcomeBtn = document.getElementById('closeWelcomeBtn');

  // Other Modals & Controls
  const joinModal = document.getElementById('joinModal');
  const manualRoomCodeInput = document.getElementById('manualRoomCodeInput');
  const confirmJoinBtn = document.getElementById('confirmJoinBtn');
  const closeJoinModalBtn = document.getElementById('closeJoinModalBtn');

  const recordingResultModal = document.getElementById('recordingResultModal');
  const recordedPlayback = document.getElementById('recordedPlayback');
  const downloadVideoAnchor = document.getElementById('downloadVideoAnchor');
  const closeResultModalBtn = document.getElementById('closeResultModalBtn');
  const discardVideoBtn = document.getElementById('discardVideoBtn');
  const recordedFileSizeBadge = document.getElementById('recordedFileSizeBadge');
  const recordedDurationBadge = document.getElementById('recordedDurationBadge');

  const settingsModal = document.getElementById('settingsModal');
  const settingsModalBtn = document.getElementById('settingsModalBtn');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const applySettingsBtn = document.getElementById('applySettingsBtn');
  const cameraSelect = document.getElementById('cameraSelect');
  const microphoneSelect = document.getElementById('microphoneSelect');

  const guideModal = document.getElementById('guideModal');
  const guideModalBtn = document.getElementById('guideModalBtn');
  const closeGuideBtn = document.getElementById('closeGuideBtn');
  const gotItGuideBtn = document.getElementById('gotItGuideBtn');

  const hostNameInput = document.getElementById('hostNameInput');
  const guestNameInput = document.getElementById('guestNameInput');
  const topicInput = document.getElementById('topicInput');
  const toastContainer = document.getElementById('toastContainer');

  // Icons
  const micOnIcon = document.getElementById('micOnIcon');
  const micOffIcon = document.getElementById('micOffIcon');
  const camOnIcon = document.getElementById('camOnIcon');
  const camOffIcon = document.getElementById('camOffIcon');

  // --- Step 1: Pre-Entry Setup (Prompt Name First) ---
  function setupWelcomeScreen() {
    const urlParams = new URLSearchParams(window.location.search);
    const requestedRoom = urlParams.get('room');

    const savedName = localStorage.getItem('duocast_username') || '';

    if (requestedRoom) {
      // User is joining an existing room as a Guest
      state.isHost = false;
      state.roomCode = requestedRoom;
      
      welcomeSubtitle.textContent = `You've been invited to join room "${requestedRoom}" as Co-Host.`;
      roleNoticeBadge.innerHTML = `<span class="badge-role-icon">🎙️</span><span>You are joining as <strong>Co-Host (Guest)</strong>. The Room Owner will manage recording.</span>`;
      hostOnlyFields.classList.add('hidden');
      enterStudioBtn.querySelector('span').textContent = 'Join Studio 🎥';

      userNameInput.value = savedName || '@guest.creator';
      userNameInput.placeholder = 'e.g. @your_instagram_handle';
    } else {
      // User is creating a new room as Host (Room Owner)
      state.isHost = true;
      const autoRoom = 'duocast-' + Math.random().toString(36).substring(2, 8);
      state.roomCode = autoRoom;

      welcomeSubtitle.textContent = 'Please enter your name or Instagram handle to launch your recording room.';
      roleNoticeBadge.innerHTML = `<span class="badge-role-icon">👑</span><span>You are the <strong>Room Owner (Host)</strong>. Only you can start and stop recording.</span>`;
      hostOnlyFields.classList.remove('hidden');
      enterStudioBtn.querySelector('span').textContent = 'Create Studio 🎙️';

      userNameInput.value = savedName || '@traveller.risha';
      userNameInput.placeholder = 'e.g. @traveller.risha';
    }

    // Show welcome modal
    welcomeModal.classList.remove('hidden');
    welcomeModal.style.display = 'flex';
    userNameInput.focus();
  }

  function closeWelcomeModal() {
    if (welcomeModal) {
      welcomeModal.classList.add('hidden');
      welcomeModal.style.display = 'none';
    }
  }

  // --- Step 2: Handle Welcome Form Submission & Enter Studio ---
  async function handleWelcomeSubmit(e) {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    let enteredName = userNameInput.value.trim();
    if (!enteredName) {
      enteredName = state.isHost ? '@traveller.risha' : '@guest.creator';
      userNameInput.value = enteredName;
    }

    state.userName = enteredName;
    localStorage.setItem('duocast_username', enteredName);

    if (state.isHost) {
      state.hostName = enteredName;
      hostNameInput.value = enteredName;
      if (initialTopicInput && initialTopicInput.value.trim()) {
        state.showTitle = initialTopicInput.value.trim();
        topicInput.value = state.showTitle;
      }
      recordToggleBtn.classList.remove('hidden');
      guestRecordBadge.classList.add('hidden');
    } else {
      state.guestName = enteredName;
      guestNameInput.value = enteredName;
      recordToggleBtn.classList.add('hidden');
      guestRecordBadge.classList.remove('hidden');
      guestRecordLabel.textContent = 'Host Controls Rec';
    }

    // Hide welcome modal immediately
    closeWelcomeModal();
    showToast(`Welcome, ${enteredName}!`, 'success');

    // Launch media & connection
    try {
      await startLocalMedia();
      populateDeviceList();
    } catch (mediaErr) {
      console.warn('Media startup warning:', mediaErr);
    }

    if (state.isHost) {
      initPeerAsHost(state.roomCode);
    } else {
      initPeerAsGuest(state.roomCode);
    }

    // Start Compositor Render Loop
    requestAnimationFrame(renderCanvasLoop);
  }

  // --- Local Camera & Mic Access ---
  async function startLocalMedia(exactVideoId, exactAudioId) {
    try {
      if (state.localStream) {
        state.localStream.getTracks().forEach(t => t.stop());
      }

      const constraints = {
        video: exactVideoId ? { deviceId: { exact: exactVideoId } } : {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: state.facingMode
        },
        audio: exactAudioId ? { deviceId: { exact: exactAudioId } } : {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      state.localStream = stream;
      localVideo.srcObject = stream;

      setupAudioMixer();
      showToast('Camera and microphone connected', 'success');
    } catch (err) {
      console.error('Error accessing camera/mic:', err);
      showToast('Camera/mic error: ' + err.message, 'error');
    }
  }

  // --- PeerJS Signaling Setup (Free Public Broker) ---
  function initPeerAsHost(roomId) {
    updateStatus('connecting', 'Creating Room...');
    currentRoomCodeEl.textContent = roomId;

    state.peer = new Peer(roomId, { debug: 1 });

    state.peer.on('open', (id) => {
      state.peerId = id;
      updateStatus('offline', 'Ready for Guest (Owner)');
      showToast('Studio ready! Click "Copy Invite Link" to invite your co-host.', 'success');
    });

    // Accept incoming data connection from guest
    state.peer.on('connection', (conn) => {
      setupHostDataConnection(conn);
    });

    // Listen for incoming media call from guest
    state.peer.on('call', (call) => {
      state.activeCall = call;
      call.answer(state.localStream);

      call.on('stream', (remoteStream) => {
        state.remoteStream = remoteStream;
        remoteVideo.srcObject = remoteStream;
        setupAudioMixer();
        updateStatus('connected', 'Co-Host Connected');
        showToast('Co-Host joined the video feed!', 'success');
      });

      call.on('close', handleRemoteDisconnect);
      call.on('error', (err) => {
        console.error('Call error:', err);
        handleRemoteDisconnect();
      });
    });

    state.peer.on('error', (err) => {
      console.warn('Peer error:', err);
      if (err.type === 'unavailable-id') {
        const fallbackRoom = 'duocast-' + Math.random().toString(36).substring(2, 8);
        initPeerAsHost(fallbackRoom);
      } else {
        updateStatus('offline', 'Connection Error');
      }
    });
  }

  function initPeerAsGuest(hostRoomId) {
    updateStatus('connecting', 'Connecting to Host...');
    currentRoomCodeEl.textContent = hostRoomId;

    state.peer = new Peer({ debug: 1 });

    state.peer.on('open', (myGuestId) => {
      state.peerId = myGuestId;
      connectToHost(hostRoomId);
    });

    state.peer.on('error', (err) => {
      console.error('Peer error as guest:', err);
      updateStatus('offline', 'Connection Error');
      showToast('Could not connect to room: ' + err.message, 'error');
    });
  }

  function connectToHost(hostRoomId) {
    if (!state.localStream) return;
    
    updateStatus('connecting', 'Calling Room Owner...');

    // 1. Establish Data Channel to sync names and recording state
    const conn = state.peer.connect(hostRoomId);
    setupGuestDataConnection(conn);

    // 2. Establish Media Stream Call
    const call = state.peer.call(hostRoomId, state.localStream);
    state.activeCall = call;

    call.on('stream', (remoteStream) => {
      state.remoteStream = remoteStream;
      remoteVideo.srcObject = remoteStream;
      setupAudioMixer();
      updateStatus('connected', 'Connected to Host');
      showToast('Connected to studio!', 'success');
    });

    call.on('close', handleRemoteDisconnect);
    call.on('error', (err) => {
      console.error('Call error:', err);
      handleRemoteDisconnect();
    });
  }

  // --- Data Connection: Host Side ---
  function setupHostDataConnection(conn) {
    state.dataConn = conn;

    conn.on('open', () => {
      // Send host name and show title to the guest
      conn.send({
        type: 'HOST_SYNC',
        hostName: state.hostName,
        showTitle: state.showTitle,
        isRecording: state.isRecording
      });
    });

    conn.on('data', (data) => {
      if (data && data.type === 'GUEST_NAME') {
        state.guestName = data.name;
        guestNameInput.value = data.name;
        showToast(`Co-Host "${data.name}" synced`, 'info');
      }
    });

    conn.on('close', () => {
      state.dataConn = null;
    });
  }

  // --- Data Connection: Guest Side ---
  function setupGuestDataConnection(conn) {
    state.dataConn = conn;

    conn.on('open', () => {
      // Send our guest name to the host
      conn.send({
        type: 'GUEST_NAME',
        name: state.guestName
      });
    });

    conn.on('data', (data) => {
      if (!data) return;

      if (data.type === 'HOST_SYNC') {
        state.hostName = data.hostName;
        state.showTitle = data.showTitle;
        hostNameInput.value = data.hostName;
        topicInput.value = data.showTitle;
        if (data.isRecording) {
          triggerGuestRecordingUI(true);
        }
      } else if (data.type === 'RECORDING_START') {
        triggerGuestRecordingUI(true);
        showToast('🔴 Room Owner started recording!', 'success');
      } else if (data.type === 'RECORDING_STOP') {
        triggerGuestRecordingUI(false);
        showToast('⏹️ Room Owner stopped recording', 'info');
      }
    });

    conn.on('close', () => {
      state.dataConn = null;
    });
  }

  // Guest UI update when Host records
  function triggerGuestRecordingUI(isRec) {
    if (isRec) {
      guestRecordBadge.classList.add('is-recording');
      guestRecordLabel.textContent = 'REC (By Host)';
      recordingTimerBadge.classList.remove('hidden');
      hudLiveTag.textContent = 'REC ●';
      hudLiveTag.style.background = '#ef4444';
      state.recordStartTime = Date.now();
      startTimerInterval();
    } else {
      guestRecordBadge.classList.remove('is-recording');
      guestRecordLabel.textContent = 'Host Controls Rec';
      recordingTimerBadge.classList.add('hidden');
      hudLiveTag.textContent = 'LIVE PREVIEW';
      hudLiveTag.style.background = 'rgba(0, 0, 0, 0.6)';
      clearInterval(state.recordTimerInterval);
    }
  }

  function handleRemoteDisconnect() {
    state.remoteStream = null;
    remoteVideo.srcObject = null;
    updateStatus('offline', 'Co-Host Disconnected');
    showToast('Co-Host left the studio', 'error');
  }

  // --- Audio Mixer (Web Audio API) ---
  function setupAudioMixer() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!state.audioCtx) {
        state.audioCtx = new AudioContextClass();
        state.audioDestination = state.audioCtx.createMediaStreamDestination();
      }

      if (state.audioCtx.state === 'suspended') {
        state.audioCtx.resume();
      }

      // Mix local audio
      if (state.localStream && state.localStream.getAudioTracks().length > 0) {
        if (state.localAudioSource) {
          state.localAudioSource.disconnect();
        }
        state.localAudioSource = state.audioCtx.createMediaStreamSource(state.localStream);
        state.localAudioSource.connect(state.audioDestination);
      }

      // Mix remote audio
      if (state.remoteStream && state.remoteStream.getAudioTracks().length > 0) {
        if (state.remoteAudioSource) {
          state.remoteAudioSource.disconnect();
        }
        state.remoteAudioSource = state.audioCtx.createMediaStreamSource(state.remoteStream);
        state.remoteAudioSource.connect(state.audioDestination);
      }
    } catch (e) {
      console.warn('AudioContext setup issue:', e);
    }
  }

  // --- Canvas Video Compositor Loop ---
  function renderCanvasLoop() {
    const cw = studioCanvas.width;
    const ch = studioCanvas.height;

    // 1. Draw Studio Background with subtle gradient
    const bgGradient = canvasCtx.createLinearGradient(0, 0, cw, ch);
    bgGradient.addColorStop(0, '#0a0c14');
    bgGradient.addColorStop(0.5, '#10121d');
    bgGradient.addColorStop(1, '#07090e');
    canvasCtx.fillStyle = bgGradient;
    canvasCtx.fillRect(0, 0, cw, ch);

    // Identify which stream is Top/Left and Bottom/Right
    const feed1 = state.swapPositions ? state.remoteStream : state.localStream;
    const feed2 = state.swapPositions ? state.localStream : state.remoteStream;
    const feed1Video = state.swapPositions ? remoteVideo : localVideo;
    const feed2Video = state.swapPositions ? localVideo : remoteVideo;

    const label1 = state.swapPositions ? state.guestName : state.hostName;
    const label2 = state.swapPositions ? state.hostName : state.guestName;

    if (state.layoutMode === 'vertical') {
      // 9:16 Vertical Instagram Split Screen (Top / Bottom)
      const halfH = ch / 2;

      // Draw Top Feed
      drawVideoFeed(feed1Video, feed1, 0, 0, cw, halfH, label1, 'Host');

      // Draw Elegant Center Divider Line with Neon Glow
      canvasCtx.save();
      canvasCtx.shadowColor = '#6366f1';
      canvasCtx.shadowBlur = 12;
      canvasCtx.strokeStyle = 'rgba(99, 102, 241, 0.8)';
      canvasCtx.lineWidth = 4;
      canvasCtx.beginPath();
      canvasCtx.moveTo(0, halfH);
      canvasCtx.lineTo(cw, halfH);
      canvasCtx.stroke();
      canvasCtx.restore();

      // Draw Bottom Feed
      drawVideoFeed(feed2Video, feed2, 0, halfH, cw, halfH, label2, 'Co-Host');

      // Draw Top Branding Header Banner
      drawTopHeaderBanner(cw);

    } else {
      // 16:9 Landscape Mode (Side by Side)
      const halfW = cw / 2;

      // Draw Left Feed
      drawVideoFeed(feed1Video, feed1, 0, 0, halfW, ch, label1, 'Host');

      // Draw Center Divider Line
      canvasCtx.save();
      canvasCtx.shadowColor = '#6366f1';
      canvasCtx.shadowBlur = 10;
      canvasCtx.strokeStyle = 'rgba(99, 102, 241, 0.8)';
      canvasCtx.lineWidth = 4;
      canvasCtx.beginPath();
      canvasCtx.moveTo(halfW, 0);
      canvasCtx.lineTo(halfW, ch);
      canvasCtx.stroke();
      canvasCtx.restore();

      // Draw Right Feed
      drawVideoFeed(feed2Video, feed2, halfW, 0, halfW, ch, label2, 'Co-Host');

      // Draw Top Branding Header Banner
      drawTopHeaderBanner(cw);
    }

    requestAnimationFrame(renderCanvasLoop);
  }

  // Draw an individual video feed with "cover" aspect-ratio preservation
  function drawVideoFeed(videoEl, streamObj, x, y, w, h, nameTag, roleTag) {
    if (streamObj && videoEl && videoEl.readyState >= 2 && videoEl.videoWidth > 0) {
      const vw = videoEl.videoWidth;
      const vh = videoEl.videoHeight;
      const videoRatio = vw / vh;
      const destRatio = w / h;

      let sx, sy, sw, sh;
      if (videoRatio > destRatio) {
        sh = vh;
        sw = vh * destRatio;
        sx = (vw - sw) / 2;
        sy = 0;
      } else {
        sw = vw;
        sh = vw / destRatio;
        sx = 0;
        sy = (vh - sh) / 2;
      }

      canvasCtx.drawImage(videoEl, sx, sy, sw, sh, x, y, w, h);
    } else {
      drawEmptyPlaceholder(x, y, w, h, roleTag);
    }

    drawNameBadge(x + 24, y + h - 54, nameTag);
  }

  function drawEmptyPlaceholder(x, y, w, h, role) {
    canvasCtx.fillStyle = 'rgba(18, 20, 30, 0.95)';
    canvasCtx.fillRect(x, y, w, h);

    canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    canvasCtx.strokeRect(x + 10, y + 10, w - 20, h - 20);

    canvasCtx.fillStyle = '#94a3b8';
    canvasCtx.font = '600 24px "Plus Jakarta Sans", sans-serif';
    canvasCtx.textAlign = 'center';
    
    if (role === 'Co-Host') {
      canvasCtx.fillText('⌛ Waiting for Co-Host to join...', x + w / 2, y + h / 2 - 20);
      canvasCtx.font = '500 18px "Plus Jakarta Sans", sans-serif';
      canvasCtx.fillStyle = '#64748b';
      canvasCtx.fillText('Share your Room Link to start recording together', x + w / 2, y + h / 2 + 15);
    } else {
      canvasCtx.fillText('Connecting Camera...', x + w / 2, y + h / 2);
    }
  }

  function drawNameBadge(x, y, text) {
    if (!text) return;
    canvasCtx.save();
    canvasCtx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    const textMetrics = canvasCtx.measureText(text);
    const padX = 18;
    const badgeW = textMetrics.width + (padX * 2);
    const badgeH = 38;

    canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    canvasCtx.beginPath();
    canvasCtx.roundRect(x, y, badgeW, badgeH, 10);
    canvasCtx.fill();

    canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    canvasCtx.lineWidth = 1.5;
    canvasCtx.stroke();

    canvasCtx.fillStyle = '#ffffff';
    canvasCtx.textAlign = 'left';
    canvasCtx.textBaseline = 'middle';
    canvasCtx.fillText(text, x + padX, y + (badgeH / 2));
    canvasCtx.restore();
  }

  function drawTopHeaderBanner(cw) {
    if (!state.showTitle) return;
    canvasCtx.save();
    canvasCtx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    const textMetrics = canvasCtx.measureText(state.showTitle);
    const padX = 24;
    const bannerW = Math.min(textMetrics.width + (padX * 2), cw - 60);
    const bannerH = 46;
    const bx = (cw - bannerW) / 2;
    const by = 30;

    canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    canvasCtx.beginPath();
    canvasCtx.roundRect(bx, by, bannerW, bannerH, 12);
    canvasCtx.fill();

    canvasCtx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
    canvasCtx.lineWidth = 1.5;
    canvasCtx.stroke();

    canvasCtx.fillStyle = '#f8fafc';
    canvasCtx.textAlign = 'center';
    canvasCtx.textBaseline = 'middle';
    canvasCtx.fillText(state.showTitle, cw / 2, by + (bannerH / 2));
    canvasCtx.restore();
  }

  // --- Recording Engine (Room Owner / Host Only) ---
  function startRecording() {
    if (!state.isHost) {
      showToast('Only the Room Owner (Host) can start recording', 'error');
      return;
    }

    setupAudioMixer();

    const canvasStream = studioCanvas.captureStream(30);

    if (state.audioDestination && state.audioDestination.stream.getAudioTracks().length > 0) {
      canvasStream.addTrack(state.audioDestination.stream.getAudioTracks()[0]);
    } else if (state.localStream && state.localStream.getAudioTracks().length > 0) {
      canvasStream.addTrack(state.localStream.getAudioTracks()[0]);
    }

    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/mp4;codecs=avc1,mp4a.40.2',
      'video/mp4',
      'video/webm'
    ];
    let selectedMime = '';
    for (const mime of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mime)) {
        selectedMime = mime;
        break;
      }
    }

    try {
      state.recordedChunks = [];
      state.mediaRecorder = new MediaRecorder(canvasStream, selectedMime ? { mimeType: selectedMime, videoBitsPerSecond: 4500000 } : {});
      
      state.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          state.recordedChunks.push(e.data);
        }
      };

      state.mediaRecorder.onstop = handleRecordingStopped;

      state.mediaRecorder.start(1000);
      state.isRecording = true;
      state.recordStartTime = Date.now();

      // UI updates
      recordToggleBtn.classList.add('is-recording');
      recordBtnLabel.textContent = 'Stop';
      recordingTimerBadge.classList.remove('hidden');
      hudLiveTag.textContent = 'REC ●';
      hudLiveTag.style.background = '#ef4444';

      startTimerInterval();

      // Notify Guest via WebRTC Data Connection
      if (state.dataConn && state.dataConn.open) {
        state.dataConn.send({ type: 'RECORDING_START' });
      }

      showToast('Recording started by Room Owner', 'success');
    } catch (err) {
      console.error('Failed to start recording:', err);
      showToast('Recording error: ' + err.message, 'error');
    }
  }

  function stopRecording() {
    if (!state.isHost) return;

    if (state.mediaRecorder && state.isRecording) {
      state.mediaRecorder.stop();
      state.isRecording = false;

      recordToggleBtn.classList.remove('is-recording');
      recordBtnLabel.textContent = 'Record';
      recordingTimerBadge.classList.add('hidden');
      hudLiveTag.textContent = 'LIVE PREVIEW';
      hudLiveTag.style.background = 'rgba(0, 0, 0, 0.6)';

      clearInterval(state.recordTimerInterval);

      // Notify Guest via WebRTC Data Connection
      if (state.dataConn && state.dataConn.open) {
        state.dataConn.send({ type: 'RECORDING_STOP' });
      }
    }
  }

  function handleRecordingStopped() {
    const mimeType = state.mediaRecorder.mimeType || 'video/webm';
    state.recordedBlob = new Blob(state.recordedChunks, { type: mimeType });

    const videoUrl = URL.createObjectURL(state.recordedBlob);
    recordedPlayback.src = videoUrl;

    const sizeInMB = (state.recordedBlob.size / (1024 * 1024)).toFixed(2);
    recordedFileSizeBadge.textContent = 'Size: ' + sizeInMB + ' MB';

    const durationSec = Math.floor((Date.now() - state.recordStartTime) / 1000);
    recordedDurationBadge.textContent = 'Duration: ' + formatSeconds(durationSec);

    const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
    downloadVideoAnchor.href = videoUrl;
    downloadVideoAnchor.download = 'DuoCast_' + new Date().toISOString().replace(/[:.]/g, '-') + '.' + ext;

    recordingResultModal.classList.remove('hidden');
  }

  function startTimerInterval() {
    state.recordTimerInterval = setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - state.recordStartTime) / 1000);
      recordingTimerDisplay.textContent = formatSeconds(elapsedSec);
    }, 1000);
  }

  function formatSeconds(totalSec) {
    const hrs = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSec % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  }

  // --- Layout Switcher (9:16 Vertical <-> 16:9 Landscape) ---
  function toggleLayoutMode() {
    if (state.layoutMode === 'vertical') {
      state.layoutMode = 'landscape';
      canvasWrapper.classList.remove('vertical-mode');
      canvasWrapper.classList.add('landscape-mode');
      studioCanvas.width = 1920;
      studioCanvas.height = 1080;
      layoutModeText.textContent = '16:9 Landscape';
      hudResolutionTag.textContent = '1920 x 1080 (16:9)';
      showToast('Switched to 16:9 Landscape Mode', 'success');
    } else {
      state.layoutMode = 'vertical';
      canvasWrapper.classList.remove('landscape-mode');
      canvasWrapper.classList.add('vertical-mode');
      studioCanvas.width = 1080;
      studioCanvas.height = 1920;
      layoutModeText.textContent = '9:16 Reels';
      hudResolutionTag.textContent = '1080 x 1920 (9:16)';
      showToast('Switched to 9:16 Reels Mode', 'success');
    }
  }

  // --- Device Controls & Toggles ---
  function toggleMic() {
    if (!state.localStream) return;
    const audioTrack = state.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      state.isMicMuted = !audioTrack.enabled;
      
      toggleMicBtn.classList.toggle('active-off', state.isMicMuted);
      micOnIcon.classList.toggle('hidden', state.isMicMuted);
      micOffIcon.classList.toggle('hidden', !state.isMicMuted);

      showToast(state.isMicMuted ? 'Microphone muted' : 'Microphone unmuted', 'success');
    }
  }

  function toggleCam() {
    if (!state.localStream) return;
    const videoTrack = state.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      state.isCamOff = !videoTrack.enabled;

      toggleCamBtn.classList.toggle('active-off', state.isCamOff);
      camOnIcon.classList.toggle('hidden', state.isCamOff);
      camOffIcon.classList.toggle('hidden', !state.isCamOff);

      showToast(state.isCamOff ? 'Camera turned off' : 'Camera turned on', 'success');
    }
  }

  async function flipCamera() {
    state.facingMode = (state.facingMode === 'user') ? 'environment' : 'user';
    await startLocalMedia();
    showToast('Flipped camera to ' + state.facingMode, 'success');
  }

  function swapLayoutPositions() {
    state.swapPositions = !state.swapPositions;
    showToast('Swapped feed positions', 'success');
  }

  // --- Device Selectors in Settings ---
  async function populateDeviceList() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      cameraSelect.innerHTML = '';
      microphoneSelect.innerHTML = '';

      devices.forEach(device => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        if (device.kind === 'videoinput') {
          option.text = device.label || `Camera ${cameraSelect.length + 1}`;
          cameraSelect.appendChild(option);
        } else if (device.kind === 'audioinput') {
          option.text = device.label || `Microphone ${microphoneSelect.length + 1}`;
          microphoneSelect.appendChild(option);
        }
      });
    } catch (err) {
      console.warn('Could not enumerate devices:', err);
    }
  }

  // --- Invite Link Generator ---
  function copyInviteLink() {
    const inviteUrl = window.location.origin + window.location.pathname + '?room=' + encodeURIComponent(state.roomCode);
    navigator.clipboard.writeText(inviteUrl).then(() => {
      showToast('Invite link copied! Send it to your co-host.', 'success');
    }).catch(() => {
      prompt('Copy this invite link:', inviteUrl);
    });
  }

  // --- Branding Updates ---
  function updateBrandingFromInputs() {
    state.hostName = hostNameInput.value.trim();
    state.guestName = guestNameInput.value.trim();
    state.showTitle = topicInput.value.trim();

    // If host updates, broadcast update to guest
    if (state.isHost && state.dataConn && state.dataConn.open) {
      state.dataConn.send({
        type: 'HOST_SYNC',
        hostName: state.hostName,
        showTitle: state.showTitle,
        isRecording: state.isRecording
      });
    }
  }

  // --- Status & Toast Helpers ---
  function updateStatus(status, text) {
    connectionStatusBadge.className = 'status-badge status-' + status;
    connectionStatusText.textContent = text;
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    if (enterStudioBtn) enterStudioBtn.addEventListener('click', handleWelcomeSubmit);
    if (closeWelcomeBtn) closeWelcomeBtn.addEventListener('click', handleWelcomeSubmit);

    // Press Enter to submit
    if (userNameInput) {
      userNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleWelcomeSubmit();
        }
      });
    }
    if (initialTopicInput) {
      initialTopicInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleWelcomeSubmit();
        }
      });
    }

    // Clicking backdrop also enters studio
    welcomeModal.addEventListener('click', (e) => {
      if (e.target === welcomeModal) {
        handleWelcomeSubmit();
      }
    });

    copyInviteBtn.addEventListener('click', copyInviteLink);
    layoutToggleBtn.addEventListener('click', toggleLayoutMode);
    toggleMicBtn.addEventListener('click', toggleMic);
    toggleCamBtn.addEventListener('click', toggleCam);
    flipCameraBtn.addEventListener('click', flipCamera);
    swapLayoutBtn.addEventListener('click', swapLayoutPositions);

    recordToggleBtn.addEventListener('click', () => {
      if (!state.isHost) {
        showToast('Only the Room Owner can start/stop recording', 'error');
        return;
      }
      if (state.isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    });

    guestRecordBadge.addEventListener('click', () => {
      showToast('Only the Room Owner (Host) can record', 'info');
    });

    // Branding Inputs
    hostNameInput.addEventListener('input', updateBrandingFromInputs);
    guestNameInput.addEventListener('input', updateBrandingFromInputs);
    topicInput.addEventListener('input', updateBrandingFromInputs);

    // Join Modal
    joinDifferentRoomBtn.addEventListener('click', () => joinModal.classList.remove('hidden'));
    closeJoinModalBtn.addEventListener('click', () => joinModal.classList.add('hidden'));
    confirmJoinBtn.addEventListener('click', () => {
      const code = manualRoomCodeInput.value.trim();
      if (code) {
        window.location.search = '?room=' + encodeURIComponent(code);
      }
    });

    // Settings Modal
    settingsModalBtn.addEventListener('click', () => {
      populateDeviceList();
      settingsModal.classList.remove('hidden');
    });
    closeSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));
    applySettingsBtn.addEventListener('click', () => {
      startLocalMedia(cameraSelect.value, microphoneSelect.value);
      settingsModal.classList.add('hidden');
    });

    // Result Modal
    closeResultModalBtn.addEventListener('click', () => recordingResultModal.classList.add('hidden'));
    discardVideoBtn.addEventListener('click', () => recordingResultModal.classList.add('hidden'));

    // Guide Modal
    guideModalBtn.addEventListener('click', () => guideModal.classList.remove('hidden'));
    closeGuideBtn.addEventListener('click', () => guideModal.classList.add('hidden'));
    gotItGuideBtn.addEventListener('click', () => guideModal.classList.add('hidden'));
  }

  // Reliable Bootstrap (Works whether DOM is already loaded or still loading)
  function boot() {
    setupEventListeners();
    setupWelcomeScreen();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
