import { awscdk, JsonPatch } from 'projen';
import { AutoQueue, DependabotScheduleInterval } from 'projen/lib/github';
import { JobPermission } from 'projen/lib/github/workflows-model';
import { NodePackageManager } from 'projen/lib/javascript';

const DEPENDABOT_COOLDOWN_DAYS = 7;
const IGNORE_MAJOR_UPDATES = {
  'dependency-name': '*',
  'update-types': ['version-update:semver-major'],
};

const project = new awscdk.AwsCdkTypeScriptApp({
  authorName: 'Yvo van Zee',
  authorUrl: 'buildinginthecloud.com',
  authorEmail: 'yvo@buildinginthecloud.com',
  authorOrganization: true,
  name: 'buildinginthecloud.com',
  description: 'CDK code for buildingthecloud.com',
  cdkVersion: '2.275.0',
  cdkVersionPinning: true,
  defaultReleaseBranch: 'main',
  packageManager: NodePackageManager.NPM,
  projenVersion: '0.104.0', // Find the latest projen version here: https://www.npmjs.com/package/projen
  projenrcTs: true,
  release: false,
  deps: ['aws-cdk-github-oidc'],
  devDeps: ['aws-cdk-github-oidc'],
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
    allowedUsernames: [
      'dependabot',
      'dependabot[bot]',
      'github-bot',
      'github-actions[bot]',
      'yvthepief',
      'Yvo van Zee',
    ],
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
    // Wait a week before proposing a new release, so a compromised or broken
    // release is usually withdrawn before it reaches this repository.
    cooldown: { defaultDays: DEPENDABOT_COOLDOWN_DAYS },
  },
  githubOptions: {
    // Dependabot pull requests are merged by GitHub auto-merge (see AutoQueue
    // below), not by Mergify.
    mergify: false,
    pullRequestLintOptions: {
      semanticTitle: true,
      semanticTitleOptions: {
        types: ['feat', 'fix', 'build', 'chore', 'ci', 'docs', 'style', 'refactor'],
      },
    },
  },
  gitignore: [
    '.claude/',
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

const dependabotFile = project.tryFindObjectFile('.github/dependabot.yml');

// Major updates are not proposed, so they are never merged automatically.
// Projen has no option for update types, so the rule is appended to the
// ignore list of the root package with a JSON patch.
dependabotFile?.patch(JsonPatch.add('/updates/0/ignore/-', IGNORE_MAJOR_UPDATES));

// Dependabot for the Astro site in site/. Projen only configures the root
// package, so the second entry is added to the generated file.
dependabotFile?.addToArray('updates', {
  'package-ecosystem': 'npm',
  'versioning-strategy': 'lockfile-only',
  directory: '/site',
  schedule: { interval: 'weekly' },
  labels: ['dependencies', 'auto-approve'],
  groups: { site: { patterns: ['*'] } },
  ignore: [IGNORE_MAJOR_UPDATES],
  cooldown: { 'default-days': DEPENDABOT_COOLDOWN_DAYS },
});

// Enable GitHub auto-merge on Dependabot pull requests. GitHub merges them
// when the required status checks on main pass. This relies on the branch
// protection of main: without required checks a pull request would merge at
// once.
new AutoQueue(project.github!, {
  allowedUsernames: ['dependabot[bot]'],
  targetBranches: ['main'],
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
        uses: 'actions/checkout@v7',
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
