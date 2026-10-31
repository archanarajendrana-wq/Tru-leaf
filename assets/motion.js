/* Shared motion layer: scroll progress, parallax, curtain image reveals, timeline draw.
   Uses the individual `translate` / `scale` CSS properties so it never fights with
   GSAP or CSS `transform` already used on the same elements. */
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const root = document.documentElement;
  root.classList.add('js-motion');

  // ---- inertia scrolling (drives GSAP ScrollTrigger when present)
  if (window.Lenis) {
    const lenis = new Lenis({
      lerp: 0.12,
      wheelMultiplier: 1,
      anchors: true,
      prevent: (node) => node.closest && node.closest('.overlay__panel, .search-suggest, textarea'),
    });
    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  // ---- scroll progress bar
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  // ---- parallax targets: [selector, speed, scale]
  const IMG_TARGETS = [
    ['.sourcing-figure-media img', 0.10, 1.08],
    ['.cap-figure img', 0.08, 1.14],
    ['.impact-figure img', 0.12, 1.16],
    ['.mission-card--photo img', 0.06, 1.12],
    ['.careers-open__banner > img', 0.10, 1.16],
    ['.careers-apply__photo', 0.05, 1.1],
    ['.about-cta__bg', 0.10, 1.16],
    ['img[src*="about-origin-figure"]', 0.08, 1.14],
    ['[data-parallax]', 0.10, 1.12],
  ];
  const BG_TARGETS = ['.careers-hero', '.supply-hero', '.catalogue-hero'];

  const items = [];
  IMG_TARGETS.forEach(([sel, speed, scale]) => {
    document.querySelectorAll(sel).forEach((el) => {
      const p = el.parentElement;
      if (p && getComputedStyle(p).overflow === 'visible') p.style.overflow = 'hidden';
      el.style.scale = String(scale);
      el.style.willChange = 'translate';
      items.push({ el, speed, type: 'img' });
    });
  });
  BG_TARGETS.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => {
      if (getComputedStyle(el).backgroundImage !== 'none') items.push({ el, speed: 0.18, type: 'bg' });
    });
  });

  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
    items.forEach(({ el, speed, type }) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const offset = (r.top + r.height / 2 - vh / 2) * -speed;
      if (type === 'img') el.style.translate = `0 ${offset.toFixed(1)}px`;
      else el.style.backgroundPosition = `center calc(50% + ${offset.toFixed(1)}px)`;
    });
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  update();

  // ---- one-shot reveals (curtain images, timeline draw)
  // A curtain image starts fully clipped, which the browser counts as "not visible", so it must be
  // observed through its (unclipped) parent, or it would never open.
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { (e.target._reveal || e.target).classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.05 });
  document
    .querySelectorAll('.curtain, .buying-steps, .careers-open__banner, .careers-apply__photo')
    .forEach((el) => {
      el.classList.add('curtain-ready');
      const clipped = el.matches('.curtain, .careers-open__banner, .careers-apply__photo');
      const watch = clipped && el.parentElement ? el.parentElement : el;
      if (watch !== el) watch._reveal = el;
      io.observe(watch);
    });

  // stacked timeline (≤920px): the list is tall, so each step reveals as it scrolls into view
  // instead of the whole list firing as soon as its first pixel appears. Harmless on desktop.
  const stepIo = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); stepIo.unobserve(e.target); }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.buying-steps li').forEach((li) => stepIo.observe(li));

})();
