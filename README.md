# Building in the Cloud

This repository contains the CDK code for buildinginthecloud.com.

## Development

This project uses [projen](https://github.com/projen/projen) for project management.

### Prerequisites

- Node.js (v14 or later)
- npm

### Setup

```bash
npm install
```

### Available Commands

- `npm run build` - Build the project
- `npm run test` - Run tests
- `npm run deploy` - Deploy the CDK stack

## CI/CD

This project uses GitHub Actions for continuous integration and deployment.

### GitHub Workflows

- **Build**: Runs when a pull request is created or updated to verify that the code builds successfully.
- **Test**: Runs when a pull request is created or updated to verify that all tests pass.

The test workflow runs `npx projen test` to execute all tests in the repository.

## Project Structure

- `src/` - Source code
  - `main.ts` - Main CDK stack definition
  - `types.ts` - TypeScript type definitions
- `test/` - Test files