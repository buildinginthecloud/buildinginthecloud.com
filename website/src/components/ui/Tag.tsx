import { cn } from '@/lib/utils';
import Link from 'next/link';

interface TagProps {
  tag: string;
  href?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function Tag({ tag, href, size = 'sm', className }: TagProps) {
  const baseStyles = cn(
    'inline-flex items-center rounded-full font-medium transition-colors',
    size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
    'bg-primary/10 text-primary hover:bg-primary/20',
    className
  );

  if (href) {
    return (
      <Link href={href} className={baseStyles}>
        {tag}
      </Link>
    );
  }

  return <span className={baseStyles}>{tag}</span>;
}

interface TagListProps {
  tags: string[];
  linkPrefix?: string;
  size?: 'sm' | 'md';
  className?: string;
  disableLinks?: boolean;
}

export function TagList({ tags, linkPrefix = '/blog?tag=', size = 'sm', className, disableLinks = false }: TagListProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {tags.map((tag) => (
        <Tag
          key={tag}
          tag={tag}
          href={disableLinks ? undefined : `${linkPrefix}${encodeURIComponent(tag)}`}
          size={size}
        />
      ))}
    </div>
  );
}
