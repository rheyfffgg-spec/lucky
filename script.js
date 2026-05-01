(() => {
  const cfg = window.SITE_CONFIG;

  // --- Apply config to DOM ---
  const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
  set('brand-text', cfg.brand);
  set('hero-kicker', cfg.hero.kicker);
  set('hero-title', cfg.hero.title);
  set('hero-desc', cfg.hero.description);
  set('contacts-text', cfg.contacts.text);
  set('footer-brand', cfg.brand);
  set('footer-domain', cfg.domain);
  document.title = `${cfg.brand} — мини-игра в браузере`;

  const email = document.getElementById('contacts-email');
  if (email) { email.textContent = cfg.contacts.email; email.href = `mailto:${cfg.contacts.email}`; }

  const bp = document.getElementById('btn-primary');
  if (bp) { bp.textContent = cfg.buttons.primary.label; bp.href = cfg.buttons.primary.href; }
  const bs = document.getElementById('btn-secondary');
  if (bs) { bs.textContent = cfg.buttons.secondary.label; bs.href = cfg.buttons.secondary.href; }

  const cta = document.getElementById('header-cta');
  if (cta) { cta.textContent = cfg.cta.label; cta.href = cfg.cta.href; }

  const nav = document.getElementById('nav');
  if (nav) {
    nav.innerHTML = '';
    cfg.nav.forEach(item => {
      const a = document.createElement('a');
      a.href = item.href; a.textContent = item.label;
      nav.appendChild(a);
    });
  }

  // --- Game ---
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const timeEl = document.getElementById('time');
  const bestEl = document.getElementById('best');
  const startBtn = document.getElementById('start');

  const W = canvas.width, H = canvas.height;
  let targets = [];
  let score = 0;
  let timeLeft = cfg.game.durationSec;
  let running = false;
  let lastSpawn = 0;
  let timerInt = null;

  let best = parseInt(localStorage.getItem('white-kol-best') || '0', 10);
  bestEl.textContent = best;

  function spawn() {
    const r = 22 + Math.random() * 14;
    targets.push({
      x: r + Math.random() * (W - 2 * r),
      y: r + Math.random() * (H - 2 * r),
      r,
      born: performance.now(),
      life: cfg.game.targetLifeMs,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(59, 130, 246, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    const now = performance.now();
    targets = targets.filter(t => now - t.born < t.life);
    targets.forEach(t => {
      const age = (now - t.born) / t.life;
      const alpha = 1 - age;
      const grd = ctx.createRadialGradient(t.x, t.y, 2, t.x, t.y, t.r);
      grd.addColorStop(0, `rgba(147, 197, 253, ${alpha})`);
      grd.addColorStop(1, `rgba(29, 78, 216, ${alpha * 0.2})`);
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }

  function loop(t) {
    if (!running) return;
    if (t - lastSpawn > cfg.game.spawnEveryMs) {
      spawn();
      lastSpawn = t;
    }
    draw();
    requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    score = 0; timeLeft = cfg.game.durationSec; targets = [];
    scoreEl.textContent = '0';
    timeEl.textContent = timeLeft;
    running = true;
    lastSpawn = 0;
    requestAnimationFrame(loop);
    timerInt = setInterval(() => {
      timeLeft--;
      timeEl.textContent = timeLeft;
      if (timeLeft <= 0) stop();
    }, 1000);
    startBtn.textContent = 'Идёт раунд...';
    startBtn.disabled = true;
  }

  function stop() {
    running = false;
    clearInterval(timerInt);
    if (score > best) {
      best = score;
      localStorage.setItem('white-kol-best', String(best));
      bestEl.textContent = best;
    }
    startBtn.textContent = 'Старт';
    startBtn.disabled = false;
    draw();
  }

  function hit(mx, my) {
    if (!running) return;
    for (let i = targets.length - 1; i >= 0; i--) {
      const t = targets[i];
      const dx = mx - t.x, dy = my - t.y;
      if (dx * dx + dy * dy <= t.r * t.r) {
        targets.splice(i, 1);
        score++;
        scoreEl.textContent = score;
        return;
      }
    }
  }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    const p = e.touches ? e.touches[0] : e;
    return { x: (p.clientX - rect.left) * sx, y: (p.clientY - rect.top) * sy };
  }

  canvas.addEventListener('click', e => { const p = getPos(e); hit(p.x, p.y); });
  canvas.addEventListener('touchstart', e => { e.preventDefault(); const p = getPos(e); hit(p.x, p.y); }, { passive: false });
  startBtn.addEventListener('click', start);

  draw();
})();
