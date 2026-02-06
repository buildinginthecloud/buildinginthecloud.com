# Building in the Cloud

This monorepo contains the infrastructure and website code for [buildinginthecloud.com](https://buildinginthecloud.com).

## Project Structure

```
├── src/                    # CDK infrastructure code
│   ├── main.ts             # Main entry point + MailRelay stack
│   ├── static-hosting-stack.ts  # S3 + CloudFront hosting
│   ├── github-oidc-stack.ts     # GitHub OIDC IAM role
│   └── types.ts            # TypeScript interfaces
├── test/                   # CDK tests
├── website/                # Next.js website
│   ├── src/
│   │   ├── app/            # Next.js App Router pages
│   │   ├── components/     # React components
│   │   ├── content/blog/   # MDX blog posts
│   │   └── lib/            # Utility functions
│   └── public/             # Static assets
├── .github/workflows/      # GitHub Actions
└── .projenrc.ts            # Projen configuration
```

## Architecture

The infrastructure consists of three CDK stacks:

| Stack | Description |
|-------|-------------|
| `mail-relay` | iCloud mail configuration (MX, SPF, DKIM records) |
| `github-oidc` | GitHub OIDC IAM role for secure CI/CD deployments |
| `static-hosting` | S3 + CloudFront for static website hosting |

### Static Hosting Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Route53   │────▶│  CloudFront │────▶│     S3      │
│  DNS + SSL  │     │     CDN     │     │   Bucket    │
└─────────────┘     └─────────────┘     └─────────────┘
```

- **S3**: Stores the static website files (HTML, CSS, JS, images)
- **CloudFront**: Global CDN with HTTPS, caching, and compression
- **Route53**: DNS records pointing to CloudFront
- **ACM**: SSL certificate for HTTPS

## Prerequisites

- Node.js 20+
- npm
- AWS CLI configured with the `mgmt` profile

## Quick Start

### Infrastructure (CDK)

```bash
# Install dependencies
npm install

# Run tests
npm test

# Deploy all stacks
npx cdk deploy --all --profile mgmt
```

### Website (Next.js)

```bash
cd website

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Deployment

### First-time Setup

1. **Deploy the GitHub OIDC stack** (enables secure deployments from GitHub Actions):

```bash
npx cdk deploy github-oidc --profile mgmt
```

2. **Deploy the static hosting stack**:

```bash
npx cdk deploy static-hosting --profile mgmt
```

3. **Deploy the website** (manual first time, then automatic):

```bash
cd website
npm run build
aws s3 sync out/ s3://buildinginthecloud-com-website --delete --profile mgmt
```

### Automatic Deployments

After initial setup, deployments happen automatically via GitHub Actions when you push to `main`:

1. **Infrastructure job**: Deploys CDK changes
2. **Website job**: Builds Next.js and syncs to S3, then invalidates CloudFront cache

## Website Features

- **Next.js 16** with App Router
- **Static Export** for fast CDN delivery
- **MDX Blog** with syntax highlighting
- **Dark/Light Theme** support
- **RSS Feed** and **Sitemap** generation
- **Tailwind CSS** for styling

## Available Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run CDK tests |
| `npm run build` | Build CDK project |
| `npx cdk deploy --all` | Deploy all stacks |
| `npx cdk diff` | Show deployment changes |

## License

Apache-2.0
