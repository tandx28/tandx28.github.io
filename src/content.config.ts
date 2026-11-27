import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

// One Markdown file per project. Front matter drives the cards; the body is
// the case-study page at /projects/<file name>.
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    tagline: z.string(),
    /** A few words for the terminal's ls listing. */
    short: z.string(),
    /** Page title for search results, when "title: short" reads badly. */
    seoTitle: z.string().optional(),
    /** featured: big card with its own page. small: compact row. lab: AI-built piece hosted under /lab/. */
    tier: z.enum(['featured', 'small', 'lab']),
    /** For lab pieces: game, film or tool. */
    kind: z.enum(['game', 'film', 'tool']).optional(),
    /** For lab pieces: path of the hosted page, e.g. /lab/rook-and-ruin/. */
    play: z.string().optional(),
    order: z.number(),
    year: z.string(),
    role: z.string().optional(),
    status: z.enum(['live', 'in progress', 'private']).default('live'),
    stack: z.array(z.string()),
    live: z.url().optional(),
    repo: z.url().optional(),
    /** Two or three short facts shown as big numbers on the case study. */
    stats: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    /** Screenshot under public/, shown on the card and case study. */
    cover: image().optional(),
    accent: z.string().default('#5eead4'),
  }),
});

export const collections = { projects };
