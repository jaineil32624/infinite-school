// Procedural pixel art: tiles, characters and portraits are drawn from code
// so the game ships without image assets. Swap any function for a sprite
// sheet later without touching game logic.
(function (IS) {
  const Art = { night: false };

  const THEMES = {
    school:  { floor: ['#c4ad86', '#bba37c'], line: '#a8916c', top: '#2c2338', face: '#7b6b92', fline: '#6c5c83', trim: '#a898bf', base: '#251c2f' },
    library: { floor: ['#6e4632', '#66402d'], line: '#55352a', top: '#1e1828', face: '#4f3f62', fline: '#433555', trim: '#7e6a96', base: '#160f1e' },
    cafe:    { floor: ['#d8d0bd', '#a9a08d'], line: '#9a917f', top: '#2c2338', face: '#8d7d7a', fline: '#7c6c69', trim: '#b8a4a0', base: '#2a2024' },
    gym:     { floor: ['#c98f52', '#c08848'], line: '#a8743e', top: '#2c2338', face: '#6e7e92', fline: '#5f6f83', trim: '#9fb0c4', base: '#20242c' },
    lobby:   { floor: ['#cfc8bd', '#c4bdb1'], line: '#b0a99d', top: '#2c2338', face: '#857597', fline: '#766688', trim: '#b2a2c4', base: '#251c2f' },
    office:  { floor: ['#7a2f38', '#702a33'], line: '#5e2229', top: '#241c2c', face: '#6c5a52', fline: '#5c4b44', trim: '#a08a78', base: '#1c1418' },
    outdoor: { floor: ['#5f8a4c', '#5a8448'], line: '#4f7740', top: '#3a3046', face: '#8c7a9a', fline: '#7a688a', trim: '#b4a3c4', base: '#2a2134' },
    roof:    { floor: ['#77737e', '#716d78'], line: '#615e69', top: '#3a3046', face: '#5d5866', fline: '#504c58', trim: '#8a8494', base: '#24212a' },
    anomaly: { floor: ['#47656f', '#415d66'], line: '#36505a', top: '#0b1016', face: '#344c57', fline: '#2b414b', trim: '#86c9d2', base: '#060a0e' },
    sub:     { floor: ['#262b37', '#232833'], line: '#1c212b', top: '#07080c', face: '#1e2430', fline: '#181d27', trim: '#3d6e78', base: '#040507' }
  };
  Art.THEMES = THEMES;
  Art.SOLID = new Set('#EKWLDTBP=XrhoqvFYxwb'.split(''));
  Art.WALLS = new Set('#EKWXr'.split(''));

  const hsh = (x, y) => ((x * 73856093) ^ (y * 19349663)) >>> 0;

  Art.tile = function (c, ch, x, y, tx, ty, th, below, t) {
    const p = THEMES[th] || THEMES.school;
    const R = (col, a, b, w, h) => { c.fillStyle = col; c.fillRect(x + a, y + b, w, h); };
    const floor = () => {
      const f = p.floor[(tx + ty) & 1];
      if (th === 'cafe') { R(f, 0, 0, 16, 16); return; }
      R(p.floor[0], 0, 0, 16, 16);
      if (th === 'outdoor') { const h = hsh(tx, ty); R(p.line, h % 13, (h >> 4) % 13, 1, 2); R(p.floor[1], (h >> 8) % 12, (h >> 12) % 12, 2, 1); return; }
      if (th === 'roof') { const h = hsh(tx, ty); R(p.line, h % 15, (h >> 3) % 15, 1, 1); R(p.line, (h >> 6) % 15, (h >> 9) % 15, 1, 1); return; }
      if (th === 'office') { R(p.line, 0, 15, 16, 1); return; }
      if (th === 'lobby' || th === 'anomaly' || th === 'sub') { R(p.line, 0, 15, 16, 1); R(p.line, 15, 0, 1, 16); return; }
      R(p.line, 0, (tx & 1) ? 7 : 15, 16, 1); // plank seams
      R(p.floor[1], (hsh(tx, ty) % 12), 3, 3, 1);
    };
    const wall = () => {
      if (Art.WALLS.has(below)) { R(p.top, 0, 0, 16, 16); R(p.base, 0, 15, 16, 1); return false; }
      R(p.face, 0, 0, 16, 16); R(p.trim, 0, 0, 16, 2); R(p.fline, 0, 6, 16, 1); R(p.base, 0, 13, 16, 3); return true;
    };
    switch (ch) {
      case '#': case 'E': wall(); break;
      case 'X': R('#000', 0, 0, 16, 16); break;
      case 'K': if (wall()) { R('#2d5a45', 1, 3, 14, 8); R('#3f7059', 1, 3, 14, 1); R('#dfe6d0', 3 + (tx % 3), 5, 4, 1); R('#dfe6d0', 2 + (tx % 4), 8, 6, 1); } break;
      case 'W': if (wall()) { const g = Art.night ? '#1a2342' : '#93c6d6'; R('#e8e0d0', 2, 2, 12, 10); R(g, 3, 3, 10, 8); R(Art.night ? '#2a3560' : '#cfeaf2', 4, 4, 3, 2); R('#e8e0d0', 7, 3, 1, 8); } break;
      case 'r': R(p.floor[0], 0, 0, 16, 16); R('#4a4552', 0, 2, 16, 2); R('#4a4552', 0, 9, 16, 2); R('#3a3640', (tx % 2) * 8 + 2, 0, 2, 14); break;
      case 'F': floor(); R('#3f3a48', 0, 3, 16, 2); R('#3f3a48', 0, 10, 16, 2); for (let i = 1; i < 16; i += 5) R('#2e2a36', i, 1, 2, 14); break;
      case 'G': floor(); R('#5d5568', 0, 2, 2, 13); R('#5d5568', 14, 2, 2, 13); R('rgba(220,230,240,0.35)', 2, 0, 12, 16); break;
      case 'Y': floor(); R('#5a3d2a', 6, 9, 4, 7); R('#2f5a32', 0, 0, 16, 11); R('#3f7642', 2, 1, 10, 7); R('#58924f', 4, 2, 4, 3); break;
      case 'g': R('#4f7a3e', 0, 0, 16, 16); { const h = hsh(tx, ty); R('#e6c84a', h % 13, (h >> 4) % 13, 2, 2); R('#d96a6a', (h >> 8) % 13, (h >> 12) % 13, 2, 2); R('#3e6532', (h >> 5) % 14, (h >> 9) % 14, 1, 2); } break;
      case 'p': R('#b6a98f', 0, 0, 16, 16); R('#a2957b', 0, 7, 8, 1); R('#a2957b', 8, 15, 8, 1); R('#a2957b', 7, 0, 1, 8); R('#a2957b', 15, 8, 1, 8); break;
      case ',': R(p.floor[0], 0, 0, 16, 16); if ((tx + ty) % 2) R(p.floor[1], 4, 4, 8, 8); R(p.line, 0, 15, 16, 1); break;
      case ':': floor(); break;
      case 'S': R('#8d7f6a', 0, 0, 16, 16); for (let i = 0; i < 16; i += 4) { R('#6f624f', 0, i + 3, 16, 1); R('#a3957f', 0, i, 16, 1); } break;
      case 'd': floor(); R('#1d1520', 2, 0, 12, 16); R('#3a2c40', 2, 0, 1, 16); R('#3a2c40', 13, 0, 1, 16); R('rgba(255,230,180,0.08)', 3, 10, 10, 6); break;
      case 'L': floor(); R('#5b7a8e', 1, 0, 14, 16); R('#4a6577', 1, 0, 1, 16); R('#4a6577', 8, 0, 1, 16); for (let i = 3; i < 9; i += 2) { R('#3c5262', 3, i, 4, 1); R('#3c5262', 10, i, 4, 1); } R('#cfd8de', 6, 10, 1, 2); R('#cfd8de', 13, 10, 1, 2); R('#2f4250', 1, 15, 14, 1); break;
      case 'D': floor(); R('#5a3c24', 2, 12, 1, 4); R('#5a3c24', 13, 12, 1, 4); R('#a3743f', 1, 3, 14, 8); R('#bf8c50', 1, 3, 14, 2); R('#7c5530', 1, 11, 14, 2); break;
      case 'C': floor(); R('#6b4a2e', 4, 4, 8, 2); R('#8a6038', 4, 6, 8, 5); R('#5a3c24', 4, 11, 1, 4); R('#5a3c24', 11, 11, 1, 4); break;
      case 'T': floor(); R('#7d5130', 0, 2, 16, 10); R('#96643c', 0, 2, 16, 2); R('#5e3c22', 0, 12, 16, 2); break;
      case 'B': R('#3e2719', 0, 0, 16, 16); for (let r = 0; r < 3; r++) { R('#2a1a10', 0, r * 5 + 4, 16, 1); for (let b = 1; b < 15; b += 3) { const h = hsh(tx * 7 + b, ty * 3 + r); R(['#a8443a', '#3a6a8c', '#c9a24a', '#4f7a4a', '#7a4f8c', '#d8d0c0'][h % 6], b, r * 5 + 1 + (h % 2), 2, 3 - (h % 2)); } } break;
      case 'P': floor(); R('#9c5434', 5, 10, 6, 5); R('#7c3f24', 5, 14, 6, 1); R('#3f7a3a', 3, 2, 10, 9); R('#58a04e', 5, 3, 3, 3); R('#2f5f2c', 9, 6, 3, 3); break;
      case '=': floor(); R('#9aa3ad', 0, 2, 16, 9); R('#b9c1ca', 0, 2, 16, 2); R('#6c757f', 0, 11, 16, 4); break;
      case 'h': floor(); R('#222a30', 0, 3, 16, 9); R('#36424a', 0, 3, 16, 2); R('#4a5a63', 0, 12, 16, 3); { const h = hsh(tx, ty); R(['#6fd18a', '#d16f9a', '#6fa8d1'][h % 3], 3 + (h % 6), 0, 3, 5); R('#cfe8ef', 10, 1, 2, 4); } break;
      case 'q': floor(); R('#a9b4bd', 1, 3, 14, 10); R('#5f6c76', 3, 5, 10, 6); R('#cfd8de', 7, 1, 2, 4); break;
      case 'o': floor(); R('#7a5530', 3, 4, 1, 12); R('#7a5530', 12, 4, 1, 12); R('#f2ead8', 2, 1, 12, 9); R(['#c9604a', '#4a7ac9', '#8a8a8a'][hsh(tx, ty) % 3], 4, 3, 8, 5); break;
      case 'v': floor(); R('#a3343a', 1, 0, 14, 16); R('#2a2230', 3, 2, 7, 9); R('#e6c84a', 4, 3, 2, 2); R('#6fa84a', 7, 3, 2, 2); R('#e6c84a', 4, 7, 5, 2); R('#d8d0c0', 11, 3, 2, 6); break;
      case 'x': floor(); R('#5d4a3a', 1, 2, 14, 13); R('#73604e', 1, 2, 14, 2); R('#4a3a2c', 7, 4, 2, 11); break;
      case 'b': floor(); R('#7a5530', 1, 5, 14, 3); R('#8f6a40', 1, 9, 14, 2); R('#4f3820', 2, 11, 1, 4); R('#4f3820', 13, 11, 1, 4); break;
      case 'm': R('#3a5f9a', 0, 0, 16, 16); R('#2f4f82', 0, 7, 16, 1); break;
      case 'w': {
        R('#0e2a34', 0, 0, 16, 16);
        const s = Math.sin(t * 1.5 + tx * 0.7 + ty) * 0.5 + 0.5;
        R('rgba(120,220,230,' + (0.15 + s * 0.2).toFixed(2) + ')', 2 + ((tx * 3) % 8), 4 + ((ty * 5) % 7), 5, 1);
        R('rgba(160,240,255,0.12)', 0, 0, 16, 16);
        break;
      }
      case '~': floor(); { const s = Math.sin(t * 3 + tx * 1.3 + ty * 0.7); if (s > 0.3) R('rgba(140,230,240,' + (s * 0.35).toFixed(2) + ')', (tx * 5) % 12, (ty * 7) % 12, 3, 3); } break;
      default: floor();
    }
  };

  // ---------- characters ----------
  // look = {skin, hair, hs (hairstyle), top, bot, acc, accC}
  Art.char = function (c, L, x, y, dir, frame, opt) {
    opt = opt || {};
    x = Math.round(x); y = Math.round(y);
    const R = (col, a, b, w, h) => { c.fillStyle = col; c.fillRect(x + a, y + b, w, h); };
    if (opt.alpha != null) c.globalAlpha = opt.alpha;
    if (!opt.noShadow) { c.fillStyle = 'rgba(0,0,0,0.28)'; c.fillRect(x - 5, y - 1, 10, 2); c.fillRect(x - 4, y - 2, 8, 1); }
    const bob = frame === 1 ? -1 : 0;
    const legA = frame === 1 ? 1 : 0, legB = frame === 1 ? -1 : 0;
    // legs
    R(L.bot, -3, -5 + Math.max(0, legB), 2, 5 - Math.max(0, legB));
    R(L.bot, 1, -5 + Math.max(0, legA), 2, 5 - Math.max(0, legA));
    R('#1b1620', -3, -1, 2, 1); R('#1b1620', 1, -1, 2, 1);
    // body
    R(L.top, -4, -12 + bob, 8, 7);
    R(shade(L.top), -4, -6 + bob, 8, 1);
    // arms
    if (dir === 2 || dir === 3) R(L.skin, dir === 2 ? -1 : 0, -9 + bob, 2, 3);
    else { R(L.top, -5, -11 + bob, 1, 5); R(L.top, 4, -11 + bob, 1, 5); R(L.skin, -5, -6 + bob, 1, 1); R(L.skin, 4, -6 + bob, 1, 1); }
    // accessories on body
    if (L.acc === 'tie') R(L.accC || '#a02c2c', -1, -12 + bob, 2, 5);
    if (L.acc === 'apron') R(L.accC || '#d8d0c0', -3, -10 + bob, 6, 5);
    if (L.acc === 'coat') { R('#e9edf0', -4, -12 + bob, 2, 7); R('#e9edf0', 2, -12 + bob, 2, 7); }
    if (L.acc === 'whistle') R('#d8d0c0', 0, -10 + bob, 1, 2);
    // head
    R(L.skin, -4, -19 + bob, 8, 7);
    // hair
    const H = L.hair, hs = L.hs || 'short';
    R(H, -4, -20 + bob, 8, 2);
    if (dir === 1) R(H, -4, -19 + bob, 8, 5);
    else if (dir === 2) R(H, -1, -19 + bob, 5, 3);
    else if (dir === 3) R(H, -4, -19 + bob, 5, 3);
    else R(H, -4, -19 + bob, 8, 1);
    if (hs === 'long') { R(H, -5, -19 + bob, 1, 9); R(H, 4, -19 + bob, 1, 9); if (dir === 1) R(H, -4, -14 + bob, 8, 4); }
    if (hs === 'bun') { R(H, -2, -23 + bob, 4, 3); }
    if (hs === 'spiky') { R(H, -4, -22 + bob, 2, 2); R(H, 0, -22 + bob, 2, 2); R(H, 3, -21 + bob, 1, 1); }
    if (hs === 'bald') { R(L.skin, -3, -20 + bob, 6, 1); R(H, -4, -17 + bob, 1, 3); R(H, 3, -17 + bob, 1, 3); }
    if (hs === 'cap') { R(L.accC || '#c45a2a', -5, -21 + bob, 10, 3); if (dir === 0) R(shade(L.accC || '#c45a2a'), -4, -18 + bob, 8, 1); }
    if (L.acc === 'ribbon') R(L.accC, 2, -22 + bob, 3, 2);
    // face
    if (dir === 0) { R('#1b1620', -2, -15 + bob, 1, 2); R('#1b1620', 1, -15 + bob, 1, 2); }
    if (dir === 2) R('#1b1620', -3, -15 + bob, 1, 2);
    if (dir === 3) R('#1b1620', 2, -15 + bob, 1, 2);
    if (L.acc2 === 'glasses' && dir !== 1) { c.fillStyle = 'rgba(230,240,255,0.55)'; if (dir === 0) { c.fillRect(x - 3, y - 15 + bob, 2, 2); c.fillRect(x + 1, y - 15 + bob, 2, 2); } else c.fillRect(x + (dir === 2 ? -4 : 1), y - 15 + bob, 3, 2); }
    if (opt.glow) { c.globalAlpha = 0.25; R('#bff4ff', -5, -21 + bob, 10, 21); }
    c.globalAlpha = 1;
  };

  function shade(hex) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.max(0, (n >> 16) - 30), g = Math.max(0, ((n >> 8) & 255) - 30), b = Math.max(0, (n & 255) - 30);
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }
  Art.shade = shade;

  const pcache = {};
  Art.portrait = function (key, look, kind) {
    if (pcache[key]) return pcache[key];
    const cv = document.createElement('canvas'); cv.width = 16; cv.height = 16;
    const c = cv.getContext('2d');
    if (kind === 'orb') {
      for (let r = 7; r > 0; r--) { c.fillStyle = 'rgba(120,230,240,' + (0.12 + (7 - r) * 0.1) + ')'; c.beginPath(); c.arc(8, 8, r, 0, 7); c.fill(); }
      c.fillStyle = '#e8fdff'; c.fillRect(7, 7, 2, 2);
    } else if (look) {
      Art.char(c, look, 8, 26, 0, 0, { noShadow: true });
    }
    pcache[key] = cv; return cv;
  };

  // Player look — tweakable later through a character creator
  Art.PLAYER = { skin: '#e0b48e', hair: '#3b2a24', hs: 'short', top: '#3c4a7a', bot: '#2a2a36', acc: 'tie', accC: '#8a2c3a' };

  IS.Art = Art;
})(window.IS);
