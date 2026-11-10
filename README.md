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
├── site/                   # Astro website
│   ├── src/
│   │   ├── pages/          # Routes (home, blog, about, CV, search, feed)
│   │   ├── layouts/        # Base layout with header and footer
│   │   ├── components/     # Astro components
│   │   ├── content/blog/   # MDX blog posts
│   │   ├── data/           # CV content
│   │   └── lib/            # Post helpers
│   ├── public/             # Static assets
│   └── compose.yaml        # Local development in Docker
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

- Node.js 22.23.4 or later (required by Astro 7)
- npm
- Docker (optional, for local development of the website)
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

### Website (Astro)

Run the development server in Docker. The site is served on http://localhost:4321 with hot reload.

```bash
cd site
docker compose up
```

Or run it directly with Node.js:

```bash
cd site

# Install dependencies
npm ci

# Run the development server
npm run dev

# Type-check the project
npm run check

# Build for production into dist/ and generate the search index
npm run build
```

The search page needs the Pagefind index. `npm run build` generates it for production. For the development server, run `npm run search:index` once. The Docker setup does this at startup.

To publish a post, add an `.mdx` file to `site/src/content/blog/`. The build validates the frontmatter against the schema in `site/src/content.config.ts`.

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
cd site
npm run build
aws s3 sync dist/ s3://buildinginthecloud-com-website --delete --profile mgmt
```

### Automatic Deployments

After initial setup, deployments happen automatically via GitHub Actions when you push to `main`:

1. **Infrastructure job**: Deploys CDK changes
2. **Website job**: Builds the Astro site and syncs it to S3, then invalidates the CloudFront cache

## Website Features

- **Astro 7** static build, served as plain HTML without a client-side framework
- **MDX blog** with content collections, syntax highlighting, tags and reading time
- **Search** with Pagefind, a static index generated at build time
- **Dark and light theme**
- **RSS feed** and **sitemap** generation
- **Tailwind CSS 4** for styling
- **Printable CV** on A4

## Available Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run CDK tests |
| `npm run build` | Build CDK project |
| `npx cdk deploy --all` | Deploy all stacks |
| `npx cdk diff` | Show deployment changes |

## License

Apache-2.0
