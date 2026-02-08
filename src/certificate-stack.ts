import { Stack, CfnOutput } from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import type { Construct } from 'constructs';
import type { CertificateStackProps } from './types';

/**
 * A CDK Stack that creates an ACM certificate in us-east-1 for CloudFront.
 *
 * CloudFront requires certificates to be in us-east-1, so this stack
 * must be deployed in that region.
 *
 * @example
 * ```typescript
 * new CertificateStack(app, 'CertificateStack', {
 *   env: { account: '123456789', region: 'us-east-1' },
 *   domainName: 'buildinginthecloud.com',
 *   hostedZoneId: 'Z005047721YOSJOMI0XAF',
 * });
 * ```
 */
export class CertificateStack extends Stack {
  /**
   * The ACM certificate for HTTPS
   */
  public readonly certificate: acm.Certificate;

  /**
   * The certificate ARN (for cross-stack reference)
   */
  public readonly certificateArn: string;

  constructor(scope: Construct, id: string, props: CertificateStackProps) {
    super(scope, id, props);

    const { domainName = 'buildinginthecloud.com', hostedZoneId } = props;

    // Import the existing hosted zone
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: hostedZoneId,
      zoneName: domainName,
    });

    // Create ACM certificate with DNS validation
    this.certificate = new acm.Certificate(this, 'Certificate', {
      domainName: domainName,
      subjectAlternativeNames: [`www.${domainName}`],
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    this.certificateArn = this.certificate.certificateArn;

    // Output the certificate ARN
    new CfnOutput(this, 'CertificateArn', {
      value: this.certificate.certificateArn,
      description: 'ACM Certificate ARN for CloudFront',
    });
  }
}
