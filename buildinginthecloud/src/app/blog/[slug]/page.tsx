import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, Clock, RefreshCw, Twitter, Linkedin } from 'lucide-react';
import { ShareButtons } from '@/components/blog/ShareButtons';
import { getPostBySlug, getAllPosts } from '@/lib/posts';
import { formatDate } from '@/lib/utils';
import { TagList } from '@/components/ui/Tag';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { extractTableOfContents } from '@/lib/mdx';
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkGfm from 'remark-gfm';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.updated,
      authors: ['Yvo van Zee'],
      tags: post.tags,
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const toc = extractTableOfContents(post.content);
  const shareUrl = `https://buildinginthecloud.com/blog/${slug}`;

  return (
    <article>
      {/* Hero Section */}
      <div className="article-hero-gradient">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="max-w-4xl mx-auto">
            {/* Back link */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to blog
            </Link>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mb-6">
                <TagList tags={post.tags} />
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Description */}
            {post.description && (
              <p className="text-lg text-foreground/70 mb-8 leading-relaxed">
                {post.description}
              </p>
            )}

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/60">
              <div className="flex items-center gap-6">
                <span className="inline-flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  {formatDate(post.date)}
                </span>
                {post.updated && (
                  <span className="inline-flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-primary" />
                    Updated {formatDate(post.updated)}
                  </span>
                )}
                <span className="inline-flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  {post.readingTime}
                </span>
              </div>
            </div>

            {/* Cover Image */}
            {post.coverImage && (
              <div className="mt-8 rounded-xl overflow-hidden">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  width={1200}
                  height={630}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-12">
            {/* Main content */}
            <div className="lg:col-span-3">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <MDXRemote
                  source={post.content}
                  options={{
                    mdxOptions: {
                      remarkPlugins: [remarkGfm],
                      rehypePlugins: [
                        rehypeSlug,
                        [
                          rehypeAutolinkHeadings,
                          {
                            behavior: 'wrap',
                            properties: {
                              className: ['anchor-link'],
                            },
                          },
                        ],
                        [
                          rehypePrettyCode,
                          {
                            theme: {
                              dark: 'github-dark',
                              light: 'github-light',
                            },
                            keepBackground: false,
                          },
                        ],
                      ],
                    },
                  }}
                />
              </div>

              {/* Share buttons */}
              <div className="mt-12 pt-8 border-t border-border">
                <h3 className="font-semibold text-lg mb-4">Share this article</h3>
                <ShareButtons url={shareUrl} title={post.title} />
              </div>

              {/* Author bio */}
              <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-white">YZ</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Yvo van Zee</h3>
                    <p className="text-primary font-medium text-sm mb-2">
                      Cloud Consultant at Cloudar & AWS Community Builder
                    </p>
                    <p className="text-sm text-foreground/70 mb-4">
                      I help organizations build secure, scalable, and cost-effective cloud solutions on AWS.
                      Passionate about CDK, serverless, and sharing knowledge with the community.
                    </p>
                    <div className="flex items-center gap-3">
                      <a
                        href="https://twitter.com/yvthepief"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground/50 hover:text-primary transition-colors"
                      >
                        <Twitter className="w-5 h-5" />
                      </a>
                      <a
                        href="https://linkedin.com/in/yvovanzee"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground/50 hover:text-primary transition-colors"
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Table of Contents - Desktop only */}
            {toc.length > 0 && (
              <aside className="hidden lg:block lg:col-span-1">
                <div className="sticky top-24">
                  <TableOfContents items={toc} />
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
