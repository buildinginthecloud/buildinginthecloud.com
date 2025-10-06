import type { StackProps } from 'aws-cdk-lib';

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
   * The target domain name for HTTPS redirect.
   * All HTTP/HTTPS traffic to the domain will be redirected to this target domain.
   * @default 'yvovanzee.nl'
   */
  readonly targetDomainName?: string;
}

/**
 * Configuration properties for the DomainRedirect stack
 */
export interface DomainRedirectProps extends StackProps {
  /**
   * The source domain name that will redirect to the target domain.
   * @default 'buildinginthecloud.com'
   */
  readonly sourceDomain?: string;

  /**
   * The target domain name where traffic will be redirected.
   * @default 'yvovanzee.nl'
   */
  readonly targetDomain?: string;

  /**
   * Whether to preserve the URL path in the redirect.
   * @default true
   */
  readonly preservePath?: boolean;

  /**
   * Whether to force HTTPS in the redirect.
   * @default true
   */
  readonly forceHttps?: boolean;

  /**
   * HTTP redirect code to use.
   * @default 301
   */
  readonly redirectCode?: number;
}

/**
 * Redirect configuration interface
 */
export interface RedirectConfig {
  /** Source domain (e.g., buildinginthecloud.com) */
  readonly sourceDomain: string;

  /** Target domain (e.g., yvovanzee.nl) */
  readonly targetDomain: string;

  /** Whether to preserve URL path in redirect */
  readonly preservePath: boolean;

  /** Whether to force HTTPS */
  readonly forceHttps: boolean;

  /** HTTP redirect status code */
  readonly redirectCode: number;
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
