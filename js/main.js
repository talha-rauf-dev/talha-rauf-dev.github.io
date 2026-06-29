/* ════════════════════════════════════════════════════════════════
   EMAILJS CREDENTIALS
   ────────────────────────────────────────────────────────────────
   1. Sign up at https://www.emailjs.com (free tier is enough).
   2. Create an Email Service (Gmail, Outlook, etc.).
      → Copy the Service ID.
   3. Create an Email Template. Use these variable names inside it:
        {{from_name}}   — the sender's name
        {{from_email}}  — the sender's email address
        {{message}}     — the message body
      → Copy the Template ID.
   4. Go to Account → API Keys.
      → Copy your Public Key.
   5. Paste each value into the constants below.
   ════════════════════════════════════════════════════════════════ */
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY_HERE';
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID_HERE';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID_HERE';


/* ════════════════════════════════════════════════════════════════
   EMAILJS — INIT
════════════════════════════════════════════════════════════════ */
if (typeof emailjs !== 'undefined') {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}


/* ════════════════════════════════════════════════════════════════
   THEME TOGGLE
   The head script already applied the saved class to <html> to
   prevent a flash. Here we just keep the icon in sync and wire
   the button click.
════════════════════════════════════════════════════════════════ */
(function initTheme() {
  const btn  = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  if (!btn || !icon) return;

  function syncIcon() {
    const light = document.documentElement.classList.contains('light-mode');
    icon.className = light ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }

  syncIcon(); // set icon to match whatever the head script applied

  btn.addEventListener('click', () => {
    const isNowLight = document.documentElement.classList.toggle('light-mode');
    localStorage.setItem('theme', isNowLight ? 'light' : 'dark');
    syncIcon();
  });
})();


/* ════════════════════════════════════════════════════════════════
   MOBILE HAMBURGER
════════════════════════════════════════════════════════════════ */
(function initHamburger() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobMenu');
  if (!btn || !menu) return;

  function close() {
    btn.classList.remove('open');
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
  }

  btn.addEventListener('click', () => {
    const opening = !menu.classList.contains('open');
    if (opening) {
      btn.classList.add('open');
      menu.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      menu.setAttribute('aria-hidden', 'false');
    } else {
      close();
    }
  });

  menu.querySelectorAll('.mob-link').forEach(link => {
    link.addEventListener('click', close);
  });
})();


/* ════════════════════════════════════════════════════════════════
   SIDEBAR NAV — active section highlight on scroll
════════════════════════════════════════════════════════════════ */
(function initNavHighlight() {
  const links    = document.querySelectorAll('.snav-link');
  const sections = document.querySelectorAll('section[id]');
  if (!links.length) return;

  function update() {
    const threshold = window.scrollY + window.innerHeight * 0.3;
    let current = sections[0] ? sections[0].id : '';

    sections.forEach(sec => {
      if (sec.offsetTop <= threshold) current = sec.id;
    });

    links.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();


/* ════════════════════════════════════════════════════════════════
   SCROLL REVEAL — INTERSECTION OBSERVER
   Only sections below the fold on load get the .reveal class.
   Sections already visible on load are not animated.
════════════════════════════════════════════════════════════════ */
(function initReveal() {
  const sections = document.querySelectorAll('.section');

  if (!('IntersectionObserver' in window)) {
    return; // sections are visible by default — no class = no animation
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top >= window.innerHeight * 0.95) {
      section.classList.add('reveal');
      observer.observe(section);
    }
  });
})();


/* ════════════════════════════════════════════════════════════════
   CONTACT FORM — EmailJS submission
════════════════════════════════════════════════════════════════ */
(function initContactForm() {
  const form    = document.getElementById('contactForm');
  const status  = document.getElementById('formStatus');
  const btn     = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  if (!form) return;

  function setStatus(msg, type) {
    status.textContent = msg;
    status.className   = 'form-status ' + type;
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
