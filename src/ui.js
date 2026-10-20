// UI layer: drawing helpers, toasts, and every scene (title, world, dialogue,
// notebook/evidence board, menus, settings, endings). UI draws in a 320x180
// virtual space on the full-resolution canvas so text stays crisp.
(function (IS) {
  const UI = { toasts: [] };
  const I = () => IS.I;

  UI.col = function () {
    const hc = IS.settings.contrast;
    return {
      ink: hc ? '#ffffff' : '#f1e9d2', dim: hc ? '#d0d0d0' : '#a49ab4', bg: hc ? 'rgba(0,0,0,0.97)' : 'rgba(17,13,27,0.93)',
      edge: hc ? '#ffffff' : '#d9cfb6', acc: hc ? '#ffd84a' : '#e8b84a', red: '#e0675d', teal: '#7fd3dc', sel: hc ? 'rgba(255,216,74,0.25)' : 'rgba(232,184,74,0.16)'
    };
  };
  UI.fs = (n) => n + (IS.settings.big ? 2 : 0);
  UI.font = function (c, px) {
    if (IS.settings.plain) c.font = Math.round(UI.fs(px) * 0.78 * 10) / 10 + 'px system-ui, -apple-system, Segoe UI, sans-serif';
    else if (IS.fontFallback) c.font = Math.round(UI.fs(px) * 0.8 * 10) / 10 + 'px Menlo, Consolas, "DejaVu Sans Mono", monospace'; // VT323 unavailable offline
    else c.font = UI.fs(px) + 'px VT323, monospace';
  };
  UI.text = function (c, s, x, y, col, px, align) {
    UI.font(c, px || 11); c.fillStyle = col || UI.col().ink; c.textAlign = align || 'left'; c.textBaseline = 'top';
    c.fillText(s, x, y);
  };
  UI.wrap = function (c, s, maxW, px) {
    UI.font(c, px || 11);
    const out = [];
    for (const para of String(s).split('\n')) {
      let line = '';
      for (const w of para.split(' ')) {
        const tryL = line ? line + ' ' + w : w;
        if (c.measureText(tryL).width > maxW && line) { out.push(line); line = w; } else line = tryL;
      }
      out.push(line);
    }
    return out;
  };
  UI.panel = function (c, x, y, w, h, opts) {
    const k = UI.col();
    c.fillStyle = k.bg; c.fillRect(x, y, w, h);
    c.strokeStyle = (opts && opts.edge) || k.edge; c.lineWidth = 1; c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    c.strokeStyle = 'rgba(255,255,255,0.08)'; c.strokeRect(x + 2.5, y + 2.5, w - 5, h - 5);
  };
  // generic vertical list; returns nothing, just draws
  UI.list = function (c, items, sel, x, y, w, rowH, opts) {
    const k = UI.col(); opts = opts || {};
    const inkC = opts.ink || k.ink, dimC = opts.dim || k.dim, accC = opts.acc || k.acc;
    const max = opts.max || 99, start = Math.max(0, Math.min(sel - Math.floor(max / 2), items.length - max));
    for (let i = start; i < Math.min(items.length, start + max); i++) {
      const yy = y + (i - start) * rowH, it = items[i];
      const label = typeof it === 'string' ? it : it.label;
      const dis = it && it.disabled;
      if (i === sel) { c.fillStyle = opts.selBg || k.sel; c.fillRect(x - 2, yy - 1, w, rowH); UI.text(c, '▸', x, yy, accC, opts.px); }
      UI.text(c, label, x + 9, yy, dis ? dimC : (i === sel ? accC : inkC), opts.px);
      if (it && it.right) UI.text(c, it.right, x + w - 6, yy, i === sel ? accC : dimC, opts.px, 'right');
    }
    if (start > 0) UI.text(c, '▲', x + w - 8, y - 9, dimC, 9);
    if (start + max < items.length) UI.text(c, '▼', x + w - 8, y + max * rowH - 2, dimC, 9);
  };
  UI.navList = function (sel, n) {
    if (n <= 0) return 0;
    if (I().rep('up')) { sel = (sel - 1 + n) % n; IS.A.sfx('select'); }
    if (I().rep('down')) { sel = (sel + 1) % n; IS.A.sfx('select'); }
    return sel;
  };

  UI.toast = function (text, kind) { UI.toasts.push({ text, kind: kind || 'info', t: 0 }); if (UI.toasts.length > 5) UI.toasts.shift(); };
  UI.drawToasts = function (c, dt) {
    const k = UI.col();
    let y = 26;
    for (const t of UI.toasts) {
      t.t += dt;
      const a = t.t < 0.25 ? t.t / 0.25 : t.t > 3.2 ? Math.max(0, 1 - (t.t - 3.2) / 0.5) : 1;
      c.globalAlpha = a;
      UI.font(c, 10);
      const w = Math.min(190, c.measureText(t.text).width + 14);
      const x = IS.W - w - 6 + (1 - a) * 20;
      const col = t.kind === 'clue' ? k.teal : t.kind === 'ach' ? k.acc : t.kind === 'bond' ? k.red : k.ink;
      UI.panel(c, x, y, w, 14, { edge: col });
      UI.text(c, t.text, x + 7, y + 2, col, 10);
      c.globalAlpha = 1; y += 17;
    }
    UI.toasts = UI.toasts.filter((t) => t.t < 3.7);
  };

  // =============== dialogue ===============
  const D = {};
  D.ok = (c) => IS.G.ok(c);
  // resolve a scene id: dynamic scenes pick from a conditional list each time
  D.scene = function (id) {
    const dl = IS.data.dynamicScenes && IS.data.dynamicScenes[id];
    if (dl) return D.pick(IS.data[dl]);
    const e = IS.data.scenes[id]; if (e && !e.id) e.id = id;
    return e || null;
  };
  D.pick = function (list) {
    if (!list) return null;
    if (typeof list === 'string') return D.scene(list);
    if (!Array.isArray(list)) return list;
    for (const e of list) {
      if (!IS.G.ok(e.if)) continue;
      if (e.once && e.id && IS.G.has('L.seen.' + e.id)) continue;
      if (e.onceEver && e.id && IS.G.has('seen.' + e.id)) continue;
      return e;
    }
    return null;
  };
  D.run = function (entry, npc) {
    if (typeof entry === 'string') entry = D.scene(entry);
    if (!entry) return false;
    IS.push(new DialogueScene(entry, npc)); return true;
  };
  D.sub = function (s) {
    const S = IS.S;
    return s.replace(/\{name\}/g, S.name).replace(/\{loop\}/g, S.loop).replace(/\{time\}/g, IS.fmtTime(S.time));
  };
  function parseLine(l) {
    const m = /^@(\w+)\s+([\s\S]*)$/.exec(l);
    return m ? { sp: m[1], text: D.sub(m[2]) } : { sp: null, text: D.sub(l) };
  }
  IS.D = D;

  class DialogueScene {
    constructor(entry, npc) { this.npc = npc; this.goto = null; this.start(entry); }
    start(e) {
      this.entry = e;
      if (e.id) { IS.G.set('L.seen.' + e.id); if (e.onceEver) IS.G.set('seen.' + e.id); IS.G.set('seen.' + e.id); }
      if (this.npc) IS.G.set('met.' + this.npc.id);
      let lines = e.lines;
      if (e.pool) lines = e.pool[Math.floor(IS.loopRand((e.id || 'pool') + 'p') * e.pool.length)];
      this.queue = (lines || []).map(parseLine);
      this.doFx = e.do; this.choiceList = e.choices; this.goto = e.goto || null;
      this.choices = null; this.line = null;
      this.next();
    }
    next() {
      if (this.queue.length) { this.line = this.queue.shift(); this.shown = 0; this.blipT = 0; return; }
      if (this.doFx) { const f = this.doFx; this.doFx = null; IS.G.apply(f); }
      if (this.choiceList) {
        const cs = this.choiceList.filter((ch) => IS.G.ok(ch.if)); this.choiceList = null;
        if (cs.length) { this.choices = cs; this.sel = 0; if (this.line) this.shown = 1e9; return; }
      }
      if (this.goto) { const g = this.goto; this.goto = null; const e = D.scene(g); if (e) return this.start(e); }
      IS.pop();
    }
    choose(ch) {
      IS.A.sfx('confirm'); this.choices = null;
      this.queue = (ch.lines || []).map(parseLine);
      this.doFx = ch.do; this.choiceList = ch.choices || null; this.goto = ch.goto || null;
      this.line = null; this.next();
    }
    update(dt) {
      const In = I();
      if (this.choices) {
        this.sel = UI.navList(this.sel, this.choices.length);
        if (In.pressed.ok) this.choose(this.choices[this.sel]);
        return;
      }
      if (!this.line) return;
      const speeds = [28, 50, 95, 1e6];
      const len = this.line.text.length;
      const prev = Math.floor(this.shown);
      this.shown = Math.min(len, this.shown + speeds[IS.settings.textSpeed] * dt);
      if (Math.floor(this.shown) > prev && Math.floor(this.shown) % 2 === 0 && this.line.text[Math.floor(this.shown) - 1] !== ' ') {
        const n = this.line.sp && (IS.data.npcs[this.line.sp] || IS.data.speakers[this.line.sp]);
        IS.A.sfx('blip', n ? n.voice : (this.line.sp === 'you' ? 700 : 420));
      }
      if (In.pressed.ok || In.pressed.back) {
        if (this.shown < len) this.shown = len; else { IS.A.sfx('select'); this.next(); }
      }
    }
    drawUI(c) {
      const k = UI.col();
      const ln = this.line;
      const bx = 8, by = 124, bw = 304, bh = 50;
      if (ln) {
        UI.panel(c, bx, by, bw, bh);
        let tx = bx + 10;
        const sp = ln.sp, npc = sp && IS.data.npcs[sp], spk = sp && IS.data.speakers[sp];
        if (npc || spk || sp === 'you') {
          const look = npc ? npc.look : sp === 'you' ? IS.Art.PLAYER : null;
          const img = IS.Art.portrait(sp, look, spk && spk.portrait);
          c.fillStyle = 'rgba(255,255,255,0.05)'; c.fillRect(bx + 6, by + 6, 38, 38);
          c.imageSmoothingEnabled = false;
          if (npc && npc.ghost) c.globalAlpha = 0.7;
          c.drawImage(img, bx + 7, by + 7, 36, 36); c.globalAlpha = 1;
          tx = bx + 52;
          const name = npc ? npc.name : spk ? spk.name : IS.S.name;
          UI.font(c, 10); const nw = c.measureText(name).width + 12;
          UI.panel(c, bx + 4, by - 12, nw, 13, { edge: k.acc });
          UI.text(c, name, bx + 10, by - 11, k.acc, 10);
        }
        const lines = UI.wrap(c, ln.text, bw - (tx - bx) - 10, 11);
        let left = Math.floor(this.shown);
        lines.slice(0, 4).forEach((l, i) => {
          const part = l.slice(0, Math.max(0, left)); left -= l.length + 1;
          UI.text(c, part, tx, by + 6 + i * 10.5, sp ? k.ink : '#d8d0e8', 11);
        });
        if (!this.choices && this.shown >= ln.text.length && Math.floor(performance.now() / 400) % 2) UI.text(c, '▼', bx + bw - 12, by + bh - 11, k.acc, 9);
      }
      if (this.choices) {
        UI.font(c, 11);
        const w = Math.min(240, Math.max(...this.choices.map((ch) => c.measureText(ch.t).width)) + 26);
        const h = this.choices.length * 12 + 8;
        const x = IS.W - w - 10, y = (ln ? by : 170) - h - 4;
        UI.panel(c, x, y, w, h, { edge: k.acc });
        UI.list(c, this.choices.map((ch) => ch.t), this.sel, x + 6, y + 4, w - 8, 12);
      }
    }
  }
  UI.DialogueScene = DialogueScene;

  // =============== world ===============
  class WorldScene {
    update(dt) {
      if (IS.top() !== this) return;
      const S = IS.S;
      if (IS.pendingEnding) { const e = IS.pendingEnding; IS.pendingEnding = null; IS.push(new EndingScene(e)); return; }
      if (IS.pendingMidnight) { IS.pendingMidnight = false; IS.push(new MidnightScene()); return; }
      if (IS.pendingCard) { const cd = IS.pendingCard; IS.pendingCard = null; IS.push(new CardScene(cd)); return; }
      if (IS.pendingWarp) { const w = IS.pendingWarp; IS.pendingWarp = null; IS.A.sfx('door'); IS.Wd.enter(w[0], w[1], w[2], w[3]); return; }
      if (IS.pendingScene) { const s = IS.pendingScene; IS.pendingScene = null; IS.D.run(s); return; }
      if (I().pressed.menu) { IS.A.sfx('confirm'); IS.push(new PauseScene()); return; }
      if (I().pressed.note) { IS.A.sfx('confirm'); IS.push(new NotebookScene()); return; }
      IS.Wd.update(dt);
      S.x = Math.floor(IS.Wd.p.x / 16); S.y = Math.floor((IS.Wd.p.y - 1) / 16); S.dir = IS.Wd.p.dir;
    }
    drawLo(c) { IS.Wd.draw(c); }
    drawUI(c) {
      const k = UI.col(), S = IS.S;
      if (!(IS.top() instanceof DialogueScene) || true) {
        UI.panel(c, 4, 4, 92, 25);
        UI.text(c, IS.fmtTime(S.time), 10, 5, S.time >= 1380 ? k.red : k.ink, 12);
        UI.text(c, 'THU', 90, 7, k.dim, 9, 'right');
        UI.text(c, 'Loop ' + S.loop + ' · ' + IS.G.period(S.time), 10, 17, k.acc, 9);
      }
      if (IS.Wd.titleT > 0 && IS.Wd.title) {
        c.globalAlpha = Math.min(1, IS.Wd.titleT);
        UI.text(c, IS.Wd.title, IS.W / 2, 12, k.ink, 14, 'center');
        c.fillStyle = k.acc; c.fillRect(IS.W / 2 - 20, 27, 40, 1);
        c.globalAlpha = 1;
      }
    }
  }
  UI.WorldScene = WorldScene;

  UI.startWorld = function (scene) {
    const S = IS.S;
    IS.replaceAll(new WorldScene());
    IS.Wd.enter(S.room, S.x, S.y, S.dir);
    if (scene) IS.pendingScene = scene;
  };

  // =============== cards / midnight / endings ===============
  class CardScene {
    constructor(cd) { this.cd = cd; this.t = 0; if (cd.sfx) IS.A.sfx(cd.sfx); }
    update(dt) { this.t += dt; if (this.t > 0.6 && (I().pressed.ok || this.t > (this.cd.dur || 2.8))) IS.pop(); }
    drawUI(c) {
      const k = UI.col(), a = Math.min(1, this.t * 2, Math.max(0, ((this.cd.dur || 2.8) - this.t) * 2));
      c.globalAlpha = a * 0.85; c.fillStyle = '#05040a'; c.fillRect(0, 0, IS.W, IS.H); c.globalAlpha = a;
      UI.text(c, this.cd.big, IS.W / 2, 70, k.ink, 24, 'center');
      c.fillStyle = k.acc; c.fillRect(IS.W / 2 - 30, 96, 60, 1);
      UI.text(c, this.cd.small || '', IS.W / 2, 102, k.acc, 12, 'center');
      c.globalAlpha = 1;
    }
  }
  UI.CardScene = CardScene;

  class MidnightScene {
    constructor() { this.t = 0; this.done = false; IS.A.stop(); IS.A.sfx('bell'); }
    update(dt) {
      this.t += dt;
      if (this.t > 1.6 && !this.loopSfx) { this.loopSfx = true; IS.A.sfx('loop'); }
      if (this.t > 3.6 && !this.done) {
        this.done = true;
        IS.G.resetLoop();
        IS.pop();
        if (IS.pendingEnding) return;
        const S = IS.S;
        IS.Wd.enter(S.room, S.x, S.y, S.dir, { silent: true });
        IS.pendingCard = { big: 'LOOP ' + S.loop, small: 'Thursday, October 13', dur: 2.6 };
        IS.pendingScene = 'loop_start';
      }
    }
    drawUI(c) {
      const k = UI.col();
      const a = Math.min(1, this.t / 1.2);
      c.fillStyle = 'rgba(4,3,8,' + a + ')'; c.fillRect(0, 0, IS.W, IS.H);
      UI.text(c, '12:00 AM', IS.W / 2, 72, k.red, 22, 'center');
      if (this.t > 1.4) UI.text(c, IS.S.phase >= 2 ? 'Not again.' : 'The bell rings once. Everything stops.', IS.W / 2, 100, k.dim, 11, 'center');
    }
  }

  class EndingScene {
    constructor(id) {
      this.e = IS.data.endings[id]; this.id = id; this.i = 0; this.t = 0;
      IS.A.play(this.e.music || 'title');
      IS.meta.endings[id] = IS.meta.endings[id] || Date.now(); IS.G.saveMeta();
      IS.G.ach('end_' + id);
    }
    update(dt) {
      this.t += dt;
      if (this.t > 0.5 && I().pressed.ok) { this.t = 0; this.i++; IS.A.sfx('select'); }
      if (this.i > this.e.lines.length) { IS.replaceAll(new TitleScene()); }
    }
    drawUI(c) {
      const k = UI.col();
      c.fillStyle = '#05040a'; c.fillRect(0, 0, IS.W, IS.H);
      if (this.i < this.e.lines.length) {
        c.globalAlpha = Math.min(1, this.t * 1.5);
        const ls = UI.wrap(c, this.e.lines[this.i], 250, 12);
        ls.forEach((l, j) => UI.text(c, l, IS.W / 2, 80 - ls.length * 6 + j * 13, k.ink, 12, 'center'));
        c.globalAlpha = 1;
        UI.text(c, '▼', IS.W / 2, 160, k.dim, 9, 'center');
      } else {
        c.globalAlpha = Math.min(1, this.t);
        UI.text(c, 'ENDING', IS.W / 2, 56, k.dim, 11, 'center');
        UI.text(c, this.e.title, IS.W / 2, 70, k.acc, 24, 'center');
        const found = Object.keys(IS.meta.endings).length, total = Object.keys(IS.data.endings).length;
        UI.text(c, 'Endings found: ' + found + ' / ' + total, IS.W / 2, 104, k.ink, 11, 'center');
        UI.text(c, 'Press OK to return to the title', IS.W / 2, 150, k.dim, 10, 'center');
        c.globalAlpha = 1;
      }
    }
  }
  UI.EndingScene = EndingScene;

  // =============== title & new game ===============
  class TitleScene {
    constructor() { this.sel = 0; this.t = 0; this.motes = []; IS.A.play('title'); this.build(); }
    build() {
      const latest = latestSave();
      this.items = [];
      if (latest) this.items.push({ label: 'Continue', act: () => { IS.G.load(latest); UI.startWorld(); } });
      this.items.push({ label: 'New Game', act: () => IS.push(new NameScene()) });
      this.items.push({ label: 'Load Game', act: () => IS.push(new SlotScene('load')) });
      this.items.push({ label: 'Settings', act: () => IS.push(new SettingsScene()) });
      this.items.push({ label: 'Extras', act: () => IS.push(new ExtrasScene()) });
    }
    enter() { this.build(); }
    update(dt) {
      this.t += dt;
      if (IS.top() !== this) return;
      this.sel = UI.navList(this.sel, this.items.length);
      if (I().pressed.ok) { IS.A.sfx('confirm'); this.items[this.sel].act(); }
    }
    drawLo(c) {
      const t = this.t;
      const g = c.createLinearGradient(0, 0, 0, IS.H); g.addColorStop(0, '#0c0a16'); g.addColorStop(1, '#1d1430');
      c.fillStyle = g; c.fillRect(0, 0, IS.W, IS.H);
      // endless corridor of lockers receding
      for (let i = 0; i < 9; i++) {
        const z = ((i + t * 0.25) % 9) / 9, s = 1 - z;
        const w = 300 * s * s + 10, h = 150 * s * s + 6, x = IS.W / 2 - w / 2, y = 96 - h / 2;
        c.strokeStyle = 'rgba(160,140,200,' + (0.05 + s * 0.22).toFixed(3) + ')'; c.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(w), Math.round(h));
      }
      // clock
      const cx = IS.W / 2, cy = 96;
      c.fillStyle = '#e8dcc0'; c.beginPath(); c.arc(cx, cy, 15, 0, 7); c.fill();
      c.fillStyle = '#1a1424'; c.beginPath(); c.arc(cx, cy, 13, 0, 7); c.fill();
      c.fillStyle = '#e8dcc0';
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.fillRect(Math.round(cx + Math.cos(a) * 11), Math.round(cy + Math.sin(a) * 11), 1, 1); }
      const sec = (t * 0.9) % 1, jitter = sec > 0.92 ? Math.sin(t * 60) * 0.03 : 0;
      const hand = (a, l, col) => { c.strokeStyle = col; c.lineWidth = 1; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a - Math.PI / 2) * l, cy + Math.sin(a - Math.PI / 2) * l); c.stroke(); };
      hand((11 + 59 / 60) / 12 * Math.PI * 2, 7, '#e8dcc0');
      hand(59 / 60 * Math.PI * 2 + jitter, 10, '#e8dcc0');
      hand((0.98 + sec * 0.019) * Math.PI * 2, 11, '#e0675d');
      if (Math.random() < 0.04) IS.Wd.postGlitch(c.canvas, c, 0.6);
    }
    drawUI(c) {
      const k = UI.col();
      UI.text(c, 'INFINITE', IS.W / 2, 14, k.ink, 30, 'center');
      UI.text(c, 'S C H O O L', IS.W / 2, 40, k.acc, 15, 'center');
      UI.text(c, 'Thursday never ends.', IS.W / 2, 57, k.dim, 10, 'center');
      const w = 110, x = IS.W / 2 - w / 2, y = 118;
      UI.list(c, this.items, this.sel, x + 8, y, w, 11);
      UI.text(c, 'v' + IS.VERSION, 6, IS.H - 12, k.dim, 9);
      const hint = I().mode === 'pad' ? 'A select · B back' : I().mode === 'touch' ? 'Tap A to select' : 'Arrows move · Enter selects';
      UI.text(c, hint, IS.W - 6, IS.H - 12, k.dim, 9, 'right');
    }
  }
  UI.TitleScene = TitleScene;

  function latestSave() {
    let best = null, bt = 0;
    for (const s of ['auto', 1, 2, 3]) { const d = IS.G.slot(s); if (d && (d.savedAt || 0) > bt) { bt = d.savedAt; best = s; } }
    return best;
  }

  class NameScene {
    constructor() {
      this.name = ''; this.r = 0; this.c = 0;
      this.grid = ['ABCDEFGHIJ', 'KLMNOPQRST', 'UVWXYZ-\'. ', ['DEL', 'RANDOM', 'DONE']];
    }
    enter() { I().textMode = true; I().typed.length = 0; }
    exit() { I().textMode = false; }
    update(dt) {
      const In = I();
      for (const ch of In.typed) {
        if (ch === '\b') this.name = this.name.slice(0, -1);
        else if (/^[A-Za-z\-'. ]$/.test(ch) && this.name.length < 10) this.name += this.name.length ? ch.toLowerCase() : ch.toUpperCase();
      }
      In.typed.length = 0;
      const row = this.grid[this.r], len = row.length;
      if (In.rep('left')) { this.c = (this.c - 1 + len) % len; IS.A.sfx('select'); }
      if (In.rep('right')) { this.c = (this.c + 1) % len; IS.A.sfx('select'); }
      if (In.rep('up')) { this.r = (this.r + 3) % 4; this.c = Math.min(this.c, this.grid[this.r].length - 1); IS.A.sfx('select'); }
      if (In.rep('down')) { this.r = (this.r + 1) % 4; this.c = Math.min(this.c, this.grid[this.r].length - 1); IS.A.sfx('select'); }
      if (In.pressed.menu) { IS.pop(); return; }
      if (In.pressed.back) { if (this.name) this.name = this.name.slice(0, -1); else IS.pop(); IS.A.sfx('back'); return; }
      if (In.pressed.ok) {
        const v = this.grid[this.r][this.c];
        if (v === 'DEL') this.name = this.name.slice(0, -1);
        else if (v === 'RANDOM') { const pool = ['Ash', 'Rowan', 'Kit', 'Sol', 'Juno', 'Ezra', 'Wren', 'Nico', 'Sage', 'Indy']; this.name = pool[Math.floor(Math.random() * pool.length)]; }
        else if (v === 'DONE') { IS.A.sfx('confirm'); begin(this.name.trim() || 'Ash'); return; }
        else if (this.name.length < 10) this.name += this.name.length ? v.toLowerCase() : v;
        IS.A.sfx('select');
      }
    }
    drawUI(c) {
      const k = UI.col();
      c.fillStyle = '#0c0a16'; c.fillRect(0, 0, IS.W, IS.H);
      UI.text(c, 'Sign the attendance sheet:', IS.W / 2, 22, k.dim, 11, 'center');
      UI.panel(c, IS.W / 2 - 70, 40, 140, 22, { edge: k.acc });
      UI.text(c, (this.name || '') + (Math.floor(performance.now() / 400) % 2 ? '_' : ' '), IS.W / 2, 43, k.ink, 16, 'center');
      for (let r = 0; r < 4; r++) {
        const row = this.grid[r];
        for (let i = 0; i < row.length; i++) {
          const wide = r === 3, cw = wide ? 60 : 20;
          const x = IS.W / 2 - (row.length * cw) / 2 + i * cw + cw / 2, y = 78 + r * 18;
          const on = r === this.r && i === this.c;
          if (on) { c.fillStyle = k.sel; c.fillRect(x - cw / 2 + 2, y - 2, cw - 4, 15); }
          UI.text(c, row[i] === ' ' ? '␣' : row[i], x, y, on ? k.acc : k.ink, 12, 'center');
        }
      }
      UI.text(c, 'Type, or pick letters. Blank = Ash', IS.W / 2, 160, k.dim, 9, 'center');
    }
  }

  function begin(name) {
    IS.G.newGame(name);
    const r = IS.data.rooms.c2b; IS.S.x = r.spawn[0]; IS.S.y = r.spawn[1]; IS.S.dir = 1;
    UI.startWorld('intro');
    IS.pendingCard = null;
    IS.G.save('auto');
  }

  // =============== pause ===============
  class PauseScene {
    constructor() { this.sel = 0; this.sub = null; }
    items() {
      return [
        { label: 'Resume', act: () => IS.pop() },
        { label: 'Notebook', act: () => { IS.pop(); IS.push(new NotebookScene()); } },
        { label: 'Wait…', act: () => { this.sub = waitItems(); this.ssel = 0; } },
        { label: 'Save Game', act: () => IS.push(new SlotScene('save')) },
        { label: 'Load Game', act: () => IS.push(new SlotScene('load')) },
        { label: 'Settings', act: () => IS.push(new SettingsScene()) },
        { label: 'Quit to Title', act: () => { IS.G.save('auto'); IS.replaceAll(new TitleScene()); } }
      ];
    }
    update() {
      const In = I();
      if (this.sub) {
        this.ssel = UI.navList(this.ssel, this.sub.length);
        if (In.back()) { this.sub = null; IS.A.sfx('back'); return; }
        if (In.pressed.ok) { const it = this.sub[this.ssel]; if (!it.disabled) { IS.A.sfx('confirm'); it.act(); } else IS.A.sfx('wrong'); }
        return;
      }
      const its = this.items();
      this.sel = UI.navList(this.sel, its.length);
      if (In.back()) { IS.A.sfx('back'); IS.pop(); return; }
      if (In.pressed.ok) { IS.A.sfx('confirm'); its[this.sel].act(); }
    }
    drawUI(c) {
      const k = UI.col(), S = IS.S;
      c.fillStyle = 'rgba(5,4,10,0.55)'; c.fillRect(0, 0, IS.W, IS.H);
      UI.panel(c, 16, 36, 110, 100);
      UI.text(c, 'PAUSED', 26, 40, k.acc, 12);
      UI.list(c, this.items(), this.sel, 22, 56, 100, 11);
      UI.panel(c, 136, 36, 168, 100);
      const room = IS.data.rooms[S.room];
      const rows = [['Name', S.name], ['Location', room ? room.name : '?'], ['Time', IS.fmtTime(S.time)], ['Loop', String(S.loop)],
        ['Phase', S.phase + ' · ' + (IS.data.phases[S.phase] || '')], ['Clues', S.clues.length + ' / ' + Object.keys(IS.data.clues).length],
        ['Deductions', IS.data.deductions.filter((d) => IS.G.has('d.' + d.id)).length + ' / ' + IS.data.deductions.length],
        ['Play time', Math.floor(S.playMs / 60000) + ' min']];
      rows.forEach((r, i) => { UI.text(c, r[0], 144, 42 + i * 11, k.dim, 10); UI.text(c, r[1], 296, 42 + i * 11, k.ink, 10, 'right'); });
      if (this.sub) {
        UI.panel(c, 60, 60, 200, this.sub.length * 11 + 20, { edge: k.acc });
        UI.text(c, 'Pass the time until…', 68, 63, k.acc, 10);
        UI.list(c, this.sub, this.ssel, 66, 76, 190, 11);
      }
    }
  }
  function waitItems() {
    const S = IS.S, list = [];
    const jump = (t) => () => {
      S.time = Math.max(S.time, t); IS.Wd.placeNPCs(true); IS.Wd.music(); IS.Wd.fade = 1;
      while (IS.top() !== IS.stack[0]) IS.pop();
    };
    const nb = IS.data.bells.find((b) => b[0] > S.time);
    list.push({ label: nb ? 'The next bell (' + IS.fmtTime(nb[0]) + ')' : 'The next bell', act: jump(nb ? nb[0] : S.time), disabled: !nb });
    [[900, 'After school'], [1080, 'Evening'], [1260, 'Night']].forEach(([t, n]) => list.push({ label: n + ' (' + IS.fmtTime(t) + ')', act: jump(t), disabled: S.time >= t }));
    list.push({ label: 'Midnight (end the day)', act: () => { while (IS.top() !== IS.stack[0]) IS.pop(); IS.pendingMidnight = true; } });
    if (S.items.includes('watch')) list.push({ label: 'Wind the Second Hand (restart now)', act: () => { while (IS.top() !== IS.stack[0]) IS.pop(); IS.pendingMidnight = true; } });
    if (IS.Wd.room && IS.Wd.room.timeless) list.forEach((x) => { x.disabled = true; });
    return list;
  }

  // =============== notebook & evidence board ===============
  const TABS = ['Goals', 'Clues', 'Board', 'People', 'Map', 'Items'];
  class NotebookScene {
    constructor(tab) { this.tab = tab || 0; this.sel = 0; this.pick = null; this.msg = null; }
    clueList() { return IS.S.clues.map((id) => Object.assign({ id }, IS.data.clues[id])); }
    people() {
      const S = IS.S;
      return Object.keys(IS.data.npcs).filter((id) => IS.data.npcs[id].profile !== false && (S.flags['met.' + id] || S.insight[id] > 0)).map((id) => Object.assign({ id }, IS.data.npcs[id]));
    }
    update() {
      const In = I();
      if (In.back() || In.pressed.note) {
        if (this.pick != null && this.tab === 2 && !In.pressed.note) { this.pick = null; IS.A.sfx('back'); return; }
        IS.A.sfx('back'); IS.pop(); return;
      }
      if (In.rep('left')) { this.tab = (this.tab + TABS.length - 1) % TABS.length; this.sel = 0; this.pick = null; IS.A.sfx('select'); }
      if (In.rep('right')) { this.tab = (this.tab + 1) % TABS.length; this.sel = 0; this.pick = null; IS.A.sfx('select'); }
      const n = this.tab === 1 || this.tab === 2 ? IS.S.clues.length : this.tab === 3 ? this.people().length : this.tab === 5 ? IS.S.items.length : 0;
      this.sel = UI.navList(this.sel, n);
      if (this.tab === 1 && n) delete IS.S.newClues[IS.S.clues[this.sel]];
      if (this.tab === 2 && In.pressed.ok && n) {
        const id = IS.S.clues[this.sel];
        if (this.pick == null) { this.pick = id; IS.A.sfx('confirm'); }
        else if (this.pick === id) { this.pick = null; IS.A.sfx('back'); }
        else {
          const r = IS.G.deduce(this.pick, id);
          this.pick = null;
          if (r && r.ok) { IS.pop(); IS.D.run({ lines: ['DEDUCTION — ' + r.d.title.toUpperCase(), r.d.text] }); return; }
          else if (r && r.already) { this.msg = 'You already worked that out: ' + r.d.title + '.'; IS.A.sfx('select'); }
          else { this.msg = "These don't connect. Not yet."; IS.A.sfx('wrong'); }
        }
      }
    }
    drawUI(c) {
      const k = UI.col(), S = IS.S;
      c.fillStyle = 'rgba(5,4,10,0.6)'; c.fillRect(0, 0, IS.W, IS.H);
      // paper notebook
      c.fillStyle = IS.settings.contrast ? '#000' : '#efe6cf'; c.fillRect(10, 10, 300, 160);
      c.fillStyle = IS.settings.contrast ? '#000' : '#e2d6b8'; for (let y = 34; y < 168; y += 11) c.fillRect(12, y, 296, 0.5);
      c.fillStyle = '#c0574d'; c.fillRect(34, 10, 0.6, 160);
      const ink = IS.settings.contrast ? '#fff' : '#2a2238', faint = IS.settings.contrast ? '#ccc' : '#7a6f88', red = '#b5433a';
      TABS.forEach((t, i) => {
        const x = 40 + i * 44;
        if (i === this.tab) { c.fillStyle = k.acc; c.fillRect(x - 3, 13, 42, 13); }
        UI.text(c, t, x + 18, 13, i === this.tab ? '#1a1424' : faint, 11, 'center');
      });
      UI.text(c, '◀ ▶', 300, 14, faint, 9, 'right');
      const L = 40, Y = 34;
      const P = { ink, dim: faint, acc: red, selBg: 'rgba(181,67,58,0.12)' };
      if (this.tab === 0) {
        const goal = IS.data.objectives.find((o) => IS.G.ok(o.if));
        UI.text(c, 'CURRENT LEAD', L, Y, red, 10);
        UI.wrap(c, goal ? goal.text : 'Keep exploring.', 255, 11).forEach((l, i) => UI.text(c, l, L, Y + 11 + i * 11, ink, 11));
        UI.text(c, 'Phase ' + S.phase + ' — ' + (IS.data.phases[S.phase] || ''), L, Y + 56, ink, 11);
        UI.text(c, 'Loop ' + S.loop + '   ·   ' + S.clues.length + ' clues   ·   ' + IS.data.deductions.filter((d) => IS.G.has('d.' + d.id)).length + ' deductions', L, Y + 67, faint, 10);
        UI.text(c, 'Tip: connect two clues on the Board to make a deduction.', L, Y + 89, faint, 10);
        UI.text(c, 'What you learn survives midnight. What you carry does not.', L, Y + 100, faint, 10);
      } else if (this.tab === 1 || this.tab === 2) {
        const list = this.clueList();
        if (!list.length) { UI.text(c, 'Nothing written yet. Look around. Talk to people.', L, Y, faint, 11); return; }
        const items = list.map((cl) => ({ label: (S.newClues[cl.id] ? '• ' : '') + cl.title + (this.pick === cl.id ? '  ✱' : '') }));
        UI.list(c, items, this.sel, L - 6, Y, 128, 11, Object.assign({ max: 11 }, P));
        const cl = list[this.sel];
        c.fillStyle = IS.settings.contrast ? '#000' : '#efe6cf'; c.fillRect(170, 32, 136, 134);
        UI.text(c, (cl.cat || '').toUpperCase(), 174, Y, red, 9);
        UI.wrap(c, cl.title, 128, 12).forEach((l, i) => UI.text(c, l, 174, Y + 9 + i * 11, ink, 12));
        UI.wrap(c, cl.text, 128, 10).slice(0, 9).forEach((l, i) => UI.text(c, l, 174, Y + 32 + i * 10, ink, 10));
        if (this.tab === 2) {
          const made = IS.data.deductions.filter((d) => IS.G.has('d.' + d.id));
          c.fillStyle = IS.settings.contrast ? '#000' : '#efe6cf'; c.fillRect(170, 128, 136, 38);
          UI.text(c, this.pick ? 'Now pick a second clue…' : 'Pick a clue to pin.', 174, 130, red, 10);
          UI.text(c, this.msg || ('Red string tied: ' + made.length + ' / ' + IS.data.deductions.length), 174, 142, faint, 9);
          if (made.length) UI.text(c, 'Latest: ' + made[made.length - 1].title, 174, 152, ink, 9);
        }
      } else if (this.tab === 3) {
        const ps = this.people();
        if (!ps.length) { UI.text(c, 'You have not really met anyone yet.', L, Y, faint, 11); return; }
        UI.list(c, ps.map((p) => p.short || p.name), this.sel, L - 6, Y, 90, 11, Object.assign({ max: 11 }, P));
        const p = ps[Math.min(this.sel, ps.length - 1)];
        c.fillStyle = IS.settings.contrast ? '#000' : '#efe6cf'; c.fillRect(132, 32, 174, 134);
        c.imageSmoothingEnabled = false; c.drawImage(IS.Art.portrait(p.id, p.look), 136, Y, 28, 28);
        UI.text(c, p.name, 170, Y, ink, 12); UI.text(c, p.role || '', 170, Y + 11, faint, 10);
        const b = S.bonds[p.id] || 0;
        UI.text(c, '♥'.repeat(b) + '♡'.repeat(5 - b) + (IS.G.isAware(p.id) ? '   remembers you' : ''), 170, Y + 21, red, 10);
        let yy = Y + 36;
        for (const note of p.notes || []) {
          if (!IS.G.ok(note.if)) continue;
          for (const l of UI.wrap(c, '— ' + note.text, 168, 10)) { if (yy > 160) break; UI.text(c, l, 136, yy, ink, 10); yy += 10; }
        }
      } else if (this.tab === 4) {
        const floors = {};
        for (const id in IS.data.rooms) { const r = IS.data.rooms[id]; const f = r.floor || '?'; (floors[f] = floors[f] || []).push(Object.assign({ id }, r)); }
        let x = L, yy = Y;
        for (const f of ['2F', '1F', 'Grounds', 'Hidden', 'Below']) {
          if (!floors[f]) continue;
          const vis = floors[f].filter((r) => S.visited[r.id]);
          if (!vis.length && (f === 'Hidden' || f === 'Below')) continue;
          UI.text(c, f, x, yy, red, 10); yy += 10;
          for (const r of floors[f]) {
            const seen = S.visited[r.id];
            if (!seen && r.secret) continue;
            UI.text(c, (r.id === S.room ? '◉ ' : seen ? '· ' : '? ') + (seen ? r.name : '???'), x + 4, yy, r.id === S.room ? red : seen ? ink : faint, 10); yy += 9.5;
            if (yy > 160) { yy = Y; x += 92; }
          }
          yy += 3; if (yy > 150) { yy = Y; x += 92; }
        }
      } else if (this.tab === 5) {
        if (!S.items.length) { UI.text(c, 'Your pockets are empty.', L, Y, faint, 11); return; }
        UI.list(c, S.items.map((i) => IS.data.items[i].name), this.sel, L - 6, Y, 110, 11, P);
        const it = IS.data.items[S.items[Math.min(this.sel, S.items.length - 1)]];
        c.fillStyle = IS.settings.contrast ? '#000' : '#efe6cf'; c.fillRect(160, 32, 146, 134);
        UI.wrap(c, it.desc + (it.anchored ? '\n\n(Anchored: survives midnight.)' : ''), 140, 10).forEach((l, i) => UI.text(c, l, 164, Y + i * 10, ink, 10));
      }
    }
  }
  UI.NotebookScene = NotebookScene;

  // =============== settings ===============
  class SettingsScene {
    constructor() { this.sel = 0; this.help = false; }
    rows() {
      const s = IS.settings, pct = (v) => Math.round(v * 100) + '%', onoff = (v) => (v ? 'On' : 'Off');
      return [
        { label: 'Master volume', right: pct(s.master), adj: (d) => { s.master = IS.clamp(Math.round((s.master + d * 0.1) * 10) / 10, 0, 1); } },
        { label: 'Music', right: pct(s.music), adj: (d) => { s.music = IS.clamp(Math.round((s.music + d * 0.1) * 10) / 10, 0, 1); } },
        { label: 'Sound effects', right: pct(s.sfx), adj: (d) => { s.sfx = IS.clamp(Math.round((s.sfx + d * 0.1) * 10) / 10, 0, 1); } },
        { label: 'Text speed', right: ['Slow', 'Normal', 'Fast', 'Instant'][s.textSpeed], adj: (d) => { s.textSpeed = (s.textSpeed + d + 4) % 4; } },
        { label: 'Clock speed', right: s.flow === 2 ? 'Relaxed' : 'Normal', adj: () => { s.flow = s.flow === 2 ? 1 : 2; } },
        { label: 'Screen shake', right: onoff(s.shake), adj: () => { s.shake = !s.shake; } },
        { label: 'Glitch & flash effects', right: ['Off', 'Reduced', 'Full'][s.fx], adj: (d) => { s.fx = (s.fx + d + 3) % 3; } },
        { label: 'CRT scanlines', right: onoff(s.crt), adj: () => { s.crt = !s.crt; } },
        { label: 'Large text', right: onoff(s.big), adj: () => { s.big = !s.big; } },
        { label: 'Plain (readable) font', right: onoff(s.plain), adj: () => { s.plain = !s.plain; } },
        { label: 'High contrast', right: onoff(s.contrast), adj: () => { s.contrast = !s.contrast; } },
        { label: 'Interaction sparkles', right: onoff(s.hints), adj: () => { s.hints = !s.hints; } },
        { label: 'Touch controls', right: ['Auto', 'On', 'Off'][s.touch], adj: (d) => { s.touch = (s.touch + d + 3) % 3; IS.applyTouch(); } },
        { label: 'View controls', right: '', act: () => { this.help = true; } }
      ];
    }
    update() {
      const In = I(), rows = this.rows();
      if (this.help) { if (In.pressed.ok || In.back()) { this.help = false; IS.A.sfx('back'); } return; }
      this.sel = UI.navList(this.sel, rows.length);
      const r = rows[this.sel];
      if (In.rep('left') && r.adj) { r.adj(-1); IS.G.saveSettings(); IS.A.sfx('select'); }
      if ((In.rep('right') && r.adj) || (In.pressed.ok && r.adj)) { r.adj(1); IS.G.saveSettings(); IS.A.sfx('select'); }
      if (In.pressed.ok && r.act) r.act();
      if (In.back()) { IS.A.sfx('back'); IS.pop(); }
    }
    drawUI(c) {
      const k = UI.col();
      c.fillStyle = 'rgba(5,4,10,0.8)'; c.fillRect(0, 0, IS.W, IS.H);
      UI.panel(c, 40, 8, 240, 164);
      UI.text(c, 'SETTINGS', 52, 12, k.acc, 12);
      UI.list(c, this.rows(), this.sel, 50, 28, 222, 10.2, { px: 10 });
      if (this.help) {
        UI.panel(c, 30, 30, 260, 120, { edge: k.acc });
        const L = [['Move', 'Arrows / WASD · D-pad / stick'], ['Run', 'Shift · X / RT'], ['Talk / Inspect / OK', 'Z · Enter · Space · E · A'], ['Back', 'X · Backspace · B'],
          ['Notebook', 'N · C · Tab · Y / Select'], ['Pause menu', 'Esc · P · Start'], ['Switch notebook tab', 'Left / Right']];
        L.forEach((r, i) => { UI.text(c, r[0], 40, 38 + i * 14, k.acc, 10); UI.text(c, r[1], 280, 38 + i * 14, k.ink, 10, 'right'); });
      }
    }
  }

  // =============== save slots ===============
  class SlotScene {
    constructor(mode) { this.mode = mode; this.sel = 0; this.confirm = false; }
    slots() { return this.mode === 'load' ? ['auto', 1, 2, 3] : [1, 2, 3]; }
    update() {
      const In = I(), sl = this.slots();
      if (In.back()) { if (this.confirm) this.confirm = false; else IS.pop(); IS.A.sfx('back'); return; }
      if (!this.confirm) this.sel = UI.navList(this.sel, sl.length);
      if (In.pressed.ok) {
        const s = sl[this.sel], d = IS.G.slot(s);
        if (this.mode === 'save') {
          if (d && !this.confirm) { this.confirm = true; IS.A.sfx('select'); return; }
          IS.G.save(s); this.confirm = false; IS.pop();
        } else {
          if (!d) { IS.A.sfx('wrong'); return; }
          IS.G.load(s); IS.A.sfx('confirm'); UI.startWorld();
        }
      }
    }
    drawUI(c) {
      const k = UI.col();
      c.fillStyle = 'rgba(5,4,10,0.85)'; c.fillRect(0, 0, IS.W, IS.H);
      UI.panel(c, 30, 24, 260, 132);
      UI.text(c, this.mode === 'save' ? 'SAVE GAME' : 'LOAD GAME', 42, 28, k.acc, 12);
      this.slots().forEach((s, i) => {
        const d = IS.G.slot(s), y = 46 + i * 26, on = i === this.sel;
        if (on) { c.fillStyle = k.sel; c.fillRect(38, y - 2, 244, 24); }
        UI.text(c, s === 'auto' ? 'Autosave' : 'Slot ' + s, 44, y, on ? k.acc : k.ink, 11);
        if (d) {
          UI.text(c, d.name + ' · Loop ' + d.loop + ' · Phase ' + d.phase, 276, y, k.ink, 10, 'right');
          const r = IS.data.rooms[d.room];
          UI.text(c, (r ? r.name : '') + ' · ' + IS.fmtTime(d.time) + ' · ' + new Date(d.savedAt || 0).toLocaleDateString(), 276, y + 10, k.dim, 9, 'right');
        } else UI.text(c, 'Empty', 276, y, k.dim, 10, 'right');
      });
      if (this.confirm) UI.text(c, 'Overwrite this slot? OK to confirm, Back to cancel.', IS.W / 2, 144, k.red, 10, 'center');
    }
  }

  // =============== extras ===============
  class ExtrasScene {
    constructor() { this.tab = 0; this.sel = 0; }
    update() {
      const In = I();
      if (In.back()) { IS.A.sfx('back'); IS.pop(); return; }
      if (In.rep('left') || In.rep('right')) { this.tab = (this.tab + 1) % 3; this.sel = 0; IS.A.sfx('select'); }
      const n = this.tab === 0 ? IS.data.achievements.length : this.tab === 1 ? Object.keys(IS.data.endings).length : 0;
      this.sel = UI.navList(this.sel, n);
    }
    drawUI(c) {
      const k = UI.col();
      c.fillStyle = 'rgba(5,4,10,0.9)'; c.fillRect(0, 0, IS.W, IS.H);
      UI.panel(c, 16, 8, 288, 164);
      ['Achievements', 'Endings', 'Credits'].forEach((t, i) => UI.text(c, t, 60 + i * 100, 12, i === this.tab ? k.acc : k.dim, 12, 'center'));
      if (this.tab === 0) {
        const A = IS.data.achievements;
        const got = A.filter((a) => IS.meta.ach[a.id]).length;
        UI.text(c, got + ' / ' + A.length + ' unlocked', 296, 28, k.dim, 9, 'right');
        UI.list(c, A.map((a) => ({ label: IS.meta.ach[a.id] ? a.title : (a.secret ? '???' : a.title), disabled: !IS.meta.ach[a.id] })), this.sel, 26, 38, 130, 10.5, { max: 12 });
        const a = A[this.sel];
        UI.wrap(c, IS.meta.ach[a.id] || !a.secret ? a.desc : 'A secret. Keep looking.', 130, 10).forEach((l, i) => UI.text(c, l, 166, 40 + i * 10, k.ink, 10));
        if (IS.meta.ach[a.id]) UI.text(c, '✓ Unlocked', 166, 150, k.acc, 10);
      } else if (this.tab === 1) {
        const ids = Object.keys(IS.data.endings);
        UI.list(c, ids.map((id) => ({ label: IS.meta.endings[id] ? IS.data.endings[id].title : '???', disabled: !IS.meta.endings[id] })), this.sel, 26, 34, 130, 11);
        const e = IS.data.endings[ids[this.sel]];
        const txt = IS.meta.endings[ids[this.sel]] ? e.blurb : (e.future ? 'Arrives in a future chapter.' : (e.hint || 'Not found yet.'));
        UI.wrap(c, txt, 130, 10).forEach((l, i) => UI.text(c, l, 166, 36 + i * 10, k.ink, 10));
      } else {
        const L = ['INFINITE SCHOOL', 'Chapter One: Homeroom', '', 'Created by Jaineil Rana', 'Story, code, pixels and music generated in code — no external assets.',
          '', 'Built with plain JavaScript + Canvas + Web Audio.', 'Thank you for staying after class.'];
        L.forEach((l, i) => UI.text(c, l, IS.W / 2, 36 + i * 13, i === 0 ? k.acc : k.ink, i === 0 ? 14 : 10, 'center'));
      }
    }
  }

  IS.UI = UI;
})(window.IS);
