import { Metadata } from 'next';
import { Briefcase, GraduationCap, Award, Code, Cloud, Calendar, MapPin, ExternalLink, Building2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Curriculum Vitae',
  description: 'Professional experience and background of Yvo van Zee, Cloud Consultant at Cloudar and AWS Community Builder.',
};

interface Project {
  client: string;
  role: string;
  description?: string;
}

interface WorkExperience {
  title: string;
  company: string;
  location: string;
  period: string;
  current: boolean;
  description: string;
  highlights?: string[];
  projects?: Project[];
}

const workExperience: WorkExperience[] = [
  {
    title: 'Cloud Consultant',
    company: 'Cloudar',
    location: 'Belgium/Netherlands',
    period: 'February 2026 - Present',
    current: true,
    description: 'Helping organizations design and implement cloud solutions on AWS with a focus on infrastructure as code, security best practices, and operational excellence.',
    highlights: [
      'AWS architecture and solution design',
      'Infrastructure as Code with CDK',
      'Cloud migration and modernization',
      'Security and compliance',
    ],
  },
  {
    title: 'Principal Consultant',
    company: 'FreshMinds',
    location: 'Netherlands',
    period: 'September 2024 - January 2026',
    current: false,
    description: 'Facilitating an engineering culture where consultants are intrinsically motivated to continuously develop through knowledge sharing, mentorship, and coaching.',
    highlights: [
      'Mentoring and coaching 25 consultants',
      'Technical and personal development guidance',
      'Leading knowledge sharing sessions',
      'Training tech leads in technical interviews',
    ],
    projects: [
      {
        client: 'ANWB',
        role: 'Cloud Consultant in Cloud Center of Enablement',
        description: 'Helped building a Cloud Community within the ANWB by organizing Cloud Days and a Summit. Other tasks where helping teams with their cloud journey and land in AWS. Helped ESB/ISB migrate from on premise to AWS',
      },
    ],
  },
  {
    title: 'AWS Lead Architect & Cloud Consultant',
    company: 'Oblivion Cloud Control / Xebia',
    location: 'Netherlands',
    period: 'June 2021 - June 2024',
    current: false,
    description: 'Led cloud initiatives and architected complex AWS solutions for enterprise clients in financial and industrial sectors.',
    highlights: [
      'Data Analytics Platform development',
      'Landing zone design and implementation',
      'Complex network architecture (multi-cloud)',
      'Team leadership and knowledge transfer',
    ],
    projects: [
      {
        client: 'ABN AMRO Clearing Bank',
        role: 'AWS Lead Architect',
        description: 'Developed and built a Data Analytics Platform on AWS. Implemented streaming (Confluent Kafka) and batch processing solutions using Lambda, Glue, MWAA, S3, RedShift, Athena, and LakeFormation.',
      },
      {
        client: 'Envalior (DSM carve-out)',
        role: 'AWS Lead Architect',
        description: 'Led the migration from DSM AWS environment to new landing zone. Designed complex network topology with Transit Gateway and multi-cloud connectivity. Migrated Data Analytics Platform within 6-month deadline.',
      },
    ],
  },
  {
    title: 'AWS Lead Architect & Cloud Consultant',
    company: 'Oblivion Cloud Control / Xebia',
    location: 'Netherlands',
    period: '2020 - 2021',
    current: false,
    description: 'Designed and built enterprise landing zones and established Cloud Centers of Excellence.',
    projects: [
      {
        client: 'PostNL',
        role: 'AWS Lead Architect',
        description: 'Built landing zone and established Cloud Center of Excellence. Led workshops, architected solutions, and helped hire and train internal cloud team.',
      },
    ],
  },
  {
    title: 'AWS Cloud Consultant',
    company: 'Oblivion Cloud Control',
    location: 'Netherlands',
    period: '2018 - 2019',
    current: false,
    description: 'Delivered AWS consultancy for various enterprise clients. Conducted workshops, designed landing zones, and performed cloud migrations.',
    projects: [
      { client: 'KPN', role: 'Cloud Center of Excellence setup' },
      { client: 'WPG Uitgevers', role: 'Landing zone & migration' },
      { client: 'Minox', role: 'Well-Architected Review & migration' },
      { client: 'ABN AMRO', role: 'Account vending machine development' },
      { client: 'Medis', role: 'AppStream 2.0 training platform' },
      { client: 'ZuidZorg', role: 'Datacenter to cloud migration' },
    ],
  },
];

const education = [
  {
    degree: 'Bachelor of Technology',
    field: 'Computer Science - Information Technology',
    school: 'Hogeschool van Amsterdam',
    location: 'Amsterdam, Netherlands',
    period: '2008 - 2014',
  },
  {
    degree: 'Consultants Development Masterclass',
    field: 'Professional Development',
    school: 'TIAS School for Business and Society',
    location: 'Xebia Program',
    period: '2022',
  },
  {
    degree: 'Lead the Way',
    field: 'Leadership Program',
    school: 'TIAS School for Business and Society',
    location: 'Xebia Program',
    period: '2023',
  },
];

