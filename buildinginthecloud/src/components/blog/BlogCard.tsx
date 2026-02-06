import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ArrowUpRight } from 'lucide-react';
import { PostMeta } from '@/types';
import { formatDate } from '@/lib/utils';
import { TagList } from '@/components/ui/Tag';

interface BlogCardProps {
  post: PostMeta;
  featured?: boolean;
}

// Generate a gradient based on tags
function getGradientForTags(tags: string[]): string {
  const tagGradients: Record<string, string> = {
    aws: 'from-orange-500 to-yellow-500',
    cdk: 'from-teal-500 to-cyan-500',
    python: 'from-blue-500 to-yellow-500',
    typescript: 'from-blue-600 to-blue-400',
    security: 'from-red-500 to-orange-500',
    lambda: 'from-orange-600 to-yellow-500',
    s3: 'from-green-500 to-teal-500',
    dynamodb: 'from-blue-600 to-purple-500',
    default: 'from-primary to-accent',
  };

  for (const tag of tags) {
    const lowerTag = tag.toLowerCase();
    if (tagGradients[lowerTag]) {
      return tagGradients[lowerTag];
    }
  }
  return tagGradients.default;
}

// Get an icon/emoji based on primary tag
function getIconForTags(tags: string[]): string {
  const tagIcons: Record<string, string> = {
    aws: '☁️',
    cdk: '🏗️',
    python: '🐍',
    typescript: '📘',
    security: '🔒',
    lambda: '⚡',
    s3: '🪣',
    dynamodb: '🗄️',
    docker: '🐳',
    terraform: '🏔️',
    devops: '🔧',
    introduction: '👋',
    default: '📝',
  };

  for (const tag of tags) {
    const lowerTag = tag.toLowerCase();
    if (tagIcons[lowerTag]) {
      return tagIcons[lowerTag];
    }
  }
  return tagIcons.default;
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
  const gradient = getGradientForTags(post.tags);
  const icon = getIconForTags(post.tags);

  if (featured) {
    return (
      <article className="group relative rounded-2xl overflow-hidden bg-card border border-border transition-all hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
        <Link href={`/blog/${post.slug}`} className="block">
          {/* Cover image or gradient header */}
          <div className="h-48 relative">
            {post.coverImage ? (
              <>
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </>
            ) : (
              <>
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute bottom-4 left-4 text-6xl opacity-50">
                  {icon}
                </div>
              </>
            )}
            <div className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mb-3">
                <TagList tags={post.tags.slice(0, 3)} disableLinks />
              </div>
            )}

            {/* Title */}
            <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-all">
              {post.title}
            </h3>

            {/* Description */}
            <p className="text-foreground/70 mb-4 line-clamp-2">
              {post.description}
            </p>

            {/* Meta info */}
            <div className="flex items-center gap-4 text-sm text-foreground/50">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(post.date)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readingTime}
              </span>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group relative rounded-xl overflow-hidden bg-card border border-border transition-all hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30">
      <Link href={`/blog/${post.slug}`} className="flex">
        {/* Cover image thumbnail or side gradient strip */}
        {post.coverImage ? (
          <div className="w-24 h-24 sm:w-32 sm:h-32 relative flex-shrink-0">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              sizes="128px"
            />
          </div>
        ) : (
          <div className={`w-2 bg-gradient-to-b ${gradient} flex-shrink-0`} />
        )}

        {/* Content */}
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="mb-2">
                  <TagList tags={post.tags.slice(0, 2)} disableLinks />
                </div>
              )}

              {/* Title */}
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                {post.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-foreground/60 mb-3 line-clamp-2">
                {post.description}
              </p>

              {/* Meta info */}
              <div className="flex items-center gap-3 text-xs text-foreground/50">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(post.date)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.readingTime}
                </span>
              </div>
            </div>

            {/* Icon - only show if no cover image */}
            {!post.coverImage && (
              <div className="text-3xl opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0">
                {icon}
              </div>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
