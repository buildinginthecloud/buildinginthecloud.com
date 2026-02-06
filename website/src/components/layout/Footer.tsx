import Link from 'next/link';
import { Github, Twitter, Linkedin, Rss, Zap, Heart } from 'lucide-react';

const socialLinks = [
  { name: 'GitHub', href: 'https://github.com/buildinginthecloud', icon: Github },
  { name: 'Twitter', href: 'https://twitter.com/yvthepief', icon: Twitter },
  { name: 'LinkedIn', href: 'https://linkedin.com/in/yvovanzee', icon: Linkedin },
  { name: 'RSS', href: '/feed.xml', icon: Rss },
];

const footerLinks = [
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'CV', href: '/cv' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Brand */}
            <div className="space-y-4">
              <Link href="/" className="inline-flex items-center gap-2">
                <div className="p-2 rounded-xl gradient-bg">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg">Building in the Cloud</span>
              </Link>
              <p className="text-sm text-foreground/60 max-w-xs">
                A tech enthusiast's journey through AWS, CDK, and cloud infrastructure.
                Built with ☕ and curiosity.
              </p>
              {/* AWS Community Builder Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-medium">
                ☁️ AWS Community Builder
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">Explore</h3>
              <ul className="space-y-3">
                {footerLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground/60 hover:text-primary transition-colors animated-underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <a
                    href="https://dev.to/yvthepief"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-foreground/60 hover:text-primary transition-colors animated-underline"
                  >
                    DEV.to
                  </a>
                </li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <p className="text-sm text-foreground/60 mb-4">
                Follow me on social media for cloud tips, AWS updates, and tech insights.
              </p>
              <div className="flex items-center gap-2">
                {socialLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.name}
                      href={link.href}
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="p-2.5 rounded-xl text-foreground/60 hover:text-primary hover:bg-primary/10 transition-all"
                      aria-label={link.name}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-foreground/50 flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by Yvo van Zee &copy; {currentYear}
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="p-2 rounded-lg text-foreground/50 hover:text-primary hover:bg-primary/10 transition-all"
                    aria-label={link.name}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
