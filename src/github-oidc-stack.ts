import {
  GithubActionsIdentityProvider,
  GithubActionsRole,
  type IGithubActionsIdentityProvider,
} from 'aws-cdk-github-oidc';
import { Stack, CfnOutput, Duration } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import type { Construct } from 'constructs';
import type { GitHubOidcProps } from './types';

/**
 * A CDK Stack that configures GitHub OIDC for secure AWS deployments.
 * This allows GitHub Actions to deploy to AWS without storing AWS credentials.
 *
 * @example
 * ```typescript
 * new GitHubOidcStack(app, 'GitHubOidcStack', {
 *   githubOwner: 'buildinginthecloud',
 *   githubRepo: 'buildinginthecloud.com',
 * });
 * ```
 */
export class GitHubOidcStack extends Stack {
  /**
   * The GitHub Actions IAM role ARN
   */
  public readonly roleArn: string;

  /**
   * The GitHub OIDC Identity Provider
   */
  public readonly provider: IGithubActionsIdentityProvider;

  constructor(scope: Construct, id: string, props: GitHubOidcProps) {
    super(scope, id, props);

    const { githubOwner = 'buildinginthecloud', githubRepo = 'buildinginthecloud.com' } = props;

    // Create or import the GitHub OIDC Identity Provider
    // Only one provider per account is allowed, so we check if it exists first
    try {
      this.provider = GithubActionsIdentityProvider.fromAccount(this, 'GithubProvider');
    } catch {
      // Provider doesn't exist, create it
      this.provider = new GithubActionsIdentityProvider(this, 'GithubProvider');
    }
    const provider = this.provider;

    // Create the IAM role that GitHub Actions will assume
    // Using wildcard filter to allow both push and workflow_dispatch events
    const deployRole = new GithubActionsRole(this, 'GitHubActionsDeployRole', {
      provider: provider,
      owner: githubOwner,
      repo: githubRepo,
      filter: '*', // Allow all events from this repo (push, workflow_dispatch, etc.)
      roleName: `${githubRepo.replace(/\./g, '-')}-github-actions-role`,
      description: `GitHub Actions deployment role for ${githubOwner}/${githubRepo}`,
      maxSessionDuration: Duration.hours(1),
    });

    // Grant permissions needed for CDK deployments
    deployRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'));

    // Alternative: More restrictive permissions (recommended for production)
    // deployRole.addToPolicy(new iam.PolicyStatement({
    //   effect: iam.Effect.ALLOW,
    //   actions: [
    //     'cloudformation:*',
    //     'amplify:*',
    //     's3:*',
    //     'iam:*',
    //     'route53:*',
    //     'ssm:GetParameter',
    //     'secretsmanager:GetSecretValue',
    //   ],
    //   resources: ['*'],
    // }));

    this.roleArn = deployRole.roleArn;

    // Outputs
    new CfnOutput(this, 'GitHubActionsRoleArn', {
      value: this.roleArn,
      description: 'ARN of the IAM role for GitHub Actions',
      exportName: 'GitHubActionsRoleArn',
    });

    new CfnOutput(this, 'GitHubRepository', {
      value: `${githubOwner}/${githubRepo}`,
      description: 'GitHub repository that can assume this role',
    });
  }
}
