import { awscdk } from "projen";
import { NodePackageManager } from "projen/lib/javascript";
import { DependabotScheduleInterval } from "projen/lib/github";

const project = new awscdk.AwsCdkTypeScriptApp({
  authorName: "Yvo van Zee",
  authorUrl: "buildinginthecloud.com",
  authorEmail: "yvo@buildinginthecloud.com",
  authorOrganization: true,
  name: "buildinginthecloud.com",
  description: "CDK code for buildingthecloud.com",
  cdkVersion: "2.189.0",
  cdkVersionPinning: true,
  defaultReleaseBranch: "main",
  packageManager: NodePackageManager.YARN,
  projenVersion: "0.91.20", // Find the latest projen version here: https://www.npmjs.com/package/projen
  projenrcTs: true,
  release: true,
  deps: ["projen-pipelines", "aws-cdk-github-oidc"],
  devDeps: ["projen-pipelines", "aws-cdk-github-oidc"],
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
    dirs: ["src", "test"],
  },
  autoApproveOptions: {
    allowedUsernames: [
      "dependabot",
      "dependabot[bot]",
      "github-bot",
      "github-actions[bot]",
    ],
    /**
     * The name of the secret that has the GitHub PAT for auto-approving PRs.
     * Generate a new PAT (https://github.com/settings/tokens/new) and add it to your repo's secrets
     */
    secret: "PROJEN_GITHUB_TOKEN",
  },
  dependabot: true,
  dependabotOptions: {
    scheduleInterval: DependabotScheduleInterval.WEEKLY,
    labels: ["dependencies", "auto-approve"],
    groups: {
      default: {
        patterns: ["*"],
        excludePatterns: ["aws-cdk*", "projen"],
      },
    },
    ignore: [{ dependencyName: "aws-cdk-lib" }, { dependencyName: "aws-cdk" }],
  },
  githubOptions: {
    mergifyOptions: {
      rules: [
        {
          name: "Automatic merge for Dependabot pull requests",
          conditions: [
            "author=dependabot[bot]",
            "check-success=build",
            "check-success=test",
          ],
          actions: {
            queue: {
              name: "dependency-updates",
              method: "squash",
              commit_message_template: "{{title}} (#{{number}})",
            },
          },
        },
      ],
    },
    pullRequestLintOptions: {
      semanticTitleOptions: {
        types: [
          "feat",
          "fix",
          "build",
          "chore",
          "ci",
          "docs",
          "style",
          "refactor",
        ],
      },
    },
  },
  gitignore: [
    "__pycache__",
    "__pycache__/",
    "!.eslintrc.js",
    ".cache",
    ".coverage.*",
    ".coverage",
    ".DS_Store",
    ".env",
    ".mypy_cache",
    ".pytest_cache",
    ".Python",
    ".venv/",
    ".vscode",
    "*.js",
    "*.log",
    "*.manifest",
    "*.pyc",
    "*.spec",
    "*.zip",
    "**/cdk-test-report.xml",
    "*node_modules*",
    "build/",
    "coverage/",
    "dist/",
    "downloads/",
    "env/",
    "ENV/",
    "htmlcov/",
    "sdist/",
    "var/",
    "venv/",
  ],
});
project.synth();
