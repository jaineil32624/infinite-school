// Infinite School — core namespace, constants and small utilities.
// Every module attaches itself to the global IS object so the game runs
// from file:// with plain <script> tags (no bundler required).
window.IS = window.IS || {};
(function (IS) {
  IS.VERSION = '0.1.0-ch1';
  IS.W = 320; IS.H = 180; IS.T = 16;
  IS.DAY_START = 465;   // 7:45 AM
  IS.DAY_END = 1440;    // midnight

  IS.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  IS.lerp = (a, b, t) => a + (b - a) * t;

  IS.hash = function (str) {
    let h = 2166136261;
    str = String(str);
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  };
  // xorshift PRNG — deterministic per seed so loops vary but are reproducible
  IS.rng = function (seed) {
    let s = (seed >>> 0) || 1;
    return function () { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  };
  IS.loopRand = (key) => IS.rng(IS.hash(key) + (IS.S ? IS.S.loop : 1) * 7919)();

  IS.fmtTime = function (m) {
    m = Math.floor(m);
    const h = Math.floor(m / 60) % 24, mm = m % 60;
    let hh = h % 12; if (hh === 0) hh = 12;
    return hh + ':' + String(mm).padStart(2, '0') + (h >= 12 ? ' PM' : ' AM');
  };

  IS.store = {
    get(k, d) { try { const v = localStorage.getItem('infschool.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('infschool.' + k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem('infschool.' + k); } catch (e) {} }
  };

  // Content registry. data/*.js files fill these in.
  IS.data = {
    rooms: {}, npcs: {}, speakers: {}, dialogue: {}, scenes: {}, clues: {}, deductions: [],
    items: {}, achievements: [], endings: {}, music: {}, phases: {}, objectives: [],
    loopRules: [], books: [], periods: [], bells: []
  };

  // Scene stack
  IS.stack = [];
  IS.push = (s) => { IS.stack.push(s); s.enter && s.enter(); };
  IS.pop = () => { const s = IS.stack.pop(); s && s.exit && s.exit(); return s; };
  IS.top = () => IS.stack[IS.stack.length - 1];
  IS.replaceAll = (s) => { while (IS.stack.length) IS.pop(); IS.push(s); };
})(window.IS);
