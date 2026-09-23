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
    /** Optional editorial deck displayed between the title and article body. */
    standfirst: z.string().optional(),
    /** List-page hook: a striking quote or question from the essay itself. Falls back to description. */
    teaser: z.string().optional(),
    /** Topic tags shared verbatim between the en/sq pair; feed schema keywords. */
    tags: z.array(z.string()).default([]),
    /** Explicit social-card image (ideally 1200x630). Falls back to the first body image for JSON-LD only. */
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
    /** Original TikTok video; the local poster remains available without the embed. */
    video: z.object({
      id: z.string().regex(/^\d+$/, 'TikTok video IDs contain digits only'),
      url: z.string().url().refine((value) => {
        const url = new URL(value);
        return url.protocol === 'https:' && ['www.tiktok.com', 'tiktok.com'].includes(url.hostname);
      }, 'Use the original HTTPS TikTok video URL'),
      poster: z.string().regex(/^\/(?!\/)/, 'Use a local, root-relative poster path'),
      posterAlt: z.string().min(1),
      /** Optional complete metadata for VideoObject; uploadDate is the original video publication. */
      seo: z.object({
        name: z.string().trim().min(1),
        description: z.string().trim().min(1),
        uploadDate: z.string().datetime({ offset: true }),
        durationSeconds: z.number().int().positive().optional(),
        /** Spoken language of the video, independent of the article translation. */
        language: z.string().regex(/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/).optional(),
      }).optional(),
    }).optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { writing };
