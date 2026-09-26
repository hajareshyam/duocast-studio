/**
 * DuoCast Studio • Client-Side 2-Person Live Recorder
 * Professional Creator Studio with Multi-Layouts, Soundboard, Lip-Sync, VU Meters & Chat
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
    dataConn: null,        // WebRTC Data Connection for syncing names, chat, layouts, and recording
    isHost: true,          // Room Owner = true, Guest = false
    roomCode: '',
    
    // User Identity
    userName: '',
    
    // Media Streams
    localStream: null,
    remoteStream: null,
    screenStream: null,       // Screen share or slide deck feed
    isScreenSharing: false,
    facingMode: 'user',       // 'user' or 'environment'
    isMicMuted: false,
    isCamOff: false,
    
    // Layout
    layoutMode: 'vertical',   // 'vertical' (9:16) or 'landscape' (16:9)
    studioLayout: 'split',    // 'split', 'pip', 'solo-host', 'solo-guest', 'screen-duo'
    swapPositions: false,     // swap local & remote feeds
    
    // Audio Context Mixer & Sync
    audioCtx: null,
    audioDestination: null,
    localAudioSource: null,
    remoteAudioSource: null,
    screenAudioSource: null,
    audioDelayNode: null,
    audioDelayMs: 0,
    audioCompressor: null,    // Dynamics compressor for studio-grade limiting
    audioProfile: 'broadcast', // 'broadcast', 'warmth', 'raw'
    localAnalyser: null,
    remoteAnalyser: null,
    localVolume: 0,
    remoteVolume: 0,
    
    // Recording (Host Exclusive)
    mediaRecorder: null,
    recordedChunks: [],
    isRecording: false,
    isRecordingPaused: false, // Pause / resume recording
    isCountingDown: false,
    recordStartTime: 0,
    recordTimerInterval: null,
    recordedBlob: null,
    
    // Teleprompter
    prompterSpeed: 2,
    prompterFontSize: 18,
    isPrompterScrolling: false,
    prompterScrollInterval: null,
    
    // Branding, Lower-Third Ticker & Theme
    hostName: '@traveller.risha',
    guestName: '@guest.creator',
    showTitle: 'Live Travel & Mom-Life Talk 🎙️',
    studioTheme: 'theme-indigo',
    tickerEnabled: true,
    tickerText: '✨ Follow @traveller.risha for daily travel hacks & mom-life reels!',
    tickerOffset: 0,

    // Chat
    unreadChatCount: 0,
    micTestInterval: null
  };

  // --- DOM Elements ---
  const studioCanvas = document.getElementById('studioCanvas');
  const canvasCtx = studioCanvas.getContext('2d');
  const canvasWrapper = document.getElementById('canvasWrapper');
  
  const localVideo = document.getElementById('localVideo');
  const remoteVideo = document.getElementById('remoteVideo');
  const screenVideo = document.getElementById('screenVideo');
  
  // Status Badges
  const connectionStatusBadge = document.getElementById('connectionStatusBadge');
  const connectionStatusText = document.getElementById('connectionStatusText');
  const recordingTimerBadge = document.getElementById('recordingTimerBadge');
  const recordingTimerDisplay = document.getElementById('recordingTimerDisplay');
  const currentRoomCodeEl = document.getElementById('currentRoomCode');
  const hudResolutionTag = document.getElementById('hudResolutionTag');
  const hudLiveTag = document.getElementById('hudLiveTag');

  // Header Controls
  const studioLayoutSelect = document.getElementById('studioLayoutSelect');
  const layoutToggleBtn = document.getElementById('layoutToggleBtn');
  const layoutModeText = document.getElementById('layoutModeText');
  const soundboardToggleBtn = document.getElementById('soundboardToggleBtn');
  const chatToggleBtn = document.getElementById('chatToggleBtn');
  const chatBadgeCount = document.getElementById('chatBadgeCount');
  const prompterToggleBtn = document.getElementById('prompterToggleBtn');
  const brandingToggleBtn = document.getElementById('brandingToggleBtn');
  const hotkeysModalBtn = document.getElementById('hotkeysModalBtn');
  const settingsModalBtn = document.getElementById('settingsModalBtn');
  const guideModalBtn = document.getElementById('guideModalBtn');
  const copyInviteBtn = document.getElementById('copyInviteBtn');
  const joinDifferentRoomBtn = document.getElementById('joinDifferentRoomBtn');

  // Floating Control Bar
  const toggleMicBtn = document.getElementById('toggleMicBtn');
  const toggleCamBtn = document.getElementById('toggleCamBtn');
  const toggleScreenBtn = document.getElementById('toggleScreenBtn');
  const screenBtnLabel = document.getElementById('screenBtnLabel');
  const flipCameraBtn = document.getElementById('flipCameraBtn');
  const swapLayoutBtn = document.getElementById('swapLayoutBtn');
  const recordToggleBtn = document.getElementById('recordToggleBtn');
  const recordBtnLabel = document.getElementById('recordBtnLabel');
  const pauseRecordBtn = document.getElementById('pauseRecordBtn');
  const pauseIcon = document.getElementById('pauseIcon');
  const resumeIcon = document.getElementById('resumeIcon');
  const pauseBtnLabel = document.getElementById('pauseBtnLabel');
  const guestRecordBadge = document.getElementById('guestRecordBadge');
  const guestRecordLabel = document.getElementById('guestRecordLabel');

  // Welcome / Onboarding Modal
  const welcomeModal = document.getElementById('welcomeModal');
  const welcomeSubtitle = document.getElementById('welcomeSubtitle');
  const userNameInput = document.getElementById('userNameInput');
  const hostOnlyFields = document.getElementById('hostOnlyFields');
  const initialTopicInput = document.getElementById('initialTopicInput');
  const roleNoticeBadge = document.getElementById('roleNoticeBadge');
  const enterStudioBtn = document.getElementById('enterStudioBtn');
  const closeWelcomeBtn = document.getElementById('closeWelcomeBtn');

  // Branding Drawer Inputs & Theme
  const brandingBar = document.querySelector('.branding-bar');
  const hostNameInput = document.getElementById('hostNameInput');
  const guestNameInput = document.getElementById('guestNameInput');
  const topicInput = document.getElementById('topicInput');
  const tickerTextInput = document.getElementById('tickerTextInput');
  const toggleTickerBtn = document.getElementById('toggleTickerBtn');
  const studioThemeSelect = document.getElementById('studioThemeSelect');

  // Settings Modal Controls
  const settingsModal = document.getElementById('settingsModal');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const applySettingsBtn = document.getElementById('applySettingsBtn');
  const cameraSelect = document.getElementById('cameraSelect');
  const microphoneSelect = document.getElementById('microphoneSelect');
  const micTestBar = document.getElementById('micTestBar');
  const audioProfileSelect = document.getElementById('audioProfileSelect');
  const frameRateSelect = document.getElementById('frameRateSelect');
  const audioDelaySlider = document.getElementById('audioDelaySlider');
  const audioDelayValue = document.getElementById('audioDelayValue');

  // Countdown & SFX Overlays
  const countdownOverlay = document.getElementById('countdownOverlay');
  const countdownNumber = document.getElementById('countdownNumber');
  const soundboardDrawer = document.getElementById('soundboardDrawer');
  const closeSoundboardBtn = document.getElementById('closeSoundboardBtn');

  // Teleprompter Drawer
  const teleprompterDrawer = document.getElementById('teleprompterDrawer');
  const closePrompterBtn = document.getElementById('closePrompterBtn');
  const toggleScrollPrompterBtn = document.getElementById('toggleScrollPrompterBtn');
  const resetScrollPrompterBtn = document.getElementById('resetScrollPrompterBtn');
  const prompterSpeedRange = document.getElementById('prompterSpeedRange');
  const prompterSpeedVal = document.getElementById('prompterSpeedVal');
  const prompterFontSizeRange = document.getElementById('prompterFontSizeRange');
  const prompterFontVal = document.getElementById('prompterFontVal');
  const prompterContent = document.getElementById('prompterContent');

  // Chat Drawer
  const chatDrawer = document.getElementById('chatDrawer');
  const closeChatBtn = document.getElementById('closeChatBtn');
  const chatMessagesContainer = document.getElementById('chatMessagesContainer');
  const chatForm = document.getElementById('chatForm');
  const chatTextInput = document.getElementById('chatTextInput');

  // Result & Join Modals
  const joinModal = document.getElementById('joinModal');
  const manualRoomCodeInput = document.getElementById('manualRoomCodeInput');
  const confirmJoinBtn = document.getElementById('confirmJoinBtn');
  const closeJoinModalBtn = document.getElementById('closeJoinModalBtn');
  const createNewRoomBtn = document.getElementById('createNewRoomBtn');

  const recordingResultModal = document.getElementById('recordingResultModal');
  const recordedPlayback = document.getElementById('recordedPlayback');
  const downloadVideoAnchor = document.getElementById('downloadVideoAnchor');
  const downloadAudioAnchor = document.getElementById('downloadAudioAnchor');
  const closeResultModalBtn = document.getElementById('closeResultModalBtn');
  const discardVideoBtn = document.getElementById('discardVideoBtn');
  const recordedFileSizeBadge = document.getElementById('recordedFileSizeBadge');
  const recordedDurationBadge = document.getElementById('recordedDurationBadge');

  // Hotkeys Modal
  const hotkeysModal = document.getElementById('hotkeysModal');
  const closeHotkeysBtn = document.getElementById('closeHotkeysBtn');
  const gotItHotkeysBtn = document.getElementById('gotItHotkeysBtn');

  const guideModal = document.getElementById('guideModal');
  const closeGuideBtn = document.getElementById('closeGuideBtn');
  const gotItGuideBtn = document.getElementById('gotItGuideBtn');
  const toastContainer = document.getElementById('toastContainer');

  // Icons
  const micOnIcon = document.getElementById('micOnIcon');
  const micOffIcon = document.getElementById('micOffIcon');
  const camOnIcon = document.getElementById('camOnIcon');
  const camOffIcon = document.getElementById('camOffIcon');

  // --- Step 1: Pre-Entry Setup (Prompt Name First & Restore Room) ---
  function setupWelcomeScreen() {
    const urlParams = new URLSearchParams(window.location.search);
    let requestedRoom = urlParams.get('room');
    const savedHostRoom = localStorage.getItem('duocast_host_room') || '';
    const savedName = localStorage.getItem('duocast_username') || '';

    // Restore saved host room if refreshing without query params
    if (!requestedRoom && savedHostRoom) {
      requestedRoom = savedHostRoom;
      const newUrl = window.location.origin + window.location.pathname + '?room=' + encodeURIComponent(savedHostRoom);
      window.history.replaceState({ room: savedHostRoom }, '', newUrl);
    }

    if (requestedRoom) {
      state.roomCode = requestedRoom;

      // Check if user is the Room Owner who created this room
      if (requestedRoom === savedHostRoom) {
        state.isHost = true;
        welcomeSubtitle.textContent = `Welcome back to your room "${requestedRoom}".`;
        roleNoticeBadge.innerHTML = `<span class="badge-role-icon">👑</span><span>You are the <strong>Room Owner (Host)</strong>. Only you control recording.</span>`;
        hostOnlyFields.classList.remove('hidden');
        enterStudioBtn.querySelector('span').textContent = 'Enter Studio 🎙️';
        userNameInput.value = savedName || '@traveller.risha';
      } else {
        state.isHost = false;
        welcomeSubtitle.textContent = `You've been invited to join room "${requestedRoom}" as Co-Host.`;
        roleNoticeBadge.innerHTML = `<span class="badge-role-icon">🎙️</span><span>You are joining as <strong>Co-Host (Guest)</strong>. The Room Owner will manage recording.</span>`;
        hostOnlyFields.classList.add('hidden');
        enterStudioBtn.querySelector('span').textContent = 'Join Studio 🎥';
        userNameInput.value = savedName || '@guest.creator';
      }
    } else {
      // First-time room creation
      state.isHost = true;
      const autoRoom = 'duocast-' + Math.random().toString(36).substring(2, 8);
      state.roomCode = autoRoom;
      localStorage.setItem('duocast_host_room', autoRoom);

      const newUrl = window.location.origin + window.location.pathname + '?room=' + encodeURIComponent(autoRoom);
      window.history.replaceState({ room: autoRoom }, '', newUrl);

      welcomeSubtitle.textContent = 'Please enter your name or Instagram handle to launch your recording room.';
      roleNoticeBadge.innerHTML = `<span class="badge-role-icon">👑</span><span>You are the <strong>Room Owner (Host)</strong>. Only you can start and stop recording.</span>`;
      hostOnlyFields.classList.remove('hidden');
      enterStudioBtn.querySelector('span').textContent = 'Create Studio 🎙️';
      userNameInput.value = savedName || '@traveller.risha';
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
      localStorage.setItem('duocast_host_room', state.roomCode);
      const newUrl = window.location.origin + window.location.pathname + '?room=' + encodeURIComponent(state.roomCode);
      window.history.replaceState({ room: state.roomCode }, '', newUrl);

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
      localVideo.muted = true;
      try {
        const p = localVideo.play();
        if (p !== undefined) p.catch(() => {});
      } catch (err) {}

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
        remoteVideo.muted = true;
        try {
          const p = remoteVideo.play();
          if (p !== undefined) p.catch(() => {});
        } catch (err) {}
        setupAudioMixer();
        updateStatus('connected', 'Co-Host Connected');
        showToast('Co-Host joined the studio!', 'success');
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
        updateStatus('connecting', 'Reconnecting to room...');
        setTimeout(() => {
          if (!state.peer || state.peer.destroyed) {
            initPeerAsHost(roomId);
          }
        }, 2000);
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

    // 1. Establish Data Channel
    const conn = state.peer.connect(hostRoomId);
    setupGuestDataConnection(conn);

    // 2. Establish Media Stream Call
    const call = state.peer.call(hostRoomId, state.localStream);
    state.activeCall = call;

    call.on('stream', (remoteStream) => {
      state.remoteStream = remoteStream;
      remoteVideo.srcObject = remoteStream;
      remoteVideo.muted = true;
      try {
        const p = remoteVideo.play();
        if (p !== undefined) p.catch(() => {});
      } catch (err) {}
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
      conn.send({
        type: 'HOST_SYNC',
        hostName: state.hostName,
        showTitle: state.showTitle,
        studioLayout: state.studioLayout,
        tickerText: state.tickerText,
        tickerEnabled: state.tickerEnabled,
        isRecording: state.isRecording
      });
    });

    conn.on('data', (data) => {
      if (!data) return;
      if (data.type === 'GUEST_NAME') {
        state.guestName = data.name;
        guestNameInput.value = data.name;
        showToast(`Co-Host "${data.name}" synced`, 'info');
      } else if (data.type === 'CHAT_MSG') {
        appendChatMessage(data.sender, data.text, false);
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
        if (data.studioLayout) {
          state.studioLayout = data.studioLayout;
          studioLayoutSelect.value = data.studioLayout;
        }
        if (data.tickerText) state.tickerText = data.tickerText;
        state.tickerEnabled = !!data.tickerEnabled;
        if (data.isRecording) {
          triggerGuestRecordingUI(true);
        }
      } else if (data.type === 'COUNTDOWN') {
        handleRemoteCountdown(data.count);
      } else if (data.type === 'LAYOUT_SYNC') {
        state.studioLayout = data.layout;
        studioLayoutSelect.value = data.layout;
      } else if (data.type === 'RECORDING_START') {
        triggerGuestRecordingUI(true);
        showToast('🔴 Room Owner started recording!', 'success');
      } else if (data.type === 'RECORDING_PAUSED') {
        guestRecordBadge.classList.add('is-paused');
        guestRecordLabel.textContent = 'PAUSED (By Host)';
        hudLiveTag.textContent = 'PAUSED ❚❚';
        hudLiveTag.style.background = '#f59e0b';
        showToast('⏸️ Room Owner paused recording', 'info');
      } else if (data.type === 'RECORDING_RESUMED') {
        guestRecordBadge.classList.remove('is-paused');
        guestRecordLabel.textContent = 'REC (By Host)';
        hudLiveTag.textContent = 'REC ●';
        hudLiveTag.style.background = '#ef4444';
        showToast('▶️ Room Owner resumed recording', 'success');
      } else if (data.type === 'RECORDING_STOP') {
        triggerGuestRecordingUI(false);
        showToast('⏹️ Room Owner stopped recording', 'info');
      } else if (data.type === 'CHAT_MSG') {
        appendChatMessage(data.sender, data.text, false);
      }
    });

    conn.on('close', () => {
      state.dataConn = null;
    });
  }

  function handleRemoteCountdown(count) {
    if (count > 0) {
      countdownOverlay.classList.remove('hidden');
      countdownNumber.textContent = count;
      playStudioSFX('ding');
    } else {
      countdownNumber.textContent = 'REC!';
      playStudioSFX('chime');
      setTimeout(() => {
        countdownOverlay.classList.add('hidden');
      }, 500);
    }
  }

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

  // --- Audio Mixer & Lip-Sync Node (Web Audio API) ---
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

      // Audio Dynamics Compressor (Broadcast Leveler & Limiter)
      if (!state.audioCompressor) {
        state.audioCompressor = state.audioCtx.createDynamicsCompressor();
        state.audioCompressor.threshold.setValueAtTime(-24, state.audioCtx.currentTime);
        state.audioCompressor.knee.setValueAtTime(30, state.audioCtx.currentTime);
        state.audioCompressor.ratio.setValueAtTime(12, state.audioCtx.currentTime);
        state.audioCompressor.attack.setValueAtTime(0.003, state.audioCtx.currentTime);
        state.audioCompressor.release.setValueAtTime(0.25, state.audioCtx.currentTime);
        state.audioCompressor.connect(state.audioDestination);
      }

      // Audio Delay Node for Lip-Sync calibration
      if (!state.audioDelayNode) {
        state.audioDelayNode = state.audioCtx.createDelay(1.0);
        state.audioDelayNode.delayTime.value = state.audioDelayMs / 1000;
        state.audioDelayNode.connect(state.audioCompressor);
      }

      // Audio Analysers for Live VU Metering
      if (!state.localAnalyser) {
        state.localAnalyser = state.audioCtx.createAnalyser();
        state.localAnalyser.fftSize = 32;
      }
      if (!state.remoteAnalyser) {
        state.remoteAnalyser = state.audioCtx.createAnalyser();
        state.remoteAnalyser.fftSize = 32;
      }

      // Mix local audio
      if (state.localStream && state.localStream.getAudioTracks().length > 0) {
        if (state.localAudioSource) {
          state.localAudioSource.disconnect();
        }
        state.localAudioSource = state.audioCtx.createMediaStreamSource(state.localStream);
        state.localAudioSource.connect(state.audioDelayNode);
        state.localAudioSource.connect(state.localAnalyser);
      }

      // Mix remote audio
      if (state.remoteStream && state.remoteStream.getAudioTracks().length > 0) {
        if (state.remoteAudioSource) {
          state.remoteAudioSource.disconnect();
        }
        state.remoteAudioSource = state.audioCtx.createMediaStreamSource(state.remoteStream);
        state.remoteAudioSource.connect(state.audioCompressor);
        state.remoteAudioSource.connect(state.remoteAnalyser);
        // Connect to speaker destination so Host hears Co-Host
        try {
          state.remoteAudioSource.connect(state.audioCtx.destination);
        } catch (e) {}
      }

      // Mix screen share audio (if presentation has sound/video)
      if (state.screenStream && state.screenStream.getAudioTracks().length > 0) {
        if (state.screenAudioSource) {
          state.screenAudioSource.disconnect();
        }
        state.screenAudioSource = state.audioCtx.createMediaStreamSource(state.screenStream);
        state.screenAudioSource.connect(state.audioCompressor);
      }
    } catch (e) {
      console.warn('AudioContext setup issue:', e);
    }
  }

  // Get normalized audio volume (0.0 to 1.0) for VU meters
  function getAudioVolume(analyser) {
    if (!analyser) return 0;
    try {
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      return Math.min(Math.max((avg - 10) / 90, 0), 1);
    } catch (e) {
      return 0;
    }
  }

  // --- Creator Soundboard (Web Audio Synthesizer) ---
  function playStudioSFX(name) {
    if (!state.audioCtx) setupAudioMixer();
    if (state.audioCtx.state === 'suspended') state.audioCtx.resume();

    const now = state.audioCtx.currentTime;
    const dest = state.audioDestination;

    if (name === 'ding') {
      const osc = state.audioCtx.createOscillator();
      const gain = state.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.1);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
      osc.connect(gain);
      gain.connect(dest);
      gain.connect(state.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 1.0);
    } else if (name === 'airhorn') {
      const freqs = [370, 370, 370, 440];
      const times = [0, 0.15, 0.3, 0.45];
      freqs.forEach((f, idx) => {
        const osc = state.audioCtx.createOscillator();
        const gain = state.audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now + times[idx]);
        gain.gain.setValueAtTime(0.35, now + times[idx]);
        gain.gain.exponentialRampToValueAtTime(0.01, now + times[idx] + 0.12);
        osc.connect(gain);
        gain.connect(dest);
        gain.connect(state.audioCtx.destination);
        osc.start(now + times[idx]);
        osc.stop(now + times[idx] + 0.14);
      });
    } else if (name === 'applause') {
      const bufferSize = state.audioCtx.sampleRate * 2.2;
      const buffer = state.audioCtx.createBuffer(1, bufferSize, state.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (state.audioCtx.sampleRate * 1.5));
      }
      const noise = state.audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = state.audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1000;
      filter.Q.value = 1.0;
      const gain = state.audioCtx.createGain();
      gain.gain.setValueAtTime(0.45, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 2.2);
      noise.connect(filter).connect(gain).connect(dest);
      gain.connect(state.audioCtx.destination);
      noise.start(now);
    } else if (name === 'chime') {
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = state.audioCtx.createOscillator();
        const gain = state.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.4, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.8);
        osc.connect(gain).connect(dest);
        gain.connect(state.audioCtx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.8);
      });
    } else if (name === 'laugh') {
      [380, 480, 400, 520, 420, 540].forEach((f, idx) => {
        const osc = state.audioCtx.createOscillator();
        const gain = state.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.08);
        gain.gain.setValueAtTime(0.3, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.07);
        osc.connect(gain).connect(dest);
        gain.connect(state.audioCtx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.08);
      });
    } else if (name === 'drumroll') {
      for (let i = 0; i < 16; i++) {
        const osc = state.audioCtx.createOscillator();
        const gain = state.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140 + Math.random() * 20, now + i * 0.06);
        gain.gain.setValueAtTime(0.1 + (i / 16) * 0.35, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.06 + 0.05);
        osc.connect(gain).connect(dest);
        gain.connect(state.audioCtx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.06);
      }
    }
  }

  // --- Canvas Video Compositor Loop ---
  function renderCanvasLoop() {
    const cw = studioCanvas.width;
    const ch = studioCanvas.height;

    // Background gradient
    const bgGradient = canvasCtx.createLinearGradient(0, 0, cw, ch);
    bgGradient.addColorStop(0, '#0a0c14');
    bgGradient.addColorStop(0.5, '#10121d');
    bgGradient.addColorStop(1, '#07090e');
    canvasCtx.fillStyle = bgGradient;
    canvasCtx.fillRect(0, 0, cw, ch);

    // Calculate dynamic volume levels for VU meters
    state.localVolume = getAudioVolume(state.localAnalyser);
    state.remoteVolume = getAudioVolume(state.remoteAnalyser);

    const feed1 = state.swapPositions ? state.remoteStream : state.localStream;
    const feed2 = state.swapPositions ? state.localStream : state.remoteStream;
    const feed1Video = state.swapPositions ? remoteVideo : localVideo;
    const feed2Video = state.swapPositions ? localVideo : remoteVideo;
    const vol1 = state.swapPositions ? state.remoteVolume : state.localVolume;
    const vol2 = state.swapPositions ? state.localVolume : state.remoteVolume;

    const label1 = state.swapPositions ? state.guestName : state.hostName;
    const label2 = state.swapPositions ? state.hostName : state.guestName;

    // --- Layout Rendering Modes ---
    if (state.studioLayout === 'solo-host') {
      // Solo Host (Full Screen)
      drawVideoFeed(feed1Video, feed1, 0, 0, cw, ch, label1, 'Host', vol1);
    } else if (state.studioLayout === 'solo-guest') {
      // Solo Co-Host (Full Screen)
      drawVideoFeed(feed2Video, feed2, 0, 0, cw, ch, label2, 'Co-Host', vol2);
    } else if (state.studioLayout === 'pip') {
      // Picture-in-Picture Mode
      drawVideoFeed(feed1Video, feed1, 0, 0, cw, ch, label1, 'Host', vol1);

      // Floating Corner Bubble
      const pipW = Math.round(cw * 0.36);
      const pipH = Math.round(state.layoutMode === 'vertical' ? pipW * (16 / 9) : pipW * (9 / 16));
      const pipX = cw - pipW - 24;
      const pipY = ch - pipH - 70;

      canvasCtx.save();
      canvasCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      canvasCtx.shadowBlur = 24;
      canvasCtx.strokeStyle = 'rgba(99, 102, 241, 0.9)';
      canvasCtx.lineWidth = 3;
      canvasCtx.strokeRect(pipX, pipY, pipW, pipH);
      canvasCtx.restore();

      drawVideoFeed(feed2Video, feed2, pipX, pipY, pipW, pipH, label2, 'Co-Host', vol2);
    } else if (state.studioLayout === 'screen-duo') {
      // Screen Share + Co-Hosts Duo Mode
      const screenActive = state.screenStream && screenVideo && screenVideo.videoWidth > 0;
      if (state.layoutMode === 'vertical') {
        const topH = Math.round(ch * 0.60);
        const botH = ch - topH;
        const halfW = Math.round(cw / 2);

        // Screen Share Feed on top
        if (screenActive) {
          drawVideoFeed(screenVideo, state.screenStream, 0, 0, cw, topH, '🖥️ Screen Presentation', 'Screen', 0);
        } else {
          drawEmptyPlaceholder(0, 0, cw, topH, 'Screen');
        }

        // Host on bottom-left
        drawVideoFeed(feed1Video, feed1, 0, topH, halfW, botH, label1, 'Host', vol1);
        // Guest on bottom-right
        drawVideoFeed(feed2Video, feed2, halfW, topH, halfW, botH, label2, 'Co-Host', vol2);
      } else {
        const leftW = Math.round(cw * 0.72);
        const rightW = cw - leftW;
        const halfH = Math.round(ch / 2);

        // Screen Share on Left
        if (screenActive) {
          drawVideoFeed(screenVideo, state.screenStream, 0, 0, leftW, ch, '🖥️ Screen Presentation', 'Screen', 0);
        } else {
          drawEmptyPlaceholder(0, 0, leftW, ch, 'Screen');
        }

        // Host top-right
        drawVideoFeed(feed1Video, feed1, leftW, 0, rightW, halfH, label1, 'Host', vol1);
        // Guest bottom-right
        drawVideoFeed(feed2Video, feed2, leftW, halfH, rightW, halfH, label2, 'Co-Host', vol2);
      }
    } else {
      // Standard 50/50 Split Screen Mode
      if (state.layoutMode === 'vertical') {
        const halfH = ch / 2;

        drawVideoFeed(feed1Video, feed1, 0, 0, cw, halfH, label1, 'Host', vol1);

        // Center Divider
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

        drawVideoFeed(feed2Video, feed2, 0, halfH, cw, halfH, label2, 'Co-Host', vol2);
      } else {
        const halfW = cw / 2;

        drawVideoFeed(feed1Video, feed1, 0, 0, halfW, ch, label1, 'Host', vol1);

        // Center Divider
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

        drawVideoFeed(feed2Video, feed2, halfW, 0, halfW, ch, label2, 'Co-Host', vol2);
      }
    }

    // Top Header Banner
    drawTopHeaderBanner(cw);

    // Scrolling Lower-Third Ticker
    drawScrollingTicker(cw, ch);

    requestAnimationFrame(renderCanvasLoop);
  }

  // Draw individual video feed with aspect cover & active speaker glow
  function drawVideoFeed(videoEl, streamObj, x, y, w, h, nameTag, roleTag, volume) {
    if (streamObj && videoEl) {
      if (videoEl.paused) {
        try {
          const p = videoEl.play();
          if (p !== undefined) p.catch(() => {});
        } catch (e) {}
      }
    }

    const isVideoAlive = streamObj && videoEl && videoEl.videoWidth > 0 && !videoEl.ended;
    if (isVideoAlive) {
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

      // Active Speaker Dynamic Glow Border
      if (volume > 0.08) {
        canvasCtx.save();
        canvasCtx.shadowColor = (roleTag === 'Host') ? 'rgba(99, 102, 241, 0.95)' : 'rgba(236, 72, 153, 0.95)';
        canvasCtx.shadowBlur = 18;
        canvasCtx.strokeStyle = (roleTag === 'Host') ? '#818cf8' : '#f472b6';
        canvasCtx.lineWidth = 4;
        canvasCtx.strokeRect(x + 2, y + 2, w - 4, h - 4);
        canvasCtx.restore();
      }
    } else {
      drawEmptyPlaceholder(x, y, w, h, roleTag);
    }

    // Draw Name Tag with VU Meter Equalizer
    drawNameBadge(x + 20, y + h - 50, nameTag, volume);
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
    } else if (role === 'Screen') {
      canvasCtx.fillText('🖥️ Screen Presentation Mode', x + w / 2, y + h / 2 - 15);
      canvasCtx.font = '500 18px "Plus Jakarta Sans", sans-serif';
      canvasCtx.fillStyle = '#64748b';
      canvasCtx.fillText('Click "Screen" in controls to share slides or tabs', x + w / 2, y + h / 2 + 18);
    } else {
      canvasCtx.fillText('Connecting Camera...', x + w / 2, y + h / 2);
    }
  }

  // Draw name tag badge with live VU meter equalizer
  function drawNameBadge(x, y, text, volume = 0) {
    if (!text) return;
    canvasCtx.save();
    canvasCtx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    const textMetrics = canvasCtx.measureText(text);
    const padX = 14;
    const vuWidth = 24;
    const badgeW = textMetrics.width + (padX * 2) + vuWidth;
    const badgeH = 36;

    // Pill background
    canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    canvasCtx.beginPath();
    canvasCtx.roundRect(x, y, badgeW, badgeH, 10);
    canvasCtx.fill();

    canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    canvasCtx.lineWidth = 1.2;
    canvasCtx.stroke();

    // Name Text
    canvasCtx.fillStyle = '#ffffff';
    canvasCtx.textAlign = 'left';
    canvasCtx.textBaseline = 'middle';
    canvasCtx.fillText(text, x + padX, y + (badgeH / 2));

    // Dynamic 4-Bar Equalizer
    const bars = 4;
    const barW = 3;
    const barGap = 2;
    const startBarX = x + padX + textMetrics.width + 8;
    for (let i = 0; i < bars; i++) {
      const barH = 4 + Math.min(volume * 18 * (0.8 + i * 0.25), 18);
      const barY = y + (badgeH - barH) / 2;
      canvasCtx.fillStyle = (i === 3 && volume > 0.75) ? '#ef4444' : (i >= 2 ? '#f59e0b' : '#10b981');
      canvasCtx.fillRect(startBarX + i * (barW + barGap), barY, barW, barH);
    }

    canvasCtx.restore();
  }

  function drawTopHeaderBanner(cw) {
    if (!state.showTitle) return;
    canvasCtx.save();
    canvasCtx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    const textMetrics = canvasCtx.measureText(state.showTitle);
    const padX = 22;
    const bannerW = Math.min(textMetrics.width + (padX * 2), cw - 60);
    const bannerH = 42;
    const bx = (cw - bannerW) / 2;
    const by = 26;

    canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    canvasCtx.beginPath();
    canvasCtx.roundRect(bx, by, bannerW, bannerH, 10);
    canvasCtx.fill();

    canvasCtx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
    canvasCtx.lineWidth = 1.2;
    canvasCtx.stroke();

    canvasCtx.fillStyle = '#f8fafc';
    canvasCtx.textAlign = 'center';
    canvasCtx.textBaseline = 'middle';
    canvasCtx.fillText(state.showTitle, cw / 2, by + (bannerH / 2));
    canvasCtx.restore();
  }

  // Draw Scrolling Lower-Third Ticker
  function drawScrollingTicker(cw, ch) {
    if (!state.tickerEnabled || !state.tickerText) return;
    const barH = 38;
    const barY = ch - barH - 6;

    canvasCtx.save();
    // Glass background bar
    canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.78)';
    canvasCtx.fillRect(0, barY, cw, barH);

    canvasCtx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
    canvasCtx.lineWidth = 1;
    canvasCtx.beginPath();
    canvasCtx.moveTo(0, barY);
    canvasCtx.lineTo(cw, barY);
    canvasCtx.stroke();

    // Clip to ticker bar area
    canvasCtx.beginPath();
    canvasCtx.rect(0, barY, cw, barH);
    canvasCtx.clip();

    canvasCtx.font = '600 17px "Plus Jakarta Sans", sans-serif';
    canvasCtx.fillStyle = '#f1f5f9';
    canvasCtx.textBaseline = 'middle';

    const textMetrics = canvasCtx.measureText(state.tickerText);
    const textW = textMetrics.width + 120;
    state.tickerOffset = (state.tickerOffset + 2) % textW;

    const startX = cw - state.tickerOffset;
    canvasCtx.fillText(state.tickerText, startX, barY + barH / 2);
    canvasCtx.fillText(state.tickerText, startX + textW, barY + barH / 2);

    canvasCtx.restore();
  }

  // --- 3-2-1 Countdown Trigger & Sync ---
  function startCountdownSequence() {
    if (!state.isHost) {
      showToast('Only the Room Owner can start recording', 'error');
      return;
    }
    if (state.isRecording || state.isCountingDown) return;

    state.isCountingDown = true;
    countdownOverlay.classList.remove('hidden');

    let count = 3;
    countdownNumber.textContent = count;
    playStudioSFX('ding');

    if (state.dataConn && state.dataConn.open) {
      state.dataConn.send({ type: 'COUNTDOWN', count });
    }

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        countdownNumber.textContent = count;
        playStudioSFX('ding');
        if (state.dataConn && state.dataConn.open) {
          state.dataConn.send({ type: 'COUNTDOWN', count });
        }
      } else {
        clearInterval(interval);
        countdownNumber.textContent = 'REC!';
        playStudioSFX('chime');
        if (state.dataConn && state.dataConn.open) {
          state.dataConn.send({ type: 'COUNTDOWN', count: 0 });
        }
        setTimeout(() => {
          countdownOverlay.classList.add('hidden');
          state.isCountingDown = false;
          executeStartRecording();
        }, 500);
      }
    }, 1000);
  }

  // --- Recording Engine (Host Only) ---
  function executeStartRecording() {
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
      pauseRecordBtn.classList.remove('hidden');
      pauseRecordBtn.classList.remove('is-paused');
      pauseIcon.classList.remove('hidden');
      resumeIcon.classList.add('hidden');
      pauseBtnLabel.textContent = 'Pause';
      state.isRecordingPaused = false;

      recordingTimerBadge.classList.remove('hidden');
      hudLiveTag.textContent = 'REC ●';
      hudLiveTag.style.background = '#ef4444';

      startTimerInterval();

      // Broadcast start to Guest
      if (state.dataConn && state.dataConn.open) {
        state.dataConn.send({ type: 'RECORDING_START' });
      }

      showToast('Recording live!', 'success');
    } catch (err) {
      console.error('Failed to start recording:', err);
      showToast('Recording error: ' + err.message, 'error');
    }
  }

  function pauseResumeRecording() {
    if (!state.isHost || !state.isRecording || !state.mediaRecorder) return;
    if (!state.isRecordingPaused) {
      try {
        state.mediaRecorder.pause();
        state.isRecordingPaused = true;
        pauseRecordBtn.classList.add('is-paused');
        pauseIcon.classList.add('hidden');
        resumeIcon.classList.remove('hidden');
        pauseBtnLabel.textContent = 'Resume';
        hudLiveTag.textContent = 'PAUSED ❚❚';
        hudLiveTag.style.background = '#f59e0b';
        showToast('Recording paused ❚❚', 'info');
        if (state.dataConn && state.dataConn.open) {
          state.dataConn.send({ type: 'RECORDING_PAUSED' });
        }
      } catch (err) {
        console.warn('Pause error:', err);
      }
    } else {
      try {
        state.mediaRecorder.resume();
        state.isRecordingPaused = false;
        pauseRecordBtn.classList.remove('is-paused');
        pauseIcon.classList.remove('hidden');
        resumeIcon.classList.add('hidden');
        pauseBtnLabel.textContent = 'Pause';
        hudLiveTag.textContent = 'REC ●';
        hudLiveTag.style.background = '#ef4444';
        showToast('Recording resumed ●', 'success');
        if (state.dataConn && state.dataConn.open) {
          state.dataConn.send({ type: 'RECORDING_RESUMED' });
        }
      } catch (err) {
        console.warn('Resume error:', err);
      }
    }
  }

  function stopRecording() {
    if (!state.isHost) return;

    if (state.mediaRecorder && state.isRecording) {
      state.mediaRecorder.stop();
      state.isRecording = false;
      state.isRecordingPaused = false;

      recordToggleBtn.classList.remove('is-recording');
      recordBtnLabel.textContent = 'Record';
      pauseRecordBtn.classList.add('hidden');
      pauseRecordBtn.classList.remove('is-paused');
      pauseIcon.classList.remove('hidden');
      resumeIcon.classList.add('hidden');
      pauseBtnLabel.textContent = 'Pause';

      recordingTimerBadge.classList.add('hidden');
      hudLiveTag.textContent = 'LIVE PREVIEW';
      hudLiveTag.style.background = 'rgba(0, 0, 0, 0.6)';

      clearInterval(state.recordTimerInterval);

      // Broadcast stop to Guest
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

    // Generate Audio-Only podcast track download
    if (downloadAudioAnchor) {
      const audioBlob = new Blob(state.recordedChunks, { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(audioBlob);
      downloadAudioAnchor.href = audioUrl;
      downloadAudioAnchor.download = 'DuoCast_Podcast_Audio_' + new Date().toISOString().replace(/[:.]/g, '-') + '.webm';
    }

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

  // --- Backstage Chat Messaging ---
  function sendChatMessage(text) {
    if (!text || !text.trim()) return;
    const msg = text.trim();
    appendChatMessage('You', msg, true);
    if (state.dataConn && state.dataConn.open) {
      state.dataConn.send({
        type: 'CHAT_MSG',
        sender: state.userName || (state.isHost ? 'Host' : 'Guest'),
        text: msg
      });
    }
    chatTextInput.value = '';
  }

  function appendChatMessage(sender, text, isSelf) {
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble ' + (isSelf ? 'chat-msg-self' : 'chat-msg-remote');
    bubble.innerHTML = `<div class="chat-sender">${escapeHtml(sender)}</div><div class="chat-text">${escapeHtml(text)}</div>`;
    chatMessagesContainer.appendChild(bubble);
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;

    if (!isSelf && chatDrawer.classList.contains('hidden')) {
      state.unreadChatCount++;
      chatBadgeCount.classList.remove('hidden');
      showToast(`💬 Note from ${sender}: "${text.substring(0, 30)}"`, 'info');
    }
  }

  function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  // --- Layout Switcher (9:16 Vertical <-> 16:9 Landscape) ---
  function toggleLayoutMode() {
    if (state.layoutMode === 'vertical') {
      state.layoutMode = 'landscape';
      canvasWrapper.classList.remove('vertical-mode');
      canvasWrapper.classList.add('landscape-mode');
      studioCanvas.width = 1920;
      studioCanvas.height = 1080;
      layoutModeText.textContent = '16:9';
      hudResolutionTag.textContent = '1920 x 1080 (16:9)';
      showToast('Switched to 16:9 Landscape Mode', 'success');
    } else {
      state.layoutMode = 'vertical';
      canvasWrapper.classList.remove('landscape-mode');
      canvasWrapper.classList.add('vertical-mode');
      studioCanvas.width = 1080;
      studioCanvas.height = 1920;
      layoutModeText.textContent = '9:16';
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
    if (tickerTextInput) state.tickerText = tickerTextInput.value.trim();

    if (state.isHost && state.dataConn && state.dataConn.open) {
      state.dataConn.send({
        type: 'HOST_SYNC',
        hostName: state.hostName,
        showTitle: state.showTitle,
        studioLayout: state.studioLayout,
        tickerText: state.tickerText,
        tickerEnabled: state.tickerEnabled,
        isRecording: state.isRecording
      });
    }
  }

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

  // --- Screen Sharing Support ---
  async function toggleScreenShare() {
    if (state.isScreenSharing) {
      stopScreenShare();
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: true
        });
        state.screenStream = stream;
        state.isScreenSharing = true;
        screenVideo.srcObject = stream;
        try {
          const p = screenVideo.play();
          if (p !== undefined) p.catch(() => {});
        } catch (e) {}

        toggleScreenBtn.classList.add('is-sharing');
        screenBtnLabel.textContent = 'Stop Share';

        // Auto-switch to screen-duo layout
        if (state.studioLayout === 'split' || state.studioLayout === 'solo-host') {
          state.studioLayout = 'screen-duo';
          studioLayoutSelect.value = 'screen-duo';
        }

        stream.getVideoTracks()[0].onended = () => {
          stopScreenShare();
        };

        setupAudioMixer();
        showToast('Screen share active! Switched to Screen + Duo layout.', 'success');
      } catch (err) {
        if (err.name !== 'NotAllowedError') {
          console.warn('Screen share error:', err);
          showToast('Screen share failed: ' + err.message, 'error');
        }
      }
    }
  }

  function stopScreenShare() {
    if (state.screenStream) {
      state.screenStream.getTracks().forEach(t => t.stop());
      state.screenStream = null;
    }
    state.isScreenSharing = false;
    screenVideo.srcObject = null;
    toggleScreenBtn.classList.remove('is-sharing');
    screenBtnLabel.textContent = 'Screen';

    if (state.studioLayout === 'screen-duo') {
      state.studioLayout = 'split';
      studioLayoutSelect.value = 'split';
    }

    showToast('Screen share ended', 'info');
  }

  // --- Teleprompter Engine ---
  function togglePrompterScroll() {
    if (state.isPrompterScrolling) {
      clearInterval(state.prompterScrollInterval);
      state.isPrompterScrolling = false;
      toggleScrollPrompterBtn.textContent = '▶️ Scroll';
      toggleScrollPrompterBtn.classList.remove('btn-secondary');
      toggleScrollPrompterBtn.classList.add('btn-primary');
    } else {
      state.isPrompterScrolling = true;
      toggleScrollPrompterBtn.textContent = '⏸️ Pause';
      toggleScrollPrompterBtn.classList.remove('btn-primary');
      toggleScrollPrompterBtn.classList.add('btn-secondary');
      state.prompterScrollInterval = setInterval(() => {
        if (prompterContent) {
          prompterContent.scrollTop += state.prompterSpeed;
          if (prompterContent.scrollTop + prompterContent.clientHeight >= prompterContent.scrollHeight - 2) {
            clearInterval(state.prompterScrollInterval);
            state.isPrompterScrolling = false;
            toggleScrollPrompterBtn.textContent = '▶️ Scroll';
            toggleScrollPrompterBtn.classList.remove('btn-secondary');
            toggleScrollPrompterBtn.classList.add('btn-primary');
          }
        }
      }, 50);
    }
  }

  function resetPrompterScroll() {
    if (prompterContent) {
      prompterContent.scrollTop = 0;
    }
  }

  // --- Mic Input Test Meter (Settings) ---
  function startMicTest() {
    if (state.micTestInterval) clearInterval(state.micTestInterval);
    state.micTestInterval = setInterval(() => {
      if (!settingsModal.classList.contains('hidden')) {
        const vol = getAudioVolume(state.localAnalyser);
        if (micTestBar) {
          micTestBar.style.width = Math.min(100, Math.round(vol * 170)) + '%';
        }
      } else {
        clearInterval(state.micTestInterval);
      }
    }, 80);
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    if (enterStudioBtn) enterStudioBtn.addEventListener('click', handleWelcomeSubmit);
    if (closeWelcomeBtn) closeWelcomeBtn.addEventListener('click', handleWelcomeSubmit);

    // Press Enter to submit in welcome inputs
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

    welcomeModal.addEventListener('click', (e) => {
      if (e.target === welcomeModal) {
        handleWelcomeSubmit();
      }
    });

    // Studio Layout Mode (Split, Solo Host, Solo Guest, PiP, Screen-Duo)
    studioLayoutSelect.addEventListener('change', (e) => {
      state.studioLayout = e.target.value;
      showToast(`Layout changed to: ${e.target.options[e.target.selectedIndex].text}`, 'info');
      if (state.isHost && state.dataConn && state.dataConn.open) {
        state.dataConn.send({ type: 'LAYOUT_SYNC', layout: state.studioLayout });
      }
    });

    // Aspect Ratio Toggle
    layoutToggleBtn.addEventListener('click', toggleLayoutMode);

    // Audio Sync Delay Slider (Settings)
    if (audioDelaySlider) {
      audioDelaySlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        state.audioDelayMs = val;
        audioDelayValue.textContent = val + ' ms';
        if (state.audioDelayNode) {
          state.audioDelayNode.delayTime.value = val / 1000;
        }
      });
    }

    // Audio Quality Profile DSP
    if (audioProfileSelect) {
      audioProfileSelect.addEventListener('change', (e) => {
        state.audioProfile = e.target.value;
        showToast(`Audio DSP Profile: ${e.target.options[e.target.selectedIndex].text}`, 'info');
      });
    }

    // Soundboard Drawer Toggle
    soundboardToggleBtn.addEventListener('click', () => {
      soundboardDrawer.classList.toggle('hidden');
      teleprompterDrawer.classList.add('hidden');
      chatDrawer.classList.add('hidden');
    });
    closeSoundboardBtn.addEventListener('click', () => {
      soundboardDrawer.classList.add('hidden');
    });

    // Soundboard SFX Buttons
    document.querySelectorAll('.sfx-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sfx = btn.getAttribute('data-sfx');
        playStudioSFX(sfx);
        showToast(`Sound Effect: ${btn.querySelector('.sfx-name').textContent}`, 'info');
      });
    });

    // Teleprompter Drawer Controls
    if (prompterToggleBtn) {
      prompterToggleBtn.addEventListener('click', () => {
        teleprompterDrawer.classList.toggle('hidden');
        soundboardDrawer.classList.add('hidden');
        chatDrawer.classList.add('hidden');
      });
    }
    if (closePrompterBtn) {
      closePrompterBtn.addEventListener('click', () => {
        teleprompterDrawer.classList.add('hidden');
      });
    }
    if (toggleScrollPrompterBtn) {
      toggleScrollPrompterBtn.addEventListener('click', togglePrompterScroll);
    }
    if (resetScrollPrompterBtn) {
      resetScrollPrompterBtn.addEventListener('click', resetPrompterScroll);
    }
    if (prompterSpeedRange) {
      prompterSpeedRange.addEventListener('input', (e) => {
        state.prompterSpeed = parseInt(e.target.value, 10);
        if (prompterSpeedVal) prompterSpeedVal.textContent = state.prompterSpeed + 'x';
      });
    }
    if (prompterFontSizeRange) {
      prompterFontSizeRange.addEventListener('input', (e) => {
        state.prompterFontSize = parseInt(e.target.value, 10);
        if (prompterFontVal) prompterFontVal.textContent = state.prompterFontSize + 'px';
        if (prompterContent) prompterContent.style.fontSize = state.prompterFontSize + 'px';
      });
    }

    // Backstage Chat Drawer Toggle
    chatToggleBtn.addEventListener('click', () => {
      chatDrawer.classList.toggle('hidden');
      soundboardDrawer.classList.add('hidden');
      teleprompterDrawer.classList.add('hidden');
      if (!chatDrawer.classList.contains('hidden')) {
        chatBadgeCount.classList.add('hidden');
        state.unreadChatCount = 0;
        chatTextInput.focus();
      }
    });
    closeChatBtn.addEventListener('click', () => {
      chatDrawer.classList.add('hidden');
    });

    // Chat Form Submit
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      sendChatMessage(chatTextInput.value);
    });

    // Branding Drawer Toggle (Mobile & Desktop)
    if (brandingToggleBtn && brandingBar) {
      brandingToggleBtn.addEventListener('click', () => {
        brandingBar.classList.toggle('is-open');
      });
    }

    // Studio Theme Select
    if (studioThemeSelect) {
      studioThemeSelect.addEventListener('change', (e) => {
        const theme = e.target.value;
        document.body.className = theme;
        state.studioTheme = theme;
        showToast(`Studio theme updated: ${e.target.options[e.target.selectedIndex].text}`, 'info');
      });
    }

    // Topic Preset Chips
    document.querySelectorAll('.topic-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const topic = chip.getAttribute('data-topic');
        topicInput.value = topic;
        updateBrandingFromInputs();
        showToast('Show topic updated: ' + topic, 'info');
      });
    });

    // Ticker Toggle Button
    if (toggleTickerBtn) {
      toggleTickerBtn.addEventListener('click', () => {
        state.tickerEnabled = !state.tickerEnabled;
        toggleTickerBtn.textContent = state.tickerEnabled ? 'Ticker: ON' : 'Ticker: OFF';
        toggleTickerBtn.classList.toggle('btn-secondary', state.tickerEnabled);
        toggleTickerBtn.classList.toggle('btn-ghost', !state.tickerEnabled);
        showToast(state.tickerEnabled ? 'Scrolling ticker enabled' : 'Scrolling ticker disabled', 'info');
        updateBrandingFromInputs();
      });
    }

    copyInviteBtn.addEventListener('click', copyInviteLink);
    toggleMicBtn.addEventListener('click', toggleMic);
    toggleCamBtn.addEventListener('click', toggleCam);
    if (toggleScreenBtn) toggleScreenBtn.addEventListener('click', toggleScreenShare);
    flipCameraBtn.addEventListener('click', flipCamera);
    swapLayoutBtn.addEventListener('click', swapLayoutPositions);

    // Record Button (Host Only: Starts 3-2-1 Countdown)
    recordToggleBtn.addEventListener('click', () => {
      if (!state.isHost) {
        showToast('Only the Room Owner can start/stop recording', 'error');
        return;
      }
      if (state.isRecording) {
        stopRecording();
      } else {
        startCountdownSequence();
      }
    });

    // Pause / Resume Button (Host Only)
    if (pauseRecordBtn) {
      pauseRecordBtn.addEventListener('click', pauseResumeRecording);
    }

    guestRecordBadge.addEventListener('click', () => {
      showToast('Only the Room Owner (Host) can record', 'info');
    });

    // Branding Inputs
    hostNameInput.addEventListener('input', updateBrandingFromInputs);
    guestNameInput.addEventListener('input', updateBrandingFromInputs);
    topicInput.addEventListener('input', updateBrandingFromInputs);
    if (tickerTextInput) tickerTextInput.addEventListener('input', updateBrandingFromInputs);

    // Create New Room button (in Join Modal)
    if (createNewRoomBtn) {
      createNewRoomBtn.addEventListener('click', () => {
        localStorage.removeItem('duocast_host_room');
        window.location.href = window.location.origin + window.location.pathname;
      });
    }

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
      startMicTest();
      settingsModal.classList.remove('hidden');
    });
    closeSettingsBtn.addEventListener('click', () => {
      if (state.micTestInterval) clearInterval(state.micTestInterval);
      settingsModal.classList.add('hidden');
    });
    applySettingsBtn.addEventListener('click', () => {
      if (state.micTestInterval) clearInterval(state.micTestInterval);
      startLocalMedia(cameraSelect.value, microphoneSelect.value);
      settingsModal.classList.add('hidden');
    });

    // Result Modal
    closeResultModalBtn.addEventListener('click', () => recordingResultModal.classList.add('hidden'));
    discardVideoBtn.addEventListener('click', () => recordingResultModal.classList.add('hidden'));

    // Hotkeys Modal
    if (hotkeysModalBtn) {
      hotkeysModalBtn.addEventListener('click', () => hotkeysModal.classList.remove('hidden'));
    }
    if (closeHotkeysBtn) {
      closeHotkeysBtn.addEventListener('click', () => hotkeysModal.classList.add('hidden'));
    }
    if (gotItHotkeysBtn) {
      gotItHotkeysBtn.addEventListener('click', () => hotkeysModal.classList.add('hidden'));
    }

    // Guide Modal
    guideModalBtn.addEventListener('click', () => guideModal.classList.remove('hidden'));
    closeGuideBtn.addEventListener('click', () => guideModal.classList.add('hidden'));
    gotItGuideBtn.addEventListener('click', () => guideModal.classList.add('hidden'));

    // Stream Deck Global Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || (e.target && e.target.isContentEditable)) {
        return;
      }
      const key = e.key.toLowerCase();
      if (key === ' ' || key === 'm') {
        e.preventDefault();
        toggleMic();
      } else if (key === 'v') {
        e.preventDefault();
        toggleCam();
      } else if (key === 'r') {
        e.preventDefault();
        if (state.isHost) {
          if (state.isRecording) stopRecording(); else startCountdownSequence();
        }
      } else if (key === 'p') {
        e.preventDefault();
        if (state.isHost && state.isRecording) pauseResumeRecording();
      } else if (key === 's') {
        e.preventDefault();
        soundboardDrawer.classList.toggle('hidden');
        teleprompterDrawer.classList.add('hidden');
        chatDrawer.classList.add('hidden');
      } else if (key === 'c') {
        e.preventDefault();
        chatDrawer.classList.toggle('hidden');
        soundboardDrawer.classList.add('hidden');
        teleprompterDrawer.classList.add('hidden');
      } else if (key === 't') {
        e.preventDefault();
        teleprompterDrawer.classList.toggle('hidden');
        soundboardDrawer.classList.add('hidden');
        chatDrawer.classList.add('hidden');
      } else if (key === '?') {
        e.preventDefault();
        hotkeysModal.classList.toggle('hidden');
      } else if (['1', '2', '3', '4', '5'].includes(key)) {
        const layoutMap = { '1': 'split', '2': 'pip', '3': 'solo-host', '4': 'solo-guest', '5': 'screen-duo' };
        state.studioLayout = layoutMap[key];
        studioLayoutSelect.value = state.studioLayout;
        showToast('Layout switched to: ' + state.studioLayout, 'info');
        if (state.isHost && state.dataConn && state.dataConn.open) {
          state.dataConn.send({ type: 'LAYOUT_SYNC', layout: state.studioLayout });
        }
      }
    });
  }

  // Reliable Bootstrap
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
