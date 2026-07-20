// Scheduled function — triggers a site rebuild once a day so the static social
// wall re-fetches the latest Instagram + TikTok posts. Set NETLIFY_BUILD_HOOK to
// a build-hook URL (Netlify → Site configuration → Build hooks). If it is unset,
// this is a no-op, so the schedule is harmless until you opt in.

export const config = { schedule: '0 6 * * *' }; // daily at 06:00 UTC

export default async () => {
  const hook = process.env.NETLIFY_BUILD_HOOK;
  if (!hook) {
    console.log('refresh-social: NETLIFY_BUILD_HOOK not set — skipping.');
    return new Response('skipped', { status: 200 });
  }
  try {
    const res = await fetch(hook, { method: 'POST' });
    console.log('refresh-social: build hook triggered, status', res.status);
    return new Response('triggered', { status: 200 });
  } catch (err) {
    console.error('refresh-social: failed to trigger build hook:', err);
    return new Response('error', { status: 500 });
  }
};
