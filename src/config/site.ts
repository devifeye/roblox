//src/config/site.ts
// Everything that identifies the business lives here. Change it once, it updates everywhere.

export const site = {
  /** Shown in the header, footer and browser tab. Swap for a studio name later if you pick one. */
  name: 'Edward',
  /** What you do, in a few words. Used in page titles and search results. */
  tagline: 'Animated Roblox story videos',
  description:
    'Edward is a one-person animation studio in Canada making fast-paced, 9:16 animated Roblox story videos for YouTube Shorts, TikTok and Reels.',
  email: 'echoincs@gmail.com',
  location: 'Canada',
  /** Subject line pre-filled when a lead clicks an email button. */
  emailSubject: 'Video project inquiry',
} as const;

export const mailto = `mailto:${site.email}?subject=${encodeURIComponent(site.emailSubject)}`;
