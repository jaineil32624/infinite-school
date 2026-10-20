// Unified input: keyboard, gamepad (standard mapping) and touch buttons.
// Game code only ever asks about abstract actions: up/down/left/right/ok/back/menu/note/run.
(function (IS) {
  const KEYS = {
    ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right', KeyZ: 'ok', Enter: 'ok', Space: 'ok', KeyE: 'ok',
    KeyX: 'back', Backspace: 'back', Escape: 'menu', KeyP: 'menu', KeyN: 'note', KeyC: 'note', Tab: 'note',
    ShiftLeft: 'run', ShiftRight: 'run'
  };
  const PAD = { 0: 'ok', 1: 'back', 2: 'run', 3: 'note', 9: 'menu', 8: 'note', 12: 'up', 13: 'down', 14: 'left', 15: 'right' };
  const ACTIONS = ['up', 'down', 'left', 'right', 'ok', 'back', 'menu', 'note', 'run'];

  const I = { held: {}, pressed: {}, typed: [], mode: 'keys', repT: {} };
  const kb = {}, pad = {}, touch = {}, latch = {};
  I.textMode = false;
  let prev = {};

  addEventListener('keydown', (e) => {
    let a = KEYS[e.code];
    if (e.key && e.key.length === 1) I.typed.push(e.key);
    if (e.code === 'Backspace') I.typed.push('\b');
    // while typing a name, letters are letters, not actions
    if (I.textMode && (e.code === 'Backspace' || (e.key && e.key.length === 1 && e.code !== 'Space'))) a = null;
    if (a) { if (!e.repeat) latch[a] = true; kb[a] = true; e.preventDefault(); }
    I.mode = 'keys';
    IS.A && IS.A.unlock();
  });
  addEventListener('keyup', (e) => { const a = KEYS[e.code]; if (a) kb[a] = false; });
  addEventListener('blur', () => { for (const k in kb) kb[k] = false; });
  addEventListener('pointerdown', () => { IS.A && IS.A.unlock(); }, { passive: true });

  I.bindTouch = function (root) {
    root.querySelectorAll('[data-act]').forEach((el) => {
      const a = el.dataset.act;
      const on = (e) => { e.preventDefault(); touch[a] = true; el.classList.add('on'); I.mode = 'touch'; IS.A && IS.A.unlock(); };
      const off = (e) => { e.preventDefault(); touch[a] = false; el.classList.remove('on'); };
      el.addEventListener('pointerdown', on); el.addEventListener('pointerup', off);
      el.addEventListener('pointercancel', off); el.addEventListener('pointerleave', off);
    });
  };

  function pollPad() {
    for (const k in pad) pad[k] = false;
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const g of pads) {
      if (!g) continue;
      g.buttons.forEach((b, i) => { if (b.pressed && PAD[i]) { pad[PAD[i]] = true; I.mode = 'pad'; } });
      const ax = g.axes[0] || 0, ay = g.axes[1] || 0;
      if (ax < -0.5) pad.left = true; if (ax > 0.5) pad.right = true;
      if (ay < -0.5) pad.up = true; if (ay > 0.5) pad.down = true;
      if (g.buttons[7] && g.buttons[7].value > 0.5) pad.run = true; // RT also runs
    }
  }

  I.update = function (dt) {
    pollPad();
    for (const a of ACTIONS) {
      const h = !!(kb[a] || pad[a] || touch[a]);
      if (latch[a] && !prev[a]) { I.pressed[a] = true; I.held[a] = true; prev[a] = true; latch[a] = false; I.repT[a] = h ? (I.repT[a] || 0) + dt : 0; continue; }
      latch[a] = false;
      I.pressed[a] = h && !prev[a];
      I.held[a] = h;
      prev[a] = h;
      // menu-style auto repeat
      if (h) I.repT[a] = (I.repT[a] || 0) + dt; else I.repT[a] = 0;
    }
  };
  // true on first press, then repeatedly while held (for menus)
  I.rep = function (a) {
    if (I.pressed[a]) return true;
    const t = I.repT[a] || 0;
    if (t > 0.38) { I.repT[a] -= 0.09; return true; }
    return false;
  };
  I.back = () => I.pressed.back || I.pressed.menu;
  I.clear = () => { for (const a of ACTIONS) { I.pressed[a] = false; } I.typed.length = 0; };

  IS.I = I;
})(window.IS);
