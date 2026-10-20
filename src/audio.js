// Procedural chiptune engine (Web Audio). No audio files: every theme is a
// pattern in data/music.js, and every sound effect is synthesized here.
(function (IS) {
  const A = { ctx: null, cur: null, want: null, step: 0, nextT: 0, timer: null, detune: 0 };
  const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);
  const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

  function parse(str) {
    // tokens: C5, F#4, Bb3, '.' = rest, '-' = hold previous
    const toks = str.trim().split(/\s+/);
    const out = [];
    toks.forEach((t, i) => {
      if (t === '.' || t === '-') { out.push(null); return; }
      const m = /^([A-G])(#|b)?(-?\d)$/.exec(t);
      if (!m) { out.push(null); return; }
      let n = NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (parseInt(m[3], 10) + 1) * 12;
      let len = 1; for (let j = i + 1; j < toks.length && toks[j] === '-'; j++) len++;
      out.push({ n, len });
    });
    return out;
  }

  A.unlock = function () {
    if (A.ctx) { if (A.ctx.state === 'suspended') A.ctx.resume(); return; }
    try {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
      A.ctx = new C();
      A.master = A.ctx.createGain(); A.master.connect(A.ctx.destination);
      A.mus = A.ctx.createGain(); A.mus.connect(A.master);
      A.fx = A.ctx.createGain(); A.fx.connect(A.master);
      // gentle echo on music for atmosphere
      const d = A.ctx.createDelay(); d.delayTime.value = 0.28;
      const fb = A.ctx.createGain(); fb.gain.value = 0.22;
      A.mus.connect(d); d.connect(fb); fb.connect(d); d.connect(A.master);
      A.apply();
      A.timer = setInterval(A.tick, 25);
      if (A.want) { const w = A.want; A.want = null; A.play(w); }
    } catch (e) { A.ctx = null; }
  };

  A.apply = function () {
    if (!A.ctx) return;
    const s = IS.settings || { master: 0.8, music: 0.6, sfx: 0.8 };
    A.master.gain.value = s.master;
    A.mus.gain.value = s.music * 0.32;
    A.fx.gain.value = s.sfx * 0.45;
  };

  function tone(dest, freq, t, dur, type, vol, slide) {
    const o = A.ctx.createOscillator(), g = A.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (A.detune) o.detune.setValueAtTime((Math.random() - 0.5) * A.detune, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(t, dur, vol) {
    const len = Math.floor(A.ctx.sampleRate * dur);
    const buf = A.ctx.createBuffer(1, len, A.ctx.sampleRate);
    const ch = buf.getChannelData(0); for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = A.ctx.createBufferSource(), g = A.ctx.createGain();
    s.buffer = buf; g.gain.value = vol; s.connect(g); g.connect(A.fx); s.start(t);
  }

  A.play = function (id) {
    if (A.cur && A.cur.id === id) return;
    if (!A.ctx) { A.want = id; return; }
    const m = IS.data.music[id];
    if (!m) { A.cur = null; return; }
    A.cur = { id, m, lead: parse(m.lead), bass: parse(m.bass), pad: m.pad ? parse(m.pad) : null };
    A.step = 0; A.nextT = A.ctx.currentTime + 0.1;
  };
  A.stop = function () { A.cur = null; };

  A.tick = function () {
    if (!A.ctx || !A.cur) return;
    const c = A.cur, spb = 60 / c.m.bpm / 2; // 8th notes
    while (A.nextT < A.ctx.currentTime + 0.12) {
      const i = A.step;
      const L = c.lead[i % c.lead.length], B = c.bass[i % c.bass.length];
      if (L) tone(A.mus, midi(L.n), A.nextT, spb * L.len * 0.95, c.m.wave || 'square', c.m.leadVol || 0.18);
      if (B) tone(A.mus, midi(B.n), A.nextT, spb * B.len * 0.9, c.m.bassWave || 'triangle', c.m.bassVol || 0.3);
      if (c.pad) { const P = c.pad[i % c.pad.length]; if (P) tone(A.mus, midi(P.n), A.nextT, spb * P.len, 'sine', 0.08); }
      A.nextT += spb; A.step++;
    }
  };

  const SFX = {
    blip(t, p) { tone(A.fx, p || 620, t, 0.035, 'square', 0.07); },
    select(t) { tone(A.fx, 660, t, 0.05, 'square', 0.12); },
    confirm(t) { tone(A.fx, 523, t, 0.06, 'square', 0.14); tone(A.fx, 784, t + 0.06, 0.09, 'square', 0.14); },
    back(t) { tone(A.fx, 392, t, 0.07, 'square', 0.12, 0.7); },
    door(t) { noise(t, 0.12, 0.25); tone(A.fx, 110, t, 0.15, 'triangle', 0.3, 0.6); },
    clue(t) { [72, 76, 79, 84].forEach((n, i) => tone(A.fx, midi(n), t + i * 0.07, 0.18, 'triangle', 0.22)); },
    deduce(t) { [60, 67, 72, 76, 79, 84].forEach((n, i) => tone(A.fx, midi(n), t + i * 0.06, 0.3, 'square', 0.13)); },
    wrong(t) { tone(A.fx, 220, t, 0.18, 'sawtooth', 0.1, 0.8); },
    ach(t) { [67, 72, 76, 72, 79].forEach((n, i) => tone(A.fx, midi(n), t + i * 0.08, 0.16, 'square', 0.12)); },
    bell(t) { [0, 0.35].forEach((o) => { tone(A.fx, 988, t + o, 1.6, 'sine', 0.22); tone(A.fx, 1318, t + o, 1.1, 'sine', 0.1); tone(A.fx, 494, t + o, 1.9, 'sine', 0.12); }); },
    glitch(t) { noise(t, 0.25, 0.3); tone(A.fx, 80, t, 0.25, 'sawtooth', 0.15, 3); },
    loop(t) { [84, 79, 76, 72, 67, 60, 55, 48].forEach((n, i) => tone(A.fx, midi(n), t + i * 0.11, 0.5, 'sine', 0.2)); },
    step(t) { tone(A.fx, 90, t, 0.03, 'triangle', 0.05); }
  };
  A.sfx = function (id, p) { if (!A.ctx || !SFX[id]) return; SFX[id](A.ctx.currentTime + 0.005, p); };

  IS.A = A;
})(window.IS);
