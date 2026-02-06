import { Metadata } from 'next';
import { Github, Twitter, Linkedin, Mail, Award, Briefcase, Code, Cloud, Heart, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Who am I',
  description: 'Learn more about Yvo van Zee, Cloud Consultant at Cloudar and AWS Community Builder.',
};

const skills = [
  { category: 'Cloud Platforms', items: ['AWS', 'Cloud Architecture', 'Multi-account Strategy'] },
  { category: 'Infrastructure as Code', items: ['AWS CDK', 'Terraform', 'CloudFormation'] },
  { category: 'Programming', items: ['Python', 'TypeScript', 'Bash'] },
  { category: 'DevOps', items: ['CI/CD', 'GitHub Actions', 'AWS CodePipeline'] },
  { category: 'Security', items: ['IAM', 'Security Hub', 'cdk-nag'] },
];

const socialLinks = [
  { name: 'GitHub', href: 'https://github.com/yvthepief', icon: Github },
  { name: 'Twitter', href: 'https://twitter.com/yvthepief', icon: Twitter },
  { name: 'LinkedIn', href: 'https://linkedin.com/in/yvovanzee', icon: Linkedin },
  { name: 'Email', href: 'mailto:yvo@buildinginthecloud.com', icon: Mail },
];

export default function AboutPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="grid md:grid-cols-3 gap-8 items-start mb-16">
            {/* Photo placeholder */}
            <div className="md:col-span-1">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full gradient-bg mx-auto mb-4 flex items-center justify-center">
                    <span className="text-5xl font-bold text-white">YZ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Intro */}
            <div className="md:col-span-2">
              <h1 className="text-4xl font-bold mb-4">Who am I?</h1>
              <p className="text-xl text-foreground/70 mb-6">
                Cloud Consultant & AWS Community Builder
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium">
                  <Award className="w-4 h-4" />
                  AWS Community Builder
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Briefcase className="w-4 h-4" />
                  Cloud Consultant @ Cloudar
                </span>
              </div>

              {/* Social links */}
              <div className="flex gap-4">
                {socialLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.name}
                      href={link.href}
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="p-2 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                      aria-label={link.name}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bio */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">About Me</h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p>
                Hi, my name is Yvo and I am a force to be reckoned with in the world of cloud computing!
                As a proud AWS Cloud Consultant and AWS Community Builder, I am passionate about helping
                customers and people in general on their cloud journey from start to finish.
              </p>
              <p>
                I spend my days architecting and building high-available environments that are as sleek as
                they are secure. Whether it is Infrastructure as Code or Continuous Integration and Delivery,
                I am always looking for creative solutions that solve even the most challenging problems.
              </p>
              <p>
                Need a Landing Zone designed? A DataLake created in AWS? I am your go-to guy for all things
                cloud-related. And when it comes to development tools, I am skilled at using them to speed
                up the deployment process.
              </p>
              <p>
                On this blog, I write about my day-to-day experiences in the field as an AWS Cloud Consultant.
                I try to write about the AWS cloud in a readable and fun way, based on my personal experiences.
                So grab a cup of coffee and join me on this cloud journey!
              </p>
            </div>
          </section>

          {/* Personal Life */}
          <section className="mb-16">
            <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 to-accent/5 p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-red-500/10">
                  <Heart className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Beyond the Cloud</h3>
                  <p className="text-foreground/70">
                    When I am not building in the cloud, I am a devoted husband and proud father of three kids.
                    Family time is just as important as cloud time!
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Current Role */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Current Role</h2>
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Cloud Consultant</h3>
                  <p className="text-primary font-medium mb-2">Cloudar</p>
                  <p className="text-foreground/70">
                    At Cloudar, I help organizations design and implement cloud solutions on AWS.
                    My focus is on infrastructure as code, security best practices, and operational
                    excellence. Every day brings new challenges and opportunities to build something great.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Skills */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Skills & Expertise</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map((skill) => (
                <div
                  key={skill.category}
                  className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors"
                >
                  <h3 className="font-semibold mb-3">{skill.category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {skill.items.map((item) => (
                      <span
                        key={item}
                        className="px-2.5 py-1 rounded-full bg-muted text-sm"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Other Profiles */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Find Me Elsewhere</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <a
                href="https://dev.to/yvthepief"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                    <Code className="w-5 h-5 group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-semibold">DEV Community</h3>
                    <p className="text-sm text-foreground/60">@yvthepief</p>
                  </div>
                </div>
              </a>
              <a
                href="https://community.aws"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                    <Cloud className="w-5 h-5 group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AWS Community</h3>
                    <p className="text-sm text-foreground/60">Community Builder</p>
                  </div>
                </div>
              </a>
              <a
                href="https://yvovanzee.nl"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                    <Users className="w-5 h-5 group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Personal Blog</h3>
                    <p className="text-sm text-foreground/60">yvovanzee.nl</p>
                  </div>
                </div>
              </a>
              <a
                href="https://cloudar.be"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                    <Briefcase className="w-5 h-5 group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Cloudar</h3>
                    <p className="text-sm text-foreground/60">My employer</p>
                  </div>
                </div>
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
