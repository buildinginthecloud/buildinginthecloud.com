import Link from 'next/link';
import { ArrowRight, Newspaper } from 'lucide-react';
import { BlogCard } from '@/components/blog/BlogCard';
import { getLatestPosts } from '@/lib/posts';

export function FeaturedPosts() {
  const posts = getLatestPosts(5);

  if (posts.length === 0) {
    return (
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16 rounded-2xl border-2 border-dashed border-border">
            <Newspaper className="w-12 h-12 mx-auto mb-4 text-primary/50" />
            <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
            <p className="text-foreground/60">
              Articles about AWS, CDK, and cloud infrastructure are on the way!
            </p>
          </div>
        </div>
      </section>
    );
  }

  const [featuredPost, ...otherPosts] = posts;

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
              <Newspaper className="w-4 h-4" />
              Fresh Content
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Latest Articles</h2>
          </div>
          <Link
            href="/blog"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 font-medium transition-all"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Magazine-style layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Featured post - large card */}
          <div className="lg:row-span-2">
            <BlogCard post={featuredPost} featured />
          </div>

          {/* Other posts - smaller cards */}
          <div className="space-y-4">
            {otherPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </div>

        {/* Mobile view all link */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium"
          >
            View all articles
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
