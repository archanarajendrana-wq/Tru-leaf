const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('is-open');
  navToggle.classList.toggle('is-open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

const revealTargets = document.querySelectorAll('.reveal, .reveal-stagger');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  revealTargets.forEach((el) => el.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        // Reveal on intersect, or if a fast/jump scroll already carried the
        // element above the viewport before it ever intersected.
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0, rootMargin: '0px 0px -40px 0px' }
  );

  revealTargets.forEach((el) => observer.observe(el));
}

// product overlay: see assets/product-overlay.js

const contactForm = document.getElementById('contactForm');

if (contactForm) {
  const contactSuccess = document.getElementById('contactSuccess');
  const contactError = document.getElementById('contactError');
  const emailField = document.getElementById('contactEmail');
  const emailFieldWrap = document.getElementById('contactEmailField');
  const emailError = document.getElementById('contactEmailError');
  const submitBtn = contactForm.querySelector('.contact-card__submit');
  const sendAnotherBtn = document.getElementById('sendAnotherBtn');
  const tryAgainBtn = document.getElementById('tryAgainBtn');

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const showPanel = (panel) => {
    [contactForm, contactSuccess, contactError].forEach((p) => {
      p.hidden = p !== panel;
    });
  };

  const setEmailError = (hasError) => {
    emailFieldWrap.classList.toggle('contact-field--error', hasError);
    emailError.hidden = !hasError;
  };

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!contactForm.reportValidity()) return;

    const isValidEmail = emailPattern.test(emailField.value.trim());
    setEmailError(!isValidEmail);
    if (!isValidEmail) {
      emailField.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    window.sendForm('contact', contactForm).then((didSucceed) => {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
      showPanel(didSucceed ? contactSuccess : contactError);
    });
  });

  emailField.addEventListener('input', () => {
    if (emailFieldWrap.classList.contains('contact-field--error')) setEmailError(false);
  });

  sendAnotherBtn.addEventListener('click', () => {
    contactForm.reset();
    setEmailError(false);
    showPanel(contactForm);
  });

  tryAgainBtn.addEventListener('click', () => {
    showPanel(contactForm);
  });
}
