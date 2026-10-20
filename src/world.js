// The overworld: room building, movement + collision, NPC schedules,
// interaction, the clock, and the lighting / anomaly post effects.
(function (IS) {
  const T = 16;
  const Wd = { room: null, grid: null, npcs: [], p: { x: 0, y: 0, dir: 0, anim: 0, moving: false }, cam: { x: 0, y: 0 },
    shake: 0, glitch: 0, fade: 0, parts: [], schedKey: '', schedT: 0, t: 0, stepT: 0, title: null, titleT: 0 };

  const DIRS = [[0, 1], [0, -1], [-1, 0], [1, 0]]; // down, up, left, right

  Wd.tileAt = (tx, ty) => (!Wd.grid || ty < 0 || tx < 0 || ty >= Wd.grid.length || tx >= Wd.grid[0].length) ? '#' : Wd.grid[ty][tx];
  Wd.solidAt = (tx, ty) => IS.Art.SOLID.has(Wd.tileAt(tx, ty));

  Wd.build = function () {
    const r = Wd.room;
    Wd.grid = r.map.map((row) => row.padEnd(r.w, '#').slice(0, r.w).split(''));
    for (const d of r.dyn || []) if (IS.G.ok(d.if)) Wd.grid[d.y][d.x] = d.t;
  };

  Wd.enter = function (id, tx, ty, dir, opts) {
    opts = opts || {};
    const r = IS.data.rooms[id];
    if (!r) { console.warn('No room', id); return; }
    const S = IS.S;
    r.id = id; Wd.room = r; S.room = id;
    r.w = r.map[0].length; r.h = r.map.length;
    Wd.build();
    Wd.p.x = tx * T + 8; Wd.p.y = ty * T + 13; Wd.p.dir = dir == null ? Wd.p.dir : dir;
    S.visited[id] = 1;
    Wd.fade = 1; Wd.schedKey = ''; Wd.placeNPCs(true);
    Wd.parts = [];
    Wd.music();
    if (!opts.silent) { Wd.title = r.name; Wd.titleT = 2.2; }
    IS.G.checkAch();
    // room enter events
    if (!opts.noEvents) for (const ev of r.enter || []) {
      if (IS.G.ok(ev.if) && !(ev.once && IS.G.has('L.seen.' + ev.scene)) && !(ev.onceEver && IS.G.has('seen.' + ev.scene))) { IS.pendingScene = ev.scene; break; }
    }
  };

  Wd.music = function () {
    const r = Wd.room; if (!r) return;
    let m = r.music;
    if (IS.S.time >= 1260 && r.nightMusic !== false && !r.keepMusic) m = 'night';
    else if (IS.S.time >= 1020 && r.duskMusic) m = r.duskMusic;
    IS.A.play(m);
  };

  // ---------- NPC scheduling ----------
  function schedEntry(n) {
    if (n.absentIf && IS.G.ok(n.absentIf)) return null;
    let e = null;
    for (const s of n.sched || []) if (IS.S.time >= s[0]) e = s;
    if (!e || !e[1]) return null;
    const o = e[5] || {};
    if (o.if && !IS.G.ok(o.if)) return null;
    let room = e[1], x = e[2], y = e[3];
    if (o.vary) { const v = o.vary[Math.floor(IS.loopRand(n.id + e[0]) * o.vary.length)]; room = v[0]; x = v[1]; y = v[2]; }
    return { room, x, y, dir: e[4] || 0, wander: o.wander };
  }

  Wd.placeNPCs = function (force) {
    const list = [];
    for (const id in IS.data.npcs) {
      const n = IS.data.npcs[id]; n.id = id;
      const e = schedEntry(n);
      if (e && e.room === Wd.room.id) list.push({ id, x: e.x, y: e.y, dir: e.dir, wander: e.wander });
    }
    for (const ln of Wd.room.npcs || []) if (IS.G.ok(ln.if)) list.push(Object.assign({}, ln));
    const key = list.map((n) => n.id + n.x + ',' + n.y).join('|');
    if (!force && key === Wd.schedKey) return;
    Wd.schedKey = key;
    Wd.npcs = list.map((n) => {
      const old = Wd.npcs.find((o) => o.id === n.id && o.hx === n.x && o.hy === n.y);
      if (old && !force) return old;
      return { id: n.id, talk: n.talk || n.id, ghost: n.ghost, hx: n.x, hy: n.y, x: n.x * T + 8, y: n.y * T + 13, dir: n.dir, baseDir: n.dir,
        wander: n.wander, wt: Math.random() * 3, vx: 0, vy: 0, anim: 0 };
    });
  };

  // ---------- collision ----------
  function blocked(x, y, self) {
    const hw = 4;
    const pts = [[x - hw, y - 4], [x + hw - 1, y - 4], [x - hw, y], [x + hw - 1, y]];
    for (const [px, py] of pts) if (Wd.solidAt(Math.floor(px / T), Math.floor(py / T))) return true;
    for (const n of Wd.npcs) {
      if (n === self) continue;
      if (Math.abs(n.x - x) < 9 && Math.abs(n.y - y) < 6) return true;
    }
    if (self && self !== Wd.p && Math.abs(Wd.p.x - x) < 9 && Math.abs(Wd.p.y - y) < 6) return true;
    return false;
  }

  function moveEnt(e, dx, dy) {
    if (dx && !blocked(e.x + dx, e.y, e)) e.x += dx;
    else if (dx && e === Wd.p) { // corner slide
      if (!blocked(e.x + dx, e.y - 3, e) && blocked(e.x + dx, e.y + 3, e)) e.y -= 0.6;
      else if (!blocked(e.x + dx, e.y + 3, e) && blocked(e.x + dx, e.y - 3, e)) e.y += 0.6;
    }
    if (dy && !blocked(e.x, e.y + dy, e)) e.y += dy;
    else if (dy && e === Wd.p) {
      if (!blocked(e.x - 3, e.y + dy, e) && blocked(e.x + 3, e.y + dy, e)) e.x -= 0.6;
      else if (!blocked(e.x + 3, e.y + dy, e) && blocked(e.x - 3, e.y + dy, e)) e.x += 0.6;
    }
  }

  // ---------- interaction ----------
  function objAt(tx, ty) {
    for (const o of Wd.room.obj || []) {
      const w = o.w || 1, h = o.h || 1;
      if (tx >= o.x && tx < o.x + w && ty >= o.y && ty < o.y + h) {
        const e = IS.D.pick(o.d); if (e) return e;
      }
    }
    return null;
  }
  function npcNear(px, py) {
    let best = null, bd = 1e9;
    for (const n of Wd.npcs) { const d = Math.hypot(n.x - px, n.y - py); if (d < 13 && d < bd) { bd = d; best = n; } }
    return best;
  }

  Wd.interact = function () {
    const p = Wd.p, [dx, dy] = DIRS[p.dir];
    const n = npcNear(p.x + dx * 10, p.y - 2 + dy * 10);
    if (n) return Wd.talk(n);
    const tx = Math.floor((p.x + dx * 10) / T), ty = Math.floor((p.y - 3 + dy * 10) / T);
    let e = objAt(tx, ty);
    if (e) return IS.D.run(e);
    // reach across counters / tables
    const ch = Wd.tileAt(tx, ty);
    if ('=T'.includes(ch)) {
      const n2 = npcNear(p.x + dx * 26, p.y - 2 + dy * 26);
      if (n2) return Wd.talk(n2);
    }
    // generic lore books on library shelves
    if (ch === 'B' && Wd.room.books && IS.data.books.length) {
      const b = IS.data.books[(tx * 31 + ty * 17 + IS.S.loop) % IS.data.books.length];
      return IS.D.run({ lines: b });
    }
    e = objAt(Math.floor(p.x / T), Math.floor((p.y - 3) / T));
    if (e) return IS.D.run(e);
  };

  Wd.talk = function (n) {
    const p = Wd.p;
    const dx = p.x - n.x, dy = p.y - n.y;
    n.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 2 : 3) : (dy < 0 ? 1 : 0);
    n.vx = n.vy = 0;
    const e = IS.D.pick(IS.data.dialogue[n.talk]);
    if (e) { IS.D.run(e, n); return true; }
    IS.D.run({ lines: ['They seem busy.'] });
    return true;
  };

  // ---------- update ----------
  Wd.update = function (dt) {
    const I = IS.I, p = Wd.p, S = IS.S;
    Wd.t += dt;
    if (Wd.fade > 0) Wd.fade = Math.max(0, Wd.fade - dt * 3);
    if (Wd.titleT > 0) Wd.titleT -= dt;
    if (Wd.shake > 0) Wd.shake = Math.max(0, Wd.shake - dt * 6);
    const baseGlitch = Wd.room.glitch || 0;
    if (Wd.glitch > baseGlitch) Wd.glitch = Math.max(baseGlitch, Wd.glitch - dt * 0.8); else Wd.glitch = baseGlitch;

    // movement
    let mx = (I.held.right ? 1 : 0) - (I.held.left ? 1 : 0);
    let my = (I.held.down ? 1 : 0) - (I.held.up ? 1 : 0);
    const run = I.held.run;
    const sp = (run ? 100 : 62) * dt;
    if (mx || my) {
      if (mx && my) { mx *= 0.7071; my *= 0.7071; }
      if (Math.abs(mx) > Math.abs(my) + 0.01) p.dir = mx < 0 ? 2 : 3; else if (my) p.dir = my < 0 ? 1 : 0; else p.dir = mx < 0 ? 2 : 3;
      moveEnt(p, mx * sp, my * sp);
      p.anim += dt * (run ? 10 : 7); p.moving = true;
      Wd.stepT += dt; if (Wd.stepT > (run ? 0.22 : 0.3)) { Wd.stepT = 0; IS.A.sfx('step'); }
    } else { p.moving = false; p.anim = 0; }

    // exits
    const ftx = Math.floor(p.x / T), fty = Math.floor((p.y - 2) / T);
    for (const ex of Wd.room.exits || []) {
      if (ex.x !== ftx || ex.y !== fty) continue;
      if (ex.if && !IS.G.ok(ex.if)) {
        // bounce back and explain
        const [dx, dy] = DIRS[p.dir]; p.x -= dx * 6; p.y -= dy * 6;
        if (ex.lock) IS.D.run({ lines: [].concat(ex.lock) });
        return;
      }
      if (ex.scene) { const [dx, dy] = DIRS[p.dir]; p.x -= dx * 6; p.y -= dy * 6; IS.D.run(ex.scene); return; }
      IS.A.sfx('door');
      S.time = Math.min(IS.DAY_END - 1, S.time + 1);
      Wd.enter(ex.to, ex.tx, ex.ty, ex.dir);
      return;
    }
    // trigger zones
    for (const tr of Wd.room.triggers || []) {
      if (ftx >= tr.x && ftx < tr.x + (tr.w || 1) && fty >= tr.y && fty < tr.y + (tr.h || 1) && IS.G.ok(tr.if) && !IS.G.has('L.seen.' + tr.scene)) {
        IS.D.run(tr.scene); return;
      }
    }

    if (I.pressed.ok) { Wd.interact(); }

    // NPC idle / wander
    for (const n of Wd.npcs) {
      n.wt -= dt;
      if (n.wander) {
        if (n.wt <= 0) {
          n.wt = 1.5 + Math.random() * 2.5;
          const d = Math.floor(Math.random() * 5);
          if (d < 4) { n.vx = DIRS[d][0] * 22; n.vy = DIRS[d][1] * 22; n.dir = d; } else { n.vx = n.vy = 0; }
        }
        if (Math.abs(n.x - (n.hx * T + 8)) > 28) n.vx = (n.hx * T + 8 - n.x) > 0 ? 22 : -22;
        if (Math.abs(n.y - (n.hy * T + 13)) > 20) n.vy = (n.hy * T + 13 - n.y) > 0 ? 22 : -22;
        if (n.vx || n.vy) { const ox = n.x, oy = n.y; moveEnt(n, n.vx * dt, n.vy * dt); n.anim += dt * 6; if (ox === n.x && oy === n.y) { n.vx = n.vy = 0; } }
        else n.anim = 0;
      } else if (n.wt <= 0) { n.wt = 3; n.dir = n.baseDir; }
    }

    // particles: dust motes in sunlight
    if (Wd.room.theme !== 'sub' && Wd.parts.length < 24 && Math.random() < dt * 6) {
      Wd.parts.push({ x: Wd.cam.x + Math.random() * IS.W, y: Wd.cam.y + Math.random() * IS.H, life: 4 + Math.random() * 4, vx: (Math.random() - 0.5) * 4, vy: -2 - Math.random() * 3 });
    }
    for (const q of Wd.parts) { q.x += q.vx * dt; q.y += q.vy * dt; q.life -= dt; }
    Wd.parts = Wd.parts.filter((q) => q.life > 0);

    // clock
    Wd.tickClock(dt);
  };

  Wd.tickClock = function (dt) {
    const S = IS.S;
    if (Wd.room.timeless) return;
    const before = S.time;
    const rate = IS.settings.flow === 2 ? 0.6 : 1.25; // game minutes per real second
    S.time += dt * rate;
    S.playMs += dt * 1000;
    for (const b of IS.data.bells) if (before < b[0] && S.time >= b[0]) { IS.A.sfx('bell'); IS.UI.toast('♪ ' + b[1]); }
    if (Math.floor(before) !== Math.floor(S.time)) {
      Wd.schedT++;
      if (Wd.schedT >= 2) { Wd.schedT = 0; Wd.placeNPCs(false); Wd.music(); }
      IS.G.checkAch();
    }
    if (S.time >= IS.DAY_END - 6 && S.phase >= 2) Wd.glitch = Math.max(Wd.glitch, (S.time - (IS.DAY_END - 6)) / 6);
    if (S.time >= IS.DAY_END) { S.time = IS.DAY_END; IS.pendingMidnight = true; }
  };

  // ---------- draw ----------
  Wd.draw = function (c) {
    const r = Wd.room, p = Wd.p, S = IS.S;
    const pw = r.w * T, ph = r.h * T;
    IS.Art.night = S.time >= 1170;
    Wd.cam.x = pw <= IS.W ? (pw - IS.W) / 2 : IS.clamp(p.x - IS.W / 2, 0, pw - IS.W);
    Wd.cam.y = ph <= IS.H ? (ph - IS.H) / 2 : IS.clamp(p.y - 8 - IS.H / 2, 0, ph - IS.H);
    let ox = Math.round(-Wd.cam.x), oy = Math.round(-Wd.cam.y);
    if (Wd.shake > 0) { ox += Math.round((Math.random() - 0.5) * Wd.shake * 4); oy += Math.round((Math.random() - 0.5) * Wd.shake * 4); }
    c.fillStyle = r.theme === 'sub' || r.theme === 'anomaly' ? '#05070a' : '#140f1a';
    c.fillRect(0, 0, IS.W, IS.H);
    const x0 = Math.max(0, Math.floor(-ox / T)), y0 = Math.max(0, Math.floor(-oy / T));
    const x1 = Math.min(r.w, x0 + Math.ceil(IS.W / T) + 2), y1 = Math.min(r.h, y0 + Math.ceil(IS.H / T) + 2);
    for (let ty = y0; ty < y1; ty++) for (let tx = x0; tx < x1; tx++) {
      IS.Art.tile(c, Wd.grid[ty][tx], tx * T + ox, ty * T + oy, tx, ty, r.theme, Wd.tileAt(tx, ty + 1), Wd.t);
    }
    // interactable hints (unread things sparkle)
    if (IS.settings.hints) for (const o of r.obj || []) {
      if (!o.hint) continue;
      const e = IS.D.pick(o.d); if (!e || !e.id || IS.G.has('seen.' + e.id) || IS.G.has('L.seen.' + e.id)) continue;
      const s = Math.sin(Wd.t * 4 + o.x) > 0.6;
      if (s) { c.fillStyle = '#fff6c8'; c.fillRect(o.x * T + ox + 7, o.y * T + oy + 2, 2, 2); c.fillRect(o.x * T + ox + 6, o.y * T + oy + 3, 4, 0.5); }
    }
    // entities, depth sorted
    const ents = Wd.npcs.map((n) => ({ y: n.y, n })).concat([{ y: p.y, me: true }]).sort((a, b) => a.y - b.y);
    for (const e of ents) {
      if (e.me) { IS.Art.char(c, IS.Art.PLAYER, p.x + ox, p.y + oy, p.dir, p.moving ? (Math.floor(p.anim) % 2) : 0); continue; }
      const n = e.n, d = IS.data.npcs[n.id];
      if (!d) continue;
      const ghost = n.ghost || d.ghost;
      IS.Art.char(c, d.look, n.x + ox, n.y + oy, n.dir, (n.vx || n.vy) ? Math.floor(n.anim) % 2 : 0,
        ghost ? { alpha: 0.55 + Math.sin(Wd.t * 2) * 0.15, glow: true } : null);
    }
    // dust motes
    c.fillStyle = 'rgba(255,240,200,0.35)';
    for (const q of Wd.parts) c.fillRect(Math.round(q.x - Wd.cam.x), Math.round(q.y - Wd.cam.y), 1, 1);

    Wd.lighting(c, ox, oy);
  };

  Wd.lighting = function (c, ox, oy) {
    const S = IS.S, r = Wd.room, t = S.time;
    let tint = null, dark = 0;
    if (r.theme === 'sub') dark = 0.6;
    else if (r.theme === 'anomaly') tint = 'rgba(40,120,140,0.12)';
    else if (t < 540) tint = 'rgba(255,190,140,0.08)';
    else if (t >= 1020 && t < 1140) tint = 'rgba(255,140,60,0.14)';
    else if (t >= 1140 && t < 1260) { tint = 'rgba(70,40,130,0.22)'; dark = 0.15; }
    else if (t >= 1260) { tint = 'rgba(20,20,70,0.3)'; dark = r.outdoor ? 0.35 : 0.5; }
    if (tint) { c.fillStyle = tint; c.fillRect(0, 0, IS.W, IS.H); }
    if (dark > 0) {
      const g = c.createRadialGradient(Wd.p.x + ox, Wd.p.y + oy - 8, 10, Wd.p.x + ox, Wd.p.y + oy - 8, 110);
      g.addColorStop(0, 'rgba(0,0,10,0)'); g.addColorStop(1, 'rgba(0,0,10,' + dark + ')');
      c.fillStyle = g; c.fillRect(0, 0, IS.W, IS.H);
    }
    // vignette
    const v = c.createRadialGradient(IS.W / 2, IS.H / 2, IS.H * 0.45, IS.W / 2, IS.H / 2, IS.W * 0.62);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.38)');
    c.fillStyle = v; c.fillRect(0, 0, IS.W, IS.H);
    if (Wd.fade > 0) { c.fillStyle = 'rgba(0,0,0,' + Wd.fade + ')'; c.fillRect(0, 0, IS.W, IS.H); }
  };

  // horizontal slice displacement: the "reality is tearing" effect
  Wd.postGlitch = function (canvas, ctx, amount) {
    const fx = IS.settings.fx; if (!fx || amount <= 0.02) return;
    const a = amount * (fx === 1 ? 0.35 : 1);
    const n = Math.floor(a * 7);
    for (let i = 0; i < n; i++) {
      const y = Math.floor(Math.random() * IS.H), h = 2 + Math.floor(Math.random() * 8);
      const dx = Math.round((Math.random() - 0.5) * 18 * a);
      ctx.drawImage(canvas, 0, y, IS.W, h, dx, y, IS.W, h);
    }
    if (fx === 2 && Math.random() < a * 0.3) { ctx.fillStyle = 'rgba(120,240,255,' + (0.08 * a).toFixed(3) + ')'; ctx.fillRect(0, 0, IS.W, IS.H); }
  };

  IS.Wd = Wd;
})(window.IS);
