/* ═══════════════════════════════════════════════════════════════
   EMAILJS CONFIGURATION
   ───────────────────────────────────────────────────────────────
   1. Sign up at https://www.emailjs.com and create a free account.
   2. Create an Email Service (Gmail, Outlook, etc.) → copy the Service ID.
   3. Create an Email Template → copy the Template ID.
      Template variables to reference in your template:
        {{from_name}}    → sender's name (maps to the "name" field)
        {{from_email}}   → sender's email (maps to the "email" field)
        {{message}}      → message body (maps to the "message" field)
   4. Go to Account → copy your Public Key.
   5. Replace the three placeholder strings below with your real values.
   ─────────────────────────────────────────────────────────────── */
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY_HERE';   // ← paste Public Key
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID_HERE';   // ← paste Service ID
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID_HERE';  // ← paste Template ID


/* ═══════════════════════════════════════════════════════════════
   EMAILJS INIT
═══════════════════════════════════════════════════════════════ */
(function initEmailJS() {
  if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }
})();


/* ═══════════════════════════════════════════════════════════════
   NAVBAR — ACTIVE SECTION HIGHLIGHTING ON SCROLL
═══════════════════════════════════════════════════════════════ */
(function initNavHighlight() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  function getActiveSection() {
    const scrollY = window.scrollY;
    const navHeight = document.getElementById('navbar').offsetHeight;
    let current = '';

    sections.forEach(section => {
      const top = section.offsetTop - navHeight - 60;
      if (scrollY >= top) {
        current = section.id;
      }
    });

    return current;
  }

  function updateActiveLink() {
    const active = getActiveSection();
    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href').replace('#', '');
      if (href === active) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();
})();


/* ═══════════════════════════════════════════════════════════════
   NAVBAR — HAMBURGER MENU TOGGLE (MOBILE)
═══════════════════════════════════════════════════════════════ */
(function initHamburger() {
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  function openMenu() {
    hamburger.classList.add('open');
    mobileMenu.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  mobileLinks.forEach(link => link.addEventListener('click', closeMenu));
})();


/* ═══════════════════════════════════════════════════════════════
   SCROLL-IN ANIMATIONS — INTERSECTION OBSERVER
   Triggers the .visible class on .animate-on-scroll elements
   when they enter the viewport, producing a fade-up effect.
═══════════════════════════════════════════════════════════════ */
(function initScrollAnimations() {
  const targets = document.querySelectorAll('.animate-on-scroll');

  if (!('IntersectionObserver' in window)) {
    // Fallback: just make everything visible
    targets.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  targets.forEach(el => observer.observe(el));
})();


/* ═══════════════════════════════════════════════════════════════
   STAGGER CARDS — project cards and skill groups animate in
   with a slight delay between siblings for a cascade effect.
═══════════════════════════════════════════════════════════════ */
(function initStagger() {
  const staggerGroups = [
    '.projects-grid .project-card',
    '.skills-grid .skill-group',
    '.timeline .timeline-entry',
  ];

  staggerGroups.forEach(selector => {
    const items = document.querySelectorAll(selector);
    items.forEach((item, i) => {
      item.style.transitionDelay = `${i * 80}ms`;
    });
  });
})();


/* ═══════════════════════════════════════════════════════════════
   CONTACT FORM — EMAILJS SUBMISSION
═══════════════════════════════════════════════════════════════ */
(function initContactForm() {
  const form       = document.getElementById('contactForm');
  const status     = document.getElementById('formStatus');
  const submitBtn  = document.getElementById('submitBtn');
  const btnText    = document.getElementById('btnText');

  if (!form) return;

  function setStatus(msg, type) {
    status.textContent = msg;
    status.className = 'form-status ' + type;
  }

  function setLoading(loading) {
    submitBtn.disabled = loading;
    btnText.textContent = loading ? 'Sending…' : 'Send Message';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name    = form.name.value.trim();
    const email   = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message) {
      setStatus('Please fill in all fields.', 'error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('Please enter a valid email address.', 'error');
      return;
    }

    if (typeof emailjs === 'undefined') {
      setStatus('Email service unavailable. Try emailing directly.', 'error');
      return;
    }

    setLoading(true);
    setStatus('', '');

    const templateParams = {
      from_name:  name,
      from_email: email,
      message:    message,
    };

    emailjs
      .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
      .then(function () {
        setStatus('Message sent!', 'success');
        form.reset();
      })
      .catch(function () {
        setStatus('Something went wrong. Try emailing directly.', 'error');
      })
      .finally(function () {
        setLoading(false);
      });
  });
})();
