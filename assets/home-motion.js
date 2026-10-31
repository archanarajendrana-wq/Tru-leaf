/* Homepage GSAP scenes. Layered on top of the base reveals in index.html. */
(() => {
  if (!window.gsap || !window.ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(ScrollTrigger);

  // 1. Scroll-scrubbed word fill on the sustainability headline
  const title = document.getElementById('missionText');
  if (title && !title.dataset.split) {
    title.dataset.split = '1';
    // keep any <br> line breaks authored in the markup
    title.innerHTML = title.innerHTML.split(/<br[^>]*>/i)
      .map((line) => line.trim().split(/\s+/).map((w) => `<span class="word">${w}</span>`).join(' '))
      .join('<br class="mission-title__br" />');
    gsap.fromTo(title.querySelectorAll('.word'), { opacity: 0.18 }, {
      opacity: 1, ease: 'none', stagger: 0.12,
      scrollTrigger: { trigger: title, start: 'top 80%', end: 'bottom 50%', scrub: 0.6 },
    });
  }

  // 2. Buying timeline: line is drawn by scroll, steps light up as it passes
  const steps = document.querySelector('.buying-steps');
  if (steps) {
    const items = gsap.utils.toArray('.buying-steps li');
    steps.classList.add('gsap-line');
    steps.style.setProperty('--line', 0);
    ScrollTrigger.create({
      trigger: steps, start: 'top 72%', end: 'bottom 70%', scrub: 0.6,
      onUpdate: (self) => {
        steps.style.setProperty('--line', self.progress);
        items.forEach((li, i) => li.classList.toggle('is-active', self.progress >= i / (items.length - 1) - 0.02));
      },
    });
  }

  // 3. Tractor field expands from an inset card to full bleed as you arrive
  const fig = document.getElementById('impactFigure');
  if (fig) {
    gsap.fromTo(fig, { scale: 0.9, borderRadius: 36 }, {
      scale: 1, borderRadius: 0, ease: 'none', transformOrigin: '50% 50%',
      scrollTrigger: { trigger: '.impact', start: 'top 90%', end: 'top 20%', scrub: 0.6 },
    });
    gsap.from('.impact-cta', {
      y: 50, opacity: 0, duration: 0.7, ease: 'power3.out',
      scrollTrigger: { trigger: '.impact', start: 'top 35%', once: true },
    });
  }

  // 4. Capabilities: photo slides in from the left, cards from the right
  gsap.from('#capRow .cap-figure', { x: -50, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '#capRow', start: 'top 80%', once: true } });
  gsap.from('#capRow .cap-col', { x: 50, duration: 0.8, ease: 'power3.out', stagger: 0.1,
    scrollTrigger: { trigger: '#capRow', start: 'top 80%', once: true } });

  // 5. Certificate badges flip in
  gsap.from('.cert-badge-circle', { rotationY: 90, scale: 0.7, duration: 0.7, ease: 'back.out(1.6)', stagger: 0.08,
    transformPerspective: 600, scrollTrigger: { trigger: '.certs-row', start: 'top 85%', once: true } });

  // 6a. Sourcing photo: opens up from a rounded inset window while the image eases out of a zoom
  const sMedia = document.querySelector('.sourcing-figure-media');
  if (sMedia) {
    gsap.fromTo(sMedia, { clipPath: 'inset(14% 10% 14% 10% round 36px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 36px)', ease: 'none', // end on the frame's own corner radius so the corners stay round
      scrollTrigger: { trigger: '#sourcingFigure', start: 'top 100%', end: 'top 55%', scrub: 0.6 },
    });
    // end at 1.08, not 1: motion.js enlarges this image by 1.08 so its parallax shift never exposes the frame behind it
    gsap.fromTo(sMedia.querySelector('img'), { scale: 1.3 }, {
      scale: 1.08, ease: 'none',
      scrollTrigger: { trigger: '#sourcingFigure', start: 'top 100%', end: 'top 55%', scrub: 0.6 },
    });
  }

  // 6. Sourcing card slides over the photo
  gsap.from('.sourcing-card', { y: 40, x: -30, opacity: 0, duration: 0.7, ease: 'power3.out',
    scrollTrigger: { trigger: '#sourcingFigure', start: 'top 45%', once: true } });

  // 7. Sourcing headline: lines lift in from behind a mask
  const st = document.querySelector('.sourcing-title');
  if (st) {
    st.style.overflow = 'hidden';
    gsap.from(st, { yPercent: 20, duration: 0.8, ease: 'power4.out',
      scrollTrigger: { trigger: '.sourcing-head', start: 'top 82%', once: true } });
  }

  ScrollTrigger.refresh();
})();
