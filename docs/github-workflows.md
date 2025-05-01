# GitHub Workflows

This document explains the GitHub workflows configured in this repository.

## Auto-Approve Workflow

The auto-approve workflow automatically approves pull requests from specific users when they have the 'auto-approve' label.

### How It Works

1. When a pull request is created, updated, or labeled, the workflow checks if:
   - The PR has the 'auto-approve' label
   - The PR author is one of the allowed users (including yvthepief)

2. If both conditions are met, the PR is automatically approved.

### Allowed Users

The following users are configured for auto-approval:
- dependabot
- dependabot[bot]
- github-bot
- github-actions[bot]
- yvthepief
- Yvo van Zee

### How to Use

To get a pull request automatically approved:

1. Create a pull request
2. Add the 'auto-approve' label to the pull request
3. If you are one of the allowed users, the PR will be automatically approved

### Configuration

The auto-approve workflow is configured in `.github/workflows/auto-approve.yml` and uses the standard GitHub token for authentication.

## Build Workflow

The build workflow runs when a pull request is created or updated to verify that the code builds successfully.

### Self-Mutation

The build workflow includes a self-mutation job that applies any changes made by the build process back to the pull request. This is useful for automatically fixing formatting issues or updating generated files.

## Test Workflow

The test workflow runs when a pull request is created or updated to verify that all tests pass.

## Pull Request Lint Workflow

The pull request lint workflow validates that pull request titles follow the semantic commit convention.

## Security Considerations

All workflows use the standard GitHub token (`GITHUB_TOKEN`) which is automatically provided by GitHub and has the necessary permissions for most operations. This token is scoped to the specific workflow run and has limited permissions based on the workflow configuration.