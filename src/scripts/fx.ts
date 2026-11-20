// Every interaction and animation on the site. `boot` runs on each page load,
// including navigations through Astro's view transitions. Listeners on things
// that persist across pages (nav, palette, backdrop, document) are attached
// once; anything tied to the current page is torn down before the next swap.

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => window.matchMedia('(pointer: fine)').matches;
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
    initPointerEffects();
    initScroll();
    initDots();
    initCopyEmail();
    document.addEventListener('astro:before-swap', () => {
      cleanups.forEach((fn) => fn());
      cleanups = [];
    });
  }
  initReveal();
  initScramble();
  initCounters();
  initRotator();
  initTerminal();
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
    b.classList.add('done');
    const label = $('.copy', b);
    if (label) label.textContent = 'copied ✓';
    setTimeout(() => {
      b.classList.remove('done');
      if (label) label.textContent = 'click to copy';
    }, 2000);
  });
}

/* ---------- spotlight, tilt, magnetic buttons ---------- */

function initPointerEffects() {
  let tilted: HTMLElement | null = null;
  let magnet: HTMLElement | null = null;

  document.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      const target = e.target as Element;

      const spot = target.closest<HTMLElement>('[data-spotlight], .btn');
      if (spot) {
        const r = spot.getBoundingClientRect();
        spot.style.setProperty('--mx', `${e.clientX - r.left}px`);
        spot.style.setProperty('--my', `${e.clientY - r.top}px`);
      }
      if (reduced()) return;

      const tilt = target.closest<HTMLElement>('[data-tilt]');
      if (tilted && tilted !== tilt) tilted.style.transform = '';
      tilted = tilt;
      if (tilt) {
        const r = tilt.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        const k = tilt.classList.contains('wide') ? 3 : 6;
        tilt.style.transform = `perspective(1100px) rotateX(${(-y * k).toFixed(2)}deg) rotateY(${(x * k).toFixed(2)}deg)`;
      }

      const mag = target.closest<HTMLElement>('[data-magnetic]');
      if (magnet && magnet !== mag) magnet.style.transform = '';
      magnet = mag;
      if (mag) {
        const r = mag.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        mag.style.transform = `translate(${dx * 0.18}px, ${dy * 0.28}px)`;
      }
    },
    { passive: true },
  );
  document.addEventListener('pointerleave', () => {
    if (tilted) tilted.style.transform = '';
    if (magnet) magnet.style.transform = '';
  });
}

/* ---------- scroll: progress bar, nav state, timeline, active link ---------- */

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    const doc = document.documentElement;
    const max = doc.scrollHeight - innerHeight;
    doc.style.setProperty('--progress', String(max > 0 ? scrollY / max : 0));
    doc.classList.toggle('scrolled', scrollY > 20);

    const tl = $('[data-timeline]');
    if (tl) {
      const r = tl.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.7 - r.top) / r.height));
      tl.style.setProperty('--tl', p.toFixed(3));
    }

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

/* ---------- text scramble ---------- */

const GLYPHS = '!<>-_\\/[]{}—=+*^?#01ABCDEFXYZ';

/** Decodes the text of every text node in `el` from random glyphs. */
function scramble(el: HTMLElement, duration = 900) {
  if (reduced() || el.dataset.scrambled) return;
  el.dataset.scrambled = '1';
  // Screen readers must hear the real words, not the random glyphs.
  const heading = el.closest<HTMLElement>('h1, h2, h3');
  if (heading && !heading.hasAttribute('aria-label')) heading.setAttribute('aria-label', heading.textContent!.replace(/\s+/g, ' ').trim());
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes: { node: Text; text: string }[] = [];
  while (walker.nextNode()) {
    const n = walker.currentNode as Text;
    if (n.data.trim()) nodes.push({ node: n, text: n.data });
  }
  const total = nodes.reduce((s, n) => s + n.text.length, 0);
  const start = performance.now();
  const frame = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    let offset = 0;
    for (const { node, text } of nodes) {
      let out = '';
      for (let i = 0; i < text.length; i++) {
        const settle = (offset + i) / total;
        const ch = text[i];
        out += ch === ' ' || t >= settle * 0.75 + 0.25 ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      node.data = out;
      offset += text.length;
    }
    if (t < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

function initScramble() {
  const hero = $('[data-scramble]');
  if (hero) setTimeout(() => scramble(hero, 1300), 250);

  const els = $$('[data-scramble-on-view]');
  if (!els.length || reduced()) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        scramble(en.target as HTMLElement, 800);
        io.unobserve(en.target);
      }
    },
    { threshold: 0.5 },
  );
  els.forEach((el) => io.observe(el));
  cleanups.push(() => io.disconnect());
}

