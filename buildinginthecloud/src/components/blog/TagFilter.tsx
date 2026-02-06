'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

interface TagFilterProps {
  tags: string[];
}

function TagFilterContent({ tags }: TagFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get('tag');

  const handleTagClick = (tag: string | null) => {
    if (tag) {
      router.push(`/blog?tag=${encodeURIComponent(tag)}`);
    } else {
      router.push('/blog');
    }
  };

  return (
    <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
      <button
        onClick={() => handleTagClick(null)}
        className={cn(
          'px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
          !activeTag
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-muted/80'
        )}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => handleTagClick(tag)}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
            activeTag === tag
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}

export function TagFilter({ tags }: TagFilterProps) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
          <div className="px-3 py-1.5 rounded-full text-sm font-medium bg-primary text-primary-foreground">
            All
          </div>
          {tags.map((tag) => (
            <div
              key={tag}
              className="px-3 py-1.5 rounded-full text-sm font-medium bg-muted text-muted-foreground"
            >
              {tag}
            </div>
          ))}
        </div>
      }
    >
      <TagFilterContent tags={tags} />
    </Suspense>
  );
}
