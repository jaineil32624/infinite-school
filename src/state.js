// Game state, rules engine (conditions/effects), time loop and persistence.
// Flags prefixed "L." are loop-local and are wiped at midnight. Everything
// else (clues, deductions, knowledge) survives the reset: that is the game.
(function (IS) {
  const G = {};
  const DEF_SETTINGS = { master: 0.8, music: 0.6, sfx: 0.8, textSpeed: 1, shake: true, fx: 2, crt: false, big: false, plain: false, contrast: false, touch: 0, flow: 1, hints: true };
  IS.settings = Object.assign({}, DEF_SETTINGS, IS.store.get('settings', {}));
  IS.meta = Object.assign({ ach: {}, endings: {}, bestLoop: 0 }, IS.store.get('meta', {}));

  G.saveSettings = () => { IS.store.set('settings', IS.settings); IS.A.apply(); };
  G.saveMeta = () => IS.store.set('meta', IS.meta);

  G.newGame = function (name) {
    IS.S = {
      v: 1, name: (name || 'Ash').slice(0, 10), loop: 1, time: IS.DAY_START, room: 'c2b', x: 0, y: 0, dir: 1,
      flags: {}, clues: [], newClues: {}, bonds: {}, insight: {}, items: [], phase: 1, visited: {},
      playMs: 0, created: Date.now()
    };
    G.loopRules();
  };

  // ---------- flags / progress ----------
  G.has = (f) => !!(IS.S && IS.S.flags[f]);
  G.set = (f, v) => { IS.S.flags[f] = v === undefined ? true : v; };
  G.unset = (f) => { delete IS.S.flags[f]; };

  G.addClue = function (id) {
    const S = IS.S, c = IS.data.clues[id];
    if (!c) { console.warn('Unknown clue', id); return false; }
    if (S.clues.includes(id)) return false;
    S.clues.push(id); S.newClues[id] = 1;
    IS.UI.toast('New clue: ' + c.title, 'clue'); IS.A.sfx('clue');
    return true;
  };

  G.bond = function (n, v) {
    const S = IS.S;
    const before = S.bonds[n] || 0;
    S.bonds[n] = IS.clamp(before + v, 0, 5);
    S.insight[n] = Math.max(S.insight[n] || 0, S.bonds[n]);
    if (S.bonds[n] > before) {
      const nm = (IS.data.npcs[n] && IS.data.npcs[n].short) || n;
      IS.UI.toast(nm + '  ' + '♥'.repeat(S.bonds[n]) + '·'.repeat(5 - S.bonds[n]), 'bond');
    }
  };

  G.ach = function (id) {
    if (IS.meta.ach[id]) return;
    const a = IS.data.achievements.find((x) => x.id === id);
    if (!a) return;
    IS.meta.ach[id] = Date.now(); G.saveMeta();
    IS.UI.toast('Achievement — ' + a.title, 'ach'); IS.A.sfx('ach');
  };
  G.checkAch = function () {
    if (!IS.S) return;
    for (const a of IS.data.achievements) if (a.auto && !IS.meta.ach[a.id] && G.ok(a.auto)) G.ach(a.id);
  };

  G.setPhase = function (n) {
    if (n <= IS.S.phase) return;
    IS.S.phase = n;
    IS.pendingCard = { big: 'PHASE ' + n, small: IS.data.phases[n] || '', sfx: 'glitch' };
  };

  G.isAware = function (id) {
    const n = IS.data.npcs[id]; if (!n) return false;
    return !!(n.aware || (n.awareIf && G.ok(n.awareIf)));
  };

  // Try to connect two clues on the evidence board
  G.deduce = function (a, b) {
    for (const d of IS.data.deductions) {
      const hit = d.pairs.some((p) => (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a));
      if (!hit) continue;
      if (G.has('d.' + d.id)) return { already: true, d };
      G.set('d.' + d.id);
      IS.A.sfx('deduce');
      G.ach('red_string');
      G.apply(d.do);
      if (IS.data.deductions.every((x) => G.has('d.' + x.id))) G.ach('conspiracy');
      return { ok: true, d };
    }
    return null;
  };

  // ---------- conditions ----------
  G.ok = function (c) {
    if (!c) return true;
    const S = IS.S;
    const arr = (v) => [].concat(v);
    if (c.flag && !arr(c.flag).every(G.has)) return false;
    if (c.not && arr(c.not).some(G.has)) return false;
    if (c.any && !arr(c.any).some(G.has)) return false;
    if (c.loop && (S.loop < c.loop[0] || S.loop > (c.loop[1] == null ? 1e9 : c.loop[1]))) return false;
    if (c.time && (S.time < c.time[0] || S.time >= c.time[1])) return false;
    if (c.phase && S.phase < c.phase) return false;
    if (c.maxPhase && S.phase > c.maxPhase) return false;
    if (c.room && S.room !== c.room) return false;
    if (c.bond) for (const k in c.bond) if ((S.bonds[k] || 0) < c.bond[k]) return false;
    if (c.insight) for (const k in c.insight) if ((S.insight[k] || 0) < c.insight[k]) return false;
    if (c.n) for (const k in c.n) if ((S.flags[k] || 0) < c.n[k]) return false;
    if (c.clue && !arr(c.clue).every((id) => S.clues.includes(id))) return false;
    if (c.noclue && arr(c.noclue).some((id) => S.clues.includes(id))) return false;
    if (c.clues && S.clues.length < c.clues) return false;
    if (c.item && !arr(c.item).every((i) => S.items.includes(i))) return false;
    if (c.noitem && arr(c.noitem).some((i) => S.items.includes(i))) return false;
    if (c.visited && !arr(c.visited).every((r) => S.visited[r])) return false;
    if (c.allRooms && !Object.keys(IS.data.rooms).filter((r) => !IS.data.rooms[r].secret).every((r) => S.visited[r])) return false;
    if (c.chance && IS.loopRand(c.seed || 'chance') > c.chance) return false;
    if (c.or && !c.or.some(G.ok)) return false;
    return true;
  };

  // ---------- effects ----------
  G.apply = function (e) {
    if (!e) return;
    const S = IS.S, arr = (v) => [].concat(v);
    if (e.set) arr(e.set).forEach((f) => G.set(f));
    if (e.unset) arr(e.unset).forEach(G.unset);
    if (e.inc) arr(e.inc).forEach((f) => { S.flags[f] = (S.flags[f] || 0) + 1; });
    if (e.clue) arr(e.clue).forEach(G.addClue);
    if (e.bond) for (const k in e.bond) G.bond(k, e.bond[k]);
    if (e.item) arr(e.item).forEach((i) => { if (!S.items.includes(i)) { S.items.push(i); IS.UI.toast('Got: ' + IS.data.items[i].name, 'item'); IS.A.sfx('confirm'); } });
    if (e.take) arr(e.take).forEach((i) => { S.items = S.items.filter((x) => x !== i); });
    if (e.time) S.time = Math.min(IS.DAY_END - 1, S.time + e.time);
    if (e.timeTo) S.time = Math.max(S.time, e.timeTo);
    if (e.nextBell) { const b = IS.data.bells.find((x) => x[0] > S.time); S.time = b ? b[0] : Math.max(S.time, 900); }
    if ((e.time || e.timeTo || e.nextBell) && IS.Wd.room) { IS.Wd.placeNPCs(true); IS.Wd.music(); IS.Wd.fade = 1; }
    if (e.phase) G.setPhase(e.phase);
    if (e.ach) G.ach(e.ach);
    if (e.sfx) IS.A.sfx(e.sfx);
    if (e.shake && IS.settings.shake) IS.Wd.shake = Math.max(IS.Wd.shake, e.shake);
    if (e.glitch) IS.Wd.glitch = Math.max(IS.Wd.glitch, e.glitch);
    if (e.warp) IS.pendingWarp = e.warp;
    if (e.ending) IS.pendingEnding = e.ending;
    if (e.endDay) IS.pendingMidnight = true;
    if (e.card) IS.pendingCard = e.card;
    if (e.toast) IS.UI.toast(e.toast);
    if (e.music) IS.A.play(e.music);
    G.checkAch();
  };

  // ---------- time & loop ----------
  G.period = function (t) {
    let p = IS.data.periods[0];
    for (const x of IS.data.periods) if (t >= x[0]) p = x;
    return p ? p[1] : '';
  };

  G.loopRules = function () { for (const r of IS.data.loopRules) if (G.ok(r.if)) G.apply(r.do); };

  G.resetLoop = function () {
    const S = IS.S;
    S.loop++;
    IS.meta.bestLoop = Math.max(IS.meta.bestLoop || 0, S.loop); G.saveMeta();
    for (const k of Object.keys(S.flags)) if (k.startsWith('L.')) delete S.flags[k];
    for (const n of Object.keys(S.bonds)) if (!G.isAware(n)) S.bonds[n] = 0;
    S.items = S.items.filter((i) => IS.data.items[i] && IS.data.items[i].anchored);
    S.time = IS.DAY_START;
    G.loopRules();
    // endings that trigger on waking up
    for (const id in IS.data.endings) {
      const e = IS.data.endings[id];
      if (e.onLoop && G.ok(e.onLoop)) { IS.pendingEnding = id; return; }
    }
    const r = IS.data.rooms.c2b;
    S.room = 'c2b'; S.x = r.spawn[0]; S.y = r.spawn[1]; S.dir = 1;
    G.checkAch();
    G.save('auto');
  };

  // ---------- persistence ----------
  G.save = function (slot) {
    if (!IS.S) return;
    if (IS.Wd && IS.Wd.p) { IS.S.x = Math.floor(IS.Wd.p.x / 16); IS.S.y = Math.floor((IS.Wd.p.y - 1) / 16); IS.S.dir = IS.Wd.p.dir; }
    const snap = JSON.parse(JSON.stringify(IS.S)); snap.savedAt = Date.now();
    IS.store.set('slot.' + slot, snap);
    if (slot !== 'auto') { IS.UI.toast('Saved to slot ' + slot); IS.A.sfx('confirm'); }
  };
  G.slot = (slot) => IS.store.get('slot.' + slot, null);
  G.load = function (slot) {
    const s = G.slot(slot); if (!s) return false;
    IS.S = s; return true;
  };

  IS.G = G;
})(window.IS);
