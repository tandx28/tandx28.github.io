// Every interaction on the site. `boot` runs on each page load,
// including navigations through Astro's view transitions. Listeners on things
// that persist across pages (nav, palette, backdrop, document) are attached
// once; anything tied to the current page is torn down before the next swap.

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));

let cleanups: (() => void)[] = [];
let globalsReady = false;

export function boot() {
  if (!globalsReady) {
    globalsReady = true;
    initTheme();
    initPalette();
    initScroll();
    initCopyEmail();
    document.addEventListener('astro:before-swap', () => {
      cleanups.forEach((fn) => fn());
      cleanups = [];
    });
  }
  initReveal();
  onScroll();
}

/* ---------- theme ---------- */

function currentTheme(): 'light' | 'dark' {
  const set = document.documentElement.dataset.theme;
  if (set === 'light' || set === 'dark') return set;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function toggleTheme() {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  const apply = () => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {
      /* storage blocked: the choice lasts for this page only */
    }
    window.dispatchEvent(new Event('themechange'));
  };
  // A circular wipe from the toggle where the browser supports it.
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (doc.startViewTransition && !reduced()) doc.startViewTransition(apply);
  else apply();
  return next;
}

function initTheme() {
  document.addEventListener('click', (e) => {
    const t = (e.target as Element).closest('[data-theme-toggle]');
    if (t) toggleTheme();
  });
}

/* ---------- command palette ---------- */

function initPalette() {
  const root = $('[data-palette]');
  if (!root) return;
  const input = $<HTMLInputElement>('input', root)!;
  const items = $$<HTMLLIElement>('li', root);
  const empty = $('.empty', root)!;
  let sel = 0;
  let lastFocus: HTMLElement | null = null;

  const visible = () => items.filter((li) => !li.hidden);
  const mark = () => {
    const v = visible();
    items.forEach((li) => li.classList.remove('sel'));
    if (v.length) {
      sel = (sel + v.length) % v.length;
      v[sel].classList.add('sel');
      v[sel].scrollIntoView({ block: 'nearest' });
    }
  };
  const filter = () => {
    const q = input.value.trim().toLowerCase();
    items.forEach((li) => {
      li.hidden = !!q && !li.textContent!.toLowerCase().includes(q);
    });
    empty.hidden = visible().length > 0;
    sel = 0;
    mark();
  };
  const open = () => {
    lastFocus = document.activeElement as HTMLElement;
    root.hidden = false;
    input.value = '';
    filter();
    requestAnimationFrame(() => input.focus());
  };
  const close = () => {
    root.hidden = true;
    lastFocus?.focus?.();
  };
  const run = (li: HTMLLIElement) => {
    const el = li.firstElementChild as HTMLElement;
    close();
    el.click();
  };

  document.addEventListener('keydown', (e) => {
    const typing = (e.target as HTMLElement).closest('input, textarea, [contenteditable]');
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      root.hidden ? open() : close();
    } else if (e.key === '/' && !typing && root.hidden) {
      e.preventDefault();
      open();
    } else if (!root.hidden) {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowDown') {
        e.preventDefault();
        sel++;
        mark();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        sel--;
        mark();
      } else if (e.key === 'Enter') {
        const v = visible();
        if (v[sel]) {
          e.preventDefault();
          run(v[sel]);
        }
      }
    }
  });
  input.addEventListener('input', filter);
  root.addEventListener('click', (e) => {
    const target = e.target as Element;
    if (target.closest('[data-close-palette]')) return close();
    const btn = target.closest<HTMLButtonElement>('button[data-action]');
    if (!btn) {
      if (target.closest('a')) close();
      return;
    }
    if (btn.dataset.action === 'theme') toggleTheme();
    if (btn.dataset.action === 'copy-email') copy(btn.dataset.email ?? '', 'Email copied');
    close();
  });
  items.forEach((li, i) =>
    li.addEventListener('mousemove', () => {
      const v = visible();
      const idx = v.indexOf(li);
      if (idx !== sel && idx >= 0) {
        sel = idx;
        mark();
      }
      void i;
    }),
  );
  document.addEventListener('click', (e) => {
    if ((e.target as Element).closest('[data-open-palette]')) open();
  });
}

/* ---------- copy + toast ---------- */

function toast(msg: string) {
  let t = $('#toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.setAttribute('role', 'status');
    Object.assign(t.style, {
      position: 'fixed',
      left: '50%',
      bottom: '28px',
      transform: 'translate(-50%, 20px)',
      opacity: '0',
      padding: '10px 16px',
      borderRadius: '10px',
      background: 'var(--text)',
      color: 'var(--bg)',
      font: '13px var(--font-mono)',
      zIndex: '95',
      transition: 'opacity .3s, transform .4s var(--ease)',
      pointerEvents: 'none',
    } satisfies Partial<CSSStyleDeclaration>);
    document.body.appendChild(t);
  }
  t.textContent = msg;
  requestAnimationFrame(() => {
    t!.style.opacity = '1';
    t!.style.transform = 'translate(-50%, 0)';
  });
  window.clearTimeout(Number(t.dataset.timer));
  t.dataset.timer = String(
    window.setTimeout(() => {
      t!.style.opacity = '0';
      t!.style.transform = 'translate(-50%, 20px)';
    }, 1800),
  );
}

async function copy(text: string, msg: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast(msg);
    return true;
  } catch {
    toast(text);
    return false;
  }
}

function initCopyEmail() {
  document.addEventListener('click', async (e) => {
    const b = (e.target as Element).closest<HTMLElement>('[data-copy-email]');
    if (!b) return;
    await copy(b.dataset.email ?? '', 'Email copied to clipboard');
    const before = b.textContent;
    b.textContent = 'Copied';
    setTimeout(() => {
      b.textContent = before;
    }, 2000);
  });
}

/* ---------- scroll: nav border and active link ---------- */

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    const doc = document.documentElement;
    doc.classList.toggle('scrolled', scrollY > 20);

    let active = '';
    for (const s of $$('main section[id]')) {
      if (s.getBoundingClientRect().top < innerHeight * 0.4) active = s.id;
    }
    $$('.nav ul a').forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `/#${active}`));
  });
}

function initScroll() {
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
}

/* ---------- reveal ---------- */

function initReveal() {
  const els = $$('[data-reveal]');
  if (reduced() || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  els.forEach((el) => io.observe(el));
  cleanups.push(() => io.disconnect());
}

