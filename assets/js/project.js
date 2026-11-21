(function () {
    'use strict';

    function safe(name, fn) {
        try { fn(); } catch (e) { console.error('[project.js] блок «' + name + '» упал:', e); }
    }

    /* ---- Particle network: фон страницы, красится в цвет темы ---- */
    safe('particles', function () {
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
    });

    /* ---- Переключатель вариантов галереи A/B + запоминание выбора ---- */
    safe('variants', function () {
        const btns = Array.prototype.slice.call(document.querySelectorAll('.vs-btn'));
        const gallery = document.getElementById('gallery');
        if (!btns.length || !gallery) return;

        let saved = null;
        try { saved = localStorage.getItem('gallery-variant'); } catch (e) {}
        if (saved === 'a' || saved === 'b') {
            gallery.dataset.variant = saved;
            btns.forEach(function (x) { x.classList.toggle('is-active', x.getAttribute('data-variant') === saved); });
        }

        btns.forEach(function (b) {
            b.addEventListener('click', function () {
                btns.forEach(function (x) { x.classList.remove('is-active'); });
                b.classList.add('is-active');
                gallery.dataset.variant = b.getAttribute('data-variant');
                try { localStorage.setItem('gallery-variant', b.getAttribute('data-variant')); } catch (e) {}
            });
        });
    });

    /* ---- Палитра: те же 5 тем, что на главной ---- */
    safe('theme', function () {
        const THEMES = [
            { cls: '',            name: 'Neon',  color: '#2ee88f' },
            { cls: 'theme-fern',  name: 'Fern',  color: '#8FB8AE' },
            { cls: 'theme-orbit', name: 'Orbit', color: '#4fd8e8' },
            { cls: 'theme-xber',  name: 'Xber',  color: '#ff6a3c' },
            { cls: 'theme-ex8',   name: 'EX8',   color: '#ff3b30' }
        ];

        function applyTheme(i) {
            const t = THEMES[i];
            THEMES.forEach(function (x) {
                if (x.cls) document.documentElement.classList.remove(x.cls);
            });
            if (t.cls) document.documentElement.classList.add(t.cls);
            try { localStorage.setItem('despero-theme', t.cls); } catch (e) {}
            Array.prototype.forEach.call(document.querySelectorAll('.fab-theme'), function (d, k) {
                d.classList.toggle('is-active', k === i);
            });
        }

        function closeAll() {
            Array.prototype.forEach.call(document.querySelectorAll('.fab-slot.is-open'), function (s) {
                s.classList.remove('is-open');
            });
        }
        document.addEventListener('click', function (e) {
            if (!e.target.closest || !e.target.closest('.fab-slot')) closeAll();
        });

        const wrap = document.createElement('div');
        wrap.className = 'fab-wrap';
        document.body.appendChild(wrap);

        const slot = document.createElement('div');
        slot.className = 'fab-slot';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'fab';
        btn.innerHTML = '🎨';
        btn.setAttribute('aria-label', 'Выбор темы');
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const wasOpen = slot.classList.contains('is-open');
            closeAll();
            if (!wasOpen) slot.classList.add('is-open');
        });
        const menu = document.createElement('div');
        menu.className = 'fab-menu';
        slot.appendChild(btn);
        slot.appendChild(menu);
        wrap.appendChild(slot);

        THEMES.forEach(function (t, i) {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'fab-item fab-theme';
            b.style.setProperty('--dot', t.color);
            b.title = t.name + ' (' + (i + 1) + ')';
            b.addEventListener('click', function () { applyTheme(i); closeAll(); });
            menu.appendChild(b);
        });

        let saved = '';
        try { saved = localStorage.getItem('despero-theme') || ''; } catch (e) {}
        const cur = THEMES.findIndex(function (t) { return t.cls === saved; });
        if (cur >= 0) {
            Array.prototype.forEach.call(document.querySelectorAll('.fab-theme'), function (d, k) {
                d.classList.toggle('is-active', k === cur);
            });
        }

        document.addEventListener('keydown', function (e) {
            const n = parseInt(e.key, 10);
            if (n >= 1 && n <= THEMES.length) applyTheme(n - 1);
        });
    });
})();
