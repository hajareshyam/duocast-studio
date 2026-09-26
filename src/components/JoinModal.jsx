import React, { useState } from 'react';

export default function JoinModal({
  isOpen,
  onClose,
  currentRoomCode,
  onJoinRoom,
  onCreateNewRoom
}) {
  const [inputCode, setInputCode] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    onJoinRoom(inputCode.trim());
    onClose();
  };

  return (
    <div className="modal-backdrop" id="joinModal">
      <div className="modal-card glass-card">
        <h3>Join or Create a Room</h3>
        <p>Enter a room code to join an existing session or start a new broadcast.</p>
        <form onSubmit={handleSubmit} className="modal-form">
          <input
            type="text"
            id="manualRoomCodeInput"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="e.g. risha-live-101"
            autoFocus
          />
          <div className="modal-actions">
            <button
              type="button"
              onClick={onCreateNewRoom}
              className="btn btn-secondary btn-sm"
              id="createNewRoomBtn"
              style={{ marginRight: 'auto' }}
              title="Generate a fresh room code"
            >
              + Create New Room
            </button>
            <button type="submit" className="btn btn-primary" id="confirmJoinBtn">
              Connect to Room
            </button>
            <button type="button" onClick={onClose} className="btn btn-ghost" id="closeJoinModalBtn">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
