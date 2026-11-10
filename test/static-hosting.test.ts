import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { CONTENT_SECURITY_POLICY, StaticHostingStack, URL_REWRITE_FUNCTION_CODE } from '../src/static-hosting-stack';

describe('StaticHostingStack', () => {
  let app: App;
  let stack: StaticHostingStack;
  let template: Template;

  beforeEach(() => {
    app = new App();
    stack = new StaticHostingStack(app, 'TestStaticHostingStack', {
      domainName: 'test-domain.com',
      hostedZoneId: 'Z123456789',
      certificateArn: 'arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012',
    });
    template = Template.fromStack(stack);
  });

  test('creates an S3 bucket', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketName: 'test-domain-com-website',
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    });
  });

  test('creates a CloudFront distribution', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        Aliases: ['test-domain.com', 'www.test-domain.com'],
        DefaultRootObject: 'index.html',
        HttpVersion: 'http2and3',
        PriceClass: 'PriceClass_100',
      },
    });
  });

  test('imports certificate from ARN', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        ViewerCertificate: {
          AcmCertificateArn: 'arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012',
        },
      },
    });
  });

  test('creates Route53 A records for root and www', () => {
    template.resourceCountIs('AWS::Route53::RecordSet', 2);

    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Name: 'test-domain.com.',
      Type: 'A',
    });

    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Name: 'www.test-domain.com.',
      Type: 'A',
    });
  });

  test('creates a URL rewrite CloudFront Function', () => {
    template.hasResourceProperties('AWS::CloudFront::Function', {
      FunctionConfig: {
        Runtime: 'cloudfront-js-2.0',
      },
    });
  });

  test('creates outputs', () => {
    template.hasOutput('WebsiteBucketName', {});
    template.hasOutput('DistributionId', {});
    template.hasOutput('DistributionDomainName', {});
    template.hasOutput('WebsiteUrl', {});
  });
});

describe('StaticHostingStack error handling and headers', () => {
  let template: Template;

  beforeEach(() => {
    const stack = new StaticHostingStack(new App(), 'TestStaticHostingStack', {
      domainName: 'test-domain.com',
      hostedZoneId: 'Z123456789',
      certificateArn: 'arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012',
    });
    template = Template.fromStack(stack);
  });

  test('returns the 404 page with a 404 status for missing objects', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        CustomErrorResponses: [
          {
            ErrorCode: 404,
            ResponseCode: 404,
            ResponsePagePath: '/404.html',
          },
        ],
      },
    });
  });

  test('lets CloudFront list the bucket so that S3 answers 404 instead of 403', () => {
    template.hasResourceProperties('AWS::S3::BucketPolicy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: Match.arrayWith(['s3:ListBucket']),
            Effect: 'Allow',
            Principal: { Service: 'cloudfront.amazonaws.com' },
            Condition: Match.objectLike({ StringEquals: Match.anyValue() }),
          }),
        ]),
      },
    });
  });

  test('attaches a response headers policy with security headers', () => {
    template.hasResourceProperties('AWS::CloudFront::ResponseHeadersPolicy', {
      ResponseHeadersPolicyConfig: {
        SecurityHeadersConfig: {
          ContentSecurityPolicy: { ContentSecurityPolicy: CONTENT_SECURITY_POLICY, Override: true },
          ContentTypeOptions: { Override: true },
          FrameOptions: { FrameOption: 'SAMEORIGIN', Override: true },
          ReferrerPolicy: { ReferrerPolicy: 'strict-origin-when-cross-origin', Override: true },
          StrictTransportSecurity: { AccessControlMaxAgeSec: 31536000, IncludeSubdomains: false, Override: true },
        },
      },
    });
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        DefaultCacheBehavior: { ResponseHeadersPolicyId: Match.anyValue() },
      },
    });
  });

  test('restricts scripts, objects and framing in the content security policy', () => {
    expect(CONTENT_SECURITY_POLICY).toContain("default-src 'self'");
    expect(CONTENT_SECURITY_POLICY).toContain("object-src 'none'");
    expect(CONTENT_SECURITY_POLICY).toContain("frame-ancestors 'self'");
    expect(CONTENT_SECURITY_POLICY).not.toContain("'unsafe-eval'");
  });
});

describe('URL rewrite function', () => {
  // The function runs in CloudFront. Evaluate the same source here.
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const handler = new Function(`${URL_REWRITE_FUNCTION_CODE}; return handler;`)() as (event: {
    request: { uri: string };
  }) => { uri?: string; statusCode?: number; headers?: { location: { value: string } } };

  const rewrite = (uri: string) => handler({ request: { uri } });

  test('serves index.html for the root', () => {
    expect(rewrite('/').uri).toBe('/index.html');
  });

  test('adds .html to clean URLs', () => {
    expect(rewrite('/cv').uri).toBe('/cv.html');
    expect(rewrite('/blog/some-post').uri).toBe('/blog/some-post.html');
  });

  test('leaves files with an extension untouched', () => {
    expect(rewrite('/feed.xml').uri).toBe('/feed.xml');
    expect(rewrite('/_astro/cover.abc123.webp').uri).toBe('/_astro/cover.abc123.webp');
  });

  test('redirects a trailing slash to the clean URL', () => {
    const response = rewrite('/blog/');
    expect(response.statusCode).toBe(301);
    expect(response.headers?.location.value).toBe('/blog');
  });

  test('does not redirect to another host', () => {
    const response = rewrite('//evil.example/');
    expect(response.statusCode).toBe(301);
    expect(response.headers?.location.value).toBe('/evil.example');
  });
});
