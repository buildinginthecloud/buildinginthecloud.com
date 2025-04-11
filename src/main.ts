import { Stack, App } from 'aws-cdk-lib';
import { type Construct } from 'constructs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53_patterns from 'aws-cdk-lib/aws-route53-patterns';
import { Duration } from 'aws-cdk-lib';
import type { MailRelayProps } from './types';
import { MAIL_CONFIG } from './types';

/**
 * A CDK Stack that configures mail relay services using Route53 for Apple iCloud mail services.
 * This stack creates:
 * - A Route53 hosted zone for the domain
 * - SPF record for mail verification
 * - DKIM record for domain key validation
 * - MX records for mail routing
 * - HTTPS redirect for web traffic
 * 
 * @example
 * ```typescript
 * new MailRelay(app, 'MailRelayStack', {
 *   domainName: 'example.com',
 *   targetDomainName: 'target.com'
 * });
 * ```
 */
export class MailRelay extends Stack {
  /**
   * The Route53 hosted zone for the domain.
   * This zone contains all the DNS records for mail configuration.
   */
  public readonly hostedZone: route53.PublicHostedZone;

  constructor(scope: Construct, id: string, props: MailRelayProps = {}) {
    super(scope, id, props);

    // Extract domain names with defaults
    const domainName = props.domainName ?? 'buildinginthecloud.com';
    const targetDomainName = props.targetDomainName ?? 'yvovanzee.nl';

    // Create a new public hosted zone for the domain
    this.hostedZone = new route53.PublicHostedZone(this, 'HostedZone', {
      zoneName: domainName,
    });

    // Create a TXT Record for apple mail verification (SPF)
    new route53.TxtRecord(this, 'TXTRecord', {
      zone: this.hostedZone,
      // recordName: `apple-domain=${domainName}`,
      values: [MAIL_CONFIG.TXT_RECORD],
      ttl: Duration.minutes(MAIL_CONFIG.TTL),
    });
    new route53.TxtRecord(this, 'SPFRecord', {
      zone: this.hostedZone,
      recordName: `@`,
      values: [MAIL_CONFIG.SPF_RECORD],
      ttl: Duration.minutes(MAIL_CONFIG.TTL),
    })

    // Create CNAME record for DKIM validation
    new route53.CnameRecord(this, 'DKIMRecord', {
      zone: this.hostedZone,
      recordName: `sig1._domainkey.${domainName}`,
      domainName: `sig1.dkim.${domainName}.at.icloudmailadmin.com`,
      ttl: Duration.minutes(MAIL_CONFIG.TTL),
    });

    // Create MX Record pointing to iCloud mail servers
    new route53.MxRecord(this, 'MXRecord', {
      zone: this.hostedZone,
      recordName: domainName,
      values: [...MAIL_CONFIG.MX_RECORDS],
      ttl: Duration.minutes(MAIL_CONFIG.TTL),
    });

    // Create HTTPS redirect for web traffic
    new route53_patterns.HttpsRedirect(this, 'Redirect', {
      recordNames: [this.hostedZone.zoneName],
      targetDomain: targetDomainName,
      zone: this.hostedZone,
    });
  }
}

// Environment configuration for development
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
} as const;

// Create and configure the CDK app
const app = new App();

new MailRelay(app, 'buildinginthecloud-dev', { env: devEnv });
// new MailRelay(app, 'buildinginthecloud-prod', { env: prodEnv });

app.synth();

