// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://buildinginthecloud.com',
  build: {
    // Emit /blog/post.html instead of /blog/post/index.html. The CloudFront
    // function in src/static-hosting-stack.ts rewrites /blog/post to
    // /blog/post.html, so the URLs stay identical to the Next.js export.
    format: 'file',
  },
  trailingSlash: 'never',
  markdown: {
    shikiConfig: {
      // Both themes are emitted; global.css switches to the dark one.
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
