/**
 * DuoCast Studio • HTML5 Canvas Compositor Engine
 * Renders multi-feeds, speaker glow, multi-screen tickers, HUD, video filters, and reactions
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
  tickerOffsetRef,
  tickerPosition = 'dual', // 'dual' | 'center' | 'bottom'
  videoFilter = 'none',
  featuredQuestion = '',
  isQuestionVisible = false,
  visualEffects = []
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
    drawVideoFeed(ctx, feed1Video, feed1, 0, 0, cw, ch, label1, 'Host', vol1, videoFilter);
  } else if (studioLayout === 'solo-guest') {
    drawVideoFeed(ctx, feed2Video, feed2, 0, 0, cw, ch, label2, 'Co-Host', vol2, videoFilter);
  } else if (studioLayout === 'pip') {
    drawVideoFeed(ctx, feed1Video, feed1, 0, 0, cw, ch, label1, 'Host', vol1, videoFilter);

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

    drawVideoFeed(ctx, feed2Video, feed2, pipX, pipY, pipW, pipH, label2, 'Co-Host', vol2, videoFilter);
  } else if (studioLayout === 'screen-duo') {
    const screenActive = screenStream && screenVideo && screenVideo.videoWidth > 0;
    if (layoutMode === 'vertical') {
      const topH = Math.round(ch * 0.60);
      const botH = ch - topH;
      const halfW = Math.round(cw / 2);

      if (screenActive) {
        drawVideoFeed(ctx, screenVideo, screenStream, 0, 0, cw, topH, '🖥️ Screen Presentation', 'Screen', 0, 'none');
      } else {
        drawEmptyPlaceholder(ctx, 0, 0, cw, topH, 'Screen');
      }

      drawVideoFeed(ctx, feed1Video, feed1, 0, topH, halfW, botH, label1, 'Host', vol1, videoFilter);
      drawVideoFeed(ctx, feed2Video, feed2, halfW, topH, halfW, botH, label2, 'Co-Host', vol2, videoFilter);
    } else {
      const leftW = Math.round(cw * 0.72);
      const rightW = cw - leftW;
      const halfH = Math.round(ch / 2);

      if (screenActive) {
        drawVideoFeed(ctx, screenVideo, screenStream, 0, 0, leftW, ch, '🖥️ Screen Presentation', 'Screen', 0, 'none');
      } else {
        drawEmptyPlaceholder(ctx, 0, 0, leftW, ch, 'Screen');
      }

      drawVideoFeed(ctx, feed1Video, feed1, leftW, 0, rightW, halfH, label1, 'Host', vol1, videoFilter);
      drawVideoFeed(ctx, feed2Video, feed2, leftW, halfH, rightW, halfH, label2, 'Co-Host', vol2, videoFilter);
    }
  } else {
    // Standard 50/50 Split Screen Mode
    if (layoutMode === 'vertical') {
      const halfH = ch / 2;
      drawVideoFeed(ctx, feed1Video, feed1, 0, 0, cw, halfH, label1, 'Host', vol1, videoFilter);

      // Center Divider
      ctx.save();
      ctx.shadowColor = '#6366f1';
      ctx.shadowBlur = 14;
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.85)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, halfH);
      ctx.lineTo(cw, halfH);
      ctx.stroke();
      ctx.restore();

      drawVideoFeed(ctx, feed2Video, feed2, 0, halfH, cw, halfH, label2, 'Co-Host', vol2, videoFilter);
    } else {
      const halfW = cw / 2;
      drawVideoFeed(ctx, feed1Video, feed1, 0, 0, halfW, ch, label1, 'Host', vol1, videoFilter);

      // Center Divider
      ctx.save();
      ctx.shadowColor = '#6366f1';
      ctx.shadowBlur = 12;
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.85)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(halfW, 0);
      ctx.lineTo(halfW, ch);
      ctx.stroke();
      ctx.restore();

      drawVideoFeed(ctx, feed2Video, feed2, halfW, 0, halfW, ch, label2, 'Co-Host', vol2, videoFilter);
    }
  }

  // Header Banner
  drawTopHeaderBanner(ctx, cw, showTitle);

  // Featured Question / Topic Card Overlay
  if (isQuestionVisible && featuredQuestion) {
    drawFeaturedQuestionCard(ctx, cw, ch, featuredQuestion, layoutMode);
  }

  // Lower-Third Scrolling Ticker (Enhanced for Dual / Center / Bottom)
  drawScrollingTicker(ctx, cw, ch, tickerEnabled, tickerText, tickerOffsetRef, tickerPosition, layoutMode, studioLayout);

  // Render Visual FX (Reaction Emojis Flying Upwards)
  renderVisualFX(ctx, visualEffects);
}

export function drawVideoFeed(ctx, videoEl, streamObj, x, y, w, h, nameTag, roleTag, volume, filter = 'none') {
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

    ctx.save();
    // Video Filter Shader
    if (filter === 'warm') {
      ctx.filter = 'sepia(0.2) saturate(1.25) contrast(1.06) brightness(1.02)';
    } else if (filter === 'teal-orange') {
      ctx.filter = 'contrast(1.15) saturate(1.3) hue-rotate(-12deg)';
    } else if (filter === 'noir') {
      ctx.filter = 'grayscale(1) contrast(1.22) brightness(0.96)';
    } else if (filter === 'cyberpunk') {
      ctx.filter = 'saturate(1.45) hue-rotate(18deg) contrast(1.12)';
    }

    ctx.drawImage(videoEl, sx, sy, sw, sh, x, y, w, h);
    ctx.restore();

    // Active Speaker Dynamic Glow Border
    if (volume > 0.08) {
      ctx.save();
      ctx.shadowColor = (roleTag === 'Host') ? 'rgba(99, 102, 241, 0.95)' : 'rgba(236, 72, 153, 0.95)';
      ctx.shadowBlur = 20;
      ctx.strokeStyle = (roleTag === 'Host') ? '#818cf8' : '#f472b6';
      ctx.lineWidth = 4.5;
      ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
      ctx.restore();
    }
  } else {
    drawEmptyPlaceholder(ctx, x, y, w, h, roleTag);
  }

  // Name Tag & VU Meter
  drawNameBadge(ctx, x + 20, y + h - 56, nameTag, volume);
}

export function drawEmptyPlaceholder(ctx, x, y, w, h, role) {
  ctx.fillStyle = 'rgba(18, 20, 30, 0.95)';
  ctx.fillRect(x, y, w, h);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.strokeRect(x + 10, y + 10, w - 20, h - 20);

  ctx.save();
  ctx.fillStyle = '#64748b';
  ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const icon = role === 'Screen' ? '🖥️' : '👤';
  ctx.fillText(icon, x + w / 2, y + h / 2 - 25);

  ctx.font = '500 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#94a3b8';
  const label = role === 'Screen' ? 'Waiting for Screen Share...' : (role === 'Host' ? 'Camera Stopped' : 'Waiting for Co-Host to join...');
  ctx.fillText(label, x + w / 2, y + h / 2 + 15);

  if (role !== 'Screen') {
    ctx.font = '13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText(role === 'Host' ? 'Click Camera button or "Record New Take" to restart' : 'Share your Room Link for instant split recording together', x + w / 2, y + h / 2 + 42);
  }
  ctx.restore();
}

export function drawNameBadge(ctx, x, y, name, volume = 0) {
  if (!name) return;
  ctx.save();
  ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
  const text = name.trim();
  const textMetrics = ctx.measureText(text);

  const padX = 14;
  const badgeH = 34;
  const badgeW = textMetrics.width + padX * 2 + 34;

  // Glass pill
  ctx.fillStyle = 'rgba(10, 12, 22, 0.82)';
  ctx.beginPath();
  ctx.roundRect(x, y, badgeW, badgeH, 17);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 1;
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

export function drawFeaturedQuestionCard(ctx, cw, ch, question, layoutMode) {
  if (!question) return;
  ctx.save();
  const cardW = Math.min(cw * 0.88, 700);
  const cardH = 90;
  const cardX = (cw - cardW) / 2;
  const cardY = layoutMode === 'vertical' ? 80 : 75;

  // Background glow
  ctx.shadowColor = 'rgba(236, 72, 153, 0.45)';
  ctx.shadowBlur = 24;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 14);
  ctx.fill();

  ctx.strokeStyle = 'rgba(236, 72, 153, 0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  ctx.save();
  // Pill Badge
  ctx.fillStyle = '#ec4899';
  ctx.beginPath();
  ctx.roundRect(cardX + 18, cardY + 12, 140, 22, 11);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('💡 FEATURED TOPIC', cardX + 18 + 70, cardY + 23);

  // Question Text
  ctx.fillStyle = '#f8fafc';
  ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const maxTextW = cardW - 36;
  ctx.fillText(question, cardX + 20, cardY + 58, maxTextW);
  ctx.restore();
}

/**
 * Enhanced Scrolling Ticker:
 * Supports Dual-Screen (Host + Guest), Center Divider, or Bottom Bar!
 */
