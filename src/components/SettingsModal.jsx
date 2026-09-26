import React from 'react';

export default function SettingsModal({
  isOpen,
  onClose,
  videoDevices,
  audioDevices,
  selectedVideoDevice,
  onChangeVideoDevice,
  selectedAudioDevice,
  onChangeAudioDevice,
  audioProfile,
  onChangeAudioProfile,
  framerate,
  onChangeFramerate,
  audioDelay,
  onChangeAudioDelay,
  micLevel
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" id="settingsModal">
      <div className="modal-card glass-card">
        <div className="modal-header">
          <h3>Device & Studio Settings</h3>
          <button onClick={onClose} className="btn-close" id="closeSettingsBtn">&times;</button>
        </div>

        <div className="settings-body">
          <div className="setting-item">
            <label htmlFor="cameraSelect">Camera Source:</label>
            <select
              id="cameraSelect"
              className="select-styled"
              value={selectedVideoDevice}
              onChange={(e) => onChangeVideoDevice(e.target.value)}
            >
              {videoDevices.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Camera ${d.deviceId.slice(0, 5)}...`}
                </option>
              ))}
            </select>
          </div>

          <div className="setting-item">
            <label htmlFor="microphoneSelect">Microphone Source:</label>
            <select
              id="microphoneSelect"
              className="select-styled"
              value={selectedAudioDevice}
              onChange={(e) => onChangeAudioDevice(e.target.value)}
            >
              {audioDevices.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Microphone ${d.deviceId.slice(0, 5)}...`}
                </option>
              ))}
            </select>
          </div>

          <div className="setting-item">
            <label>Live Mic Input Test:</label>
            <div className="mic-test-track">
              <div
                id="micTestBar"
                className="mic-test-fill"
                style={{ width: `${Math.round(micLevel * 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="setting-item">
            <label htmlFor="audioProfileSelect">Audio Quality DSP:</label>
            <select
              id="audioProfileSelect"
              className="select-styled"
              value={audioProfile}
              onChange={(e) => onChangeAudioProfile(e.target.value)}
            >
              <option value="broadcast">🎙️ Studio Broadcast (Compressor + Limiter)</option>
              <option value="warmth">📻 Warm Podcast EQ</option>
              <option value="raw">⚡ Clean Raw Stream</option>
            </select>
          </div>

          <div className="setting-item">
            <label htmlFor="frameRateSelect">Video Framerate:</label>
            <select
              id="frameRateSelect"
              className="select-styled"
              value={framerate}
              onChange={(e) => onChangeFramerate(Number(e.target.value))}
            >
              <option value={30}>30 FPS (Standard / Instagram)</option>
              <option value={60}>60 FPS (Ultra Smooth)</option>
            </select>
          </div>

          <div className="setting-item">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center' }}>
              <label htmlFor="audioDelaySlider">Audio Sync Offset (Lip-Sync):</label>
              <span id="audioDelayValue" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#a5b4fc', fontWeight: 700 }}>
                {audioDelay} ms
              </span>
            </div>
            <input
              type="range"
              id="audioDelaySlider"
              min="0"
              max="500"
              step="10"
              value={audioDelay}
              onChange={(e) => onChangeAudioDelay(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
            />
            <small style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>
              Increase slider if voice arrives before lips (e.g. +100ms for Bluetooth/AirPods).
            </small>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-primary" id="applySettingsBtn">
            Save & Apply
          </button>
        </div>
      </div>
    </div>
  );
}
