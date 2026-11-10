import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

export interface Tag {
  name: string;
  slug: string;
  count: number;
}

const WORDS_PER_MINUTE = 220;

/** All published posts, newest first. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function formatDate(date: Date, month: 'short' | 'long' = 'short'): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month, day: 'numeric' });
}

/** Estimated reading time in whole minutes, based on the raw MDX body. */
export function readingTime(post: Post): number {
  const words = (post.body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** URL-safe tag: "Cost Optimization" becomes "cost-optimization", "CI/CD" becomes "ci-cd". */
export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Unique tags with their post count, most used first. Tags that differ only
 * in casing ("AWS" and "aws") share a slug and are merged under the first
 * spelling found.
 */
export function getTags(posts: Post[]): Tag[] {
  const tags = new Map<string, Tag>();
  for (const post of posts) {
    for (const slug of new Set(post.data.tags.map(tagSlug))) {
      const name = post.data.tags.find((tag) => tagSlug(tag) === slug)!;
      const tag = tags.get(slug) ?? { name, slug, count: 0 };
      tag.count += 1;
      tags.set(slug, tag);
    }
  }
  return [...tags.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