const certifications = [
  {
    name: 'AWS Certified Solutions Architect - Professional',
    issuer: 'Amazon Web Services',
    expiry: 'March 2027',
    badge: '🏆',
    level: 'Professional',
    credlyUrl: 'https://www.credly.com/badges/5a637150-1e8e-40c6-9675-d4ea88a7e913',
  },
  {
    name: 'AWS Certified DevOps Engineer - Professional',
    issuer: 'Amazon Web Services',
    expiry: 'October 2025',
    badge: '🏆',
    level: 'Professional',
    credlyUrl: 'https://www.credly.com/badges/e6a6d0c8-91d3-458d-b8a6-9656d638ea6a',
  },
  {
    name: 'AWS Certified Solutions Architect - Associate',
    issuer: 'Amazon Web Services',
    expiry: 'March 2027',
    badge: '📜',
    level: 'Associate',
    credlyUrl: 'https://www.credly.com/badges/04181bdd-c165-4bea-a023-775959a08eec',
  },
  {
    name: 'AWS Certified Developer - Associate',
    issuer: 'Amazon Web Services',
    expiry: 'October 2025',
    badge: '📜',
    level: 'Associate',
    credlyUrl: 'https://www.credly.com/badges/26637f2a-48e1-4f81-a852-9fdec35271c1',
  },
  {
    name: 'AWS Certified SysOps Administrator - Associate',
    issuer: 'Amazon Web Services',
    expiry: 'October 2025',
    badge: '📜',
    level: 'Associate',
    credlyUrl: 'https://www.credly.com/badges/6e1fd6e1-36dd-42e7-a11b-2a5d3d80b994',
  },
  {
    name: 'AWS Certified Cloud Practitioner',
    issuer: 'Amazon Web Services',
    expiry: 'March 2027',
    badge: '☁️',
    level: 'Foundational',
    credlyUrl: 'https://www.credly.com/badges/20d98a50-cfdd-45cc-bf0b-e0ee32263d32',
  },
];

const skills = {
  cloud: ['AWS', 'Cloud Architecture', 'Multi-Account Strategy', 'Landing Zones', 'Well-Architected Framework'],
  iac: ['AWS CDK', 'CloudFormation', 'Terraform'],
  programming: ['Python', 'TypeScript', 'Bash'],
  containers: ['Docker', 'ECS', 'Fargate', 'EKS'],
  cicd: ['AWS CodePipeline', 'CodeBuild', 'GitHub Actions', 'Azure DevOps', 'Jenkins'],
  data: ['Glue', 'Athena', 'EMR', 'MWAA (Airflow)', 'LakeFormation', 'RedShift', 'Confluent Kafka'],
  networking: ['Transit Gateway', 'Direct Connect', 'CloudWAN', 'Network Firewall', 'VPC'],
  security: ['IAM', 'KMS', 'Security Hub', 'GuardDuty', 'Config', 'CloudTrail', 'cdk-nag'],
};

