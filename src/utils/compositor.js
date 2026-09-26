/**
 * DuoCast Studio • HTML5 Canvas Compositor Engine
 * Renders multi-feeds, speaker glow, ticker, HUD, and responsive layouts
 */

export function renderCompositorFrame({
  canvas,
  ctx,
  layoutMode,
  studioLayout,
  swapPositions,
  localVideo,
  remoteVideo,
  screenVideo,
  localStream,
  remoteStream,
  screenStream,
  localVolume,
  remoteVolume,
  hostName,
  guestName,
  showTitle,
  tickerEnabled,
  tickerText,
  tickerOffsetRef
}) {
  if (!canvas || !ctx) return;
  const cw = canvas.width;
  const ch = canvas.height;

  // Background Studio Gradient
  const bgGradient = ctx.createLinearGradient(0, 0, cw, ch);
  bgGradient.addColorStop(0, '#0a0c14');
  bgGradient.addColorStop(0.5, '#10121d');
  bgGradient.addColorStop(1, '#07090e');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, cw, ch);

  const feed1 = swapPositions ? remoteStream : localStream;
  const feed2 = swapPositions ? localStream : remoteStream;
  const feed1Video = swapPositions ? remoteVideo : localVideo;
  const feed2Video = swapPositions ? localVideo : remoteVideo;
  const vol1 = swapPositions ? remoteVolume : localVolume;
  const vol2 = swapPositions ? localVolume : remoteVolume;

  const label1 = swapPositions ? guestName : hostName;
  const label2 = swapPositions ? hostName : guestName;

  // --- Layout Modes ---
  if (studioLayout === 'solo-host') {
    drawVideoFeed(ctx, feed1Video, feed1, 0, 0, cw, ch, label1, 'Host', vol1);
  } else if (studioLayout === 'solo-guest') {
    drawVideoFeed(ctx, feed2Video, feed2, 0, 0, cw, ch, label2, 'Co-Host', vol2);
  } else if (studioLayout === 'pip') {
    drawVideoFeed(ctx, feed1Video, feed1, 0, 0, cw, ch, label1, 'Host', vol1);

    const pipW = Math.round(cw * 0.36);
    const pipH = Math.round(layoutMode === 'vertical' ? pipW * (16 / 9) : pipW * (9 / 16));
    const pipX = cw - pipW - 24;
    const pipY = ch - pipH - 70;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 24;
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.9)';
    ctx.lineWidth = 3;
    ctx.strokeRect(pipX, pipY, pipW, pipH);
    ctx.restore();

    drawVideoFeed(ctx, feed2Video, feed2, pipX, pipY, pipW, pipH, label2, 'Co-Host', vol2);
  } else if (studioLayout === 'screen-duo') {
    const screenActive = screenStream && screenVideo && screenVideo.videoWidth > 0;
    if (layoutMode === 'vertical') {
      const topH = Math.round(ch * 0.60);
      const botH = ch - topH;
      const halfW = Math.round(cw / 2);

      if (screenActive) {
        drawVideoFeed(ctx, screenVideo, screenStream, 0, 0, cw, topH, '🖥️ Screen Presentation', 'Screen', 0);
      } else {
        drawEmptyPlaceholder(ctx, 0, 0, cw, topH, 'Screen');
      }

      drawVideoFeed(ctx, feed1Video, feed1, 0, topH, halfW, botH, label1, 'Host', vol1);
      drawVideoFeed(ctx, feed2Video, feed2, halfW, topH, halfW, botH, label2, 'Co-Host', vol2);
    } else {
      const leftW = Math.round(cw * 0.72);
      const rightW = cw - leftW;
      const halfH = Math.round(ch / 2);

      if (screenActive) {
        drawVideoFeed(ctx, screenVideo, screenStream, 0, 0, leftW, ch, '🖥️ Screen Presentation', 'Screen', 0);
      } else {
        drawEmptyPlaceholder(ctx, 0, 0, leftW, ch, 'Screen');
      }

      drawVideoFeed(ctx, feed1Video, feed1, leftW, 0, rightW, halfH, label1, 'Host', vol1);
      drawVideoFeed(ctx, feed2Video, feed2, leftW, halfH, rightW, halfH, label2, 'Co-Host', vol2);
    }
  } else {
    // Standard 50/50 Split Screen Mode
    if (layoutMode === 'vertical') {
      const halfH = ch / 2;
      drawVideoFeed(ctx, feed1Video, feed1, 0, 0, cw, halfH, label1, 'Host', vol1);

      // Center Divider
      ctx.save();
      ctx.shadowColor = '#6366f1';
      ctx.shadowBlur = 12;
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, halfH);
      ctx.lineTo(cw, halfH);
      ctx.stroke();
      ctx.restore();

      drawVideoFeed(ctx, feed2Video, feed2, 0, halfH, cw, halfH, label2, 'Co-Host', vol2);
    } else {
      const halfW = cw / 2;
      drawVideoFeed(ctx, feed1Video, feed1, 0, 0, halfW, ch, label1, 'Host', vol1);

      // Center Divider
      ctx.save();
      ctx.shadowColor = '#6366f1';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(halfW, 0);
      ctx.lineTo(halfW, ch);
      ctx.stroke();
      ctx.restore();

      drawVideoFeed(ctx, feed2Video, feed2, halfW, 0, halfW, ch, label2, 'Co-Host', vol2);
    }
  }

  // Header Banner
  drawTopHeaderBanner(ctx, cw, showTitle);

  // Lower-Third Ticker
  drawScrollingTicker(ctx, cw, ch, tickerEnabled, tickerText, tickerOffsetRef);
}

