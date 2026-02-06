import Link from 'next/link';
import { ArrowRight, Github, Twitter, Linkedin, Zap, Heart, Coffee } from 'lucide-react';

export function AboutSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left - Visual/Fun element */}
            <div className="relative">
              {/* Main card */}
              <div className="rounded-3xl overflow-hidden shadow-2xl shadow-primary/10">
                <div className="h-64 bg-gradient-to-br from-primary via-accent to-secondary relative">
                  <div className="absolute inset-0 bg-black/20" />
                  {/* Avatar */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
                      <span className="text-5xl font-bold text-white">YZ</span>
                    </div>
                  </div>
                </div>
                <div className="bg-card p-6 text-center">
                  <h3 className="text-xl font-bold mb-1">Yvo van Zee</h3>
                  <p className="text-foreground/60 text-sm mb-4">@yvthepief • @buildinginthecloud</p>
                  {/* Social links */}
                  <div className="flex justify-center gap-3">
                    <a
                      href="https://github.com/buildinginthecloud"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                      aria-label="GitHub"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                    <a
                      href="https://twitter.com/yvthepief"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                      aria-label="Twitter"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                    <a
                      href="https://linkedin.com/in/yvovanzee"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -left-4 px-4 py-2 rounded-xl bg-card border border-border shadow-lg animate-bounce" style={{ animationDuration: '3s' }}>
                <span className="text-2xl">☁️</span>
              </div>
              <div className="absolute -bottom-4 -right-4 px-4 py-2 rounded-xl bg-card border border-border shadow-lg animate-bounce" style={{ animationDuration: '3s', animationDelay: '1.5s' }}>
                <span className="text-2xl">🚀</span>
              </div>
            </div>

            {/* Right - Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
                <Heart className="w-4 h-4" />
                About the builder
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Turning coffee into{' '}
                <span className="text-primary">cloud infrastructure</span>
              </h2>

              <p className="text-lg text-foreground/70 mb-6">
                I'm a tech enthusiast who believes that infrastructure should be as enjoyable to build
                as the applications running on it. When I'm not deploying stacks, I'm exploring
                new AWS services or contributing to open source.
              </p>

              {/* Fun facts */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 rounded-xl bg-card border border-border">
                  <Coffee className="w-6 h-6 mx-auto mb-2 text-secondary" />
                  <p className="font-bold text-2xl">∞</p>
                  <p className="text-xs text-foreground/50">Coffees/day</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-card border border-border">
                  <Zap className="w-6 h-6 mx-auto mb-2 text-accent" />
                  <p className="font-bold text-2xl">CDK</p>
                  <p className="text-xs text-foreground/50">Tool of choice</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-card border border-border">
                  <Github className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="font-bold text-2xl">OSS</p>
                  <p className="text-xs text-foreground/50">Contributor</p>
                </div>
              </div>

              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-primary/20 font-medium hover:border-primary/40 hover:bg-primary/5 transition-all"
              >
                More about my journey
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
