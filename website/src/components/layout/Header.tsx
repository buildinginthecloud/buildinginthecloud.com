'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, Search, Zap } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { MobileNav } from './MobileNav';

const navItems = [
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'CV', href: '/cv' },
  
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-accent group-hover:scale-110 transition-transform">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg hidden sm:inline-block">
              Building in the Cloud
            </span>
            <span className="font-bold text-lg sm:hidden">
              BITC
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-primary/10 transition-all"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              className="p-2.5 rounded-lg text-foreground/70 hover:text-foreground hover:bg-primary/10 transition-all"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <ThemeToggle className="text-foreground/70 hover:text-foreground hover:bg-primary/10" />
            <button
              className="md:hidden p-2.5 rounded-lg text-foreground/70 hover:text-foreground hover:bg-primary/10 transition-all"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navItems={navItems}
      />
    </header>
  );
}
