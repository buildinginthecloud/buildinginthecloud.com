import { Feed } from 'feed';
import { getAllPosts } from '@/lib/posts';

export async function GET() {
  const posts = getAllPosts();
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://buildinginthecloud.com';

  const feed = new Feed({
    title: 'Building in the Cloud',
    description: 'AWS insights, CDK best practices, and cloud infrastructure tips from Yvo van Zee.',
    id: siteUrl,
    link: siteUrl,
    language: 'en',
    image: `${siteUrl}/og-image.png`,
    favicon: `${siteUrl}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}, Yvo van Zee`,
    author: {
      name: 'Yvo van Zee',
      email: 'yvo@buildinginthecloud.com',
      link: siteUrl,
    },
  });

  posts.forEach((post) => {
    feed.addItem({
      title: post.title,
      id: `${siteUrl}/blog/${post.slug}`,
      link: `${siteUrl}/blog/${post.slug}`,
      description: post.description,
      content: post.content,
      date: new Date(post.date),
      author: [
        {
          name: 'Yvo van Zee',
          email: 'yvo@buildinginthecloud.com',
          link: siteUrl,
        },
      ],
    });
  });

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
