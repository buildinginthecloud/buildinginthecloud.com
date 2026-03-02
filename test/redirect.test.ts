import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { RedirectStack } from '../src/redirect-stack';

describe('RedirectStack', () => {
  let app: App;
  let stack: RedirectStack;
  let template: Template;

  beforeEach(() => {
    app = new App();
    stack = new RedirectStack(app, 'TestRedirectStack', {
      domainName: 'example.nl',
      hostedZoneId: 'Z123456789',
      certificateArn: 'arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012',
      redirectTo: 'https://buildinginthecloud.com/cv',
    });
    template = Template.fromStack(stack);
  });

  test('creates a CloudFront Function for redirect', () => {
    template.hasResourceProperties('AWS::CloudFront::Function', {
      FunctionConfig: {
        Runtime: 'cloudfront-js-2.0',
      },
    });
  });

  test('creates a CloudFront distribution with redirect function', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        Aliases: ['example.nl', 'www.example.nl'],
        HttpVersion: 'http2and3',
        PriceClass: 'PriceClass_100',
      },
    });
  });

  test('imports certificate from ARN', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        ViewerCertificate: {
          AcmCertificateArn:
            'arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012',
        },
      },
    });
  });

  test('creates Route53 A records for root and www', () => {
    template.resourceCountIs('AWS::Route53::RecordSet', 2);

    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Name: 'example.nl.',
      Type: 'A',
    });

    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Name: 'www.example.nl.',
      Type: 'A',
    });
  });
});
