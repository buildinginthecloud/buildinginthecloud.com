import { Stack, CfnOutput, RemovalPolicy, Duration } from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import type { Construct } from 'constructs';
import type { StaticHostingProps } from './types';

/**
 * A CDK Stack that configures static website hosting using S3 + CloudFront.
 *
 * This stack creates:
 * - S3 bucket for static website content
 * - CloudFront distribution with HTTPS
 * - Route53 DNS records
 * - IAM policy for GitHub Actions deployment
 *
 * Note: The ACM certificate must be created separately in us-east-1 (see CertificateStack).
 *
 * @example
 * ```typescript
 * new StaticHostingStack(app, 'StaticHostingStack', {
 *   domainName: 'buildinginthecloud.com',
 *   hostedZoneId: 'Z005047721YOSJOMI0XAF',
 *   certificateArn: 'arn:aws:acm:us-east-1:...',
 * });
 * ```
 */
export class StaticHostingStack extends Stack {
  /**
   * The S3 bucket for website content
   */
  public readonly websiteBucket: s3.Bucket;

  /**
   * The CloudFront distribution
   */
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: StaticHostingProps) {
    super(scope, id, props);

    const { domainName = 'buildinginthecloud.com', hostedZoneId, certificateArn, githubActionsRoleArn } = props;

    // Import the existing hosted zone
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: hostedZoneId,
      zoneName: domainName,
    });

    // Import the ACM certificate from us-east-1
    const certificate = acm.Certificate.fromCertificateArn(this, 'Certificate', certificateArn);

    // Create S3 bucket for website content
    this.websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `${domainName.replace(/\./g, '-')}-website`,
      removalPolicy: RemovalPolicy.RETAIN, // Keep bucket on stack deletion
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: true,
    });

    // Create Origin Access Control for CloudFront -> S3
    const oac = new cloudfront.S3OriginAccessControl(this, 'OAC', {
      signing: cloudfront.Signing.SIGV4_ALWAYS,
    });

    // Create CloudFront distribution
    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(this.websiteBucket, {
          originAccessControl: oac,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true,
      },
      domainNames: [domainName, `www.${domainName}`],
      certificate: certificate,
      defaultRootObject: 'index.html',
      // Handle SPA routing - return index.html for 404s
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/404.html',
          ttl: Duration.minutes(5),
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: Duration.minutes(5),
        },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // Use only NA and EU edge locations
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
    });

    // Create Route53 A record for root domain
    new route53.ARecord(this, 'AliasRecord', {
      zone: hostedZone,
      recordName: domainName,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(this.distribution)),
    });

    // Create Route53 A record for www subdomain
    new route53.ARecord(this, 'WwwAliasRecord', {
      zone: hostedZone,
      recordName: `www.${domainName}`,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(this.distribution)),
    });

    // Grant GitHub Actions role permission to deploy to S3 and invalidate CloudFront
    if (githubActionsRoleArn) {
      const githubRole = iam.Role.fromRoleArn(this, 'GitHubActionsRole', githubActionsRoleArn);

      this.websiteBucket.grantReadWrite(githubRole);
      this.websiteBucket.grantDelete(githubRole);

      githubRole.addToPrincipalPolicy(
        new iam.PolicyStatement({
          actions: ['cloudfront:CreateInvalidation'],
          resources: [`arn:aws:cloudfront::${this.account}:distribution/${this.distribution.distributionId}`],
        }),
      );
    }

    // Outputs
    new CfnOutput(this, 'WebsiteBucketName', {
      value: this.websiteBucket.bucketName,
      description: 'S3 bucket name for website content',
    });

    new CfnOutput(this, 'DistributionId', {
      value: this.distribution.distributionId,
      description: 'CloudFront distribution ID',
    });

    new CfnOutput(this, 'DistributionDomainName', {
      value: this.distribution.distributionDomainName,
      description: 'CloudFront distribution domain name',
    });

    new CfnOutput(this, 'WebsiteUrl', {
      value: `https://${domainName}`,
      description: 'Website URL',
    });
  }
}