export default function CVPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="w-24 h-24 rounded-full gradient-bg mx-auto mb-6 flex items-center justify-center">
              <span className="text-4xl font-bold text-white">YZ</span>
            </div>
            <h1 className="text-4xl font-bold mb-2">Yvo van Zee</h1>
            <p className="text-xl text-primary font-medium mb-2">Cloud Consultant & AWS Community Builder</p>
            <p className="text-foreground/60 mb-4">AWS Architect, Consultant & Engineer</p>
            <div className="flex items-center justify-center gap-2 text-foreground/60">
              <MapPin className="w-4 h-4" />
              <span>Netherlands</span>
            </div>

            {/* Quick links */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <a
                href="https://linkedin.com/in/yvovanzee"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 transition-colors text-sm"
              >
                LinkedIn
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://github.com/yvthepief"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground/10 text-foreground/70 hover:bg-foreground/20 transition-colors text-sm"
              >
                GitHub
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://twitter.com/yvthepief"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 transition-colors text-sm"
              >
                Twitter
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Summary */}
          <section className="mb-16">
            <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 to-accent/5 p-6">
              <p className="text-lg text-foreground/80 leading-relaxed">
                Experienced Cloud Consultant who loves helping companies on their cloud journey. From setting up
                Cloud Centers of Excellence, developing AWS Landing Zones, designing complex network architectures,
                to building Data Analytics Platforms on AWS. Everything based on Infrastructure as Code with
                CI/CD in mind. As a proud 6x certified AWS Cloud Consultant and AWS Community Builder,
                gathering and sharing knowledge runs through my veins.
              </p>
            </div>
          </section>

          {/* Certifications */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Award className="w-5 h-5 text-secondary" />
              </div>
              <h2 className="text-2xl font-bold">AWS Certifications</h2>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">6x Certified</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {certifications.map((cert, index) => (
                <a
                  key={index}
                  href={cert.credlyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`rounded-xl border bg-card p-4 hover:border-primary/30 hover:shadow-md transition-all group ${
                    cert.level === 'Professional' ? 'border-secondary/50' : 'border-border'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform">{cert.badge}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">{cert.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          cert.level === 'Professional' ? 'bg-secondary/10 text-secondary' :
                          cert.level === 'Associate' ? 'bg-primary/10 text-primary' :
                          'bg-muted text-foreground/60'
                        }`}>
                          {cert.level}
                        </span>
                        <span className="text-xs text-foreground/50">Exp: {cert.expiry}</span>
                        <ExternalLink className="w-3 h-3 text-foreground/30 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Credly link */}
            <div className="mt-6 text-center">
              <a
                href="https://www.credly.com/users/yvo-van-zee"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors text-sm font-medium"
              >
                <Award className="w-4 h-4" />
                View verified badges on Credly
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </section>

          {/* Work Experience */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-primary/10">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Work Experience</h2>
            </div>

            <div className="space-y-6">
              {workExperience.map((job, index) => (
                <div key={index} className="relative pl-8 border-l-2 border-border">
                  {/* Timeline dot */}
                  <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${job.current ? 'bg-primary border-primary' : 'bg-card border-border'}`} />

                  <div className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-lg font-semibold">{job.title}</h3>
                        <p className="text-primary font-medium">{job.company}</p>
                      </div>
                      <div className="text-right text-sm text-foreground/60">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {job.period}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </div>
                      </div>
                    </div>

                    <p className="text-foreground/70 text-sm mb-3">{job.description}</p>

                    {job.highlights && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.highlights.map((highlight, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-full bg-muted text-xs">
                            {highlight}
                          </span>
                        ))}
                      </div>
                    )}

                    {job.projects && job.projects.length > 0 && (
                      <div className="border-t border-border pt-3 mt-3">
                        <p className="text-xs font-semibold text-foreground/60 mb-2 flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> Key Projects
                        </p>
                        <div className="space-y-2">
                          {job.projects.map((project, i) => (
                            <div key={i} className="text-sm">
                              <span className="font-medium">{project.client}</span>
                              <span className="text-foreground/50"> — {project.role}</span>
                              {project.description && (
                                <p className="text-xs text-foreground/60 mt-1">{project.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Skills */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-accent/10">
                <Code className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-2xl font-bold">Skills & Technologies</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                  <Cloud className="w-4 h-4 text-primary" />
                  Cloud & Architecture
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {skills.cloud.map((skill) => (
                    <span key={skill} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold mb-3 text-sm">Infrastructure as Code</h3>
                <div className="flex flex-wrap gap-1.5">
                  {skills.iac.map((skill) => (
                    <span key={skill} className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold mb-3 text-sm">Programming</h3>
                <div className="flex flex-wrap gap-1.5">
                  {skills.programming.map((skill) => (
                    <span key={skill} className="px-2 py-0.5 rounded-full bg-muted text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold mb-3 text-sm">Containers</h3>
                <div className="flex flex-wrap gap-1.5">
                  {skills.containers.map((skill) => (
                    <span key={skill} className="px-2 py-0.5 rounded-full bg-muted text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold mb-3 text-sm">CI/CD & DevOps</h3>
                <div className="flex flex-wrap gap-1.5">
                  {skills.cicd.map((skill) => (
                    <span key={skill} className="px-2 py-0.5 rounded-full bg-muted text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold mb-3 text-sm">Networking</h3>
                <div className="flex flex-wrap gap-1.5">
                  {skills.networking.map((skill) => (
                    <span key={skill} className="px-2 py-0.5 rounded-full bg-muted text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 sm:col-span-2">
                <h3 className="font-semibold mb-3 text-sm">Data & Analytics</h3>
                <div className="flex flex-wrap gap-1.5">
                  {skills.data.map((skill) => (
                    <span key={skill} className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 sm:col-span-2">
                <h3 className="font-semibold mb-3 text-sm">Security</h3>
                <div className="flex flex-wrap gap-1.5">
                  {skills.security.map((skill) => (
                    <span key={skill} className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Education */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-green-500/10">
                <GraduationCap className="w-5 h-5 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold">Education</h2>
            </div>

            <div className="space-y-4">
              {education.map((edu, index) => (
                <div key={index} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{edu.degree}</h3>
                      <p className="text-primary text-sm">{edu.field}</p>
                      <p className="text-foreground/60 text-sm">{edu.school}</p>
                    </div>
                    <span className="text-sm text-foreground/50">{edu.period}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center">
            <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 to-accent/5 p-8">
              <h2 className="text-2xl font-bold mb-4">Let's Work Together</h2>
              <p className="text-foreground/70 mb-6">
                Interested in collaborating on cloud projects or need AWS consultancy?
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="mailto:yvo@cloudar.be"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-bg text-white font-medium hover:opacity-90 transition-all"
                >
                  Get in Touch
                </a>
                <a
                  href="https://cloudar.be"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-primary/20 font-medium hover:border-primary/40 hover:bg-primary/5 transition-all"
                >
                  Visit Cloudar
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
