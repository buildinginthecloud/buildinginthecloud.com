import { Stack, CfnOutput, RemovalPolicy, Duration } from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import type { Construct } from 'constructs';
import type { StaticHostingProps } from './types';

/**
 * Viewer request function. The site is built with one HTML file per page
 * (/cv.html, /blog/post.html) and is served on clean URLs.
 *
 * - / is served from /index.html
 * - /cv is served from /cv.html
 * - /blog/ redirects to /blog, so every page has one URL
 * - Paths with a file extension are passed through
 *
 * Exported so the tests can run the same source.
 */
export const URL_REWRITE_FUNCTION_CODE = `
function handler(event) {
  var request = event.request;
  var uri = request.uri;
  if (uri === '/') {
    request.uri = '/index.html';
  } else if (uri.endsWith('/')) {
    // Strip all leading and trailing slashes so the target is always a path
    // on this host, never a protocol-relative URL such as //example.com.
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: { location: { value: '/' + uri.replace(/^\\/+|\\/+$/g, '') } },
    };
  } else if (!uri.includes('.')) {
    request.uri = uri + '.html';
  }
  return request;
}
`;

/**
 * Content security policy for the static site.
 *
 * - Scripts and styles only load from the site itself. 'unsafe-inline' is
 *   needed for the inline theme script and for the inline styles of the
 *   syntax highlighter.
 * - 'wasm-unsafe-eval' lets the Pagefind search index run its WebAssembly.
 * - Images may come from any HTTPS host, because posts embed external images.
 */
export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join('; ');

/**
 * A CDK Stack that configures static website hosting using S3 + CloudFront.
 *
 * This stack creates:
 * - S3 bucket for static website content
 * - CloudFront distribution with HTTPS
 * - Route53 DNS records
 *
 * Website content is deployed via the CI/CD pipeline using aws s3 sync,
 * not via CDK BucketDeployment, to avoid Lambda timeout issues.
 *
 * Note: The ACM certificate must be created separately in us-east-1 (see CertificateStack).
 */
export class StaticHostingStack extends Stack {
  public readonly websiteBucket: s3.Bucket;
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: StaticHostingProps) {
    super(scope, id, props);

    const { domainName = 'buildinginthecloud.com', hostedZoneId, certificateArn } = props;

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
      removalPolicy: RemovalPolicy.RETAIN,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: true,
    });

    // Create Origin Access Control for CloudFront -> S3
    const oac = new cloudfront.S3OriginAccessControl(this, 'OAC', {
      signing: cloudfront.Signing.SIGV4_ALWAYS,
    });

    // Rewrite clean URLs to the .html files of the static build.
    const urlRewriteFunction = new cloudfront.Function(this, 'UrlRewriteFunction', {
      code: cloudfront.FunctionCode.fromInline(URL_REWRITE_FUNCTION_CODE),
      runtime: cloudfront.FunctionRuntime.JS_2_0,
      comment: 'Rewrite clean URLs to the .html files of the static build',
    });

    // Security headers for every response. HSTS does not include subdomains,
    // because other subdomains of the domain are not managed by this stack.
    const responseHeadersPolicy = new cloudfront.ResponseHeadersPolicy(this, 'SecurityHeaders', {
      comment: 'Security headers for the static website',
      securityHeadersBehavior: {
        contentSecurityPolicy: { contentSecurityPolicy: CONTENT_SECURITY_POLICY, override: true },
        contentTypeOptions: { override: true },
        frameOptions: { frameOption: cloudfront.HeadersFrameOption.SAMEORIGIN, override: true },
        referrerPolicy: {
          referrerPolicy: cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
          override: true,
        },
        strictTransportSecurity: {
          accessControlMaxAge: Duration.days(365),
          includeSubdomains: false,
          override: true,
        },
      },
    });

    // Create CloudFront distribution
    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(this.websiteBucket, {
          originAccessControl: oac,
          // LIST makes S3 answer 404 for a missing object. With READ only it
          // answers 403, which cannot be told apart from a real access error.
          // The viewer request function never forwards a directory path, so
          // a bucket listing is not reachable through CloudFront.
          originAccessLevels: [cloudfront.AccessLevel.READ, cloudfront.AccessLevel.LIST],
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy,
        compress: true,
        functionAssociations: [
          {
            function: urlRewriteFunction,
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          },
        ],
      },
      domainNames: [domainName, `www.${domainName}`],
      certificate: certificate,
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          // A missing page shows the 404 page and keeps the 404 status, so
          // search engines do not index it.
          httpStatus: 404,
          responseHttpStatus: 404,
          responsePagePath: '/404.html',
          ttl: Duration.minutes(5),
        },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
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
