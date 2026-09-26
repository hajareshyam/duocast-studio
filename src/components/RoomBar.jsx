import React from 'react';

export default function RoomBar({
  roomCode,
  onCopyInvite,
  onOpenJoinModal
}) {
  return (
    <section className="room-bar-container">
      <div className="room-bar glass-card">
        <div className="room-info">
          <span className="room-label">ROOM CODE:</span>
          <span className="room-code-badge">{roomCode || 'Generating...'}</span>
        </div>
        <div className="room-actions">
          <button onClick={onCopyInvite} className="btn btn-primary btn-sm" id="copyInviteBtn">
            <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>Copy Invite Link</span>
          </button>
          <button onClick={onOpenJoinModal} className="btn btn-ghost btn-sm" id="joinDifferentRoomBtn">
            Join Different Room
          </button>
        </div>
      </div>
    </section>
  );
}
