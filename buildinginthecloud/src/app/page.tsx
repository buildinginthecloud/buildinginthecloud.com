import { Hero } from '@/components/home/Hero';
import { FeaturedPosts } from '@/components/home/FeaturedPosts';
import { AboutSection } from '@/components/home/AboutSection';

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedPosts />
      <AboutSection />
    </>
  );
}
