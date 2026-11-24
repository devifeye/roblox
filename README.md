<!-- //README.md -->
# Edward | Animated Roblox story videos

Two-page portfolio site (Home `/`, Portfolio `/portfolio`) plus a custom 404 page.
Built with Astro as a fully static site, ready for Vercel via GitHub.

## Run it locally

Needs Node 22.23 or newer.

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # type-checks, validates videos.json, outputs to dist/
npm run preview    # serve the built site
```

## Add a new video (the only file you need to touch)

Open `src/data/videos.json` and add an entry to the list. Newest `date` shows first.

```json
{
  "id": "haunted-school-ep-2",
  "title": "Haunted school, part 2",
  "category": "Horror",
  "date": "2026-12-01",
  "description": "One short sentence about the video.",
  "video": "https://youtube.com/shorts/AbCdEfGhIjK",
  "poster": "/posters/haunted-school-ep-2.jpg",
  "duration": "0:58",
  "featured": true
}
```

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | lowercase-with-dashes, unique |
| `title` | yes | max 80 characters |
| `category` | yes | Filter buttons are created automatically from these |
| `date` | yes | `YYYY-MM-DD`, controls order |
| `video` | yes | YouTube link or ID, Vimeo link, `/videos/file.mp4`, or an `https://...mp4` link |
| `poster` | for Vimeo and mp4 | Optional for YouTube (thumbnail is pulled automatically) |
| `description` | no | Shown under the player, max 240 characters |
| `duration` | no | `0:58` style, shown on the thumbnail |
| `aspect` | no | `9:16` (default), `16:9` or `1:1` |
| `client` | no | Only add with the client's permission |
| `featured` | no | Featured videos show first in "Recent work" on the home page (3 max) |
| `hero` | no | The video in the big frame at the top of the home page |
| `preview` | no | A short muted `.mp4` loop for the hero frame (keep it under ~2 MB) |
| `sample` | no | Marks placeholder entries. Delete all sample entries before sharing the site |

If an entry has a typo, `npm run build` fails and tells you which field is wrong, so a broken entry never goes live.

### Posters

Put thumbnails in `public/posters/`, 720 x 1280 JPG or WebP, under ~150 KB each.

### Where to host the videos

- **Recommended:** upload as unlisted YouTube Shorts (free, fast streaming, no bandwidth cost) and paste the link.
- **Self-hosted mp4:** use a storage/CDN service (Cloudflare R2, Bunny, Vercel Blob) and paste the `https://` link.
- Avoid committing full videos into `public/videos/`: GitHub rejects files over 100 MB and every view uses your Vercel bandwidth.

## Change your name, email or tagline

Edit `src/config/site.ts`. It updates the header, footer, buttons and page titles.

## Deploy on Vercel

1. Push this folder to a new GitHub repository.
2. In Vercel, choose **Add New Project**, import the repository. Astro is detected automatically, no settings needed.
3. After you connect a custom domain, add an environment variable `SITE_URL` = `https://yourdomain.com` and redeploy (used for the sitemap, canonical links and link previews).

Every push to `main` redeploys the site.

## Before sending the site to leads

- [ ] Replace every `"sample": true` entry in `src/data/videos.json` with real work (the build prints a warning while samples remain)
- [ ] Delete `public/posters/sample-*.jpg` and `public/videos/sample-clip.mp4`
- [ ] Confirm you have each client's permission to show their videos
- [ ] Read through the copy on the home page and adjust anything that doesn't match how you work

## Security

`vercel.json` sets a strict Content-Security-Policy and standard security headers. The site has no forms,
no cookies, no analytics and no third-party scripts. Videos only load from YouTube (privacy-enhanced
`youtube-nocookie.com`), Vimeo, or an mp4 link after a visitor presses play.

If you later add analytics, a booking widget or videos from another embed host, add their domains to the
`Content-Security-Policy` header in `vercel.json` or they will be blocked.

## Project map

```
src/data/videos.json        your videos (edit this)
src/config/site.ts          name, email, tagline
src/pages/index.astro       home page
src/pages/portfolio.astro   portfolio page with category filters
src/pages/404.astro         not-found page
src/components/             header, footer, video card, player
src/lib/video.ts            turns YouTube/Vimeo/mp4 links into safe embeds
src/content.config.ts       validation rules for videos.json
src/styles/global.css       colours, type, buttons
vercel.json                 security headers and caching
```

Roblox is a trademark of Roblox Corporation. This site is not affiliated with or endorsed by Roblox Corporation.
