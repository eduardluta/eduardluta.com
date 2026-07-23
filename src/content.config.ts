import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Bilingual writing. Files live under src/content/writing/{lang}/{slug}.md, so the
// entry id is "{lang}/{slug}". Every article MUST exist in both languages (en + sq)
// sharing the same slug — that is the standing content rule for this site.
const writing = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    /** Set when an essay is meaningfully edited after publishing; feeds dateModified / lastmod. */
    updated: z.coerce.date().optional(),
    description: z.string(),
    /** Topic tags shared verbatim between the en/sq pair; feed schema keywords. */
    tags: z.array(z.string()).default([]),
    /** Explicit social-card image (ideally 1200x630). Falls back to the first body image for JSON-LD only. */
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { writing };
