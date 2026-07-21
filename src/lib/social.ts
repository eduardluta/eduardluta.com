import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { curatedPosts, type SocialPost } from '../data/social';

// Written at build time by scripts/fetch-social.mjs (see `npm run build`).
const FEED_PATH = join(process.cwd(), 'src/data/social-feed.json');

function readLiveFeed(): SocialPost[] {
  try {
    if (!existsSync(FEED_PATH)) return [];
    const raw = JSON.parse(readFileSync(FEED_PATH, 'utf-8'));
    return Array.isArray(raw?.posts) ? (raw.posts as SocialPost[]) : [];
  } catch {
    return [];
  }
}

/**
 * The full social wall. When the live Instagram/TikTok feed is configured, it is
 * merged (newest first) with the manually-curated X / LinkedIn entries. When it
 * is not configured, the whole curated placeholder set is shown instead.
 */
export function getSocialFeed(): SocialPost[] {
  const live = readLiveFeed();
  if (live.length === 0) return curatedPosts;
  const manual = curatedPosts.filter(
    (p) => p.platform === 'X / Twitter' || p.platform === 'LinkedIn'
  );
  const byRecency = [...live].sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
  return [...byRecency, ...manual];
}

/** The two posts for the home "From the feeds" block — an image card + a text card. */
export function getFeaturedPosts(): SocialPost[] {
  const feed = getSocialFeed();
  const picks: SocialPost[] = [];
  const image = feed.find((p) => p.media);
  const text = feed.find((p) => !p.media);
  if (image) picks.push(image);
  if (text) picks.push(text);
  for (const p of feed) {
    if (picks.length >= 2) break;
    if (!picks.includes(p)) picks.push(p);
  }
  return picks.slice(0, 2);
}
