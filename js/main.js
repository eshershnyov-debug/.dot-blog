/* .dot blog — скрипти */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ===== Дані: додавайте нові статті сюди ===== */
  const CATS = ['Усі', 'Технології', 'Дизайн', 'Суспільство', 'Культура'];
  const ARTICLES = [{
    title: 'Чому ми так любимо темну тему: наука, звичка і трохи магії',
    excerpt: 'Темний режим давно перестав бути примхою розробників. Розбираємося, чому він так припав до душі користувачам і коли справді допомагає очам.',
    category: 'Технології', date: '2026-10-21', read: 3, url: 'article.html'
  },

  {
  title: 'Як філологія допоможе стати справжнім журналістом — .dot blog',
  excerpt: 'Тут мав би бути текст але його немає. Тому що це демо-сторінка, яка показує, як виглядатиме стаття на сайті.',
  category: 'Переклад',
  date: '2026-11-03',
  read: 5,
  url: 'demo-page.html',
  img: 'https://univerpl.com.ua/wp-content/uploads/2021/04/unnamed-file.jpeg',
},


];

  const fmt = d => new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d));
  const plural = n => { const a = n % 10, b = n % 100; return a === 1 && b !== 11 ? 'матеріал' : a > 1 && a < 5 && (b < 10 || b > 20) ? 'матеріали' : 'матеріалів'; };

  /* ===== Тема ===== */
  const btn = $('#theme');
  const label = () => btn && btn.setAttribute('aria-label', root.dataset.theme === 'dark' ? 'Увімкнути світлу тему' : 'Увімкнути темну тему');
  const setTheme = t => {
    root.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch (e) {}
    label(); window.dispatchEvent(new Event('themechange'));
  };
  label();
  btn && btn.addEventListener('click', e => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    if (!document.startViewTransition || reduce) return setTheme(next);
    const b = btn.getBoundingClientRect();
    const x = e.clientX || b.left + b.width / 2, y = e.clientY || b.top + b.height / 2;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.startViewTransition(() => setTheme(next)).ready.then(() =>
      root.animate({ clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 750, easing: 'cubic-bezier(.4,0,.2,1)', pseudoElement: '::view-transition-new(root)' }));
  });

  /* ===== Поява при скролі ===== */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .12 }) : null;
  const observe = () => document.querySelectorAll('.rv:not(.in)').forEach(el => io ? io.observe(el) : el.classList.add('in'));

  /* ===== Стрічка ===== */
  const feed = $('#feed');
  if (feed) {
    let cat = 'Усі', q = '';
    const chips = $('#chips');
    chips.innerHTML = CATS.map(c => `<button class="chip" type="button" aria-pressed="${c === 'Усі'}">${c}</button>`).join('');
    const card = (a, i) => `<a class="card rv${i === 0 ? ' feat' : ''}" href="${a.url}" style="--d:${i * 90}ms">
      <div class="media">${a.img ? `<img class="cover" src="${a.img}" alt="">` : '<div class="cover"></div>'}</div></div>
      <div class="body"><div class="meta"><span class="tag">${a.category}</span>
      <time datetime="${a.date}">${fmt(a.date)}</time><span>${a.read} хв читання</span></div>
      <h3>${a.title}</h3><p>${a.excerpt}</p><span class="more">Читати статтю</span></div></a>`;
    const render = () => {
      const list = ARTICLES.filter(a => (cat === 'Усі' || a.category === cat) && (a.title + a.excerpt).toLowerCase().includes(q));
      $('#count').textContent = `${list.length} ${plural(list.length)}`;
      feed.innerHTML = list.length ? list.map(card).join('')
        : '<p class="empty">Тут поки порожньо. Оберіть іншу рубрику або змініть пошуковий запит.</p>';
      observe();
    };
    chips.addEventListener('click', e => {
      const b = e.target.closest('.chip'); if (!b) return;
      chips.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', c === b));
      cat = b.textContent; render();
    });
    $('#search').addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); render(); });
    render();
  }

  /* ===== Інтерактивна сітка з крапок у герої ===== */
  const cv = $('#dots');
  if (cv) {
    const ctx = cv.getContext('2d'), S = 30;
    let W, H, mx = -999, my = -999, active = false, t = 0, raf = 0, col = {};
    const colors = () => { const s = getComputedStyle(root); col = { base: s.getPropertyValue('--dotgrid'), hot: s.getPropertyValue('--accent'), pop: s.getPropertyValue('--dot') }; };
    const size = () => { const d = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
    const draw = () => {
      ctx.clearRect(0, 0, W, H); t += .012;
      if (!active) { mx = W * (.5 + .38 * Math.sin(t * .9)); my = H * (.5 + .3 * Math.sin(t * 1.3 + 1)); }
      for (let x = S / 2; x < W; x += S) for (let y = S / 2; y < H; y += S) {
        const k = Math.max(0, 1 - Math.hypot(x - mx, y - my) / 170);
        ctx.fillStyle = k > .55 ? col.pop : k > 0 ? col.hot : col.base;
        ctx.globalAlpha = k > 0 ? .35 + k * .65 : 1;
        ctx.beginPath(); ctx.arc(x, y, 1.4 + k * k * 6, 0, 6.283); ctx.fill();
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    const start = () => { cancelAnimationFrame(raf); draw(); };
    const hero = cv.parentElement;
    hero.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; active = true; });
    hero.addEventListener('pointerleave', () => active = false);
    addEventListener('resize', () => { size(); if (reduce) draw(); });
    addEventListener('themechange', () => { colors(); if (reduce) draw(); });
    colors(); size();
    if (reduce) draw();
    else new IntersectionObserver(([e]) => e.isIntersecting ? start() : cancelAnimationFrame(raf)).observe(hero);
  }

  /* ===== Стаття: індикатор читання і копіювання посилання ===== */
  const bar = $('#progress');
  if (bar) {
    const upd = () => { const h = root.scrollHeight - innerHeight; bar.style.transform = `scaleX(${h > 0 ? Math.min(scrollY / h, 1) : 0})`; };
    addEventListener('scroll', upd, { passive: true }); upd();
  }
  const copy = $('#copy');
  copy && copy.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(location.href); copy.textContent = 'Посилання скопійовано'; }
    catch (e) { copy.textContent = 'Не вдалося скопіювати'; }
    setTimeout(() => copy.textContent = 'Скопіювати посилання', 2200);
  });

  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
  observe();
})();
