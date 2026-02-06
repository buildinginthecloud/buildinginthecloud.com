import { Feed } from 'feed';
import { writeFileSync, readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const siteUrl = 'https://buildinginthecloud.com';
const contentDir = join(__dirname, '..', 'src', 'content', 'blog');
const publicDir = join(__dirname, '..', 'public');

function getAllPosts() {
  const files = readdirSync(contentDir).filter(file => file.endsWith('.mdx'));

  const posts = files.map(filename => {
    const filePath = join(contentDir, filename);
    const fileContent = readFileSync(filePath, 'utf-8');
    const { data } = matter(fileContent);

    return {
      slug: filename.replace('.mdx', ''),
      title: data.title,
      description: data.description,
      date: data.date,
      updated: data.updated,
    };
  });

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function generateRssFeed() {
  const posts = getAllPosts();

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

  writeFileSync(join(publicDir, 'feed.xml'), feed.rss2());
  console.log('RSS feed generated at public/feed.xml');
}

function generateSitemap() {
  const posts = getAllPosts();
  const today = new Date().toISOString().split('T')[0];

  const staticPages = [
    { url: siteUrl, changefreq: 'daily', priority: '1.0' },
    { url: `${siteUrl}/blog`, changefreq: 'daily', priority: '0.9' },
    { url: `${siteUrl}/about`, changefreq: 'monthly', priority: '0.7' },
    { url: `${siteUrl}/cv`, changefreq: 'monthly', priority: '0.6' },
  ];

  const blogPages = posts.map(post => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastmod: post.updated || post.date,
    changefreq: 'weekly',
    priority: '0.8',
  }));

  const allPages = [...staticPages, ...blogPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod || today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  writeFileSync(join(publicDir, 'sitemap.xml'), sitemap);
  console.log('Sitemap generated at public/sitemap.xml');
}

generateRssFeed();
generateSitemap();
