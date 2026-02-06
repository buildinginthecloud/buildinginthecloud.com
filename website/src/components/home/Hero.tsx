import Link from 'next/link';
import { ArrowRight, Terminal, Sparkles, Rocket, Code2, Cloud } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <div className="text-center lg:text-left">
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-sm mb-6">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Tech enthusiast & Cloud builder</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Hey, I'm{' '}
              <span className="text-primary">Yvo</span>
              <br />
              <span className="text-3xl md:text-4xl lg:text-5xl">I build things in the cloud</span>
            </h1>

            {/* Introduction - more personal */}
            <p className="text-lg md:text-xl text-foreground/80 mb-8 max-w-xl">
              Cloud Consultant at Cloudar by day, tinkerer by night. I love turning complex AWS challenges
              into elegant CDK solutions. Let's explore the cloud together! ☁️
            </p>

            {/* Stats/highlights */}
            <div className="flex flex-wrap gap-6 mb-8 justify-center lg:justify-start">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Cloud className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-bold">AWS</p>
                  <p className="text-xs text-foreground/60">Community Builder</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Code2 className="w-5 h-5 text-accent" />
                </div>
                <div className="text-left">
                  <p className="font-bold">CDK</p>
                  <p className="text-xs text-foreground/60">Enthusiast</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <Rocket className="w-5 h-5 text-secondary" />
                </div>
                <div className="text-left">
                  <p className="font-bold">IaC</p>
                  <p className="text-xs text-foreground/60">Advocate</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/blog"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/25"
              >
                Explore Articles
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-primary/20 bg-background font-medium hover:border-primary/40 hover:bg-primary/5 transition-all"
              >
                About Me
              </Link>
            </div>
          </div>

          {/* Right side - Visual element */}
          <div className="hidden lg:block relative">
            <div className="relative">
              {/* Terminal-style card */}
              <div className="rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-border/50">
                {/* Terminal header */}
                <div className="bg-[#1a1a2e] px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-sm text-gray-400 font-mono">~/building-in-the-cloud</span>
                  </div>
                </div>
                {/* Terminal content */}
                <div className="bg-[#16213e] p-6 font-mono text-sm">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-primary">❯</span>
                      <span className="text-gray-300">cdk deploy --all</span>
                    </div>
                    <div className="text-accent">✓ Deploying Stack...</div>
                    <div className="text-gray-400 pl-4">
                      <p>├── S3Bucket: Created</p>
                      <p>├── Lambda: Updated</p>
                      <p>├── DynamoDB: No changes</p>
                      <p>└── CloudFront: In progress...</p>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-green-400">✨</span>
                      <span className="text-green-400">Deployment successful!</span>
                    </div>
                    <div className="flex items-center gap-2 animate-pulse">
                      <span className="text-primary">❯</span>
                      <span className="text-gray-500">_</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 px-4 py-2 rounded-xl bg-card border border-border shadow-lg animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Python</span>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 px-4 py-2 rounded-xl bg-card border border-border shadow-lg animate-bounce" style={{ animationDuration: '3s', animationDelay: '1.5s' }}>
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium">TypeScript</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
