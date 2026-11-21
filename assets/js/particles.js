(function () {
    'use strict';
    const cv = document.getElementById('bg-particles');
    if (!cv || !cv.getContext) return;
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, mouse = { x: -9999, y: -9999 };
    const P = [], COUNT = 70, LINK = 120;

    function accentRGB() {
        const c = (getComputedStyle(document.documentElement)
            .getPropertyValue('--accent') || '#2ee88f').trim();
        const m = c.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})/i);
        return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [46, 232, 143];
    }

    function size() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
    addEventListener('resize', size); size();
    addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
    addEventListener('mouseleave', function () { mouse.x = mouse.y = -9999; });

    function spawn() {
        return { x: Math.random() * W, y: Math.random() * H,
                 vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
                 life: 0, max: 300 + Math.random() * 400, r: 1 + Math.random() * 1.6 };
    }
    for (let i = 0; i < COUNT; i++) { const p = spawn(); p.life = Math.random() * p.max; P.push(p); }

    (function loop() {
        const [r, g, b] = accentRGB();
        ctx.clearRect(0, 0, W, H);
        for (const p of P) {
            p.x += p.vx; p.y += p.vy; p.life++;
            const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
            if (d < 110 && d > 0.1) { p.x += dx / d * 1.6; p.y += dy / d * 1.6; }
            if (p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20 || p.life > p.max) Object.assign(p, spawn());
            const a = Math.sin(Math.PI * p.life / p.max) * .8;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7);
            ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + a * .9 + ')';
            ctx.fill();
        }
        for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
            const a = P[i], c = P[j], d = Math.hypot(a.x - c.x, a.y - c.y);
            if (d < LINK) {
                ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(c.x, c.y);
                ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (1 - d / LINK) * .18 + ')';
                ctx.stroke();
            }
        }
        requestAnimationFrame(loop);
    })();
})();
