//src/lib/video.ts
// Turns whatever you paste into the "video" field of videos.json into a safe, typed source.
// Accepted:
//   YouTube:  https://youtube.com/shorts/ID, https://www.youtube.com/watch?v=ID, https://youtu.be/ID, or the bare 11-character ID
//   Vimeo:    https://vimeo.com/123456789 (or https://vimeo.com/123456789/privatehash for unlisted videos)
//   File:     /videos/my-video.mp4 (inside /public) or https://your-cdn.com/my-video.mp4

export type VideoSource =
  | { type: 'youtube'; id: string }
  | { type: 'vimeo'; id: string; hash?: string }
  | { type: 'file'; src: string };

const YT_ID = /^[A-Za-z0-9_-]{11}$/;
const VIMEO_ID = /^\d{6,12}$/;
const VIMEO_HASH = /^[a-f0-9]{6,20}$/i;
const FILE_EXT = /\.(mp4|webm|mov|m4v)$/i;

export function parseVideo(input: string): VideoSource | null {
  const value = input.trim();
  if (!value) return null;

  if (YT_ID.test(value)) return { type: 'youtube', id: value };

  // Local file inside /public. Block path traversal and protocol tricks.
  if (value.startsWith('/') && !value.startsWith('//')) {
    if (value.includes('..') || !FILE_EXT.test(value)) return null;
    return { type: 'file', src: value };
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:') return null;

  const host = url.hostname.replace(/^www\.|^m\./, '');

  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const parts = url.pathname.split('/').filter(Boolean);
    const id =
      url.searchParams.get('v') ??
      (['shorts', 'embed', 'live', 'v'].includes(parts[0] ?? '') ? parts[1] : undefined);
    return id && YT_ID.test(id) ? { type: 'youtube', id } : null;
  }

  if (host === 'youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0];
    return id && YT_ID.test(id) ? { type: 'youtube', id } : null;
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const parts = url.pathname.split('/').filter(Boolean).filter((p) => p !== 'video');
    const id = parts[0];
    const hash = url.searchParams.get('h') ?? parts[1];
    if (!id || !VIMEO_ID.test(id)) return null;
    return hash && VIMEO_HASH.test(hash) ? { type: 'vimeo', id, hash } : { type: 'vimeo', id };
  }

  // Any other https host must point straight at a video file (e.g. Cloudflare R2, Bunny, Vercel Blob).
  if (FILE_EXT.test(url.pathname)) return { type: 'file', src: url.toString() };

  return null;
}

/** URL loaded into the player when someone presses play. */
export function embedUrl(source: VideoSource): string | null {
  if (source.type === 'youtube') {
    const params = new URLSearchParams({ autoplay: '1', playsinline: '1', rel: '0', modestbranding: '1' });
    return `https://www.youtube-nocookie.com/embed/${source.id}?${params}`;
  }
  if (source.type === 'vimeo') {
    const params = new URLSearchParams({ autoplay: '1', title: '0', byline: '0', portrait: '0', dnt: '1' });
    if (source.hash) params.set('h', source.hash);
    return `https://player.vimeo.com/video/${source.id}?${params}`;
  }
  return null;
}

/** Thumbnail used when no poster is given. Only YouTube provides one without an API key. */
export function autoPoster(source: VideoSource): string | null {
  return source.type === 'youtube' ? `https://i.ytimg.com/vi/${source.id}/hqdefault.jpg` : null;
}
