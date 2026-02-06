# Building in the Cloud

This monorepo contains the infrastructure and website code for [buildinginthecloud.com](https://buildinginthecloud.com).

## Project Structure

```
├── src/                    # CDK infrastructure code
│   ├── main.ts             # Main entry point + MailRelay stack
│   ├── amplify-hosting-stack.ts  # Amplify Hosting configuration
│   ├── github-oidc-stack.ts      # GitHub OIDC IAM role
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
| `buildinginthecloud-dev` | Mail relay configuration (iCloud mail) using existing Route53 hosted zone |
| `github-oidc` | GitHub OIDC IAM role for secure CI/CD deployments |
| `amplify-hosting-dev` | AWS Amplify Hosting for the Next.js static website |

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

1. **Deploy the GitHub OIDC stack**:

```bash
npx cdk deploy github-oidc --profile mgmt
```

2. **Deploy all stacks**:

```bash
npx cdk deploy --all --profile mgmt
```

### Automatic Deployments

After initial setup, deployments happen automatically via GitHub Actions when you push to `main`:
- CDK infrastructure changes trigger CDK deployment
- Website changes trigger Amplify auto-build

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
