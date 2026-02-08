import { Stack, App, Duration } from 'aws-cdk-lib';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { type Construct } from 'constructs';
import { CertificateStack } from './certificate-stack';
import { StaticHostingStack } from './static-hosting-stack';
import type { MailRelayProps } from './types';
import { MAIL_CONFIG } from './types';

/**
 * A CDK Stack that configures mail relay services using Route53 for Apple iCloud mail services.
 * This stack creates:
 * - A Route53 hosted zone for the domain (or uses existing one)
 * - SPF record for mail verification
 * - DKIM record for domain key validation
 * - MX records for mail routing
 *
 * @example
 * ```typescript
 * new MailRelay(app, 'MailRelayStack', {
 *   domainName: 'example.com',
 *   hostedZoneId: 'Z123456789', // optional: use existing hosted zone
 * });
 * ```
 */
export class MailRelay extends Stack {
  /**
   * The Route53 hosted zone for the domain.
   * This zone contains all the DNS records for mail configuration.
   */
  public readonly hostedZone: route53.IHostedZone;

  constructor(scope: Construct, id: string, props: MailRelayProps = {}) {
    super(scope, id, props);

    // Extract domain names with defaults
    const domainName = props.domainName ?? 'buildinginthecloud.com';

    // Use existing hosted zone if ID is provided, otherwise create a new one
    if (props.hostedZoneId) {
      this.hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
        hostedZoneId: props.hostedZoneId,
        zoneName: domainName,
      });
    } else {
      this.hostedZone = new route53.PublicHostedZone(this, 'HostedZone', {
        zoneName: domainName,
      });
    }

    // Create mail records (regardless of whether hosted zone is new or imported)

    // Create a TXT Record for apple mail verification (SPF)
    new route53.TxtRecord(this, 'TXTRecord', {
      zone: this.hostedZone,
      values: [MAIL_CONFIG.TXT_RECORD, MAIL_CONFIG.SPF_RECORD],
      ttl: Duration.seconds(MAIL_CONFIG.TTL),
    });

    // Create CNAME record for DKIM validation
    new route53.CnameRecord(this, 'DKIMRecord', {
      zone: this.hostedZone,
      recordName: `sig1._domainkey.${domainName}`,
      domainName: `sig1.dkim.${domainName}.at.icloudmailadmin.com`,
      ttl: Duration.seconds(MAIL_CONFIG.TTL),
    });

    // Create MX Record pointing to iCloud mail servers
    new route53.MxRecord(this, 'MXRecord', {
      zone: this.hostedZone,
      recordName: domainName,
      values: [...MAIL_CONFIG.MX_RECORDS],
      ttl: Duration.seconds(MAIL_CONFIG.TTL),
    });
  }
}

// Environment configuration
const devEnv = {
  account: '517095477860', // AWS management account
  region: 'eu-central-1',
} as const;

// US East 1 environment for CloudFront certificates (required by CloudFront)
const usEast1Env = {
  account: '517095477860',
  region: 'us-east-1',
} as const;

// Existing Route53 hosted zone configuration
const HOSTED_ZONE_ID = 'Z005047721YOSJOMI0XAF';
const DOMAIN_NAME = 'buildinginthecloud.com';

// Create and configure the CDK app
const app = new App();

// Mail relay stack for email configuration (uses existing hosted zone)
new MailRelay(app, 'buildinginthecloud-mail-relay', {
  env: devEnv,
  domainName: DOMAIN_NAME,
  hostedZoneId: HOSTED_ZONE_ID, // Use existing hosted zone
});

// Certificate stack in us-east-1 (required for CloudFront)
const certificateStack = new CertificateStack(app, 'certificate', {
  env: usEast1Env,
  domainName: DOMAIN_NAME,
  hostedZoneId: HOSTED_ZONE_ID,
  crossRegionReferences: true,
});

// Static hosting stack for the Next.js website (S3 + CloudFront)
new StaticHostingStack(app, 'static-hosting', {
  env: devEnv,
  domainName: DOMAIN_NAME,
  hostedZoneId: HOSTED_ZONE_ID,
  certificateArn: certificateStack.certificateArn,
  crossRegionReferences: true,
});

app.synth();
