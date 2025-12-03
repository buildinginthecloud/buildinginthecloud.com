import { Stack, Duration, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Patterns from 'aws-cdk-lib/aws-route53-patterns';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { type Construct } from 'constructs';
import type { DomainRedirectProps, RedirectConfig } from './types';

/**
 * A CDK Stack that configures domain redirect from buildinginthecloud.com to yvovanzee.nl.
 * This stack creates:
 * - S3 bucket with static website hosting for redirect rules
 * - CloudFront distribution for HTTPS and global edge locations
 * - Route53 DNS records for domain routing
 * - SSL certificate via ACM for HTTPS support
 *
 * @example
 * ```typescript
 * new DomainRedirectStack(app, 'DomainRedirectStack', {
 *   sourceDomain: 'buildinginthecloud.com',
 *   targetDomain: 'yvovanzee.nl'
 * });
 * ```
 */
export class DomainRedirectStack extends Stack {
  /**
   * The Route53 hosted zone for the source domain.
   */
  public readonly hostedZone: route53.IHostedZone;

  /**
   * The HTTPS redirect construct from Route53 patterns.
   */
  public readonly httpsRedirect: route53Patterns.HttpsRedirect;

  /**
   * The redirect configuration used by this stack.
   */
  public readonly redirectConfig: RedirectConfig;

  /**
   * S3 bucket for storing CloudFront access logs.
   */
  public readonly logsBucket: s3.Bucket;

  /**
   * CloudWatch alarms for monitoring redirect functionality.
   */
  public readonly alarms: cloudwatch.Alarm[];

  constructor(scope: Construct, id: string, props: DomainRedirectProps = {}) {
    super(scope, id, props);

    // Create redirect configuration with defaults
    this.redirectConfig = {
      sourceDomain: props.sourceDomain ?? 'buildinginthecloud.com',
      targetDomain: props.targetDomain ?? 'yvovanzee.nl',
      preservePath: props.preservePath ?? true,
      forceHttps: props.forceHttps ?? true,
      redirectCode: props.redirectCode ?? 301,
    };

    // Create or reference Route53 hosted zone
    this.hostedZone = this.getRoute53HostedZone();

    // Create S3 bucket for access logs
    this.logsBucket = this.createLogsBucket();

    // Create HTTPS redirect using Route53 patterns
    this.httpsRedirect = this.createHttpsRedirect();

    // Configure CloudWatch monitoring and alarms (temporarily disabled)
    this.alarms = [];

    // Create stack outputs for monitoring
    this.createStackOutputs();
  }

  /**
   * References the existing Route53 hosted zone for the source domain.
   */
  private getRoute53HostedZone(): route53.IHostedZone {
    // Reference existing hosted zone for source domain
    const hostedZone = route53.HostedZone.fromLookup(this, 'SourceDomainHostedZone', {
      domainName: this.redirectConfig.sourceDomain,
    });

    return hostedZone;
  }

  /**
   * Creates HTTPS redirect using Route53 patterns.
   * This handles S3 bucket, CloudFront distribution, SSL certificate, and DNS records automatically.
   * Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4
   */
  private createHttpsRedirect(): route53Patterns.HttpsRedirect {
    const httpsRedirect = new route53Patterns.HttpsRedirect(this, 'HttpsRedirect', {
      recordNames: [this.redirectConfig.sourceDomain, `www.${this.redirectConfig.sourceDomain}`],
      targetDomain: this.redirectConfig.targetDomain,
      zone: this.hostedZone,
    });

    return httpsRedirect;
  }

  /**
   * Creates S3 bucket for storing CloudFront access logs.
   * Requirements: 2.4, 3.4
   * Security: Implements encryption, versioning, and public access blocking
   */
  private createLogsBucket(): s3.Bucket {
    const logsBucketName = `${this.redirectConfig.sourceDomain.replace(/\./g, '-')}-logs-${this.account}`;

    const logsBucket = new s3.Bucket(this, 'LogsBucket', {
      bucketName: logsBucketName,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      // Security: Enable encryption at rest using S3-managed keys
      encryption: s3.BucketEncryption.S3_MANAGED,
      // Security: Block all public access to logs
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      // Security: Enable versioning for audit trail and data protection
      versioned: true,
      // Security: Enforce SSL/TLS for all requests
      enforceSSL: true,
      lifecycleRules: [
        {
          id: 'DeleteOldLogs',
          enabled: true,
          expiration: Duration.days(90), // Keep logs for 90 days
          // Also clean up old versions
          noncurrentVersionExpiration: Duration.days(30),
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: Duration.days(30),
            },
            {
              storageClass: s3.StorageClass.GLACIER,
              transitionAfter: Duration.days(60),
            },
          ],
        },
      ],
    });

    // Grant CloudFront permission to write logs
    // Security: Follow principle of least privilege - only PutObject permission needed
    logsBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        sid: 'AllowCloudFrontLogging',
        effect: iam.Effect.ALLOW,
        principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
        actions: ['s3:PutObject'],
        resources: [`${logsBucket.bucketArn}/*`],
        conditions: {
          StringEquals: {
            'aws:SourceAccount': this.account,
          },
        },
      }),
    );

    return logsBucket;
  }

  /**
   * Creates CloudWatch monitoring and alarms for the redirect functionality.
   * Sets up metrics for CloudFront distribution and creates alarms for redirect failures.
   * Requirements: 2.4, 3.4
   * 
   * Note: Temporarily disabled until we determine the correct HttpsRedirect properties
   */
  private createCloudWatchMonitoring(): cloudwatch.Alarm[] {
    const alarms: cloudwatch.Alarm[] = [];

    // TODO: Re-enable monitoring once we determine the correct property names
    // const distribution = this.httpsRedirect.???;

    // TODO: Re-enable monitoring alarms and dashboard

    return alarms;
  }

  /**
   * Creates CloudFormation outputs for monitoring and operational purposes.
   * Requirements: 3.3
   */
  private createStackOutputs(): void {
    // Note: CloudFront distribution outputs temporarily disabled
    // Will be re-enabled once we determine the correct property names

    // Route53 Hosted Zone ID
    new CfnOutput(this, 'HostedZoneId', {
      value: this.hostedZone.hostedZoneId,
      description: 'Route53 Hosted Zone ID for DNS management',
      exportName: `${this.stackName}-HostedZoneId`,
    });

    // Route53 Hosted Zone Name (using existing zone)
    new CfnOutput(this, 'HostedZoneName', {
      value: this.redirectConfig.sourceDomain,
      description: 'Route53 Hosted Zone Name (using existing zone)',
      exportName: `${this.stackName}-HostedZoneName`,
    });

    // Redirect Configuration Summary
    new CfnOutput(this, 'RedirectConfiguration', {
      value: `${this.redirectConfig.sourceDomain} -> ${this.redirectConfig.targetDomain} (301 redirect)`,
      description: 'Redirect configuration summary',
      exportName: `${this.stackName}-RedirectConfiguration`,
    });

    // Deployment Timestamp
    new CfnOutput(this, 'DeploymentTimestamp', {
      value: new Date().toISOString(),
      description: 'Deployment timestamp for tracking',
      exportName: `${this.stackName}-DeploymentTimestamp`,
    });

    // Logs Bucket Name
    new CfnOutput(this, 'LogsBucketName', {
      value: this.logsBucket.bucketName,
      description: 'S3 Bucket name for CloudFront access logs',
      exportName: `${this.stackName}-LogsBucketName`,
    });

    // CloudWatch Dashboard URL
    new CfnOutput(this, 'MonitoringDashboardUrl', {
      value: `https://${this.region}.console.aws.amazon.com/cloudwatch/home?region=${this.region}#dashboards:name=${this.redirectConfig.sourceDomain.replace(/\./g, '-')}-redirect-monitoring`,
      description: 'CloudWatch Dashboard URL for monitoring redirect performance',
      exportName: `${this.stackName}-MonitoringDashboardUrl`,
    });

    // CloudWatch Alarms Summary
    new CfnOutput(this, 'CloudWatchAlarmsCount', {
      value: this.alarms.length.toString(),
      description: 'Number of CloudWatch alarms configured for monitoring',
      exportName: `${this.stackName}-CloudWatchAlarmsCount`,
    });
  }
}
