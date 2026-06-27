/* ═══════════════════════════════════════════════════════════════
   EMAILJS CONFIGURATION
   ───────────────────────────────────────────────────────────────
   1. Create a free account at https://www.emailjs.com
   2. Add an Email Service (Gmail, Outlook, etc.) → copy Service ID
   3. Create an Email Template with these variables:
        {{from_name}}   — sender's name
        {{from_email}}  — sender's email
        {{message}}     — message body
      Copy the Template ID.
   4. Account → API Keys → copy your Public Key
   5. Paste your values into the three constants below.
   ─────────────────────────────────────────────────────────────── */
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY_HERE';
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID_HERE';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID_HERE';


/* ═══════════════════════════════════════════════════════════════
   EMAILJS INIT
═══════════════════════════════════════════════════════════════ */
if (typeof emailjs !== 'undefined') {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}


/* ═══════════════════════════════════════════════════════════════
   CANVAS STARFIELD BACKGROUND
═══════════════════════════════════════════════════════════════ */
(function initStarfield() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const STAR_COUNT = 140;
  const stars = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createStar() {
    return {
      x:      Math.random() * canvas.width,
      y:      Math.random() * canvas.height,
      r:      Math.random() * 1.2 + 0.3,
      speed:  Math.random() * 0.15 + 0.05,
      alpha:  Math.random() * 0.6 + 0.2,
      dir:    Math.random() > 0.5 ? 1 : -1,
      dAlpha: (Math.random() * 0.003 + 0.001),
    };
  }

  function initStars() {
    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push(createStar());
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.alpha += s.dAlpha * s.dir;
      if (s.alpha >= 0.8 || s.alpha <= 0.1) s.dir *= -1;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(100, 255, 218, ${s.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  initStars();
  draw();
  window.addEventListener('resize', () => { resize(); initStars(); });
})();


/* ═══════════════════════════════════════════════════════════════
   CUSTOM CURSOR (desktop only)
═══════════════════════════════════════════════════════════════ */
(function initCursor() {
  const el = document.getElementById('cursor');
  if (!el || window.matchMedia('(max-width: 900px)').matches) return;

  let mx = -100, my = -100; // actual mouse pos
  let cx = -100, cy = -100; // cursor rendered pos (lags behind)
  const LAG = 0.12;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  });

  // Expand on interactive elements
  const selectors = 'a, button, input, textarea, .project-row, .snav-link, .social-link';
  document.querySelectorAll(selectors).forEach(node => {
    node.addEventListener('mouseenter', () => el.classList.add('expanded'));
    node.addEventListener('mouseleave', () => el.classList.remove('expanded'));
  });

  (function loop() {
    cx += (mx - cx) * LAG;
    cy += (my - cy) * LAG;
    el.style.left = cx + 'px';
    el.style.top  = cy + 'px';
    requestAnimationFrame(loop);
  })();
})();


/* ═══════════════════════════════════════════════════════════════
   MOBILE HAMBURGER
═══════════════════════════════════════════════════════════════ */
(function initHamburger() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  });

  menu.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });
})();


/* ═══════════════════════════════════════════════════════════════
   SIDEBAR NAV — ACTIVE SECTION ON SCROLL
═══════════════════════════════════════════════════════════════ */
(function initNavHighlight() {
  const navLinks = document.querySelectorAll('.snav-link');
  const sections = document.querySelectorAll('section[id]');
  if (!navLinks.length) return;

  function update() {
    const scrollY = window.scrollY + window.innerHeight * 0.25;
    let current = sections[0]?.id || '';

    sections.forEach(sec => {
      if (sec.offsetTop <= scrollY) current = sec.id;
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();


/* ═══════════════════════════════════════════════════════════════
   SCROLL REVEAL — INTERSECTION OBSERVER
   .reveal elements animate in when they enter the viewport.
   Project rows stagger by 80ms between siblings.
═══════════════════════════════════════════════════════════════ */
(function initReveal() {
  const targets = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('visible'));
    return;
  }

  // Stagger siblings in .project-list
  document.querySelectorAll('.project-row').forEach((row, i) => {
    row.style.transitionDelay = `${i * 80}ms`;
  });

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
  );

  targets.forEach(el => observer.observe(el));
})();


/* ═══════════════════════════════════════════════════════════════
   BACK TO TOP
═══════════════════════════════════════════════════════════════ */
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ═══════════════════════════════════════════════════════════════
   CONTACT FORM
═══════════════════════════════════════════════════════════════ */
(function initContactForm() {
  const form    = document.getElementById('contactForm');
  const status  = document.getElementById('formStatus');
  const btn     = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  if (!form) return;

  function setStatus(msg, type) {
    status.textContent  = msg;
    status.className    = 'form-status ' + type;
  }

  function setLoading(on) {
    btn.disabled        = on;
    btnText.textContent = on ? 'Sending…' : 'Send Message';
  }

  form.addEventListener('submit', e => {
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
      setStatus('Something went wrong. Try emailing directly.', 'error');
      return;
    }

    setLoading(true);
    setStatus('', '');

    emailjs
      .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        from_name:  name,
        from_email: email,
        message:    message,
      })
      .then(() => {
        setStatus('Message sent!', 'success');
        form.reset();
      })
      .catch(() => {
        setStatus('Something went wrong. Try emailing directly.', 'error');
      })
      .finally(() => {
        setLoading(false);
      });
  });
})();
