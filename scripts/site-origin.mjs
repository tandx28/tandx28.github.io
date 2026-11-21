// After the build, points every absolute link at the address the site is served
// from. Files under public/ (robots.txt, security.txt, the lab pages) and links
// to tandx28.github.io/<project> are written with the GitHub Pages address;
// when SITE_URL names a custom domain, they are rewritten to it here, so moving
// to or away from a custom domain needs no source change.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DEFAULT = 'https://tandx28.github.io';
const target = (process.env.SITE_URL ?? DEFAULT).replace(/\/$/, '');
if (target === DEFAULT) process.exit(0);

const TEXT = /\.(html|xml|txt|json|webmanifest)$/;
let changed = 0;
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (TEXT.test(name)) {
      const before = readFileSync(path, 'utf8');
      const after = before.replaceAll(DEFAULT, target);
      if (after !== before) {
        writeFileSync(path, after);
        changed++;
      }
    }
  }
};
walk('dist');
console.log(`site-origin: ${changed} files now point at ${target}`);
