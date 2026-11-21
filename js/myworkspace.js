/* My Workspace: переключатель A/B, particle-фон, лайтбокс галереи */
document.addEventListener('DOMContentLoaded', function () {

  /* ---- Переключатель варианта галереи (A/B) + запоминание выбора ---- */
(function () {
  const btns = document.querySelectorAll('.vs-btn');
  const gallery = document.getElementById('gallery');
  if (!btns.length || !gallery) return;

  const saved = localStorage.getItem('gallery-variant');
  if (saved === 'a' || saved === 'b') {
    gallery.dataset.variant = saved;
    btns.forEach(x => x.classList.toggle('is-active', x.dataset.variant === saved));
  }

  btns.forEach(b => b.addEventListener('click', () => {
    btns.forEach(x => x.classList.remove('is-active'));
    b.classList.add('is-active');
    gallery.dataset.variant = b.dataset.variant;
    try { localStorage.setItem('gallery-variant', b.dataset.variant); } catch (e) {}
  }));
})();


  /* ---- Particle network: фон страницы ---- */
  const cv = document.getElementById('bg-particles');
  if (cv) {
    const ctx = cv.getContext('2d');
    let W, H, mouse = { x: -9999, y: -9999 };
    const P = [], COUNT = 70, LINK = 120;

    function size() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
    addEventListener('resize', size); size();
    addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; });

    function spawn() {
      return { x: Math.random() * W, y: Math.random() * H,
               vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
               life: 0, max: 300 + Math.random() * 400, r: 1 + Math.random() * 1.6 };
    }
    for (let i = 0; i < COUNT; i++) { const p = spawn(); p.life = Math.random() * p.max; P.push(p); }

    (function loop() {
      ctx.clearRect(0, 0, W, H);
      for (const p of P) {
        p.x += p.vx; p.y += p.vy; p.life++;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < 110 && d > 0.1) { p.x += dx / d * 1.6; p.y += dy / d * 1.6; }
        if (p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20 || p.life > p.max) Object.assign(p, spawn());
        const a = Math.sin(Math.PI * p.life / p.max) * .8;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7);
        ctx.fillStyle = 'rgba(46, 232, 139, ' + a * .9 + ')'; ctx.fill();
      }
      for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
        const a = P[i], b = P[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = 'rgba(46, 232, 139, ' + (1 - d / LINK) * .18 + ')'; ctx.stroke();
        }
      }
      requestAnimationFrame(loop);
    })();
  }
});
