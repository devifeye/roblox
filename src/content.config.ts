//src/content.config.ts
// Validates src/data/videos.json at build time. A typo in a video entry fails the build
// with a clear message instead of shipping a broken portfolio.
import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';
import { parseVideo, autoPoster } from './lib/video';

const assetPath = z
  .string()
  .refine(
    (v) => (v.startsWith('/') && !v.startsWith('//') && !v.includes('..')) || v.startsWith('https://'),
    'Must be a path inside /public (e.g. /posters/my-video.jpg) or an https:// URL',
  );

const videos = defineCollection({
  loader: file('src/data/videos.json'),
  schema: z
    .object({
      id: z
        .string()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'id must be lowercase-with-dashes, e.g. "haunted-school-ep-2"'),
      title: z.string().min(1).max(80),
      description: z.string().max(240).optional(),
      category: z.string().min(1).max(30),
      date: z.coerce.date(),
      video: z.string(),
      poster: assetPath.optional(),
      /** Short muted loop shown in the home page hero. Optional. */
      preview: assetPath.optional(),
      aspect: z.enum(['9:16', '16:9', '1:1']).default('9:16'),
      duration: z
        .string()
        .regex(/^\d{1,2}:\d{2}$/, 'duration must look like 0:58 or 12:04')
        .optional(),
      client: z.string().max(60).optional(),
      featured: z.boolean().default(false),
      hero: z.boolean().default(false),
      /** Sample entries show a "Sample" badge. Delete them before sending the site to leads. */
      sample: z.boolean().default(false),
    })
    .transform((entry, ctx) => {
      const source = parseVideo(entry.video);
      if (!source) {
        ctx.addIssue({
          code: 'custom',
          path: ['video'],
          message:
            'Unrecognised video. Use a YouTube or Vimeo link, a /videos/file.mp4 path, or an https:// link to an .mp4 file.',
        });
        return z.NEVER;
      }
      const poster = entry.poster ?? autoPoster(source);
      if (!poster) {
        ctx.addIssue({
          code: 'custom',
          path: ['poster'],
          message: 'Vimeo and file videos need a poster image (e.g. "/posters/my-video.jpg").',
        });
        return z.NEVER;
      }
      return { ...entry, source, poster };
    }),
});

export const collections = { videos };
