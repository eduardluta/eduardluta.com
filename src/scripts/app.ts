// Client behaviour: theme toggle + delayed newsletter popup.
// initApp() runs on first load and after every Astro view transition, so it must
// be idempotent and re-query freshly-swapped DOM each time. Module-level flags keep
// one-shot concerns (the 30s timer, document-level listeners) from re-arming.

const NL_KEY = 'el-newsletter';
const NL_EMAIL_KEY = 'el-newsletter-email';
const THEME_KEY = 'el-theme';
const OPEN_DELAY = 30000;

let timerArmed = false;
let docListenersBound = false;
let lastFocused: HTMLElement | null = null;

function nlState(): string {
  try {
    return localStorage.getItem(NL_KEY) || '';
  } catch {
    return '';
  }
}

function overlay(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-nl-overlay]');
}

function openNl() {
  const el = overlay();
  if (!el || el.getAttribute('data-open') === 'true') return;
  if (nlState() === 'dismissed' || nlState() === 'subscribed') return;
  lastFocused = document.activeElement as HTMLElement;
  el.hidden = false;
  el.setAttribute('data-open', 'true');
  // Lock background scroll + take the rest of the page out of the a11y tree.
  document.body.classList.add('nl-open');
  document.querySelector('.shell')?.setAttribute('inert', '');
  const email = el.querySelector<HTMLInputElement>('[data-nl-email]');
  window.setTimeout(() => email?.focus(), 30);
}

function closeNl(remember: boolean) {
  const el = overlay();
  if (!el) return;
  el.setAttribute('data-open', 'false');
  el.hidden = true;
  document.body.classList.remove('nl-open');
  document.querySelector('.shell')?.removeAttribute('inert');
  if (remember) {
    try {
      localStorage.setItem(NL_KEY, 'dismissed');
    } catch {
      /* ignore */
    }
  }
  lastFocused?.focus?.();
}

function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function reflectTheme(theme: string) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#15130f' : '#f7f4ee');
  document
    .querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')
    .forEach((b) => b.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false'));
}

function bindTheme() {
  reflectTheme(document.documentElement.getAttribute('data-theme') || 'light');
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const next = isDark ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* ignore */
      }
      reflectTheme(next);
    });
  });
}

function bindNewsletter() {
  const el = overlay();
  if (!el) return;

  const form = el.querySelector<HTMLFormElement>('[data-nl-form]');
  const doneEl = el.querySelector<HTMLElement>('[data-nl-done]');
  const emailEl = el.querySelector<HTMLInputElement>('[data-nl-email]');
  const errEl = el.querySelector<HTMLElement>('[data-nl-error]');
  const submitEl = el.querySelector<HTMLButtonElement>('[data-nl-submit]');
  const closeEl = el.querySelector<HTMLButtonElement>('[data-nl-close]');
  const stringsEl = document.querySelector<HTMLElement>('[data-nl-strings]');
  const strings = stringsEl ? JSON.parse(stringsEl.textContent || '{}') : {};
  const lang = document.documentElement.lang || 'en';

  closeEl?.addEventListener('click', () => closeNl(true));
  el.addEventListener('mousedown', (e) => {
    if (e.target === el) closeNl(true);
  });

  emailEl?.addEventListener('input', () => {
    emailEl.setAttribute('aria-invalid', 'false');
    if (errEl) errEl.textContent = '';
  });

  async function submit(e: Event) {
    e.preventDefault();
    if (!emailEl || !submitEl) return;
    const value = emailEl.value.trim();
    if (!isValidEmail(value)) {
      emailEl.setAttribute('aria-invalid', 'true');
      if (errEl) errEl.textContent = strings.invalid || 'Please enter a valid email.';
      emailEl.focus();
      return;
    }

    submitEl.disabled = true;
    const original = submitEl.textContent;
    submitEl.textContent = strings.sending || 'Subscribing…';
    if (errEl) errEl.textContent = '';

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value, lang, source: 'popup' }),
      });

      // 2xx = new signup; 409 = already subscribed. Both are a success for the user.
      if (res.ok || res.status === 409) {
        try {
          localStorage.setItem(NL_KEY, 'subscribed');
          localStorage.setItem(NL_EMAIL_KEY, value);
        } catch {
          /* ignore */
        }
        if (form) form.style.display = 'none';
        if (doneEl) doneEl.style.display = 'block';
        window.setTimeout(() => closeNl(false), 2800);
        return;
      }
      throw new Error(`HTTP ${res.status}`);
    } catch {
      if (errEl) errEl.textContent = strings.network || 'Something went wrong. Please try again.';
      submitEl.disabled = false;
      submitEl.textContent = original;
    }
  }

  form?.addEventListener('submit', submit);

  // Focus trap within the modal while open.
  el.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || el.getAttribute('data-open') !== 'true') return;
    const focusables = el.querySelectorAll<HTMLElement>(
      'button, [href], input, [tabindex]:not([tabindex="-1"])'
    );
    const visible = Array.from(focusables).filter((n) => n.offsetParent !== null);
    if (visible.length === 0) return;
    const first = visible[0];
    const last = visible[visible.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}

function bindDocOnce() {
  if (docListenersBound) return;
  docListenersBound = true;
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const el = overlay();
      if (el && el.getAttribute('data-open') === 'true') closeNl(true);
    }
  });
}

export function initApp() {
  bindTheme();
  bindNewsletter();
  bindDocOnce();

  if (!timerArmed && nlState() !== 'dismissed' && nlState() !== 'subscribed') {
    timerArmed = true;
    window.setTimeout(openNl, OPEN_DELAY);
  }
}
