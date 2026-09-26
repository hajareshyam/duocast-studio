import React from 'react';

const SOUNDS = [
  { id: 'applause', emoji: '👏', name: 'Applause' },
  { id: 'ding', emoji: '🔔', name: 'Ding' },
  { id: 'airhorn', emoji: '🚨', name: 'Airhorn' },
  { id: 'drumroll', emoji: '🥁', name: 'Drumroll' },
  { id: 'laugh', emoji: '😂', name: 'Laugh' },
  { id: 'chime', emoji: '✨', name: 'Magic Chime' }
];

export default function SoundboardDrawer({
  isOpen,
  onClose,
  onPlaySFX
}) {
  if (!isOpen) return null;

  return (
    <div className="soundboard-drawer glass-card" id="soundboardDrawer">
      <div className="soundboard-header">
        <div className="soundboard-title">
          <span>🎉 Creator Soundboard</span>
        </div>
        <button onClick={onClose} className="btn-close" id="closeSoundboardBtn">&times;</button>
      </div>
      <div className="soundboard-grid">
        {SOUNDS.map((s) => (
          <button
            key={s.id}
            type="button"
            className="sfx-btn"
            onClick={() => onPlaySFX(s.id)}
          >
            <span className="sfx-emoji">{s.emoji}</span>
            <span className="sfx-name">{s.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
