import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Every page worth indexing: the home page, each case study and each hosted
// lab piece. Built by hand to avoid another dependency.
export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://tandx28.github.io');
  const projects = await getCollection('projects');
  const paths = [
    '/',
    ...projects.filter((p) => p.data.tier === 'featured').map((p) => `/projects/${p.id}/`),
    ...projects.flatMap((p) => (p.data.play ? [p.data.play] : [])),
  ];
  const urls = paths
    .map((p) => `  <url><loc>${new URL(p, base).href}</loc>${p === '/' ? '<priority>1.0</priority>' : ''}</url>`)
    .join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
};