/* ---------- number counters ---------- */

function initCounters() {
  const els = $$('[data-count]');
  if (!els.length || reduced()) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        io.unobserve(en.target);
        const el = en.target as HTMLElement;
        const to = Number(el.dataset.count);
        const dec = Number(el.dataset.decimals ?? 0);
        const suffix = el.dataset.suffix ?? '';
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / 1600);
          const eased = 1 - Math.pow(1 - t, 4);
          el.textContent = (to * eased).toFixed(dec) + suffix;
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    },
    { threshold: 0.6 },
  );
  els.forEach((el) => io.observe(el));
  cleanups.push(() => io.disconnect());
}

/* ---------- rotating words in the hero ---------- */

function initRotator() {
  const el = $('[data-rotate]');
  if (!el) return;
  const words: string[] = JSON.parse(el.dataset.rotate ?? '[]');
  if (words.length < 2) return;
  let i = 0;
  const id = window.setInterval(() => {
    i = (i + 1) % words.length;
    if (reduced()) {
      el.textContent = words[i];
      return;
    }
    delete el.dataset.scrambled;
    el.textContent = words[i];
    scramble(el, 600);
  }, 2600);
  cleanups.push(() => clearInterval(id));
}

/* ---------- background dot field ---------- */

function initDots() {
  const canvas = $<HTMLCanvasElement>('#dots');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;

  const GAP = 28;
  const RADIUS = 170;
  let w = 0;
  let h = 0;
  let dpr = 1;
  let dotColour = '';
  let accent = '';
  const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
  let running = false;
  let lastMove = 0;

  const readColours = () => {
    const cs = getComputedStyle(document.documentElement);
    dotColour = cs.getPropertyValue('--dot').trim() || 'rgba(148,163,184,.18)';
    accent = cs.getPropertyValue('--accent').trim() || '#5eead4';
  };
  const resize = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  };
  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    const ox = (w % GAP) / 2;
    const oy = (h % GAP) / 2;
    for (let y = oy; y < h; y += GAP) {
      for (let x = ox; x < w; x += GAP) {
        const dx = x - mouse.x;
        const dy = y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < RADIUS) {
          const f = 1 - d / RADIUS;
          const push = f * f * 16;
          const px = x + (dx / (d || 1)) * push;
          const py = y + (dy / (d || 1)) * push;
          ctx.globalAlpha = 0.25 + f * 0.75;
          ctx.fillStyle = accent;
          ctx.beginPath();
          ctx.arc(px, py, 1 + f * 1.4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.globalAlpha = 1;
          ctx.fillStyle = dotColour;
          ctx.fillRect(x - 0.75, y - 0.75, 1.5, 1.5);
        }
      }
    }
    ctx.globalAlpha = 1;
  };
  // Animates only while the pointer is easing toward its target, then stops.
  const loop = () => {
    mouse.x += (mouse.tx - mouse.x) * 0.14;
    mouse.y += (mouse.ty - mouse.y) * 0.14;
    draw();
    if (performance.now() - lastMove < 900 && !document.hidden) requestAnimationFrame(loop);
    else running = false;
  };

  readColours();
  resize();
  addEventListener('resize', resize, { passive: true });
  addEventListener('themechange', () => {
    readColours();
    draw();
  });
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
    readColours();
    draw();
  });
  if (reduced() || !finePointer()) return;
  addEventListener(
    'pointermove',
    (e) => {
      mouse.tx = e.clientX;
      mouse.ty = e.clientY;
      if (mouse.x < -1000) {
        mouse.x = mouse.tx;
        mouse.y = mouse.ty;
      }
      lastMove = performance.now();
      if (!running) {
        running = true;
        requestAnimationFrame(loop);
      }
    },
    { passive: true },
  );
}

