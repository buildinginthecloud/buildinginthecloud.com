import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { StaticHostingStack } from '../src/static-hosting-stack';

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
    // Certificate is imported from ARN, so no Certificate resource is created
    // The distribution should reference the certificate
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

  test('creates outputs', () => {
    template.hasOutput('WebsiteBucketName', {});
    template.hasOutput('DistributionId', {});
    template.hasOutput('DistributionDomainName', {});
    template.hasOutput('WebsiteUrl', {});
  });
});
