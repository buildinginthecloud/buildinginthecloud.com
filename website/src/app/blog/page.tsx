import { Metadata } from 'next';
import { getAllPostsMeta, getAllTags } from '@/lib/posts';
import { BlogList } from '@/components/blog/BlogList';
import { TagFilter } from '@/components/blog/TagFilter';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Articles about AWS, CDK, cloud infrastructure, and best practices.',
};

export default function BlogPage() {
  const posts = getAllPostsMeta();
  const tags = getAllTags();

  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="max-w-2xl mb-12">
          <h1 className="text-4xl font-bold mb-4">Blog</h1>
          <p className="text-lg text-muted-foreground">
            Explore articles about AWS, CDK, infrastructure as code, security,
            and cloud best practices.
          </p>
        </div>

        {/* Tag Filter */}
        {tags.length > 0 && (
          <div className="mb-8">
            <TagFilter tags={tags} />
          </div>
        )}

        {/* Blog Posts List */}
        {posts.length > 0 ? (
          <BlogList posts={posts} />
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No posts yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