/* ---------- interactive terminal ---------- */

type TermProject = { id: string; title: string; tagline: string; live: string | null; featured: boolean };
type TermData = { name: string; email: string; github: string; linkedin: string; resume: string; projects: TermProject[] };

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function initTerminal() {
  const screen = $('[data-terminal]');
  const dataEl = $('#term-data');
  if (!screen || !dataEl) return;
  const data: TermData = JSON.parse(dataEl.textContent ?? '{}');
  const out = $('.out', screen)!;
  const form = $<HTMLFormElement>('form', screen)!;
  const input = $<HTMLInputElement>('input', screen)!;
  const history: string[] = [];
  let hIdx = 0;
  let alive = true;
  cleanups.push(() => {
    alive = false;
  });

  const print = (html: string, cls = '') => {
    const div = document.createElement('div');
    if (cls) div.className = cls;
    div.innerHTML = html;
    out.appendChild(div);
    screen.scrollTop = screen.scrollHeight;
  };
  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');
  const find = (q: string) => {
    const k = slug(q);
    return data.projects.find((p) => slug(p.id).startsWith(k) || slug(p.title).startsWith(k));
  };

  const commands: Record<string, { help: string; run: (args: string[]) => void | string }> = {
    help: {
      help: 'list commands',
      run: () =>
        `<pre>${Object.entries(commands)
          .filter(([, c]) => c.help)
          .map(([k, c]) => `<span class="acc">${k.padEnd(10)}</span><span class="dim">${c.help}</span>`)
          .join('\n')}</pre>`,
    },
    whoami: {
      help: 'who is this',
      run: () =>
        `<span class="acc2">${esc(data.name)}</span> <span class="dim">· CS @ NUS · Singapore</span><br/>builds software with AI agents, and tests everything they write.`,
    },
    ls: {
      help: 'list projects',
      run: () =>
        `<pre>${data.projects
          .map((p) => `<span class="${p.featured ? 'acc' : 'dim'}">${p.id.padEnd(20)}</span><span class="dim ls-d">${esc(p.tagline)}</span>`)
          .join('\n')}</pre><span class="dim">try: </span>open gatebound`,
    },
    open: {
      help: 'open <project>',
      run: (a) => {
        if (!a[0]) return '<span class="warn">usage:</span> open &lt;project&gt;  (see ls)';
        const p = find(a.join(''));
        if (!p) return `<span class="warn">not found:</span> ${esc(a.join(' '))}`;
        setTimeout(() => (location.href = `/projects/${p.id}/`), 450);
        return `opening <span class="acc">${esc(p.title)}</span>…`;
      },
    },
    play: {
      help: 'play gatebound in a new tab',
      run: () => {
        const g = data.projects.find((p) => p.id === 'gatebound');
        if (g?.live) window.open(g.live, '_blank', 'noopener');
        return 'launching <span class="acc">Gatebound</span> ↗  good luck, hunter.';
      },
    },
    lab: {
      help: 'games and films built with AI',
      run: () =>
        `<pre>${data.projects
          .filter((p) => p.live?.startsWith('/lab/'))
          .map((p) => `<a href="${p.live}" target="_blank" rel="noopener">${p.id.padEnd(19)}</a><span class="dim ls-d">${esc(p.tagline)}</span>`)
          .join('\n')}</pre>`,
    },
    contact: {
      help: 'ways to reach me',
      run: () =>
        `<pre><span class="dim">email    </span><a href="mailto:${data.email}">${data.email}</a>\n<span class="dim">github   </span><a href="${data.github}" target="_blank" rel="noopener">${data.github.replace('https://', '')}</a>\n<span class="dim">linkedin </span><a href="${data.linkedin}" target="_blank" rel="noopener">${data.linkedin.replace('https://www.', '')}</a></pre>`,
    },
    resume: {
      help: 'open my résumé',
      run: () => {
        window.open(data.resume, '_blank', 'noopener');
        return 'opening résumé.pdf ↗';
      },
    },
    theme: {
      help: 'toggle light / dark',
      run: () => `theme set to <span class="acc">${toggleTheme()}</span>`,
    },
    neofetch: {
      help: 'system info',
      run: () =>
        `<pre><span class="acc">   ▄▀▀▄   </span>  <span class="acc2">dexun</span>@<span class="acc2">portfolio</span>
<span class="acc">  █ ▀▀ █  </span>  ─────────────────
<span class="acc">  █▄▄▄▄█  </span>  <span class="dim">os</span>      NUS CS, Year 1
<span class="acc">   █  █   </span>  <span class="dim">shell</span>   TS · Python · C# · Java
<span class="acc">  ▀▀  ▀▀  </span>  <span class="dim">uptime</span>  coding since 2021
            <span class="dim">focus</span>   SWE · cloud · security</pre>`,
    },
    clear: { help: 'clear the screen', run: () => void (out.innerHTML = '') },
    date: { help: '', run: () => new Date().toString() },
    echo: { help: '', run: (a) => esc(a.join(' ')) },
    sudo: { help: '', run: () => '<span class="warn">permission denied.</span> but you can <span class="acc">hire</span> me instead.' },
    hire: {
      help: '',
      run: () => {
        location.hash = '#contact';
        return 'great choice. scrolling to contact…';
      },
    },
    exit: { help: '', run: () => 'there is no escape. try <span class="acc">ls</span>.' },
  };
  commands.projects = { help: '', run: commands.ls.run };
  commands.about = { help: '', run: commands.whoami.run };

  const exec = (raw: string) => {
    const line = raw.trim();
    print(esc(line) || '&nbsp;', 'cmd');
    if (!line) return;
    history.push(line);
    hIdx = history.length;
    const [name, ...args] = line.split(/\s+/);
    const cmd = commands[name.toLowerCase()];
    const res = cmd ? cmd.run(args) : `<span class="warn">command not found:</span> ${esc(name)}. type <span class="acc">help</span>.`;
    if (res) print(res);
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    exec(input.value);
    input.value = '';
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault();
      hIdx = Math.max(0, hIdx - 1);
      input.value = history[hIdx];
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      hIdx = Math.min(history.length, hIdx + 1);
      input.value = history[hIdx] ?? '';
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const [n, ...rest] = input.value.split(' ');
      if (rest.length) {
        const p = find(rest.join(''));
        if (p) input.value = `${n} ${p.id}`;
      } else {
        const m = Object.keys(commands).filter((k) => k.startsWith(n) && commands[k].help);
        if (m.length === 1) input.value = m[0] + ' ';
      }
    }
  });
  screen.addEventListener('click', () => {
    if (!getSelection()?.toString()) input.focus({ preventScroll: true });
  });

  // Opening sequence: type two commands, then hand over.
  const script = ['whoami', 'ls'];
  if (reduced()) {
    script.forEach(exec);
    print('<span class="dim">type</span> <span class="acc">help</span> <span class="dim">to look around.</span>');
    return;
  }
  const typeCmd = async (cmd: string) => {
    for (let i = 1; i <= cmd.length; i++) {
      if (!alive) return;
      input.value = cmd.slice(0, i);
      await sleep(70 + Math.random() * 60);
    }
    await sleep(260);
    if (!alive) return;
    exec(cmd);
    input.value = '';
    await sleep(420);
  };
  (async () => {
    await sleep(900);
    for (const c of script) await typeCmd(c);
    if (alive) print('<span class="dim">your turn. type</span> <span class="acc">help</span><span class="dim">, or press</span> <span class="acc">⌘K</span><span class="dim">.</span>');
  })();
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
