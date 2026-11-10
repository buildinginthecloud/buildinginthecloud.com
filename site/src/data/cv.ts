// Content of the CV page. Edit this file to update /cv.

export interface Project {
  client: string;
  role: string;
  description?: string;
}

export interface WorkExperience {
  title: string;
  company: string;
  location: string;
  period: string;
  current: boolean;
  description: string;
  highlights?: string[];
  projects?: Project[];
}

export const workExperience: WorkExperience[] = [
  {
    title: 'Cloud Consultant',
    company: 'Cloudar',
    location: 'Belgium/Netherlands',
    period: 'February 2026 - Present',
    current: true,
    description: 'Helping organizations design and implement cloud solutions on AWS with a focus on infrastructure as code, security best practices, and operational excellence.',
    highlights: [
      'AWS platform engineering with Terraform, Terragrunt and GitLab CI',
      'FinOps: cost allocation, reporting and optimization',
      'Serverless integration platforms (API Gateway, Lambda, WAF, mTLS)',
      'EKS and GitOps with ArgoCD and Helm',
      'IAM Identity Center and multi-account governance',
      'AI-assisted engineering tooling (Claude Code, MCP)',
    ],
    projects: [
      {
        client: 'TKP Pensioen',
        role: 'Cloud Engineer, Cloud Application Hosting (platform team)',
        description:
          'Platform engineer in the team that runs the AWS multi-account organization for 17 pension funds (70+ accounts, 50+ EKS clusters), managed entirely with Terraform, Terragrunt and GitLab CI. Designed and built the FinOps cost dashboard from the ground up: a Python collector over Cost and Usage Report 2.0 parquet with EKS split-cost allocation, team attribution and per-principal Bedrock attribution, reconciled against Cost Explorer and served as a static site on GitLab Pages. A fleet-wide Lambda cost analysis led to right-sized provisioned concurrency across 47 accounts and a backlog of unused functions. On the API Gateway and Lambda integration platform delivered S3 archiving of large payloads, ServiceNow to Intune integrations and TLS 1.3 enforcement for the DigiD audit. Hardened the internal Terraform pipeline generator after a production incident with pagination guardrails and a static checker that surfaced 75+ unpaginated AWS API calls. Designed IAM Identity Center permission sets, fixed platform-wide breakglass assignments, resolved ArgoCD and Helm GitOps issues across 27 chart repositories, and rotated in as weekly support engineer. Built Claude Code based triage tooling for the support channel on top of a verified knowledge base of 1,000+ historical cases.',
      },
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
        description: 'Part of the Cloud Center of Enablement (CCoE), the consulting arm of the ANWB Cloud team. Guided application teams in their cloud journey on AWS and Azure. Organized monthly Cloud Days (knowledge sharing sessions) and a large-scale Cloud Summit with external speakers. Contributed to the migration program, specifically the ESB/ISB migration from JBoss web servers on-premise to EKS Fargate on AWS, setting up infrastructure and network integrations. Co-initiated the Cloud Solution Library, providing reusable building blocks to help teams accelerate cloud adoption.',
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
      { client: 'TKP Pensioen', role: 'Cloud consultancy' },
      { client: 'SURFsara', role: 'Elasticsearch on AWS' },
      { client: 'SwissCom', role: 'Hackathon in Zurich' },
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
      { client: 'Heijmans', role: 'Website hosting on AWS' },
      { client: 'Tebodin', role: 'Cloud infrastructure' },
      { client: 'INDI (indi.nl)', role: 'Terraform infrastructure' },
    ],
  },
  {
    title: 'Technical Consultant',
    company: 'Sentia',
    location: 'Netherlands',
    period: '2008 - 2018',
    current: false,
    description: 'Started career as a technical consultant in the on-premise hosting world. Managed mission-critical hosting environments, customer datacenters, and enterprise applications. Gained deep experience with infrastructure, networking, and system administration before transitioning to cloud.',
    highlights: [
      'Mission-critical hosting management',
      'Datacenter & infrastructure operations',
      'VMware virtualization',
      'Windows & Linux system administration',
    ],
  },
];

export const education = [
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

export const certifications = [
  {
    name: 'AWS Certified Solutions Architect - Professional',
    issuer: 'Amazon Web Services',
    expiry: 'March 2027',
    level: 'Professional',
    credlyUrl: 'https://www.credly.com/badges/5a637150-1e8e-40c6-9675-d4ea88a7e913',
  },
  {
    name: 'AWS Certified DevOps Engineer - Professional',
    issuer: 'Amazon Web Services',
    expiry: 'October 2028',
    level: 'Professional',
    credlyUrl: 'https://www.credly.com/badges/e6a6d0c8-91d3-458d-b8a6-9656d638ea6a',
  },
  {
    name: 'AWS Certified Solutions Architect - Associate',
    issuer: 'Amazon Web Services',
    expiry: 'March 2027',
    level: 'Associate',
    credlyUrl: 'https://www.credly.com/badges/04181bdd-c165-4bea-a023-775959a08eec',
  },
  {
    name: 'AWS Certified Developer - Associate',
    issuer: 'Amazon Web Services',
    expiry: 'October 2028',
    level: 'Associate',
    credlyUrl: 'https://www.credly.com/badges/26637f2a-48e1-4f81-a852-9fdec35271c1',
  },
  {
    name: 'AWS Certified SysOps Administrator - Associate',
    issuer: 'Amazon Web Services',
    expiry: 'October 2028',
    level: 'Associate',
    credlyUrl: 'https://www.credly.com/badges/6e1fd6e1-36dd-42e7-a11b-2a5d3d80b994',
  },
  {
    name: 'AWS Certified Cloud Practitioner',
    issuer: 'Amazon Web Services',
    expiry: 'March 2027',
    level: 'Foundational',
    credlyUrl: 'https://www.credly.com/badges/20d98a50-cfdd-45cc-bf0b-e0ee32263d32',
  },
];

export const skills = {
  cloud: ['AWS', 'Cloud Architecture', 'Multi-Account Strategy', 'Landing Zones', 'Well-Architected Framework'],
  iac: ['AWS CDK', 'CloudFormation', 'Terraform', 'Terragrunt'],
  programming: ['Python', 'TypeScript', 'Bash'],
  containers: ['Docker', 'ECS', 'Fargate', 'EKS', 'Helm', 'ArgoCD'],
  cicd: ['AWS CodePipeline', 'CodeBuild', 'GitHub Actions', 'GitLab CI', 'Azure DevOps', 'Jenkins'],
  data: ['Glue', 'Athena', 'EMR', 'MWAA (Airflow)', 'LakeFormation', 'RedShift', 'Confluent Kafka'],
  networking: ['Transit Gateway', 'Direct Connect', 'CloudWAN', 'Network Firewall', 'VPC'],
  security: ['IAM', 'IAM Identity Center', 'KMS', 'Security Hub', 'GuardDuty', 'Config', 'CloudTrail', 'cdk-nag'],
  monitoring: ['CloudWatch', 'Splunk Observability', 'PagerDuty', 'OpsGenie'],
  os: ['Linux', 'MacOS', 'Windows'],
};
