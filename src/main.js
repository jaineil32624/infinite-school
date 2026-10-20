// Boot + main loop. Renders the world into a 320x180 low-res buffer, scales
// it up with crisp pixels, then draws the UI at full resolution on top.
(function (IS) {
  const main = document.getElementById('game');
  const mctx = main.getContext('2d');
  const lo = document.createElement('canvas'); lo.width = IS.W; lo.height = IS.H;
  const lctx = lo.getContext('2d');
  let scale = 1, ox = 0, oy = 0, dpr = 1;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    const w = main.clientWidth, h = main.clientHeight;
    main.width = Math.round(w * dpr); main.height = Math.round(h * dpr);
    let s = Math.min(main.width / IS.W, main.height / IS.H);
    if (s >= 2) s = Math.floor(s);
    scale = s; ox = Math.round((main.width - IS.W * s) / 2); oy = Math.round((main.height - IS.H * s) / 2);
  }
  addEventListener('resize', resize);

  IS.applyTouch = function () {
    const el = document.getElementById('touch');
    const t = IS.settings.touch;
    const auto = matchMedia('(pointer: coarse)').matches;
    el.hidden = t === 2 || (t === 0 && !auto);
  };

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    IS.I.update(dt);
    const top = IS.top();
    if (top && top.update) top.update(dt);
    // the world keeps its effects alive under overlays
    const w = IS.stack[0];
    if (w instanceof IS.UI.WorldScene && top !== w) { IS.Wd.t += dt; if (IS.Wd.fade > 0) IS.Wd.fade = Math.max(0, IS.Wd.fade - dt * 3); }
    draw(dt);
    requestAnimationFrame(frame);
  }

  function draw(dt) {
    lctx.setTransform(1, 0, 0, 1, 0, 0);
    lctx.fillStyle = '#000'; lctx.fillRect(0, 0, IS.W, IS.H);
    for (const s of IS.stack) if (s.drawLo) s.drawLo(lctx);
    if (IS.S && IS.stack[0] instanceof IS.UI.WorldScene) IS.Wd.postGlitch(lo, lctx, IS.Wd.glitch);

    mctx.setTransform(1, 0, 0, 1, 0, 0);
    mctx.fillStyle = '#05040a'; mctx.fillRect(0, 0, main.width, main.height);
    mctx.imageSmoothingEnabled = false;
    mctx.drawImage(lo, ox, oy, IS.W * scale, IS.H * scale);
    if (IS.settings.crt) {
      mctx.fillStyle = 'rgba(0,0,0,0.22)';
      const step = Math.max(2, Math.round(scale));
      for (let y = oy; y < oy + IS.H * scale; y += step) mctx.fillRect(ox, y, IS.W * scale, Math.max(1, step / 2));
    }
    mctx.setTransform(scale, 0, 0, scale, ox, oy);
    for (const s of IS.stack) if (s.drawUI) s.drawUI(mctx);
    IS.UI.drawToasts(mctx, dt);
  }

  function boot() {
    try { IS.fontFallback = ![...document.fonts].some((f) => f.family.replace(/["']/g, '') === 'VT323' && f.status === 'loaded'); } catch (e) { IS.fontFallback = true; }
    resize();
    IS.applyTouch();
    IS.I.bindTouch(document.getElementById('touch'));
    IS.push(new IS.UI.TitleScene());
    requestAnimationFrame(frame);
  }
  if (document.fonts && document.fonts.ready) {
    let booted = false;
    const go = () => { if (!booted) { booted = true; boot(); } };
    document.fonts.load('12px VT323').then(go, go);
    setTimeout(go, 1500);
  } else boot();

  // debug hook for automated tests
  IS.debug = { canvas: main, lo };
})(window.IS);
