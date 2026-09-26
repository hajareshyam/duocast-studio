import React from 'react';

export default function Stage({
  canvasRef,
  localVideoRef,
  remoteVideoRef,
  screenVideoRef,
  layoutMode,
  isRecording
}) {
  const isVertical = layoutMode === 'vertical';
  const width = isVertical ? 1080 : 1920;
  const height = isVertical ? 1920 : 1080;
  const resLabel = isVertical ? '1080 x 1920 (9:16)' : '1920 x 1080 (16:9)';

  return (
    <section className="stage-container">
      <div className={`canvas-wrapper ${isVertical ? 'vertical-mode' : 'landscape-mode'}`} id="canvasWrapper">
        <canvas
          ref={canvasRef}
          id="studioCanvas"
          width={width}
          height={height}
        />

        <div className="canvas-hud">
          <div className="hud-top">
            <span
              className="hud-tag"
              id="hudLiveTag"
              style={{ background: isRecording ? 'rgba(239, 68, 68, 0.85)' : 'rgba(0, 0, 0, 0.6)' }}
            >
              {isRecording ? 'LIVE REC' : 'STUDIO READY'}
            </span>
            <span className="hud-res" id="hudResolutionTag">{resLabel}</span>
          </div>
        </div>
      </div>

      {/* Hidden media sinks used for canvas compositing */}
      <div className="hidden-media-sinks" aria-hidden="true" style={{ display: 'none' }}>
        <video ref={localVideoRef} id="localVideo" autoPlay playsInline webkit-playsinline="true" muted />
        <video ref={remoteVideoRef} id="remoteVideo" autoPlay playsInline webkit-playsinline="true" muted />
        <video ref={screenVideoRef} id="screenVideo" autoPlay playsInline webkit-playsinline="true" muted />
      </div>
    </section>
  );
}
