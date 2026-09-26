import React from 'react';

export default function CountdownOverlay({ isVisible, count }) {
  if (!isVisible) return null;

  return (
    <div className="countdown-overlay" id="countdownOverlay">
      <div className="countdown-box">
        <div className="countdown-number" id="countdownNumber">{count}</div>
        <div className="countdown-label" id="countdownLabel">GET READY...</div>
      </div>
    </div>
  );
}
