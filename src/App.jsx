import React, { useState, useEffect, useRef, useCallback } from 'react';
import Peer from 'peerjs';

import Header from './components/Header.jsx';
import RoomBar from './components/RoomBar.jsx';
import Stage from './components/Stage.jsx';
import ControlsBar from './components/ControlsBar.jsx';
import BrandingDrawer from './components/BrandingDrawer.jsx';
import TeleprompterDrawer from './components/TeleprompterDrawer.jsx';
import SoundboardDrawer from './components/SoundboardDrawer.jsx';
import ChatDrawer from './components/ChatDrawer.jsx';
import CountdownOverlay from './components/CountdownOverlay.jsx';
import WelcomeModal from './components/WelcomeModal.jsx';
import JoinModal from './components/JoinModal.jsx';
import RecordingResultModal from './components/RecordingResultModal.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import GuideModal from './components/GuideModal.jsx';
import HotkeysModal from './components/HotkeysModal.jsx';

import { createAudioMixerContext, getAudioVolume, playStudioSFX } from './utils/audioEffects.js';
import { renderCompositorFrame } from './utils/compositor.js';

export default function App() {
  // --- Room & Identity State ---
  const [roomCode, setRoomCode] = useState('');
  const [isHost, setIsHost] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('offline');
  const [connectionText, setConnectionText] = useState('Offline');

  // --- Display & Theme State ---
  const [layoutMode, setLayoutMode] = useState('vertical'); // 'vertical' (9:16) | 'landscape' (16:9)
  const [studioLayout, setStudioLayout] = useState('split');
  const [swapPositions, setSwapPositions] = useState(false);
  const [studioTheme, setStudioTheme] = useState('theme-indigo');

  // --- Branding & Metadata ---
  const [hostName, setHostName] = useState('@traveller.risha');
  const [guestName, setGuestName] = useState('@guest.creator');
  const [showTitle, setShowTitle] = useState('Live Travel & Mom-Life Talk 🎙️');
  const [tickerEnabled, setTickerEnabled] = useState(true);
  const [tickerText, setTickerText] = useState('✨ Follow @traveller.risha for daily travel hacks & mom-life reels!');

  // --- Hardware & Media State ---
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('user'); // 'user' or 'environment'
  const [videoDevices, setVideoDevices] = useState([]);
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState('');
  const [selectedAudioDevice, setSelectedAudioDevice] = useState('');
  const [audioDelay, setAudioDelay] = useState(0);
  const [audioProfile, setAudioProfile] = useState('broadcast');
  const [framerate, setFramerate] = useState(30);
  const [micLevel, setMicLevel] = useState(0);

  // --- Drawers & Modals State ---
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(true);
  const [isBrandingOpen, setIsBrandingOpen] = useState(false);
  const [isSoundboardOpen, setIsSoundboardOpen] = useState(false);
  const [isPrompterOpen, setIsPrompterOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHotkeysOpen, setIsHotkeysOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);

  // --- Teleprompter State ---
  const [prompterSpeed, setPrompterSpeed] = useState(2);
  const [prompterFontSize, setPrompterFontSize] = useState(18);
  const [isPrompterScrolling, setIsPrompterScrolling] = useState(false);
  const [scriptText, setScriptText] = useState('');

  // --- Recording State ---
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState('00:00:00');
  const [isCountdownVisible, setIsCountdownVisible] = useState(false);
  const [countdownNumber, setCountdownNumber] = useState(3);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState('');
  const [recordedAudioUrl, setRecordedAudioUrl] = useState('');
  const [recordedFileSize, setRecordedFileSize] = useState('');
  const [recordedDuration, setRecordedDuration] = useState('');
  const [recordedMimeType, setRecordedMimeType] = useState('video/webm');

  // --- Refs ---
  const canvasRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const screenVideoRef = useRef(null);
  const prompterRef = useRef(null);
  const prompterScrollTimer = useRef(null);
  const tickerOffsetRef = useRef(0);
  const animFrameRef = useRef(null);
  const recordTimerInterval = useRef(null);
  const recordStartTime = useRef(0);

  // Live stream references
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const peerRef = useRef(null);
  const currentCallRef = useRef(null);
  const dataConnRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Audio Context Ref
  const audioMixerRef = useRef(null);
  const localAudioSourceRef = useRef(null);
  const remoteAudioSourceRef = useRef(null);

  // --- Theme Sync ---
  useEffect(() => {
    document.body.className = studioTheme;
  }, [studioTheme]);

  // --- Show Toast Helper ---
  const showToast = useCallback((msg, type = 'info') => {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }, []);

  // --- Initialize Audio Context ---
  const ensureAudioMixer = useCallback(() => {
    if (!audioMixerRef.current) {
      audioMixerRef.current = createAudioMixerContext();
    }
    if (audioMixerRef.current.audioCtx.state === 'suspended') {
      audioMixerRef.current.audioCtx.resume();
    }
    return audioMixerRef.current;
  }, []);

  // --- Connect Local Stream to Audio Mixer ---
  const attachLocalStreamToMixer = useCallback((stream) => {
    const mixer = ensureAudioMixer();
    if (!stream) return;
    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) return;

    try {
      if (localAudioSourceRef.current) {
        localAudioSourceRef.current.disconnect();
      }
      const streamOnlyAudio = new MediaStream([audioTrack]);
      const source = mixer.audioCtx.createMediaStreamSource(streamOnlyAudio);
      source.connect(mixer.localAnalyser);
      source.connect(mixer.delayNode);
      localAudioSourceRef.current = source;
    } catch (e) {
      console.warn('Audio mixer attach error:', e);
    }
  }, [ensureAudioMixer]);

  // --- Connect Remote Stream to Audio Mixer ---
  const attachRemoteStreamToMixer = useCallback((stream) => {
    const mixer = ensureAudioMixer();
    if (!stream) return;
    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) return;

    try {
      if (remoteAudioSourceRef.current) {
        remoteAudioSourceRef.current.disconnect();
      }
      const streamOnlyAudio = new MediaStream([audioTrack]);
      const source = mixer.audioCtx.createMediaStreamSource(streamOnlyAudio);
      source.connect(mixer.remoteAnalyser);
      source.connect(mixer.compressor);
      remoteAudioSourceRef.current = source;
    } catch (e) {
      console.warn('Remote audio mixer attach error:', e);
    }
  }, [ensureAudioMixer]);

  // --- Device Enumeration ---
  const updateDeviceList = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const vDevs = devices.filter(d => d.kind === 'videoinput');
      const aDevs = devices.filter(d => d.kind === 'audioinput');
      setVideoDevices(vDevs);
      setAudioDevices(aDevs);
      if (vDevs.length > 0 && !selectedVideoDevice) setSelectedVideoDevice(vDevs[0].deviceId);
      if (aDevs.length > 0 && !selectedAudioDevice) setSelectedAudioDevice(aDevs[0].deviceId);
    } catch (e) {
      console.warn('Could not enumerate devices:', e);
    }
  }, [selectedVideoDevice, selectedAudioDevice]);

  // --- Start Local Media Stream ---
  const startLocalMedia = useCallback(async (vDeviceId, aDeviceId, facing = cameraFacing) => {
    try {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }

      const constraints = {
        video: vDeviceId
          ? { deviceId: { exact: vDeviceId } }
          : { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: aDeviceId
          ? { deviceId: { exact: aDeviceId }, echoCancellation: true, noiseSuppression: true }
          : { echoCancellation: true, noiseSuppression: true }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(() => {});
      }

      attachLocalStreamToMixer(stream);
      await updateDeviceList();
      return stream;
    } catch (err) {
      console.error('Error starting media:', err);
      showToast('Camera/Mic permission denied or unavailable.', 'danger');
      return null;
    }
  }, [cameraFacing, attachLocalStreamToMixer, updateDeviceList, showToast]);

  // --- PeerJS WebRTC Setup ---
  const initWebRTC = useCallback((code, isHostUser) => {
    if (peerRef.current) {
      peerRef.current.destroy();
    }

    const peerId = isHostUser ? `duocast-${code}-host` : `duocast-${code}-guest-${Math.random().toString(36).substring(2, 6)}`;
    const peer = new Peer(peerId, {
      debug: 1,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    peerRef.current = peer;

    peer.on('open', (id) => {
      setConnectionStatus(isHostUser ? 'connecting' : 'connecting');
      setConnectionText(isHostUser ? 'Host Ready' : 'Connecting to Host...');

      if (!isHostUser) {
        // Connect to Host peer
        const hostPeerId = `duocast-${code}-host`;
        const conn = peer.connect(hostPeerId, { reliable: true });
        dataConnRef.current = conn;
        setupDataConnection(conn);

        // Call Host
        if (localStreamRef.current) {
          const call = peer.call(hostPeerId, localStreamRef.current);
          currentCallRef.current = call;
          setupCall(call);
        }
      }
    });

    peer.on('connection', (conn) => {
      dataConnRef.current = conn;
      setupDataConnection(conn);
    });

    peer.on('call', (call) => {
      currentCallRef.current = call;
      call.answer(localStreamRef.current || undefined);
      setupCall(call);
    });

    peer.on('error', (err) => {
      console.warn('Peer error:', err);
      if (err.type === 'peer-unavailable') {
        showToast('Host is not yet online in this room.', 'warning');
      }
    });
  }, [showToast]);

  const setupCall = (call) => {
    call.on('stream', (remoteStream) => {
      remoteStreamRef.current = remoteStream;
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.play().catch(() => {});
      }
      attachRemoteStreamToMixer(remoteStream);
      setConnectionStatus('connected');
      setConnectionText('Connected');
      showToast('Co-Host connected live!', 'success');
    });

    call.on('close', () => {
      remoteStreamRef.current = null;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      setConnectionStatus('connecting');
      setConnectionText('Host Ready');
      showToast('Co-Host disconnected.', 'warning');
    });
  };

  const setupDataConnection = (conn) => {
    conn.on('open', () => {
      setConnectionStatus('connected');
      setConnectionText('Connected');
      // Send initial metadata sync
      conn.send({
        type: 'META_SYNC',
        hostName,
        guestName,
        showTitle,
        studioLayout,
        layoutMode
      });
    });

    conn.on('data', (data) => {
      if (!data) return;
      if (data.type === 'CHAT_MSG') {
        setChatMessages((prev) => [...prev, {
          sender: data.sender || 'Co-Host',
          text: data.text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSelf: false
        }]);
        setUnreadChatCount((c) => c + 1);
      } else if (data.type === 'LAYOUT_SYNC') {
        if (data.studioLayout) setStudioLayout(data.studioLayout);
        if (data.layoutMode) setLayoutMode(data.layoutMode);
      } else if (data.type === 'META_SYNC') {
        if (data.showTitle) setShowTitle(data.showTitle);
      } else if (data.type === 'RECORDING_START') {
        setIsRecording(true);
        showToast('Host started recording!', 'info');
      } else if (data.type === 'RECORDING_STOP') {
        // Stop guest media tracks as well when host stops recording!
        stopAllHardwareMedia();
        showToast('Host finished recording take.', 'info');
      }
    });
  };

  // --- Initial URL Room Resolution ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setRoomCode(roomParam);
      setIsHost(false);
    } else {
      const stored = localStorage.getItem('duocast_last_room');
      const finalCode = stored || `risha-reel-${Math.random().toString(36).substring(2, 6)}`;
      setRoomCode(finalCode);
      setIsHost(true);
    }
  }, []);

  // --- Canvas Animation Frame Loop ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      let localVol = 0;
      let remoteVol = 0;
      if (audioMixerRef.current) {
        localVol = getAudioVolume(audioMixerRef.current.localAnalyser);
        remoteVol = getAudioVolume(audioMixerRef.current.remoteAnalyser);
        setMicLevel(localVol);
      }

      renderCompositorFrame({
        canvas,
        ctx,
        layoutMode,
        studioLayout,
        swapPositions,
        localVideo: localVideoRef.current,
        remoteVideo: remoteVideoRef.current,
        screenVideo: screenVideoRef.current,
        localStream: localStreamRef.current,
        remoteStream: remoteStreamRef.current,
        screenStream: screenStreamRef.current,
        localVolume: isMicMuted ? 0 : localVol,
        remoteVolume: remoteVol,
        hostName,
        guestName,
        showTitle,
        tickerEnabled,
        tickerText,
        tickerOffsetRef
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [
    layoutMode,
    studioLayout,
    swapPositions,
    isMicMuted,
    hostName,
    guestName,
    showTitle,
    tickerEnabled,
    tickerText
  ]);

  // --- Lip-Sync Audio Delay Slider Sync ---
  useEffect(() => {
    if (audioMixerRef.current?.delayNode) {
      audioMixerRef.current.delayNode.delayTime.value = audioDelay / 1000;
    }
  }, [audioDelay]);

  // --- Teleprompter Auto-Scroll Effect ---
  useEffect(() => {
    if (isPrompterScrolling && prompterRef.current) {
      prompterScrollTimer.current = setInterval(() => {
        if (prompterRef.current) {
          prompterRef.current.scrollTop += prompterSpeed;
        }
      }, 50);
    } else {
      clearInterval(prompterScrollTimer.current);
    }
    return () => clearInterval(prompterScrollTimer.current);
  }, [isPrompterScrolling, prompterSpeed]);

  // --- Stop All Hardware Tracks ("Stop Everything") ---
  const stopAllHardwareMedia = useCallback(() => {
    // 1. Stop local camera and microphone hardware
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        try { track.stop(); } catch (e) {}
      });
      localStreamRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;

    // 2. Stop screen share hardware
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => {
        try { track.stop(); } catch (e) {}
      });
      screenStreamRef.current = null;
    }
    setIsScreenSharing(false);
    if (screenVideoRef.current) screenVideoRef.current.srcObject = null;

    // 3. Stop teleprompter
    setIsPrompterScrolling(false);
    if (prompterRef.current) prompterRef.current.scrollTop = 0;

    // 4. Close utility drawers
    setIsPrompterOpen(false);
    setIsSoundboardOpen(false);
    setIsBrandingOpen(false);

    // 5. Update UI states
    setIsMicMuted(true);
    setIsCamOff(true);
  }, []);

  // --- Recording Actions ---
  const startRecordingImmediate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const mixer = ensureAudioMixer();
      const canvasStream = canvas.captureStream(framerate);
      const audioStream = mixer.audioDestination.stream;

      const combinedTracks = [
        ...canvasStream.getVideoTracks(),
        ...audioStream.getAudioTracks()
      ];
      const combinedStream = new MediaStream(combinedTracks);

      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8,opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }
      }

      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 6000000
      });

      recordedChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const fullBlob = new Blob(recordedChunksRef.current, { type: mimeType });
        const vUrl = URL.createObjectURL(fullBlob);
        setRecordedVideoUrl(vUrl);
        setRecordedMimeType(mimeType);

        const sizeMB = (fullBlob.size / (1024 * 1024)).toFixed(2) + ' MB';
        setRecordedFileSize(sizeMB);

        const durationSec = Math.floor((Date.now() - recordStartTime.current) / 1000);
        const mins = String(Math.floor(durationSec / 60)).padStart(2, '0');
        const secs = String(durationSec % 60).padStart(2, '0');
        setRecordedDuration(`${mins}:${secs}`);

        // Separate audio track
        const aBlob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        const aUrl = URL.createObjectURL(aBlob);
        setRecordedAudioUrl(aUrl);

        setIsResultModalOpen(true);
      };

      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setIsRecordingPaused(false);
      recordStartTime.current = Date.now();

      recordTimerInterval.current = setInterval(() => {
        const sec = Math.floor((Date.now() - recordStartTime.current) / 1000);
        const h = String(Math.floor(sec / 3600)).padStart(2, '0');
        const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
        const s = String(sec % 60).padStart(2, '0');
        setRecordingTimer(`${h}:${m}:${s}`);
      }, 1000);

      // Notify peer
      if (dataConnRef.current?.open) {
        dataConnRef.current.send({ type: 'RECORDING_START' });
      }

      showToast('Recording started! 🔴', 'success');
    } catch (e) {
      console.error('Failed to start recorder:', e);
      showToast('Could not start recording: ' + e.message, 'danger');
    }
  }, [framerate, ensureAudioMixer, showToast]);

  const triggerRecordingCountdown = useCallback(() => {
    if (!isHost) return;
    setIsCountdownVisible(true);
    setCountdownNumber(3);

    const playBeep = (freq) => {
      const mixer = ensureAudioMixer();
      if (!mixer) return;
      const osc = mixer.audioCtx.createOscillator();
      const gain = mixer.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, mixer.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.3, mixer.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, mixer.audioCtx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(mixer.audioCtx.destination);
      osc.start();
      osc.stop(mixer.audioCtx.currentTime + 0.2);
    };

    playBeep(440);

    setTimeout(() => {
      setCountdownNumber(2);
      playBeep(440);
      setTimeout(() => {
        setCountdownNumber(1);
        playBeep(440);
        setTimeout(() => {
          setIsCountdownVisible(false);
          playBeep(880);
          startRecordingImmediate();
        }, 1000);
      }, 1000);
    }, 1000);
  }, [isHost, ensureAudioMixer, startRecordingImmediate]);

  const stopRecording = useCallback(() => {
    if (!isHost) return;
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsRecordingPaused(false);
      clearInterval(recordTimerInterval.current);
      setRecordingTimer('00:00:00');

      // STOP EVERYTHING: cameras, mics, screen share, teleprompter
      stopAllHardwareMedia();

      // Notify peer
      if (dataConnRef.current?.open) {
        dataConnRef.current.send({ type: 'RECORDING_STOP' });
      }

      showToast('Recording stopped. All media & tools stopped.', 'info');
    }
  }, [isHost, isRecording, stopAllHardwareMedia, showToast]);

  const togglePauseRecording = useCallback(() => {
    if (!mediaRecorderRef.current || !isRecording) return;
    if (isRecordingPaused) {
      mediaRecorderRef.current.resume();
      setIsRecordingPaused(false);
      showToast('Recording resumed ▶️', 'info');
    } else {
      mediaRecorderRef.current.pause();
      setIsRecordingPaused(true);
      showToast('Recording paused ⏸️', 'warning');
    }
  }, [isRecording, isRecordingPaused, showToast]);

  // --- Hardware Toggles ---
  const toggleMic = useCallback(() => {
    if (!localStreamRef.current) {
      startLocalMedia(selectedVideoDevice, selectedAudioDevice);
      setIsMicMuted(false);
      return;
    }
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicMuted(!audioTrack.enabled);
      showToast(audioTrack.enabled ? 'Microphone unmuted' : 'Microphone muted', 'info');
    }
  }, [selectedVideoDevice, selectedAudioDevice, startLocalMedia, showToast]);

  const toggleCam = useCallback(() => {
    if (!localStreamRef.current) {
      startLocalMedia(selectedVideoDevice, selectedAudioDevice);
      setIsCamOff(false);
      return;
    }
    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsCamOff(!videoTrack.enabled);
      showToast(videoTrack.enabled ? 'Camera turned on' : 'Camera turned off', 'info');
    }
  }, [selectedVideoDevice, selectedAudioDevice, startLocalMedia, showToast]);

  const toggleScreen = useCallback(async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
      }
      setIsScreenSharing(false);
      if (screenVideoRef.current) screenVideoRef.current.srcObject = null;
      if (studioLayout === 'screen-duo') setStudioLayout('split');
      showToast('Screen sharing stopped', 'info');
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        screenStreamRef.current = stream;
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream;
          screenVideoRef.current.play().catch(() => {});
        }
        setIsScreenSharing(true);
        setStudioLayout('screen-duo');

        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          screenStreamRef.current = null;
          if (screenVideoRef.current) screenVideoRef.current.srcObject = null;
          if (studioLayout === 'screen-duo') setStudioLayout('split');
        };
        showToast('Screen shared successfully!', 'success');
      } catch (err) {
        console.warn('Screen share canceled or failed:', err);
      }
    }
  }, [isScreenSharing, studioLayout, showToast]);

  const flipCamera = useCallback(async () => {
    const nextFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(nextFacing);
    await startLocalMedia(null, selectedAudioDevice, nextFacing);
    showToast(`Switched to ${nextFacing === 'user' ? 'Front' : 'Back'} Camera`, 'info');
  }, [cameraFacing, selectedAudioDevice, startLocalMedia, showToast]);

  // --- Stream Deck Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in input or contentEditable
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.isContentEditable) {
        return;
      }

      if (e.key === ' ' || e.key.toLowerCase() === 'm') {
        e.preventDefault();
        toggleMic();
      } else if (e.key.toLowerCase() === 'v') {
        e.preventDefault();
        toggleCam();
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        if (isRecording) stopRecording();
        else triggerRecordingCountdown();
      } else if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        togglePauseRecording();
      } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        const layouts = ['split', 'pip', 'solo-host', 'solo-guest', 'screen-duo'];
        setStudioLayout(layouts[Number(e.key) - 1]);
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        setIsSoundboardOpen(prev => !prev);
      } else if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setIsChatOpen(prev => !prev);
      } else if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        setIsPrompterOpen(prev => !prev);
      } else if (e.key === '?') {
        e.preventDefault();
        setIsHotkeysOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleMic, toggleCam, isRecording, stopRecording, triggerRecordingCountdown, togglePauseRecording]);

  // --- Handlers ---
  const handleEnterStudio = (name, topic) => {
    if (isHost) {
      setHostName(name);
      if (topic) setShowTitle(topic);
    } else {
      setGuestName(name);
    }
    setIsWelcomeOpen(false);
    startLocalMedia(selectedVideoDevice, selectedAudioDevice);
    initWebRTC(roomCode, isHost);
    showToast(`Welcome ${name}! Studio is live.`, 'success');
  };

  const handleCopyInvite = () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
    navigator.clipboard.writeText(url).then(() => {
      showToast('Invite link copied to clipboard!', 'success');
    }).catch(() => {
      showToast(`Invite Link: ${url}`, 'info');
    });
  };

  const handleJoinRoom = (code) => {
    setRoomCode(code);
    setIsHost(false);
    localStorage.setItem('duocast_last_room', code);
    initWebRTC(code, false);
    showToast(`Connecting to room ${code}...`, 'info');
  };

  const handleCreateNewRoom = () => {
    const fresh = `risha-${Math.random().toString(36).substring(2, 7)}`;
    setRoomCode(fresh);
    setIsHost(true);
    localStorage.setItem('duocast_last_room', fresh);
    initWebRTC(fresh, true);
    showToast(`Created new studio room: ${fresh}`, 'success');
  };

  const handleSendChatMessage = (text) => {
    const sender = isHost ? hostName : guestName;
    setChatMessages((prev) => [...prev, {
      sender: 'You',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true
    }]);

    if (dataConnRef.current?.open) {
      dataConnRef.current.send({
        type: 'CHAT_MSG',
        sender,
        text
      });
    }
  };

  const handlePlaySFX = (sfxId) => {
    const mixer = ensureAudioMixer();
    if (mixer) {
      playStudioSFX(mixer.audioCtx, mixer.compressor, sfxId);
      showToast(`Sound FX: ${sfxId}`, 'info');
    }
  };

  const handleRecordNewTake = () => {
    setIsResultModalOpen(false);
    startLocalMedia(selectedVideoDevice, selectedAudioDevice);
    showToast('Ready for new take!', 'info');
  };

  return (
    <div className="app-container">
      {/* Top Header Navigation */}
      <Header
        connectionStatus={connectionStatus}
        connectionText={connectionText}
        isRecording={isRecording}
        recordingTimer={recordingTimer}
        layoutMode={layoutMode}
        onToggleLayoutMode={() => setLayoutMode(m => m === 'vertical' ? 'landscape' : 'vertical')}
        studioLayout={studioLayout}
        onChangeStudioLayout={(val) => setStudioLayout(val)}
        onToggleSoundboard={() => setIsSoundboardOpen(o => !o)}
        onToggleChat={() => {
          setIsChatOpen(o => !o);
          setUnreadChatCount(0);
        }}
        unreadChatCount={unreadChatCount}
        onTogglePrompter={() => setIsPrompterOpen(o => !o)}
        onToggleBranding={() => setIsBrandingOpen(o => !o)}
        onOpenHotkeys={() => setIsHotkeysOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      <main className="studio-main">
        {/* Room Link Bar */}
        <RoomBar
          roomCode={roomCode}
          onCopyInvite={handleCopyInvite}
          onOpenJoinModal={() => setIsJoinModalOpen(true)}
        />

        {/* Compositor Canvas Stage */}
        <Stage
          canvasRef={canvasRef}
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
          screenVideoRef={screenVideoRef}
          layoutMode={layoutMode}
          isRecording={isRecording}
        />

        {/* Floating Controls Bar */}
        <ControlsBar
          isHost={isHost}
          isMicMuted={isMicMuted}
          isCamOff={isCamOff}
          isScreenSharing={isScreenSharing}
          isRecording={isRecording}
          isRecordingPaused={isRecordingPaused}
          onToggleMic={toggleMic}
          onToggleCam={toggleCam}
          onToggleScreen={toggleScreen}
          onFlipCamera={flipCamera}
          onSwapLayout={() => setSwapPositions(s => !s)}
          onToggleRecord={isRecording ? stopRecording : triggerRecordingCountdown}
          onTogglePauseRecord={togglePauseRecording}
        />
      </main>

      {/* Branding Drawer */}
      <BrandingDrawer
        isOpen={isBrandingOpen}
        onClose={() => setIsBrandingOpen(false)}
        hostName={hostName}
        onChangeHostName={setHostName}
        guestName={guestName}
        onChangeGuestName={setGuestName}
        showTitle={showTitle}
        onChangeShowTitle={setShowTitle}
        studioTheme={studioTheme}
        onChangeStudioTheme={setStudioTheme}
        tickerText={tickerText}
        onChangeTickerText={setTickerText}
        tickerEnabled={tickerEnabled}
        onToggleTicker={() => setTickerEnabled(t => !t)}
      />

      {/* Teleprompter Drawer */}
      <TeleprompterDrawer
        isOpen={isPrompterOpen}
        onClose={() => setIsPrompterOpen(false)}
        isScrolling={isPrompterScrolling}
        onToggleScroll={() => setIsPrompterScrolling(s => !s)}
        onResetScroll={() => {
          if (prompterRef.current) prompterRef.current.scrollTop = 0;
        }}
        speed={prompterSpeed}
        onChangeSpeed={setPrompterSpeed}
        fontSize={prompterFontSize}
        onChangeFontSize={setPrompterFontSize}
        scriptText={scriptText}
        onChangeScriptText={setScriptText}
        prompterRef={prompterRef}
      />

      {/* Soundboard Drawer */}
      <SoundboardDrawer
        isOpen={isSoundboardOpen}
        onClose={() => setIsSoundboardOpen(false)}
        onPlaySFX={handlePlaySFX}
      />

      {/* Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendChatMessage}
      />

      {/* 3-2-1 Countdown Overlay */}
      <CountdownOverlay
        isVisible={isCountdownVisible}
        count={countdownNumber}
      />

      {/* Welcome / Onboarding Modal */}
      <WelcomeModal
        isOpen={isWelcomeOpen}
        onClose={() => setIsWelcomeOpen(false)}
        isHost={isHost}
        initialName={isHost ? hostName : guestName}
        initialTopic={showTitle}
        onEnterStudio={handleEnterStudio}
      />

      {/* Join Room Modal */}
      <JoinModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        currentRoomCode={roomCode}
        onJoinRoom={handleJoinRoom}
        onCreateNewRoom={handleCreateNewRoom}
      />

      {/* Recording Complete & Download Modal */}
      <RecordingResultModal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        videoUrl={recordedVideoUrl}
        audioUrl={recordedAudioUrl}
        fileSize={recordedFileSize}
        durationText={recordedDuration}
        mimeType={recordedMimeType}
        onRecordNewTake={handleRecordNewTake}
      />

      {/* Audio / Video Settings & Lip-Sync Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        videoDevices={videoDevices}
        audioDevices={audioDevices}
        selectedVideoDevice={selectedVideoDevice}
        onChangeVideoDevice={(id) => {
          setSelectedVideoDevice(id);
          startLocalMedia(id, selectedAudioDevice);
        }}
        selectedAudioDevice={selectedAudioDevice}
        onChangeAudioDevice={(id) => {
          setSelectedAudioDevice(id);
          startLocalMedia(selectedVideoDevice, id);
        }}
        audioProfile={audioProfile}
        onChangeAudioProfile={setAudioProfile}
        framerate={framerate}
        onChangeFramerate={setFramerate}
        audioDelay={audioDelay}
        onChangeAudioDelay={setAudioDelay}
        micLevel={micLevel}
      />

      {/* Cloudflare Pages Deployment Guide */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Stream Deck Hotkeys Cheat-Sheet */}
      <HotkeysModal
        isOpen={isHotkeysOpen}
        onClose={() => setIsHotkeysOpen(false)}
      />

      {/* Toast Notification Container */}
      <div id="toastContainer" className="toast-container"></div>
    </div>
  );
}
