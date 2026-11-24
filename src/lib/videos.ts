//src/lib/videos.ts
import { getCollection, type CollectionEntry } from 'astro:content';
import { embedUrl } from './video';

export type Video = CollectionEntry<'videos'>['data'];

let warned = false;

/** All videos, newest first. */
export async function getVideos(): Promise<Video[]> {
  const entries = await getCollection('videos');
  const videos = entries.map((e) => e.data).sort((a, b) => b.date.getTime() - a.date.getTime());

  const samples = videos.filter((v) => v.sample).length;
  if (samples > 0 && import.meta.env.PROD && !warned) {
    warned = true;
    console.warn(
      `\n[portfolio] ${samples} sample video(s) are still in src/data/videos.json. Replace them with real work before sharing the site.\n`,
    );
  }
  return videos;
}

/** Videos for the home page strip: featured first, then newest, max 3. */
export function pickRecent(videos: Video[], count = 3): Video[] {
  const featured = videos.filter((v) => v.featured);
  const rest = videos.filter((v) => !v.featured);
  return [...featured, ...rest].slice(0, count);
}

/** Video shown in the home page hero frame. */
export function pickHero(videos: Video[]): Video | undefined {
  return videos.find((v) => v.hero) ?? videos.find((v) => v.featured) ?? videos[0];
}

/** Attributes the player script reads. Everything is validated, so it's safe to expose. */
export function playerData(v: Video) {
  return {
    'data-play-title': v.title,
    'data-play-description': v.description ?? '',
    'data-play-aspect': v.aspect,
    'data-play-embed': embedUrl(v.source) ?? '',
    'data-play-file': v.source.type === 'file' ? v.source.src : '',
    'data-play-poster': v.poster,
  };
}

export function categories(videos: Video[]): string[] {
  return [...new Set(videos.map((v) => v.category))].sort((a, b) => a.localeCompare(b));
}