export function drawVideoFeed(ctx, videoEl, streamObj, x, y, w, h, nameTag, roleTag, volume) {
  if (streamObj && videoEl && videoEl.paused) {
    try {
      const p = videoEl.play();
      if (p !== undefined) p.catch(() => {});
    } catch (e) {}
  }

  const isVideoAlive = streamObj && videoEl && videoEl.videoWidth > 0 && !videoEl.ended;
  if (isVideoAlive) {
    const vw = videoEl.videoWidth;
    const vh = videoEl.videoHeight;
    const videoRatio = vw / vh;
    const destRatio = w / h;

    let sx, sy, sw, sh;
    if (videoRatio > destRatio) {
      sh = vh;
      sw = vh * destRatio;
      sx = (vw - sw) / 2;
      sy = 0;
    } else {
      sw = vw;
      sh = vw / destRatio;
      sx = 0;
      sy = (vh - sh) / 2;
    }

    ctx.drawImage(videoEl, sx, sy, sw, sh, x, y, w, h);

    // Active Speaker Dynamic Glow Border
    if (volume > 0.08) {
      ctx.save();
      ctx.shadowColor = (roleTag === 'Host') ? 'rgba(99, 102, 241, 0.95)' : 'rgba(236, 72, 153, 0.95)';
      ctx.shadowBlur = 18;
      ctx.strokeStyle = (roleTag === 'Host') ? '#818cf8' : '#f472b6';
      ctx.lineWidth = 4;
      ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
      ctx.restore();
    }
  } else {
    drawEmptyPlaceholder(ctx, x, y, w, h, roleTag);
  }

  // Name Tag & VU Meter
  drawNameBadge(ctx, x + 20, y + h - 50, nameTag, volume);
}

export function drawEmptyPlaceholder(ctx, x, y, w, h, role) {
  ctx.fillStyle = 'rgba(18, 20, 30, 0.95)';
  ctx.fillRect(x, y, w, h);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.strokeRect(x + 10, y + 10, w - 20, h - 20);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';

  if (role === 'Co-Host') {
    ctx.fillText('⌛ Waiting for Co-Host to join...', x + w / 2, y + h / 2 - 20);
    ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Share your Room Link to start recording together', x + w / 2, y + h / 2 + 15);
  } else if (role === 'Screen') {
    ctx.fillText('🖥️ Screen Presentation Mode', x + w / 2, y + h / 2 - 15);
    ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Click "Screen" in controls to share slides or tabs', x + w / 2, y + h / 2 + 18);
  } else {
    ctx.fillText('⏹️ Camera Stopped', x + w / 2, y + h / 2 - 15);
    ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Click Camera icon or "Record New Take" to restart', x + w / 2, y + h / 2 + 18);
  }
}

export function drawNameBadge(ctx, x, y, text, volume = 0) {
  if (!text) return;
  ctx.save();
  ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
  const textMetrics = ctx.measureText(text);
  const padX = 14;
  const vuWidth = 24;
  const badgeW = textMetrics.width + (padX * 2) + vuWidth;
  const badgeH = 36;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.beginPath();
  ctx.roundRect(x, y, badgeW, badgeH, 10);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + padX, y + (badgeH / 2));

  // 4-Bar Equalizer
  const bars = 4;
  const barW = 3;
  const barGap = 2;
  const startBarX = x + padX + textMetrics.width + 8;
  for (let i = 0; i < bars; i++) {
    const barH = 4 + Math.min(volume * 18 * (0.8 + i * 0.25), 18);
    const barY = y + (badgeH - barH) / 2;
    ctx.fillStyle = (i === 3 && volume > 0.75) ? '#ef4444' : (i >= 2 ? '#f59e0b' : '#10b981');
    ctx.fillRect(startBarX + i * (barW + barGap), barY, barW, barH);
  }

  ctx.restore();
}

export function drawTopHeaderBanner(ctx, cw, showTitle) {
  if (!showTitle) return;
  ctx.save();
  ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
  const textMetrics = ctx.measureText(showTitle);
  const padX = 22;
  const bannerW = Math.min(textMetrics.width + (padX * 2), cw - 60);
  const bannerH = 42;
  const bx = (cw - bannerW) / 2;
  const by = 26;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.beginPath();
  ctx.roundRect(bx, by, bannerW, bannerH, 10);
  ctx.fill();

  ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.fillStyle = '#f8fafc';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(showTitle, cw / 2, by + (bannerH / 2));
  ctx.restore();
}

export function drawScrollingTicker(ctx, cw, ch, tickerEnabled, tickerText, tickerOffsetRef) {
  if (!tickerEnabled || !tickerText) return;
  const barH = 38;
  const barY = ch - barH - 6;

  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
  ctx.fillRect(0, barY, cw, barH);

  ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, barY);
  ctx.lineTo(cw, barY);
  ctx.stroke();

  ctx.beginPath();
  ctx.rect(0, barY, cw, barH);
  ctx.clip();

  ctx.font = '600 17px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#f1f5f9';
  ctx.textBaseline = 'middle';

  const textMetrics = ctx.measureText(tickerText);
  const textW = textMetrics.width + 120;
  tickerOffsetRef.current = (tickerOffsetRef.current + 2) % textW;

  const startX = cw - tickerOffsetRef.current;
  ctx.fillText(tickerText, startX, barY + barH / 2);
  ctx.fillText(tickerText, startX + textW, barY + barH / 2);

  ctx.restore();
}
