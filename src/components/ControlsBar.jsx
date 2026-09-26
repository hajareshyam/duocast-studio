import React from 'react';

export default function ControlsBar({
  isHost,
  isMicMuted,
  isCamOff,
  isScreenSharing,
  isRecording,
  isRecordingPaused,
  onToggleMic,
  onToggleCam,
  onToggleScreen,
  onFlipCamera,
  onSwapLayout,
  onToggleRecord,
  onTogglePauseRecord
}) {
  return (
    <section className="studio-controls-bar">
      <div className="controls-glass-panel">
        {/* Mic Toggle */}
        <button
          onClick={onToggleMic}
          className={`control-btn ${isMicMuted ? 'is-muted' : ''}`}
          id="toggleMicBtn"
          title="Toggle Microphone"
        >
          {!isMicMuted ? (
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          ) : (
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="1" y1="1" x2="23" y2="23"></line>
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          )}
          <span>{isMicMuted ? 'Muted' : 'Mic'}</span>
        </button>

        {/* Camera Toggle */}
        <button
          onClick={onToggleCam}
          className={`control-btn ${isCamOff ? 'is-off' : ''}`}
          id="toggleCamBtn"
          title="Toggle Camera"
        >
          {!isCamOff ? (
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7"></polygon>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
          ) : (
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="1" y1="1" x2="23" y2="23"></line>
              <path d="M21 15.5l2 1.5v-10l-4 3"></path>
              <path d="M16 16v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h1m4-1h4a2 2 0 0 1 2 2v4"></path>
            </svg>
          )}
          <span>{isCamOff ? 'Cam Off' : 'Camera'}</span>
        </button>

        {/* Screen Share Toggle */}
        <button
          onClick={onToggleScreen}
          className={`control-btn ${isScreenSharing ? 'is-sharing' : ''}`}
          id="toggleScreenBtn"
          title="Share Screen or Slide Deck"
        >
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          <span>{isScreenSharing ? 'Stop Share' : 'Screen'}</span>
        </button>

        {/* Flip Camera */}
        <button
          onClick={onFlipCamera}
          className="control-btn"
          id="flipCameraBtn"
          title="Flip Camera (Front / Back)"
        >
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 10c0-4.42-3.58-8-8-8s-8 3.58-8 8c0 1.84.62 3.54 1.67 4.9"></path>
            <path d="M4 14c0 4.42 3.58 8 8 8s8-3.58 8-8c0-1.84-.62-3.54-1.67-4.9"></path>
            <polyline points="20 4 20 10 14 10"></polyline>
            <polyline points="4 20 4 14 10 14"></polyline>
          </svg>
          <span>Flip</span>
        </button>

        {/* Swap Layout */}
        <button
          onClick={onSwapLayout}
          className="control-btn"
          id="swapLayoutBtn"
          title="Swap Screen Positions"
        >
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="7 16 3 12 7 8"></polyline>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <polyline points="17 8 21 12 17 16"></polyline>
          </svg>
          <span>Swap</span>
        </button>

        {/* Host Record Button or Guest Rec Badge */}
        {isHost ? (
          <>
            <button
              onClick={onToggleRecord}
              className={`control-btn record-action-btn ${isRecording ? 'is-recording' : ''}`}
              id="recordToggleBtn"
              title={isRecording ? 'Stop Recording' : 'Start Recording'}
            >
              <div className="record-btn-core">
                <span className="record-icon-shape"></span>
              </div>
              <span>{isRecording ? 'Stop' : 'Record'}</span>
            </button>

            {isRecording && (
              <button
                onClick={onTogglePauseRecord}
                className={`control-btn pause-rec-btn ${isRecordingPaused ? 'is-paused' : ''}`}
                id="pauseRecordBtn"
                title="Pause or Resume Recording"
              >
                {!isRecordingPaused ? (
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                  </svg>
                ) : (
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                )}
                <span>{isRecordingPaused ? 'Resume' : 'Pause'}</span>
              </button>
            )}
          </>
        ) : (
          <div className="control-btn guest-rec-badge" title="Only the room owner can control recording">
            <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>Host Controls Rec</span>
          </div>
        )}
      </div>
    </section>
  );
}
