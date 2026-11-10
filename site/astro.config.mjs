// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://buildinginthecloud.com',
  // Temporary during the migration: reuse the static assets of the Next.js
  // site. Move them to site/public when website/ is removed.
  publicDir: '../website/public',
  build: {
    // Emit /blog/post.html instead of /blog/post/index.html. The CloudFront
    // function in src/static-hosting-stack.ts rewrites /blog/post to
    // /blog/post.html, so the URLs stay identical to the Next.js export.
    format: 'file',
  },
  trailingSlash: 'never',
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