export function drawScrollingTicker(
  ctx,
  cw,
  ch,
  tickerEnabled,
  tickerText,
  tickerOffsetRef,
  tickerPosition = 'dual',
  layoutMode = 'vertical',
  studioLayout = 'split'
) {
  if (!tickerEnabled || !tickerText) return;
  const barH = 38;

  // Calculate text dimensions
  ctx.save();
  ctx.font = '600 17px "Plus Jakarta Sans", sans-serif';
  const textMetrics = ctx.measureText(tickerText);
  const textW = textMetrics.width + 120;
  tickerOffsetRef.current = (tickerOffsetRef.current + 2) % textW;
  const startX = cw - tickerOffsetRef.current;
  ctx.restore();

  const renderTickerBar = (yPos, borderTop = true, borderBot = true) => {
    ctx.save();
    ctx.fillStyle = 'rgba(10, 14, 26, 0.88)';
    ctx.fillRect(0, yPos, cw, barH);

    ctx.strokeStyle = 'rgba(99, 102, 241, 0.55)';
    ctx.lineWidth = 1.2;

    if (borderTop) {
      ctx.beginPath();
      ctx.moveTo(0, yPos);
      ctx.lineTo(cw, yPos);
      ctx.stroke();
    }
    if (borderBot) {
      ctx.beginPath();
      ctx.moveTo(0, yPos + barH);
      ctx.lineTo(cw, yPos + barH);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.rect(0, yPos, cw, barH);
    ctx.clip();

    ctx.font = '600 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#f1f5f9';
    ctx.textBaseline = 'middle';

    ctx.fillText(tickerText, startX, yPos + barH / 2);
    ctx.fillText(tickerText, startX + textW, yPos + barH / 2);
    ctx.restore();
  };

  if (studioLayout === 'split') {
    if (layoutMode === 'vertical') {
      const halfH = ch / 2;
      if (tickerPosition === 'dual') {
        // Ticker under Screen 1 (Host) AND under Screen 2 (Guest)
        renderTickerBar(halfH - barH);
        renderTickerBar(ch - barH - 6);
      } else if (tickerPosition === 'center') {
        // Center Divider Ticker dividing both screens
        renderTickerBar(halfH - (barH / 2));
      } else {
        // Bottom Edge
        renderTickerBar(ch - barH - 6);
      }
    } else {
      // 16:9 Landscape Split (Left / Right)
      if (tickerPosition === 'dual' || tickerPosition === 'center') {
        // Spans across both screens seamlessly with a center accent
        renderTickerBar(ch - barH - 6);
      } else {
        renderTickerBar(ch - barH - 6);
      }
    }
  } else {
    // Single / PiP / Screen-Duo layout
    renderTickerBar(ch - barH - 6);
  }
}

export function renderVisualFX(ctx, visualEffects) {
  if (!visualEffects || visualEffects.length === 0) return;
  const now = Date.now();
  visualEffects.forEach((fx) => {
    const elapsed = now - fx.start;
    if (elapsed > fx.duration) return;
    const progress = elapsed / fx.duration;
    const alpha = 1 - progress;
    const currentY = fx.y - (progress * 160);

    ctx.save();
    ctx.globalAlpha = Math.max(alpha, 0);
    ctx.font = `${fx.size || 42}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText(fx.emoji, fx.x, currentY);
    ctx.restore();
  });
}
