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
 * Mail record configuration constants
 */
export const MAIL_CONFIG = {
  /** Time-to-live for DNS records in seconds */
  TTL: 1800,

  /** SPF record value for iCloud mail */
  SPF_RECORD: 'v=spf1 include:icloud.com ~all',

  /** MX record priorities and hostnames */
  MX_RECORDS: [
    { priority: 10, hostName: 'mx01.mail.icloud.com.' },
    { priority: 20, hostName: 'mx02.mail.icloud.com.' },
  ] as const,

  TXT_RECORD: 'apple-domain=Qc2qLE9vanUyATjL',
} as const;
