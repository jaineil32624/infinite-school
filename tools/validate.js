// Content validator: node tools/validate.js
// Checks maps, exits, spawns, NPC placement and every id referenced in dialogue.
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const ctx = { window: {}, console };
ctx.window.IS = undefined; vm.createContext(ctx);
for (const f of ['src/core.js', 'src/art.js', 'data/world.js', 'data/rooms.js', 'data/npcs.js', 'data/story.js', 'data/meta.js', 'data/music.js']) {
  let code = fs.readFileSync(path.join(root, f), 'utf8');
  if (f === 'src/art.js') code = code.replace('IS.Art = Art;', 'IS.Art = Art;'); // art needs no DOM at load
  vm.runInContext(code, ctx, { filename: f });
}
const IS = ctx.window.IS, D = IS.data, errs = [];
const SOLID = IS.Art.SOLID;
const tile = (r, x, y) => (r.map[y] || '')[x] || '#';
const walk = (r, x, y) => !SOLID.has(tile(r, x, y));
for (const [id, r] of Object.entries(D.rooms)) {
  const w = r.map[0].length;
  r.map.forEach((row, i) => { if (row.length !== w) errs.push(`${id}: row ${i} width ${row.length} != ${w}`); });
  if (r.spawn && !walk(r, ...r.spawn)) errs.push(`${id}: spawn ${r.spawn} not walkable`);
  for (const e of r.exits || []) {
    if (e.to) {
      const t = D.rooms[e.to];
      if (!t) errs.push(`${id}: exit to unknown ${e.to}`);
      else if (!walk(t, e.tx, e.ty)) errs.push(`${id}: exit lands on solid ${e.to} ${e.tx},${e.ty} '${tile(t, e.tx, e.ty)}'`);
    }
  }
  for (const n of r.npcs || []) if (!walk(r, n.x, n.y)) errs.push(`${id}: room npc ${n.id} on solid`);
}
for (const [id, n] of Object.entries(D.npcs)) for (const s of n.sched) {
  if (!s[1]) continue;
  const spots = (s[5] && s[5].vary) || [[s[1], s[2], s[3]]];
  for (const [rm, x, y] of spots) { const r = D.rooms[rm]; if (!r) errs.push(`npc ${id}: unknown room ${rm}`); else if (!walk(r, x, y)) errs.push(`npc ${id}: solid at ${rm} ${x},${y} '${tile(r, x, y)}'`); }
}
// walk every dialogue structure and check referenced ids
const scenesOk = (id) => D.scenes[id] || (D.dynamicScenes && D.dynamicScenes[id]);
function checkFx(e, where) {
  if (!e) return;
  [].concat(e.clue || []).forEach((c) => { if (!D.clues[c]) errs.push(`${where}: unknown clue ${c}`); });
  [].concat(e.item || []).forEach((c) => { if (!D.items[c]) errs.push(`${where}: unknown item ${c}`); });
  if (e.ach && !D.achievements.find((a) => a.id === e.ach)) errs.push(`${where}: unknown ach ${e.ach}`);
  if (e.ending && !D.endings[e.ending]) errs.push(`${where}: unknown ending ${e.ending}`);
  if (e.warp && !D.rooms[e.warp[0]]) errs.push(`${where}: warp to unknown room`);
  if (e.warp && D.rooms[e.warp[0]] && !walk(D.rooms[e.warp[0]], e.warp[1], e.warp[2])) errs.push(`${where}: warp onto solid tile`);
}
function checkCond(c, where) { if (!c) return; [].concat(c.clue || [], c.noclue || []).forEach((x) => { if (!D.clues[x]) errs.push(`${where}: cond unknown clue ${x}`); }); }
function checkEntry(e, where) {
  if (!e) return;
  if (typeof e === 'string') { if (!scenesOk(e)) errs.push(`${where}: unknown scene ${e}`); return; }
  if (Array.isArray(e)) return e.forEach((x, i) => checkEntry(x, where + '[' + i + ']'));
  checkCond(e.if, where); checkFx(e.do, where);
  if (e.goto && !scenesOk(e.goto)) errs.push(`${where}: goto unknown ${e.goto}`);
  (e.choices || []).forEach((c, i) => { checkCond(c.if, where + '.c' + i); checkFx(c.do, where + '.c' + i); if (c.goto && !scenesOk(c.goto)) errs.push(`${where}: goto ${c.goto}`); });
  for (const l of [].concat(e.lines || [], ...(e.pool || []))) {
    const m = /^@(\w+)\s/.exec(l); if (m && m[1] !== 'you' && !D.npcs[m[1]] && !D.speakers[m[1]]) errs.push(`${where}: unknown speaker ${m[1]}`);
  }
}
for (const [k, v] of Object.entries(D.dialogue)) checkEntry(v, 'dialogue.' + k);
for (const [k, v] of Object.entries(D.scenes)) checkEntry(v, 'scene.' + k);
for (const [k, v] of Object.entries(D.dynamicScenes || {})) { if (!D[v]) errs.push(`dynamic ${k}: missing list ${v}`); else checkEntry(D[v], 'dyn.' + k); }
for (const [id, r] of Object.entries(D.rooms)) { (r.obj || []).forEach((o, i) => checkEntry(o.d, `room.${id}.obj${i}`)); (r.enter || []).forEach((e) => checkEntry(e.scene, `room.${id}.enter`)); (r.triggers || []).forEach((e) => checkEntry(e.scene, `room.${id}.trigger`)); (r.exits || []).forEach((e) => e.scene && checkEntry(e.scene, `room.${id}.exit`)); }
for (const d of D.deductions) { d.pairs.flat().forEach((c) => { if (!D.clues[c]) errs.push(`deduction ${d.id}: unknown clue ${c}`); }); checkFx(d.do, 'deduction ' + d.id); }
for (const o of D.objectives) checkCond(o.if, 'objective');
for (const [id, m] of Object.entries(D.music)) if (!m.lead || !m.bass) errs.push('music ' + id);
const stats = { rooms: Object.keys(D.rooms).length, npcs: Object.keys(D.npcs).length, clues: Object.keys(D.clues).length, deductions: D.deductions.length, achievements: D.achievements.length, endings: Object.keys(D.endings).length, themes: Object.keys(D.music).length };
console.log(JSON.stringify(stats));
if (errs.length) { console.log(errs.join('\n')); process.exit(1); } else console.log('All content checks passed.');
