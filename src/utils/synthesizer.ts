// Web Audio API Synthesizer for high-craft, serverless, offline-friendly meditative sounds.
// This matches the "slow-tech" academic and tactile feel of Desmame.

let audioCtx: AudioContext | null = null;
let ambientInterval: number | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Generates a beautiful resonating Tibetan Singing Bowl sound using sub-harmonic synthesizers.
 * Incorporates detuned frequency oscillators to simulate a real singing bowl beating pattern.
 */
export function playSingingBowl(fundamental: number = 220) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Harmonic ratios for authentic singing bowl profile
    const harmonics = [
      { ratio: 1.0, gain: 0.5, detune: 0 },
      { ratio: 1.5, gain: 0.25, detune: 2 },
      { ratio: 2.7, gain: 0.15, detune: -1.5 },
      { ratio: 3.4, gain: 0.08, detune: 3 },
      { ratio: 5.1, gain: 0.04, detune: -0.5 },
    ];

    // Master gain node
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.7, now + 0.15); // gentle attack
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 8); // long organic decay
    masterGain.connect(ctx.destination);

    harmonics.forEach(({ ratio, gain, detune }) => {
      const freq = fundamental * ratio;
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(detune, now);

      oscGain.gain.setValueAtTime(gain, now);

      // Add slight tremolo/beating effect to emulate a physical bowl's rotary sound
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.8 + ratio * 0.2, now); // slow rhythmic beat
      lfoGain.gain.setValueAtTime(0.06, now); // subtle volume wobble

      lfo.connect(lfoGain);
      lfoGain.connect(oscGain.gain);

      osc.connect(oscGain);
      oscGain.connect(masterGain);

      lfo.start(now);
      osc.start(now);

      lfo.stop(now + 8);
      osc.stop(now + 8);
    });
  } catch (error) {
    console.warn("Failed to play signing bowl audio:", error);
  }
}

/**
 * Plays a soft, dreamy wind chime tone.
 */
export function playWindChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Choose a high, bright, serene pentatonic frequency (C5, D5, E5, G5, A5, C6 etc)
    const activeFreqs = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66];
    const freq = activeFreqs[Math.floor(Math.random() * activeFreqs.length)];

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.25, now + 0.02);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 4); 
    masterGain.connect(ctx.destination);

    // Main chime oscillator
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Overtones for metallic chime timbre
    const overtone = ctx.createOscillator();
    const overtoneGain = ctx.createGain();
    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(freq * 2.76, now);
    overtoneGain.gain.setValueAtTime(0.05, now);

    osc.connect(masterGain);
    overtone.connect(overtoneGain);
    overtoneGain.connect(masterGain);

    osc.start(now);
    overtone.start(now);
    osc.stop(now + 4);
    overtone.stop(now + 4);
  } catch (err) {
    console.warn("Failed to play chime:", err);
  }
}

/**
 * Starts a background soundscape that periodically mimics light chimes & a subtle harmonic swell.
 */
export function startAmbientSoundscape() {
  if (ambientInterval) return;

  // Immediately play initial bell
  playSingingBowl(220);

  // Periodic triggers simulating wind-rustled chimes
  ambientInterval = window.setInterval(() => {
    // 60% chance to hear a wind chime every interval, 10% chance to hear a physical singing bowl swell
    const roll = Math.random();
    if (roll < 0.5) {
      playWindChime();
    } else if (roll < 0.6) {
      playSingingBowl(196); // G3 bowl
    }
  }, 4000);
}

/**
 * Stops the background soundscape.
 */
export function stopAmbientSoundscape() {
  if (ambientInterval) {
    clearInterval(ambientInterval);
    ambientInterval = null;
  }
}
