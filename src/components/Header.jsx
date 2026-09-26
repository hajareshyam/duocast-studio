import React from 'react';

export default function Header({
  connectionStatus,
  connectionText,
  isRecording,
  recordingTimer,
  layoutMode,
  onToggleLayoutMode,
  studioLayout,
  onChangeStudioLayout,
  onToggleSoundboard,
  onToggleChat,
  unreadChatCount,
  onTogglePrompter,
  onToggleBranding,
  onOpenHotkeys,
  onOpenSettings,
  onOpenGuide
}) {
  return (
    <header className="studio-header">
      <div className="header-brand">
        <div className="brand-logo">
          <span className="logo-dot"></span>
          <span className="logo-ring"></span>
        </div>
        <div className="brand-text">
          <h1>DuoCast <span>Studio</span></h1>
          <p className="brand-badge">Instagram & Podcast Creator</p>
        </div>
      </div>

      <div className="header-status-bar">
        <div className={`status-badge status-${connectionStatus}`}>
          <span className="badge-dot"></span>
          <span>{connectionText}</span>
        </div>
        {isRecording && (
          <div className="timer-badge">
            <span className="rec-dot"></span>
            <span>{recordingTimer}</span>
          </div>
        )}
      </div>

      <div className="header-actions">
        <select
          value={studioLayout}
          onChange={(e) => onChangeStudioLayout(e.target.value)}
          className="select-styled select-compact"
          title="Change Video Layout"
        >
          <option value="split">👥 Split (50/50)</option>
          <option value="pip">🔲 Picture-in-Picture</option>
          <option value="solo-host">👤 Solo Host</option>
          <option value="solo-guest">👤 Solo Co-Host</option>
          <option value="screen-duo">🖥️ Screen + Duo</option>
        </select>

        <button
          onClick={onToggleLayoutMode}
          className="btn btn-secondary btn-icon"
          title="Toggle Aspect Ratio (9:16 Reels / 16:9 Landscape)"
        >
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="2" width="14" height="20" rx="2"></rect>
          </svg>
          <span>{layoutMode === 'vertical' ? '9:16' : '16:9'}</span>
        </button>

        <button
          onClick={onToggleSoundboard}
          className="btn btn-ghost btn-icon"
          title="Sound Effects Soundboard"
        >
          🔊
        </button>

        <button
          onClick={onToggleChat}
          className="btn btn-ghost btn-icon"
          style={{ position: 'relative' }}
          title="Private Backstage Chat"
        >
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          {unreadChatCount > 0 && (
            <span className="badge-dot" style={{ position: 'absolute', top: 4, right: 4, background: '#ec4899' }}></span>
          )}
        </button>

        <button
          onClick={onTogglePrompter}
          className="btn btn-ghost btn-icon"
          title="Teleprompter & Script Notes"
        >
          📝
        </button>

        <button
          onClick={onToggleBranding}
          className="btn btn-ghost btn-icon"
          title="Edit Names, Topic & Ticker"
        >
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>

        <button
          onClick={onOpenHotkeys}
          className="btn btn-ghost btn-icon"
          title="Keyboard Shortcuts Cheat-Sheet"
        >
          ⌨️
        </button>

        <button
          onClick={onOpenSettings}
          className="btn btn-ghost btn-icon"
          title="Audio/Video Settings & Lip-Sync"
        >
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1 2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>

        <button
          onClick={onOpenGuide}
          className="btn btn-ghost btn-icon"
          title="Deployment & Setup Guide"
        >
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </button>
      </div>
    </header>
  );
}
