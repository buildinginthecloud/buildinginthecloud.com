import { Stack } from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import type { Construct } from 'constructs';
import type { RedirectProps } from './types';

/**
 * A CDK Stack that redirects a domain to a target URL using CloudFront.
 *
 * This stack creates:
 * - A CloudFront Function that returns a 301 redirect to the target URL
 * - A CloudFront distribution with the redirect function on viewer-request
 * - Route53 A records for the root domain and www subdomain
 *
 * Note: The ACM certificate must be created separately in us-east-1 (see CertificateStack).
 */
export class RedirectStack extends Stack {
  constructor(scope: Construct, id: string, props: RedirectProps) {
    super(scope, id, props);

    const { domainName, hostedZoneId, certificateArn, redirectTo } = props;

    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId,
      zoneName: domainName,
    });

    const certificate = acm.Certificate.fromCertificateArn(this, 'Certificate', certificateArn);

    // CloudFront Function that returns a 301 redirect before reaching the origin
    const redirectFunction = new cloudfront.Function(this, 'RedirectFunction', {
      code: cloudfront.FunctionCode.fromInline(`
function handler(event) {
  return {
    statusCode: 301,
    statusDescription: 'Moved Permanently',
    headers: {
      location: { value: '${redirectTo}' }
    }
  };
}
      `),
      runtime: cloudfront.FunctionRuntime.JS_2_0,
      comment: `Redirects ${domainName} to ${redirectTo}`,
    });

    // CloudFront distribution — origin is never reached due to the viewer-request function
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new origins.HttpOrigin('buildinginthecloud.com'),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        functionAssociations: [
          {
            function: redirectFunction,
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          },
        ],
      },
      domainNames: [domainName, `www.${domainName}`],
      certificate,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
    });

    // Route53 A record for root domain
    new route53.ARecord(this, 'AliasRecord', {
      zone: hostedZone,
      recordName: domainName,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });

    // Route53 A record for www subdomain
    new route53.ARecord(this, 'WwwAliasRecord', {
      zone: hostedZone,
      recordName: `www.${domainName}`,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });
  }
}
