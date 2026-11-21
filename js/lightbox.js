/* Единый лайтбокс для всех страниц.
   Понимает два вида источников:
   - .shot (фигуры галереи) — подпись берёт из data-caption;
   - .screenshots img — подпись из alt (или data-caption, если задан).
   Разметку создаёт сам при первом клике. */
document.addEventListener('DOMContentLoaded', function () {
  const shots = [...document.querySelectorAll('.gallery .shot')];
  const imgs  = [...document.querySelectorAll('.project-page .screenshots img')];
  if (!shots.length && !imgs.length) return;

  let lb = null, img = null, cap = null, idx = 0, count = 0;

  function build() {
    lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.hidden = true;
    lb.innerHTML =
      '<button class="lb-close" aria-label="Закрыть">×</button>' +
      '<button class="lb-prev" aria-label="Предыдущий">‹</button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button class="lb-next" aria-label="Следующий">›</button>';
    document.body.appendChild(lb);
    img = lb.querySelector('img');
    cap = lb.querySelector('figcaption');
  }

  function show(i) {
    if (!lb) build();
    idx = (i + count) % count;
    let src, alt, caption;
    if (shots.length && shots[i]) {
      const s = shots[i];
      src = s.querySelector('img').src;
      alt = s.querySelector('img').alt;
      caption = s.dataset.caption;
    } else {
      const el = imgs[i];
      src = el.src;
      alt = el.alt;
      caption = el.dataset.caption || el.alt;
    }
    img.src = src;
    img.alt = alt;
    cap.textContent = caption;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function close() {
    if (!lb) return;
    lb.hidden = true;
    document.body.style.overflow = '';
  }

  /* Делегирование кликов: работает и для галереи, и для скринов */
  document.addEventListener('click', function (e) {
    if (shots.length) {
      const shot = e.target.closest ? e.target.closest('.shot') : null;
      if (shot && shots.includes(shot)) { count = shots.length; show(shots.indexOf(shot)); return; }
    }
    if (imgs.length) {
      const el = imgs.find(x => x === e.target);
      if (el) { count = imgs.length; show(imgs.indexOf(el)); return; }
    }
    if (!lb || lb.hidden) return;
    if (e.target.classList.contains('lb-close')) close();
    if (e.target.classList.contains('lb-prev')) { e.stopPropagation(); show(idx - 1); }
    if (e.target.classList.contains('lb-next')) { e.stopPropagation(); show(idx + 1); }
    if (e.target === lb) close();
  });

  addEventListener('keydown', function (e) {
    if (!lb || lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
});
