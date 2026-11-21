document.addEventListener('DOMContentLoaded', function () {

    function safe(name, fn) {
        try { fn(); } catch (e) { console.error('[index.js] блок «' + name + '» упал:', e); }
    }

    document.documentElement.classList.add('reveal-ready');

    /* ---- Preloader ---- */
    safe('preloader', function () {
        const pre = document.getElementById('preloader');
        if (!pre) return;
        const hide = function () {
            if (pre.classList.contains('is-hidden')) return;
            pre.classList.add('is-hidden');
            document.body.classList.remove('is-loading');
            setTimeout(function () { if (pre.parentNode) pre.remove(); }, 700);
        };
        if (document.readyState === 'complete') hide();
        else window.addEventListener('load', hide);
        setTimeout(hide, 8000);
    });

    /* ---- Красный пульс точек ---- */
    safe('pulse', function () {
        const props = {
            spaceDiameter: 32, dotDiameter: 14,
            wavelength: 100, velocity: .02, direction: 1, displacement: 1
        };
        const cv = document.getElementById('pulse-canvas');
        const hero = document.getElementById('home');
        if (!cv || !hero || !cv.getContext) return;
        const ctx = cv.getContext('2d');
        let w = 0, h = 0, dotsList = [];

        function dist(x, y) {
            const dx = w / 2 - x, dy = h / 2 - y;
            return Math.sqrt(dx * dx + dy * dy);
        }
        function init() {
            w = cv.width = hero.offsetWidth;
            h = cv.height = hero.offsetHeight;
            dotsList = [];
            const countX = Math.floor(w / props.spaceDiameter);
            const countY = Math.floor(h / props.spaceDiameter);
            const startX = (props.spaceDiameter + w - countX * props.spaceDiameter) / 2;
            const startY = (props.spaceDiameter + h - countY * props.spaceDiameter) / 2;
            let disp = props.spaceDiameter / 4 * props.displacement;
            for (let j = 0; j < countY; j++) {
                disp = -disp;
                const y = startY + j * props.spaceDiameter;
                for (let i = 0; i < countX; i++) {
                    const x = startX + i * props.spaceDiameter + disp;
                    dotsList.push({ x: x, y: y, scale: dist(x, y) / props.wavelength });
                }
            }
        }
        function loop() {
            ctx.clearRect(0, 0, w, h);
            for (let k = 0; k < dotsList.length; k++) {
                const d = dotsList[k];
                d.scale -= props.velocity * props.direction;
                const s = 1 - Math.abs(Math.sin(d.scale));
                const o = Math.round((1 - s) * 255);
                ctx.beginPath();
                ctx.arc(d.x, d.y, (props.dotDiameter / 2) * s, 0, 2 * Math.PI, false);
                ctx.fillStyle = 'rgba(255,' + o + ',' + o + ',' + s + ')';
                ctx.fill();
            }
            requestAnimationFrame(loop);
        }
        window.addEventListener('resize', init);
        init();
        loop();
    });

    /* ---- Плавный скролл ---- */
    safe('smoothscroll', function () {
        const DUR = 1000, NAV_H = 56;
        function easeInOut(t) { return .5 - Math.cos(Math.PI * t) / 2; }
        function scrollToY(y) {
            const start = window.scrollY;
            const delta = y - start;
            const t0 = performance.now();
            (function step(t) {
                const k = Math.min((t - t0) / DUR, 1);
                window.scrollTo(0, start + delta * easeInOut(k));
                if (k < 1) requestAnimationFrame(step);
            })(t0);
        }
        document.addEventListener('click', function (e) {
            const a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
            if (!a) return;
            const id = a.getAttribute('href').slice(1);
            const target = document.getElementById(id);
            if (!target) return;
            e.preventDefault();
            const y = target.getBoundingClientRect().top + window.scrollY - NAV_H + 1;
            scrollToY(Math.max(0, y));
        });
    });

    /* ---- Scrollspy ---- */
    safe('spy', function () {
        const links = Array.prototype.slice.call(document.querySelectorAll('.nav-list a[data-spy]'));
        if (!links.length) return;
        const byId = {};
        links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
        const spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting && byId[en.target.id]) {
                    links.forEach(function (a) { a.classList.remove('is-active'); });
                    byId[en.target.id].classList.add('is-active');
                }
            });
        }, { rootMargin: '-40% 0px -55% 0px' });
        Object.keys(byId).forEach(function (id) {
            const sec = document.getElementById(id);
            if (sec) spy.observe(sec);
        });
    });

    /* ---- Scroll to top ---- */
    safe('scrollup', function () {
        const up = document.querySelector('.scroll-up');
        if (!up) return;
        window.addEventListener('scroll', function () {
            up.classList.toggle('is-visible', window.scrollY > 100);
        }, { passive: true });
    });

    /* ---- Круги навыков ---- */
    safe('charts', function () {
        const R = 60, C = 2 * Math.PI * R;
        function runChart(chart) {
            const bar = chart.querySelector('.bar');
            const num = chart.querySelector('.percent');
            if (!bar || !num) return;
            const pct = Number(chart.getAttribute('data-percent')) || 0;
            bar.style.transition = 'none';
            bar.style.strokeDasharray = C;
            bar.style.strokeDashoffset = C;
            void bar.getBoundingClientRect();
            bar.style.transition = 'stroke-dashoffset 2s ease';
            requestAnimationFrame(function () {
                bar.style.strokeDashoffset = C * (1 - pct / 100);
            });
            const t0 = performance.now(), dur = 2000;
            (function tick(t) {
                const k = Math.min((t - t0) / dur, 1);
                num.textContent = Math.round(pct * k);
                if (k < 1) requestAnimationFrame(tick);
            })(t0);
        }
        const chartIO = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (en) {
                if (en.isIntersecting) { runChart(en.target); obs.unobserve(en.target); }
            });
        }, { threshold: .4 });
        document.querySelectorAll('.chart').forEach(function (c) { chartIO.observe(c); });
    });

    /* ---- Ротатор отзывов ---- */
    safe('rotator', function () {
        const items = Array.prototype.slice.call(document.querySelectorAll('.cbp-qtcontent'));
        const prog = document.querySelector('.cbp-qtprogress');
        let qi = 0;
        if (items.length < 2) return;
        setInterval(function () {
            items[qi].classList.remove('is-current');
            qi = (qi + 1) % items.length;
            items[qi].classList.add('is-current');
            if (prog) {
                prog.style.animation = 'none';
                void prog.offsetWidth;
                prog.style.animation = '';
            }
        }, 8000);
    });

    /* ---- Reveal ---- */
    safe('reveal', function () {
        const revIO = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (en) {
                if (en.isIntersecting) {
                    en.target.classList.add('is-visible');
                    obs.unobserve(en.target);
                }
            });
        }, { threshold: .15 });
        document.querySelectorAll('.reveal').forEach(function (el) { revIO.observe(el); });
    });

    /* ---- Форма: дизайн, без отправки ---- */
    safe('form', function () {
        const f = document.getElementById('contact-form');
        if (f) f.addEventListener('submit', function (e) { e.preventDefault(); });
    });

    /* ---- i18n: словарь трёх языков ---- */
    const I18N = {
        ru: {
            _title: 'Десперо — фулстек-разработчик',
            _desc: 'Сайты, которые быстро грузятся, продают и запоминаются. Разработка под ключ: от первого пикселя до деплоя.',
            intro_pre: 'Привет, я Десперо. Я делаю',
            intro_h1: 'Сайты, Которые Работают',
            intro_sub: 'Грузятся быстро. Запоминаются сразу. От первого пикселя до деплоя.',
            nav_home: 'Главная', nav_services: 'Услуги', nav_works: 'Работы',
            nav_skills: 'Навыки', nav_reviews: 'Отзывы', nav_contact: 'Контакты',
            srv_head: 'Что Я Делаю Для Вас',
            srv_sub: 'Четыре вещи, которые я делаю так, что клиенты перестают искать других. Листайте — работы ниже это докажут.',
            srv1_t: 'Веб-дизайн',
            srv1_d: 'Посетитель решает за 50 миллисекунд, остаться или уйти. Я делаю так, чтобы эти миллисекунды работали на вас.',
            srv2_t: 'Вёрстка и код',
            srv2_d: 'Чистый код, быстрая загрузка, ноль отговорок. Один сайт — одинаково безупречен на любом экране.',
            srv3_t: 'Айдентика',
            srv3_d: 'Логотип — это ещё не бренд. Я строю образ, который узнают с первого взгляда — и к которому возвращаются.',
            srv4_t: 'Консультация',
            srv4_d: 'Не знаете, с чего начать? Полчаса прямого разговора экономят месяц проб и ошибок.',
            pf_head: 'Избранные Работы',
            pf_sub: 'Никаких макетов — только запущенные проекты. Реальные люди пользуются ими прямо сейчас. Откройте любую карточку и убедитесь.',
            pf1_d: 'Фотогалерея под ключ — заказ друга, который теперь живёт в продакшене, а не в чате «ну как там?»',
            pf2_d: 'Интерактивные рабочие столы на Rainmeter, Lua и canvas. Софт, который делает десктоп личным.',
            pf3_d: 'Сайт Minecraft-сервера, который приводит игроков, а не просто «существует в интернете».',
            sk_head: 'Цифры, А Не Слова',
            sk_sub: 'Проценты ниже — честные. Поэтому ни один не равен сотне: всегда есть куда расти, и мне это нравится.',
            sk1: 'Программирование', sk2: 'Дизайн', sk3: 'Маркетинг',
            cta_h: 'Есть Идея? Давайте Воплотим.',
            cta_d: 'Открыт для фриланс-проектов. Отвечаю в течение 24 часов — и нет, это не маркетинговая присказка.',
            cta_btn: 'Работать Со Мной',
            tst_head: 'Слова Клиентов',
            tst_sub: 'Лучшая реклама — когда о тебе говорят другие. Без купюр, без оплаты, без сценариев.',
            tst1_q: 'Десперо понял, чего я хочу, быстрее, чем я сам это объяснил. Сайт, который он собрал, теперь работает на мой бизнес.',
            tst1_f: 'Клиент, Photo Gallery',
            tst2_q: 'Стопроцентная удовлетворённость — редкая штука. Он получил её с первой попытки и без тысячи правок.',
            tst2_f: 'Клиент, My Workplace',
            ct_head: 'Напишите Мне',
            ct_sub: 'Три поля, две минуты, одно сообщение. Идея — ваша; всё остальное — моё.',
            ph_name: 'Ваше имя',
            ph_email: 'Email — куда придёт мой ответ',
            ph_msg: 'Что хотите создать?',
            ct_btn: 'Отправить Сообщение',
            foot_made1: 'Сделано с', foot_made2: 'и кофеином в Кибермире',
            foot_copy: '© 2026 Десперо · 1–5 — смена темы, для тех кто в теме'
        },
        en: {
            _title: 'Despero — Full Stack Web Developer',
            _desc: 'Websites that load fast, sell and stick in memory. Full-cycle development: from the first pixel to deploy.',
            intro_pre: "Hi, I'm Despero. I build",
            intro_h1: 'Websites That Work',
            intro_sub: 'Fast to load. Hard to ignore. From first pixel to deploy.',
            nav_home: 'Home', nav_services: 'Services', nav_works: 'Works',
            nav_skills: 'Skills', nav_reviews: 'Reviews', nav_contact: 'Contact',
            srv_head: 'What I Do For You',
            srv_sub: "Four things I do so well that clients stop looking for anyone else. Scroll on — the works below prove it.",
            srv1_t: 'Web Design',
            srv1_d: 'A visitor decides in 50 milliseconds whether to stay. I make those milliseconds work for you.',
            srv2_t: 'Clean Code',
            srv2_d: 'Clean code, quick load, zero excuses. One site — flawless on any screen.',
            srv3_t: 'Branding',
            srv3_d: 'A logo is not a brand yet. I build an identity people recognize — and return to.',
            srv4_t: 'Consultation',
            srv4_d: 'Not sure where to start? Half an hour of straight talk saves a month of guessing.',
            pf_head: 'Selected Works',
            pf_sub: 'No mockups — only shipped projects. Real people use them right now. Open any card and see for yourself.',
            pf1_d: "A photo gallery built from scratch — a friend's order that now lives in production, not in a 'how's it going?' chat.",
            pf2_d: 'Interactive desktops with Rainmeter, Lua and canvas. Software that makes a desktop personal.',
            pf3_d: "A Minecraft server site that brings players in — not just 'exists on the internet'.",
            sk_head: 'Numbers, Not Words',
            sk_sub: "The percentages below are honest — that's why none of them is a hundred. There's always room to grow, and I like it that way.",
            sk1: 'Programming', sk2: 'Design', sk3: 'Marketing',
            cta_h: "Got An Idea? Let's Ship It.",
            cta_d: "Now open for freelance projects. I reply within 24 hours — and no, that's not marketing talk.",
            cta_btn: 'Hire Me',
            tst_head: 'Words From Clients',
            tst_sub: 'The best advertising is someone else saying it for you. Unedited, unpaid, unscripted.',
            tst1_q: 'Despero understood what I wanted faster than I could explain it. The site he built now runs my business.',
            tst1_f: 'Client, Photo Gallery',
            tst2_q: '100% satisfaction is a rare thing. He got it — on the first try, without a thousand revisions.',
            tst2_f: 'Client, My Workplace',
            ct_head: 'Drop Me A Line',
            ct_sub: 'Three fields, two minutes, one message. The idea is yours; everything after that is mine.',
            ph_name: 'Your name',
            ph_email: 'Email — where my reply lands',
            ph_msg: 'What do you want to build?',
            ct_btn: 'Send Message',
            foot_made1: 'Made with', foot_made2: 'and caffeine in CyberWorld',
            foot_copy: '© 2026 Despero · 1–5 — switch theme, for those in the know'
        },
        ja: {
            _title: 'Despero — フルスタック開発者',
            _desc: '高速で読み込み、印象に残り、成果につながるウェブサイト。最初のピクセルからデプロイまでフルサポート。',
            intro_pre: 'こんにちは、デスペロです。私が作るのは',
            intro_h1: '動くウェブサイト',
            intro_sub: '高速読み込み。一目で印象。最初のピクセルからデプロイまで。',
            nav_home: 'ホーム', nav_services: 'サービス', nav_works: '実績',
            nav_skills: 'スキル', nav_reviews: '評価', nav_contact: '連絡',
            srv_head: '私がお届けすること',
            srv_sub: '四つの分野で、他を探す必要がなくなる仕事をします。スクロールして実績をご覧ください。',
            srv1_t: 'ウェブデザイン',
            srv1_d: '訪問者は50ミリ秒で滞在するか決めます。その一瞬をあなたの味方にします。',
            srv2_t: 'クリーンなコード',
            srv2_d: 'クリーンなコード、高速な表示、言い訳なし。どの画面でも完璧に動くサイトを。',
            srv3_t: 'ブランディング',
            srv3_d: 'ロゴだけがブランドではありません。記憶に残り、また訪れたくなる存在感を作ります。',
            srv4_t: 'コンサルティング',
            srv4_d: '何から始めるべきか迷っていますか？30分の率直な相談で、1か月の試行錯誤を省けます。',
            pf_head: '選ばれた実績',
            pf_sub: 'モックではなく、公開済みのプロジェクトだけ。今まさに誰かが使っています。カードを開いてご確認ください。',
            pf1_d: '友人の依頼で作ったフォトギャラリー。チャットの中だけでなく、本番環境で生きています。',
            pf2_d: 'Rainmeter、Lua、Canvasで作るインタラクティブなデスクトップ。デスクトップを自分色にするソフト。',
            pf3_d: 'プレイヤーを呼び込むマインクラフトサーバーのサイト。ただ「存在する」だけではありません。',
            sk_head: '数字で語ります',
            sk_sub: '下の数字は正直なものです。だから誰も100ではありません。成長の余地は常にあり、それが好きです。',
            sk1: 'プログラミング', sk2: 'デザイン', sk3: 'マーケティング',
            cta_h: 'アイデアはありますか？形にしましょう。',
            cta_d: 'フリーランスの案件を募集中です。24時間以内に返信します。これは宣伝文句ではなく事実です。',
            cta_btn: '始めましょう',
            tst_head: 'お客様の声',
            tst_sub: '最高の宣伝は他人の言葉です。編集なし、報酬なし、台本なし。',
            tst1_q: '説明し終える前に、私の求めているものを理解してくれました。彼が作ったサイトが今、ビジネスを動かしています。',
            tst1_f: 'クライアント、Photo Gallery',
            tst2_q: '満足度100％は稀なもの。彼は初回で、何百回もの修正もなしにそれを達成しました。',
            tst2_f: 'クライアント、My Workplace',
            ct_head: 'メッセージを送る',
            ct_sub: '入力は3項目、2分、メッセージ1通。アイデアはあなたのもの、あとは私にお任せ。',
            ph_name: 'お名前',
            ph_email: '返信を受け取るメールアドレス',
            ph_msg: '何を作りたいですか？',
            ct_btn: '送信',
            foot_made1: '❤とカフェインで作られました', foot_made2: '',
            foot_copy: '© 2026 Despero · 1–5でテーマ切替'
        }
    };

    /* ---- Плавающие кнопки: язык и палитра ---- */
    safe('picker', function () {
        const THEMES = [
            { cls: '',            name: 'Neon',  color: '#2ee88f' },
            { cls: 'theme-fern',  name: 'Fern',  color: '#8FB8AE' },
            { cls: 'theme-orbit', name: 'Orbit', color: '#4fd8e8' },
            { cls: 'theme-xber',  name: 'Xber',  color: '#ff6a3c' },
            { cls: 'theme-ex8',   name: 'EX8',   color: '#ff3b30' }
        ];
        const LANGS = [
            { code: 'ru', label: 'РУС' },
            { code: 'en', label: 'ENG' },
            { code: 'ja', label: '日本語' }
        ];

        function currentTheme() {
            return document.documentElement.className
                .split(/\s+/).filter(function (c) { return c.indexOf('theme-') === 0; })[0] || '';
        }
        function applyTheme(i) {
            const t = THEMES[i];
            const keep = document.documentElement.className
                .split(/\s+/).filter(function (c) { return c !== 'reveal-ready' && c.indexOf('theme-') !== 0; });
            document.documentElement.className = keep.concat(t.cls ? [t.cls] : []).concat(['reveal-ready']).join(' ').trim();
            try { localStorage.setItem('despero-theme', t.cls); } catch (e) {}
            Array.prototype.forEach.call(document.querySelectorAll('.fab-theme'), function (d, k) {
                d.classList.toggle('is-active', k === i);
            });
        }
        function applyLang(code) {
            const dict = I18N[code] || I18N.ru;
            document.documentElement.lang = code;
            document.title = dict._title;
            const meta = document.querySelector('meta[name="description"]');
            if (meta) meta.setAttribute('content', dict._desc);
            Array.prototype.forEach.call(document.querySelectorAll('[data-i18n]'), function (el) {
                const key = el.getAttribute('data-i18n');
                if (dict[key] !== undefined) el.textContent = dict[key];
            });
            Array.prototype.forEach.call(document.querySelectorAll('[data-i18n-ph]'), function (el) {
                const key = el.getAttribute('data-i18n-ph');
                if (dict[key] !== undefined) el.setAttribute('placeholder', dict[key]);
            });
            try { localStorage.setItem('despero-lang', code); } catch (e) {}
            Array.prototype.forEach.call(document.querySelectorAll('.fab-lang'), function (b) {
                b.classList.toggle('is-active', b.getAttribute('data-lang') === code);
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
        wrap.setAttribute('aria-label', 'Язык и тема оформления');
        document.body.appendChild(wrap);

        function makeSlot(icon, label) {
            const slot = document.createElement('div');
            slot.className = 'fab-slot';
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'fab';
            btn.innerHTML = icon;
            btn.setAttribute('aria-label', label);
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
            return menu;
        }

        const langMenu = makeSlot('🌐', 'Выбор языка');
        LANGS.forEach(function (l) {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'fab-item fab-lang';
            b.textContent = l.label;
            b.setAttribute('data-lang', l.code);
            b.addEventListener('click', function () { applyLang(l.code); closeAll(); });
            langMenu.appendChild(b);
        });

        const themeMenu = makeSlot('🎨', 'Выбор темы');
        THEMES.forEach(function (t, i) {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'fab-item fab-theme';
            b.style.setProperty('--dot', t.color);
            b.title = t.name + ' (' + (i + 1) + ')';
            b.addEventListener('click', function () { applyTheme(i); closeAll(); });
            themeMenu.appendChild(b);
        });

        // подсветка сохранённых значений
        let savedLang = null;
        try { savedLang = localStorage.getItem('despero-lang'); } catch (e) {}
        applyLang(savedLang && I18N[savedLang] ? savedLang : 'ru');
        const ti = THEMES.findIndex(function (t) { return t.cls === currentTheme(); });
        if (ti >= 0) {
            Array.prototype.forEach.call(document.querySelectorAll('.fab-theme'), function (d, k) {
                d.classList.toggle('is-active', k === ti);
            });
        }

        // клавиши 1-5 — темы
        document.addEventListener('keydown', function (e) {
            const n = parseInt(e.key, 10);
            if (n >= 1 && n <= THEMES.length) applyTheme(n - 1);
        });
    });
});
