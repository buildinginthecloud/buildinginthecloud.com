'use client';

import { cn } from '@/lib/utils';
import { AlertCircle, AlertTriangle, Info, Lightbulb, CheckCircle, Zap, Clock, ArrowRight, Quote } from 'lucide-react';

interface CalloutProps {
  type?: 'info' | 'warning' | 'tip' | 'danger' | 'success';
  title?: string;
  children: React.ReactNode;
}

const calloutConfig = {
  info: {
    icon: Info,
    className: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
    iconClassName: 'text-blue-600 dark:text-blue-400',
    titleClassName: 'text-blue-800 dark:text-blue-300',
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800',
    iconClassName: 'text-yellow-600 dark:text-yellow-400',
    titleClassName: 'text-yellow-800 dark:text-yellow-300',
  },
  tip: {
    icon: Lightbulb,
    className: 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800',
    iconClassName: 'text-green-600 dark:text-green-400',
    titleClassName: 'text-green-800 dark:text-green-300',
  },
  danger: {
    icon: AlertCircle,
    className: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800',
    iconClassName: 'text-red-600 dark:text-red-400',
    titleClassName: 'text-red-800 dark:text-red-300',
  },
  success: {
    icon: CheckCircle,
    className: 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800',
    iconClassName: 'text-green-600 dark:text-green-400',
    titleClassName: 'text-green-800 dark:text-green-300',
  },
};

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const config = calloutConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'my-6 rounded-lg border p-4',
        config.className
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', config.iconClassName)} />
        <div className="flex-1">
          {title && (
            <p className={cn('font-semibold mb-1', config.titleClassName)}>
              {title}
            </p>
          )}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}

interface CopyButtonProps {
  code: string;
}

export function CopyButton({ code }: CopyButtonProps) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-2 rounded-md bg-muted hover:bg-muted-foreground/20 transition-colors"
      title="Copy code"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    </button>
  );
}

interface CodeBlockProps {
  children: React.ReactNode;
  language?: string;
  filename?: string;
}

export function CodeBlock({ children, language, filename }: CodeBlockProps) {
  return (
    <div className="relative my-6 rounded-lg overflow-hidden">
      {(language || filename) && (
        <div className="flex items-center justify-between bg-muted px-4 py-2 text-sm text-muted-foreground border-b border-border">
          {filename && <span>{filename}</span>}
          {language && !filename && <span>{language}</span>}
        </div>
      )}
      <div className="relative">
        {children}
      </div>
    </div>
  );
}

// Summary/TLDR Box
interface SummaryBoxProps {
  title?: string;
  children: React.ReactNode;
}

export function SummaryBox({ title = "TL;DR", children }: SummaryBoxProps) {
  return (
    <div className="my-8 rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-6">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-lg text-primary">{title}</h3>
      </div>
      <div className="text-foreground/80">{children}</div>
    </div>
  );
}

// Tech Stack Grid
interface TechItem {
  name: string;
  description: string;
  icon?: string;
}

interface TechStackProps {
  items: TechItem[];
}

export function TechStack({ items }: TechStackProps) {
  return (
    <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
        >
          {item.icon && <span className="text-2xl">{item.icon}</span>}
          <div>
            <h4 className="font-semibold text-foreground">{item.name}</h4>
            <p className="text-sm text-foreground/60">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Timeline Component
interface TimelineItem {
  title: string;
  description: string;
  status?: 'completed' | 'current' | 'upcoming';
}

interface TimelineProps {
  items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
  return (
    <div className="my-8 relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={index} className="relative pl-10">
            <div
              className={cn(
                "absolute left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center",
                item.status === 'completed' && "bg-green-500 border-green-500",
                item.status === 'current' && "bg-primary border-primary animate-pulse",
                (!item.status || item.status === 'upcoming') && "bg-card border-border"
              )}
            >
              {item.status === 'completed' && (
                <CheckCircle className="h-3 w-3 text-white" />
              )}
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground">{item.title}</h4>
              <p className="text-sm text-foreground/60 mt-1">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Key Takeaway Component
interface KeyTakeawayProps {
  children: React.ReactNode;
}

export function KeyTakeaway({ children }: KeyTakeawayProps) {
  return (
    <div className="my-8 relative pl-6 border-l-4 border-primary">
      <div className="absolute -left-3 top-0 bg-background p-1">
        <Lightbulb className="h-5 w-5 text-primary" />
      </div>
      <div className="text-lg font-medium text-foreground/90 italic">
        {children}
      </div>
    </div>
  );
}

// Blockquote Component
interface BlockquoteProps {
  children: React.ReactNode;
  author?: string;
}

export function Blockquote({ children, author }: BlockquoteProps) {
  return (
    <blockquote className="my-8 relative">
      <Quote className="absolute -left-2 -top-2 h-8 w-8 text-primary/20" />
      <div className="pl-8 pr-4 py-4 bg-muted/50 rounded-r-lg border-l-4 border-primary">
        <div className="text-lg text-foreground/80 italic">{children}</div>
        {author && (
          <div className="mt-2 text-sm text-foreground/60">— {author}</div>
        )}
      </div>
    </blockquote>
  );
}

// Step Component for tutorials
interface StepProps {
  number: number;
  title: string;
  children: React.ReactNode;
}

export function Step({ number, title, children }: StepProps) {
  return (
    <div className="my-6 flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-bold">
        {number}
      </div>
      <div className="flex-1 pt-1">
        <h4 className="font-semibold text-lg text-foreground mb-2">{title}</h4>
        <div className="text-foreground/80">{children}</div>
      </div>
    </div>
  );
}

// Comparison Table
interface ComparisonProps {
  good: string[];
  bad: string[];
  goodTitle?: string;
  badTitle?: string;
}

export function Comparison({ good, bad, goodTitle = "Do", badTitle = "Don't" }: ComparisonProps) {
  return (
    <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
        <h4 className="font-semibold text-green-700 dark:text-green-400 flex items-center gap-2 mb-3">
          <CheckCircle className="h-5 w-5" /> {goodTitle}
        </h4>
        <ul className="space-y-2">
          {good.map((item, index) => (
            <li key={index} className="text-sm text-green-800 dark:text-green-300 flex items-start gap-2">
              <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
        <h4 className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-2 mb-3">
          <AlertCircle className="h-5 w-5" /> {badTitle}
        </h4>
        <ul className="space-y-2">
          {bad.map((item, index) => (
            <li key={index} className="text-sm text-red-800 dark:text-red-300 flex items-start gap-2">
              <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Reading Time Badge
interface ReadingTimeBadgeProps {
  minutes: number;
}

export function ReadingTimeBadge({ minutes }: ReadingTimeBadgeProps) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-sm text-foreground/60">
      <Clock className="h-4 w-4" />
      <span>{minutes} min read</span>
    </div>
  );
}
