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
    description: z.string(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { writing };
