'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, FileText, ArrowRight } from 'lucide-react';
import Fuse from 'fuse.js';
import { PostMeta } from '@/types';
import { cn } from '@/lib/utils';

interface SearchDialogProps {
  posts: PostMeta[];
}

export function SearchDialog({ posts }: SearchDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PostMeta[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const fuse = new Fuse(posts, {
    keys: ['title', 'description', 'tags'],
    threshold: 0.3,
    includeScore: true,
  });

  const handleSearch = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults(posts.slice(0, 5));
        return;
      }
      const searchResults = fuse.search(searchQuery);
      setResults(searchResults.map((result) => result.item).slice(0, 5));
    },
    [posts, fuse]
  );

  useEffect(() => {
    handleSearch(query);
    setSelectedIndex(0);
  }, [query, handleSearch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open with Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }

      // Close with Escape
      if (e.key === 'Escape') {
        setIsOpen(false);
      }

      // Navigate results with arrow keys
      if (isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
        }
        if (e.key === 'Enter' && results[selectedIndex]) {
          e.preventDefault();
          router.push(`/blog/${results[selectedIndex].slug}`);
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, router]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Dialog */}
      <div className="fixed left-1/2 top-[15%] z-50 w-full max-w-lg -translate-x-1/2 px-4">
        <div className="rounded-xl border border-border bg-card shadow-2xl">
          {/* Search Input */}
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search posts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="flex-1 bg-transparent py-4 text-lg outline-none placeholder:text-muted-foreground"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1 hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto p-2">
            {results.length > 0 ? (
              <ul>
                {results.map((post, index) => (
                  <li key={post.slug}>
                    <button
                      onClick={() => {
                        router.push(`/blog/${post.slug}`);
                        setIsOpen(false);
                      }}
                      className={cn(
                        'w-full rounded-lg p-3 text-left transition-colors',
                        index === selectedIndex
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <FileText
                          className={cn(
                            'mt-0.5 h-5 w-5 flex-shrink-0',
                            index === selectedIndex
                              ? 'text-primary-foreground'
                              : 'text-muted-foreground'
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{post.title}</p>
                          <p
                            className={cn(
                              'text-sm truncate',
                              index === selectedIndex
                                ? 'text-primary-foreground/80'
                                : 'text-muted-foreground'
                            )}
                          >
                            {post.description}
                          </p>
                        </div>
                        {index === selectedIndex && (
                          <ArrowRight className="h-5 w-5 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No results found for "{query}"
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-4 py-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">↑</kbd>
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">↓</kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">↵</kbd>
                <span>Open</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">esc</kbd>
                <span>Close</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
