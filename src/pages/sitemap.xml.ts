import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Every page worth indexing: the home page, each case study, each hosted
// lab piece, and the game, which is deployed from its own repository under
// /gatebound/. Built by hand to avoid another dependency; scripts/sitemap-dates.mjs
// adds each page's last-changed date after the build.
export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://tandx28.github.io');
  const projects = await getCollection('projects');
  const paths = [
    '/',
    ...projects.filter((p) => p.data.tier === 'featured').map((p) => `/projects/${p.id}/`),
    ...projects.flatMap((p) => (p.data.play ? [p.data.play] : [])),
    '/gatebound/',
  ];
  const urls = paths.map((p) => `  <url><loc>${new URL(p, base).href}</loc></url>`).join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
};
