import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  // Temporary during the migration: read the posts from the Next.js site so
  // both sites render the same content. Move them to site/src/content/blog
  // when website/ is removed.
  loader: glob({ base: '../website/src/content/blog', pattern: '**/*.mdx' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    author: z.string().optional(),
    coverImage: z.string().optional(),
  }),
});

export const collections = { blog };
