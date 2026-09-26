import React from 'react';

export default function HotkeysModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" id="hotkeysModal">
      <div className="modal-card glass-card">
        <div className="modal-header">
          <h3>⌨️ Stream Deck Hotkeys</h3>
          <button onClick={onClose} className="btn-close" id="closeHotkeysBtn">&times;</button>
        </div>
        <div className="hotkeys-grid">
          <div className="hotkey-row"><div className="hotkey-keys"><kbd>Space</kbd> / <kbd>M</kbd></div> <span>Toggle Mic Mute</span></div>
          <div className="hotkey-row"><div className="hotkey-keys"><kbd>V</kbd></div> <span>Toggle Camera</span></div>
          <div className="hotkey-row"><div className="hotkey-keys"><kbd>R</kbd></div> <span>Start / Stop Recording</span></div>
          <div className="hotkey-row"><div className="hotkey-keys"><kbd>P</kbd></div> <span>Pause / Resume</span></div>
          <div className="hotkey-row"><div className="hotkey-keys"><kbd>1</kbd> - <kbd>5</kbd></div> <span>Switch Video Layouts</span></div>
          <div className="hotkey-row"><div className="hotkey-keys"><kbd>S</kbd></div> <span>Toggle Soundboard</span></div>
          <div className="hotkey-row"><div className="hotkey-keys"><kbd>C</kbd></div> <span>Toggle Backstage Chat</span></div>
          <div className="hotkey-row"><div className="hotkey-keys"><kbd>T</kbd></div> <span>Toggle Teleprompter</span></div>
          <div className="hotkey-row"><div className="hotkey-keys"><kbd>?</kbd></div> <span>Show Shortcuts Cheat-Sheet</span></div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-primary" id="gotItHotkeysBtn">Close</button>
        </div>
      </div>
    </div>
  );
}
