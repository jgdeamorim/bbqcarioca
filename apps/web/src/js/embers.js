/* ── EMBER PARTICLES ── */
function initEmbers() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.getElementById('ember-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function rand(a, b) { return a + Math.random() * (b - a); }

  function spawnParticle() {
    return {
      x: rand(0, W),
      y: H + rand(10, 40),
      vx: rand(-0.5, 0.5),
      vy: rand(-1.2, -2.4),
      life: 1,
      decay: rand(0.004, 0.009),
      size: rand(1.5, 3.5),
      color: Math.random() > .5 ? '#FF6B35' : '#D9A441'
    };
  }

  for (let i = 0; i < 35; i++) {
    const p = spawnParticle();
    p.y = rand(0, H);
    p.life = rand(0.1, 1);
    particles.push(p);
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    if (particles.length < 55 && Math.random() < .35) particles.push(spawnParticle());
    particles = particles.filter(p => {
      p.x += p.vx + Math.sin(p.y * 0.02) * 0.3;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) return false;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life * 0.7;
      ctx.fill();
      ctx.globalAlpha = 1;
      return true;
    });
    requestAnimationFrame(tick);
  }
  tick();
}
