import type { StackProps } from 'aws-cdk-lib';
import type * as route53 from 'aws-cdk-lib/aws-route53';

/**
 * Configuration properties for the MailRelay stack
 */
export interface MailRelayProps extends StackProps {
  /**
   * The domain name for which the mail relay is being configured.
   * This will be used to create the Route53 hosted zone and configure mail records.
   * @default 'buildinginthecloud.com'
   */
  readonly domainName?: string;

  /**
   * The ID of an existing Route53 hosted zone to use.
   * If provided, the stack will import this zone instead of creating a new one.
   * @example 'Z005047721YOSJOMI0XAF'
   */
  readonly hostedZoneId?: string;
}

/**
 * Configuration properties for the GitHubOidc stack
 */
export interface GitHubOidcProps extends StackProps {
  /**
   * The GitHub repository owner/organization.
   * @default 'buildinginthecloud'
   */
  readonly githubOwner?: string;

  /**
   * The GitHub repository name.
   * @default 'buildinginthecloud.com'
   */
  readonly githubRepo?: string;
}

/**
 * Configuration properties for the AmplifyHosting stack
 */
export interface AmplifyHostingProps extends StackProps {
  /**
   * The domain name for the website.
   * @default 'buildinginthecloud.com'
   */
  readonly domainName?: string;

  /**
   * The GitHub repository owner/organization.
   * @default 'buildinginthecloud'
   */
  readonly githubOwner?: string;

  /**
   * The GitHub repository name.
   * @default 'buildinginthecloud.com'
   */
  readonly githubRepo?: string;

  /**
   * The name of the AWS Secrets Manager secret containing the GitHub OAuth token.
   * @default 'github-token'
   */
  readonly githubTokenSecretName?: string;

  /**
   * The branch name to deploy.
   * @default 'main'
   */
  readonly branchName?: string;

  /**
   * The Route53 hosted zone for the domain.
   * If provided, custom domain will be configured.
   */
  readonly hostedZone?: route53.IHostedZone;

  /**
   * The root directory of the app in the monorepo.
   * @default 'buildinginthecloud'
   */
  readonly appRoot?: string;
}

/**
 * Mail record configuration constants
 */
export const MAIL_CONFIG = {
  /** Time-to-live for DNS records in minutes */
  TTL: 1800,

  /** SPF record value for iCloud mail */
  SPF_RECORD: 'v=spf1 include:icloud.com ~all',

  /** MX record priorities and hostnames */
  MX_RECORDS: [
    { priority: 10, hostName: 'mx01.mail.icloud.com' },
    { priority: 20, hostName: 'mx02.mail.icloud.com' },
  ] as const,

  TXT_RECORD: 'apple-domain=Qc2qLE9vanUyATjL',
} as const;
