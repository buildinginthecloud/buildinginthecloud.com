# Building in the Cloud - Infrastructure

This repository contains the CDK infrastructure code for [buildinginthecloud.com](https://buildinginthecloud.com).

## Architecture

The infrastructure consists of three CDK stacks:

| Stack | Description |
|-------|-------------|
| `buildinginthecloud-dev` | Mail relay configuration (iCloud mail) using existing Route53 hosted zone |
| `github-oidc` | GitHub OIDC provider and IAM role for secure CI/CD deployments |
| `amplify-hosting-dev` | AWS Amplify Hosting for the Next.js website |

## Prerequisites

- Node.js 20+
- npm
- AWS CLI configured with the `mgmt` profile
- GitHub Personal Access Token (for Amplify GitHub integration)

## Setup

```bash
npm install
```

## Deployment

### First-time Setup

1. **Deploy the GitHub OIDC stack** (enables secure deployments from GitHub Actions):

```bash
npx cdk deploy github-oidc --profile mgmt
```

2. **Create the GitHub token secret** in AWS Secrets Manager:

```bash
# Create a GitHub PAT with 'repo' and 'admin:repo_hook' scopes
aws secretsmanager create-secret \
  --name github-token \
  --secret-string "ghp_YOUR_GITHUB_PAT" \
  --profile mgmt \
  --region eu-central-1
```

3. **Deploy all stacks**:

```bash
npx cdk deploy --all --profile mgmt
```

### Subsequent Deployments

After the initial setup, deployments happen automatically via GitHub Actions when you push to `main`. The workflow uses OIDC authentication - no AWS credentials stored in GitHub!

You can also deploy manually:

```bash
npx cdk deploy --all --profile mgmt
```

## GitHub Actions CI/CD

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that:

- Triggers on push to `main` branch
- Authenticates to AWS using OIDC (no secrets required!)
- Runs tests
- Deploys CDK changes

### How OIDC Authentication Works

1. GitHub Actions requests a JWT token from GitHub's OIDC provider
2. The token is exchanged for temporary AWS credentials via the IAM role
3. The role is scoped to only allow the `buildinginthecloud/buildinginthecloud.com` repository
4. Only the `main` branch can trigger deployments

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build the project |
| `npm run test` | Run tests |
| `npm run deploy` | Deploy the CDK stacks |
| `npx cdk diff` | Show deployment changes |
| `npx cdk synth` | Synthesize CloudFormation templates |

## Project Structure

```
├── src/
│   ├── main.ts                    # Main entry point + MailRelay stack
│   ├── amplify-hosting-stack.ts   # Amplify Hosting configuration
│   ├── github-oidc-stack.ts       # GitHub OIDC provider + IAM role
│   └── types.ts                   # TypeScript interfaces
├── test/
│   ├── main.test.ts               # MailRelay stack tests
│   └── amplify-hosting.test.ts    # Amplify stack tests
├── .github/
│   └── workflows/
│       └── deploy.yml             # GitHub Actions deployment workflow
└── .projenrc.ts                   # Projen configuration
```

## Amplify Hosting Features

- **Next.js SSR Support**: Uses `WEB_COMPUTE` platform for server-side rendering
- **Monorepo Support**: Configured for `buildinginthecloud` subdirectory
- **Auto-build**: Triggers on push to main branch
- **Custom Domain**: Configured for `buildinginthecloud.com` and `www.buildinginthecloud.com`
- **Amazon Linux 2023**: Uses latest runtime for Node.js 20+ support

## Environment Variables

The Amplify app is configured with:

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Next.js production mode |
| `NEXT_TELEMETRY_DISABLED` | `1` | Disable Next.js telemetry |
| `NEXT_PUBLIC_SITE_URL` | `https://buildinginthecloud.com` | Public site URL |
| `AMPLIFY_MONOREPO_APP_ROOT` | `buildinginthecloud` | Monorepo app root |

## Troubleshooting

### "github-token" secret not found

Create the secret in AWS Secrets Manager:

```bash
aws secretsmanager create-secret \
  --name github-token \
  --secret-string "ghp_YOUR_PAT" \
  --profile mgmt \
  --region eu-central-1
```

### GitHub Actions deployment fails

Ensure the OIDC stack is deployed and the IAM role ARN in `.github/workflows/deploy.yml` matches the deployed role.

### Amplify build fails

Check the Amplify Console for build logs. Common issues:
- Missing environment variables
- Node.js version mismatch
- Build command failures

## License

Apache-2.0
