import React from 'react';

export default function RecordingResultModal({
  isOpen,
  onClose,
  videoUrl,
  audioUrl,
  fileSize,
  durationText,
  mimeType,
  onRecordNewTake
}) {
  if (!isOpen) return null;

  const isMp4 = mimeType?.includes('mp4');
  const videoFileName = `DuoCast_Live_${new Date().toISOString().replace(/[:.]/g, '-')}.${isMp4 ? 'mp4' : 'webm'}`;
  const audioFileName = `DuoCast_Podcast_Audio_${new Date().toISOString().replace(/[:.]/g, '-')}.webm`;

  return (
    <div className="modal-backdrop" id="recordingResultModal">
      <div className="modal-card glass-card modal-large">
        <div className="modal-header">
          <h3>🎉 Recording Complete!</h3>
          <button onClick={onClose} className="btn-close" id="closeResultModalBtn">&times;</button>
        </div>

        <div className="recorded-preview-container">
          {videoUrl && (
            <video
              id="recordedPlayback"
              src={videoUrl}
              controls
              playsInline
              style={{ width: '100%', maxHeight: '420px', borderRadius: '12px', background: '#000' }}
            />
          )}
        </div>

        <div className="modal-footer">
          <div className="recorded-meta">
            <span className="meta-tag" id="recordedFileSizeBadge">Size: {fileSize || 'Calculating...'}</span>
            <span className="meta-tag" id="recordedDurationBadge">Duration: {durationText || '00:00'}</span>
          </div>

          <div className="footer-actions">
            {videoUrl && (
              <a
                href={videoUrl}
                download={videoFileName}
                className="btn btn-primary btn-glow"
                id="downloadVideoAnchor"
              >
                <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>Download Video (.mp4 / .webm)</span>
              </a>
            )}

            {audioUrl && (
              <a
                href={audioUrl}
                download={audioFileName}
                className="btn btn-secondary"
                id="downloadAudioAnchor"
              >
                <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
                <span>Audio Only (.webm)</span>
              </a>
            )}

            <button
              type="button"
              onClick={onRecordNewTake}
              className="btn btn-secondary"
              id="recordNewTakeBtn"
            >
              <span>🔄 Record New Take</span>
            </button>

            <button onClick={onClose} className="btn btn-ghost" id="discardVideoBtn">
              Done & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
