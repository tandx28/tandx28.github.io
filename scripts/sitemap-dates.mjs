// Adds <lastmod> to dist/sitemap.xml: the date of the last commit that touched
// the files each page is built from, so Google can tell which pages changed.
// Needs the full git history (fetch-depth: 0 in the deploy workflow). A page
// with no known date, or a build without git, is left without one, which
// Google treats as unknown.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const file = 'dist/sitemap.xml';
const shared = ['src/layouts', 'src/components', 'src/data', 'src/styles'];

/** Source files behind a page path, or null for pages built elsewhere. */
function sources(path) {
  if (path === '/') return ['src/pages/index.astro', 'src/content/projects', ...shared];
  const project = path.match(/^\/projects\/([\w-]+)\/$/);
  if (project) return [`src/content/projects/${project[1]}.md`, 'src/pages/projects', ...shared];
  if (path.startsWith('/lab/')) return [`public${path}`];
  return null;
}

function lastCommit(files) {
  try {
    return execFileSync('git', ['log', '-1', '--format=%cs', '--', ...files], { encoding: 'utf8' }).trim() || null;
  } catch {
    return null;
  }
}

const xml = readFileSync(file, 'utf8').replace(/<loc>([^<]+)<\/loc><\/url>/g, (whole, loc) => {
  const files = sources(new URL(loc).pathname);
  const date = files && lastCommit(files);
  return date ? `<loc>${loc}</loc><lastmod>${date}</lastmod></url>` : whole;
});
writeFileSync(file, xml);
