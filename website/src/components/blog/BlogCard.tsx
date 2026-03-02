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

export function BlogCard({ post, featured = false }: BlogCardProps) {
  if (featured) {
    return (
      <article className="group relative rounded-2xl overflow-hidden bg-card border border-border transition-all hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
        <Link href={`/blog/${post.slug}`} className="block">
          {/* Cover image - only shown when available */}
          {post.coverImage && (
            <div className="h-48 relative">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-5 h-5 text-white" />
              </div>
            </div>
          )}

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
        {/* Cover image thumbnail - only shown when available */}
        {post.coverImage && (
          <div className="w-24 h-24 sm:w-32 sm:h-32 relative flex-shrink-0">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              sizes="128px"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-5">
          <div className="flex items-start gap-4">
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
          </div>
        </div>
      </Link>
    </article>
  );
}
