import { defineConfig } from 'astro/config';

// The address the site is served from. GitHub Pages serves a user site at the
// root, so no base path is needed. If a custom domain is added later, set
// SITE_URL in the workflow (and add public/CNAME) instead of editing this file.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://tandx28.github.io',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  prefetch: { prefetchAll: true },
});
