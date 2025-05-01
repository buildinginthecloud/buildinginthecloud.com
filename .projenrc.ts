import { awscdk } from 'projen';
import { DependabotScheduleInterval } from 'projen/lib/github';
import { JobPermission } from 'projen/lib/github/workflows-model';
import { NodePackageManager } from 'projen/lib/javascript';

const project = new awscdk.AwsCdkTypeScriptApp({
  authorName: 'Yvo van Zee',
  authorUrl: 'buildinginthecloud.com',
  authorEmail: 'yvo@buildinginthecloud.com',
  authorOrganization: true,
  name: 'buildinginthecloud.com',
  description: 'CDK code for buildingthecloud.com',
  cdkVersion: '2.193.0',
  cdkVersionPinning: true,
  defaultReleaseBranch: 'main',
  packageManager: NodePackageManager.NPM,
  projenVersion: '0.91.29', // Find the latest projen version here: https://www.npmjs.com/package/projen
  projenrcTs: true,
  release: false,
  deps: [],
  devDeps: ['@types/js-yaml'],
  prettier: true,
  prettierOptions: {
    settings: {
      printWidth: 120,
      singleQuote: true,
      jsxSingleQuote: true,
    },
  },
  eslintOptions: {
    prettier: true,
    dirs: ['src', 'test'],
  },
  autoApproveOptions: {
    allowedUsernames: ['dependabot', 'dependabot[bot]', 'github-bot', 'github-actions[bot]'],
    /**
     * The name of the secret that has the GitHub PAT for auto-approving PRs.
     * Generate a new PAT (https://github.com/settings/tokens/new) and add it to your repo's secrets
     */
    secret: 'PROJEN_GITHUB_TOKEN',
  },
  dependabot: true,
  dependabotOptions: {
    scheduleInterval: DependabotScheduleInterval.WEEKLY,
    labels: ['dependencies', 'auto-approve'],
    groups: {
      default: {
        patterns: ['*'],
        excludePatterns: ['aws-cdk*', 'projen'],
      },
    },
    ignore: [{ dependencyName: 'aws-cdk-lib' }, { dependencyName: 'aws-cdk' }],
  },
  githubOptions: {
    mergify: true,
    mergifyOptions: {
      rules: [
        {
          name: 'Automatic merge for Dependabot pull requests',
          conditions: ['author=dependabot[bot]', 'check-success=build', 'check-success=test'],
          actions: {
            review: {
              type: 'APPROVE',
              message: 'Thanks for the PR! I will merge it now.',
            },
            merge: {
              method: 'merge',
            },
          },
        },
      ],
    },
    pullRequestLintOptions: {
      semanticTitle: true,
      semanticTitleOptions: {
        types: ['feat', 'fix', 'build', 'chore', 'ci', 'docs', 'style', 'refactor'],
      },
    },
  },
  gitignore: [
    '__pycache__',
    '__pycache__/',
    '!.eslintrc.js',
    '.cache',
    '.coverage.*',
    '.coverage',
    '.DS_Store',
    '.env',
    '.mypy_cache',
    '.pytest_cache',
    '.Python',
    '.venv/',
    '.vscode',
    '*.js',
    '*.log',
    '*.manifest',
    '*.pyc',
    '*.spec',
    '*.zip',
    '**/cdk-test-report.xml',
    '*node_modules*',
    'build/',
    'coverage/',
    'dist/',
    'downloads/',
    'env/',
    'ENV/',
    'htmlcov/',
    'sdist/',
    'var/',
    'venv/',
  ],
});

// Add a GitHub workflow to run tests when a pull request is created
const testWorkflow = project.github!.addWorkflow('test');
testWorkflow.on({
  pullRequest: {},
  workflowDispatch: {},
});

testWorkflow.addJobs({
  test: {
    runsOn: ['ubuntu-latest'],
    permissions: {
      contents: JobPermission.READ,
    },
    steps: [
      {
        name: 'Checkout',
        uses: 'actions/checkout@v4',
        with: {
          ref: '${{ github.event.pull_request.head.ref }}',
          repository: '${{ github.event.pull_request.head.repo.full_name }}',
        },
      },
      {
        name: 'Install dependencies',
        run: 'npm install',
      },
      {
        name: 'Run tests',
        run: 'npx projen test',
      },
    ],
  },
});

project.synth();
