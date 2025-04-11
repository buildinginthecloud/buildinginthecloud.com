import { Stack, App } from 'aws-cdk-lib';
import { type Construct } from 'constructs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53_patterns from 'aws-cdk-lib/aws-route53-patterns';
import { Duration } from 'aws-cdk-lib';
import type { MailRelayProps } from './types';

/**
 * Creates a stack that configures mail relay services using Route53
 * for a specified domain with Apple iCloud mail services.
 */
/**
 * A CDK Stack that configures mail relay services using Route53 for Apple iCloud mail services
 * @example
 * ```typescript
 * new MailRelay(app, 'MailRelayStack', {
 *   domainName: 'example.com'
 * });
 * ```
 */
export class MailRelay extends Stack {
  /**
   * The Route53 hosted zone for the domain
   */
  public readonly hostedZone: route53.PublicHostedZone;

  constructor(scope: Construct, id: string, props: MailRelayProps = {}) {
    super(scope, id, props);

    // Create a Route53 hosted zone for the domain
    const domainName = props.domainName ?? 'buildinginthecloud.com';
    const targetDomainName = props.targetDomainName ?? 'yvovanzee.nl';

    // Create a new public hosted zone for the domain
    this.hostedZone = new route53.PublicHostedZone(this, 'HostedZone', {
      zoneName: domainName,
    });

    // Create a TXT Record for apple mail verification
    new route53.TxtRecord(this, 'AppleMailVerification', {
      zone: this.hostedZone,
      recordName: `apple-domain=${domainName}`,
      values: ['"v=spf1 include:icloud.com ~all"'] as const,
      ttl: Duration.minutes(1800),
    });

    // Create Cname record for domainkey validation
    new route53.CnameRecord(this, 'DomainKeyCname', {
      zone: this.hostedZone,
      recordName: `sig1._domainkey.${domainName}`,
      domainName: `sig1.dkim.${domainName}.at.icloudmailadmin.com`,
      ttl: Duration.minutes(1800),
    });

    // Create MX Record pointing to icloud.com
    new route53.MxRecord(this, 'MXRecord', {
      zone: this.hostedZone,
      recordName: domainName,
      values: [
        { priority: 10, hostName: 'mx01.mail.icloud.com' },
        { priority: 20, hostName: 'mx02.mail.icloud.com' },
      ] as const,
      ttl: Duration.minutes(1800),
    });

    new route53_patterns.HttpsRedirect(this, 'Redirect', {
      recordNames: [this.hostedZone.zoneName],
      targetDomain: targetDomainName,
      zone: this.hostedZone,
    });
  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new MailRelay(app, 'buildinginthecloud-dev', { env: devEnv });
// new MyStack(app, 'buildinginthecloud-prod', { env: prodEnv });

app.synth();
