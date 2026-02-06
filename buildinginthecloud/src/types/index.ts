export interface Post {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  tags: string[];
  featured: boolean;
  draft: boolean;
  coverImage?: string;
  content: string;
  readingTime: string;
}

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  tags: string[];
  featured: boolean;
  draft: boolean;
  coverImage?: string;
  readingTime: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface SocialLink {
  name: string;
  href: string;
  icon: string;
}

export interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}
