import React, { useState } from 'react';

export default function WelcomeModal({
  isOpen,
  onClose,
  isHost,
  initialName,
  initialTopic,
  onEnterStudio
}) {
  const [userName, setUserName] = useState(initialName || '@traveller.risha');
  const [topic, setTopic] = useState(initialTopic || 'Live Travel & Mom-Life Talk 🎙️');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onEnterStudio(userName.trim() || (isHost ? '@host.creator' : '@guest.creator'), topic.trim());
  };

  return (
    <div className="modal-backdrop" id="welcomeModal">
      <div className="modal-card glass-card modal-welcome" style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={onClose}
          className="btn-close"
          id="closeWelcomeBtn"
          style={{ position: 'absolute', top: '14px', right: '18px' }}
          title="Dismiss"
        >
          &times;
        </button>

        <div className="welcome-header">
          <div className="brand-logo" style={{ margin: '0 auto 8px' }}>
            <span className="logo-dot"></span>
            <span className="logo-ring"></span>
          </div>
          <h3>Welcome to DuoCast Studio</h3>
          <p id="welcomeSubtitle">Please enter your name or Instagram handle to enter the recording studio.</p>
        </div>

        <form onSubmit={handleSubmit} className="welcome-form" id="welcomeForm">
          <div className="form-group">
            <label htmlFor="userNameInput">Your Name or Instagram Handle</label>
            <input
              type="text"
              id="userNameInput"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. @traveller.risha"
              autoFocus
              autoComplete="name"
            />
          </div>

          {isHost && (
            <div className="form-group" id="hostOnlyFields">
              <label htmlFor="initialTopicInput">Reel / Show Topic (Optional)</label>
              <input
                type="text"
                id="initialTopicInput"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. 48-Hour Weekend Escapes"
              />
            </div>
          )}

          <div className="role-notice" id="roleNoticeBadge">
            <span className="badge-role-icon">{isHost ? '👑' : '🎙️'}</span>
            <span>
              {isHost ? (
                <>You will enter as <strong>Room Owner (Host)</strong> and control recording.</>
              ) : (
                <>You will enter as <strong>Guest Co-Host</strong> (joined via invite link).</>
              )}
            </span>
          </div>

          <div className="welcome-actions">
            <button
              type="submit"
              className="btn btn-primary btn-glow btn-full"
              id="enterStudioBtn"
            >
              <span>Enter Studio</span>
              <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
