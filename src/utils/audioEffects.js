/**
 * DuoCast Studio • Web Audio Synthesizer & Audio DSP Utilities
 */

export function createAudioMixerContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioContextClass();
  const audioDestination = audioCtx.createMediaStreamDestination();

  // Dynamics Compressor (Broadcast Leveler & Limiter to prevent clipping)
  const compressor = audioCtx.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-24, audioCtx.currentTime);
  compressor.knee.setValueAtTime(30, audioCtx.currentTime);
  compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
  compressor.attack.setValueAtTime(0.003, audioCtx.currentTime);
  compressor.release.setValueAtTime(0.25, audioCtx.currentTime);
  compressor.connect(audioDestination);

  // Mic Gain Boost Node (1.0x to 2.5x)
  const micGainNode = audioCtx.createGain();
  micGainNode.gain.value = 1.0;

  // Audio Delay Node for Lip-Sync calibration (0 to 500ms)
  const delayNode = audioCtx.createDelay(1.0);
  delayNode.delayTime.value = 0;
  delayNode.connect(compressor);

  // Analysers for VU meters
  const localAnalyser = audioCtx.createAnalyser();
  localAnalyser.fftSize = 32;

  const remoteAnalyser = audioCtx.createAnalyser();
  remoteAnalyser.fftSize = 32;

  return {
    audioCtx,
    audioDestination,
    compressor,
    micGainNode,
    delayNode,
    localAnalyser,
    remoteAnalyser
  };
}

export function getAudioVolume(analyser) {
  if (!analyser) return 0;
  try {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const avg = sum / dataArray.length;
    return Math.min(Math.max((avg - 10) / 90, 0), 1);
  } catch (e) {
    return 0;
  }
}

export function playStudioSFX(audioCtx, dest, name) {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const now = audioCtx.currentTime;

  if (name === 'ding') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.1);
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    osc.connect(gain);
    if (dest) gain.connect(dest);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 1.0);
  } else if (name === 'airhorn') {
    const freqs = [370, 370, 370, 440];
    const times = [0, 0.15, 0.3, 0.45];
    freqs.forEach((f, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now + times[idx]);
      gain.gain.setValueAtTime(0.35, now + times[idx]);
      gain.gain.exponentialRampToValueAtTime(0.01, now + times[idx] + 0.12);
      osc.connect(gain);
      if (dest) gain.connect(dest);
      gain.connect(audioCtx.destination);
      osc.start(now + times[idx]);
      osc.stop(now + times[idx] + 0.14);
    });
  } else if (name === 'applause') {
    const bufferSize = audioCtx.sampleRate * 2.2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 1.5));
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    filter.Q.value = 1.0;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.45, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 2.2);
    noise.connect(filter).connect(gain);
    if (dest) gain.connect(dest);
    gain.connect(audioCtx.destination);
    noise.start(now);
  } else if (name === 'chime') {
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      gain.gain.setValueAtTime(0.4, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.8);
      osc.connect(gain);
      if (dest) gain.connect(dest);
      gain.connect(audioCtx.destination);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.8);
    });
  } else if (name === 'laugh') {
    [380, 480, 400, 520, 420, 540].forEach((f, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.08);
      gain.gain.setValueAtTime(0.3, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.07);
      osc.connect(gain);
      if (dest) gain.connect(dest);
      gain.connect(audioCtx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.08);
    });
  } else if (name === 'drumroll') {
    for (let i = 0; i < 16; i++) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 + Math.random() * 20, now + i * 0.06);
      gain.gain.setValueAtTime(0.1 + (i / 16) * 0.35, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.06 + 0.05);
      osc.connect(gain);
      if (dest) gain.connect(dest);
      gain.connect(audioCtx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.06);
    }
  }
}
