import type { StackProps } from 'aws-cdk-lib';

/**
 * Configuration properties for the Certificate stack
 */
export interface CertificateStackProps extends StackProps {
  /**
   * The domain name for the certificate.
   * @default 'buildinginthecloud.com'
   */
  readonly domainName?: string;

  /**
   * The ID of the Route53 hosted zone for DNS validation.
   */
  readonly hostedZoneId: string;
}

/**
 * Configuration properties for the StaticHosting stack
 */
export interface StaticHostingProps extends StackProps {
  /**
   * The domain name for the website.
   * @default 'buildinginthecloud.com'
   */
  readonly domainName?: string;

  /**
   * The ID of the Route53 hosted zone.
   */
  readonly hostedZoneId: string;

  /**
   * The ARN of the ACM certificate (must be in us-east-1).
   */
  readonly certificateArn: string;

  /**
   * Path to the built website output directory.
   * @default './website/out'
   */
  readonly websitePath?: string;
}
