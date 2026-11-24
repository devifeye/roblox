//astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The public URL is used for canonical links, Open Graph tags and the sitemap.
// Set SITE_URL in Vercel (e.g. https://yourdomain.com) once you have a custom domain.
// Until then, Vercel's production URL is used automatically.
const site =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:4321');

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'directory',
    // Keep all CSS in external files so the Content-Security-Policy can stay strict (no 'unsafe-inline').
    inlineStylesheets: 'never',
  },
  vite: {
    build: {
      // Never inline JS or assets as data: URIs; keeps script-src 'self' working.
      assetsInlineLimit: 0,
    },
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],
});
