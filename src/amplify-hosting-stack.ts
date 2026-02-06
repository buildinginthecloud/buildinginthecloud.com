import * as amplify from '@aws-cdk/aws-amplify-alpha';
import { Stack, SecretValue, CfnOutput } from 'aws-cdk-lib';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import type { Construct } from 'constructs';
import type { AmplifyHostingProps } from './types';

/**
 * A CDK Stack that configures AWS Amplify Hosting for a Next.js website.
 * This stack creates:
 * - An Amplify App connected to a GitHub repository
 * - Auto-build configuration for the main branch
 * - Custom domain configuration with Route53
 * - Environment variables for the build
 *
 * @example
 * ```typescript
 * new AmplifyHostingStack(app, 'AmplifyHostingStack', {
 *   domainName: 'buildinginthecloud.com',
 *   githubOwner: 'buildinginthecloud',
 *   githubRepo: 'buildinginthecloud.com',
 *   githubTokenSecretName: 'github-token',
 * });
 * ```
 */
export class AmplifyHostingStack extends Stack {
  /**
   * The Amplify App resource
   */
  public readonly amplifyApp: amplify.App;

  /**
   * The main branch configuration
   */
  public readonly mainBranch: amplify.Branch;

  constructor(scope: Construct, id: string, props: AmplifyHostingProps) {
    super(scope, id, props);

    const {
      domainName = 'buildinginthecloud.com',
      githubOwner = 'buildinginthecloud',
      githubRepo = 'buildinginthecloud.com',
      githubTokenSecretName = 'github-token',
      branchName = 'main',
      hostedZone,
      appRoot = 'buildinginthecloud',
    } = props;

    // Create the Amplify App
    this.amplifyApp = new amplify.App(this, 'AmplifyApp', {
      appName: domainName.replace(/\./g, '-'), // Use domain name as app name
      sourceCodeProvider: new amplify.GitHubSourceCodeProvider({
        owner: githubOwner,
        repository: githubRepo,
        oauthToken: SecretValue.secretsManager(githubTokenSecretName),
      }),
      autoBranchDeletion: true,
      platform: amplify.Platform.WEB_COMPUTE, // Required for Next.js SSR
      buildSpec: codebuild.BuildSpec.fromObjectToYaml({
        version: 1,
        applications: [
          {
            appRoot: appRoot,
            frontend: {
              phases: {
                preBuild: {
                  commands: ['npm ci'],
                },
                build: {
                  commands: [
                    'npm run build',
                    // Clean up duplicate node_modules in .next to prevent bundling errors
                    'rm -rf .next/standalone/node_modules/.pnpm || true',
                  ],
                },
              },
              artifacts: {
                baseDirectory: '.next',
                files: ['**/*'],
              },
              cache: {
                paths: ['node_modules/**/*', '.next/cache/**/*'],
              },
            },
          },
        ],
      }),
      environmentVariables: {
        AMPLIFY_MONOREPO_APP_ROOT: appRoot,
        _CUSTOM_IMAGE: 'amplify:al2023', // Use Amazon Linux 2023 for Node.js 20+
        // Next.js production optimizations
        NODE_ENV: 'production',
        NEXT_TELEMETRY_DISABLED: '1',
      },
    });

    // Add the main branch
    this.mainBranch = this.amplifyApp.addBranch(branchName, {
      autoBuild: true,
      stage: 'PRODUCTION',
      environmentVariables: {
        // Branch-specific environment variables can be added here
        NEXT_PUBLIC_SITE_URL: `https://${domainName}`,
      },
    });

    // Add custom domain if hosted zone is provided
    if (hostedZone) {
      const domain = this.amplifyApp.addDomain(domainName, {
        enableAutoSubdomain: false,
      });

      // Map root domain to main branch
      domain.mapRoot(this.mainBranch);

      // Map www subdomain to main branch
      domain.mapSubDomain(this.mainBranch, 'www');

      // Create Route53 records for the custom domain
      // Note: Amplify automatically creates the necessary DNS records when you add a domain,
      // but we need to ensure the hosted zone is properly configured

      // Output the DNS validation records (Amplify will show these in the console)
      new CfnOutput(this, 'AmplifyDomainStatus', {
        value: `Check Amplify Console for domain ${domainName} DNS configuration`,
        description: 'Domain configuration status',
      });
    }

    // Outputs
    new CfnOutput(this, 'AmplifyAppId', {
      value: this.amplifyApp.appId,
      description: 'Amplify App ID',
    });

    new CfnOutput(this, 'AmplifyDefaultDomain', {
      value: `https://${branchName}.${this.amplifyApp.defaultDomain}`,
      description: 'Amplify default domain URL',
    });

    new CfnOutput(this, 'AmplifyBranchUrl', {
      value: this.mainBranch.branchName,
      description: 'Amplify branch name',
    });
  }
}
