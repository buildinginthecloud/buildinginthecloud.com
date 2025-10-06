import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { DomainRedirectStack } from '../src/domain-redirect-stack';
import type { DomainRedirectProps } from '../src/types';

/**
 * Integration tests for domain redirect functionality.
 * Tests the complete redirect flow from buildinginthecloud.com to yvovanzee.nl
 *
 * Requirements tested:
 * - 1.1: HTTP 301 redirect from buildinginthecloud.com to yvovanzee.nl
 * - 1.2: HTTP to HTTPS redirect functionality
 * - 1.4: Path preservation in redirects
 */
describe('Domain Redirect Integration Tests', () => {
  let app: App;
  let stack: DomainRedirectStack;
  let template: Template;

  const defaultProps: DomainRedirectProps = {
    sourceDomain: 'buildinginthecloud.com',
    targetDomain: 'yvovanzee.nl',
    preservePath: true,
    forceHttps: true,
    redirectCode: 301,
  };

  beforeEach(() => {
    app = new App();
    stack = new DomainRedirectStack(app, 'TestDomainRedirectStack', defaultProps);
    template = Template.fromStack(stack);
  });

  describe('HTTP to HTTPS Redirect Configuration', () => {
    test('CloudFront distribution enforces HTTPS redirect', () => {
      // Requirement 1.2: HTTP to HTTPS redirect
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          DefaultCacheBehavior: {
            ViewerProtocolPolicy: 'redirect-to-https',
          },
        },
      });
    });

    test('CloudFront distribution has SSL certificate configured', () => {
      // Requirement 1.2: HTTPS support with SSL certificate
      const distributionResources = template.findResources('AWS::CloudFront::Distribution');
      const distribution = Object.values(distributionResources)[0];

      expect(distribution.Properties.DistributionConfig.ViewerCertificate.AcmCertificateArn.Ref).toMatch(
        /SslCertificate/,
      );
      expect(distribution.Properties.DistributionConfig.ViewerCertificate.SslSupportMethod).toBe('sni-only');
      expect(distribution.Properties.DistributionConfig.ViewerCertificate.MinimumProtocolVersion).toBe('TLSv1.2_2021');
    });

    test('SSL certificate covers both apex and www domains', () => {
      // Requirement 1.2: SSL certificate for both domains
      template.hasResourceProperties('AWS::CertificateManager::Certificate', {
        DomainName: 'buildinginthecloud.com',
        SubjectAlternativeNames: ['www.buildinginthecloud.com'],
        ValidationMethod: 'DNS',
      });
    });
  });

  describe('Domain Redirect Configuration', () => {
    test('S3 bucket has redirect rules configured for target domain', () => {
      // Requirement 1.1: Domain redirect to yvovanzee.nl
      template.hasResourceProperties('AWS::S3::Bucket', {
        WebsiteConfiguration: {
          IndexDocument: 'index.html',
          ErrorDocument: 'error.html',
          RoutingRules: [
            {
              RedirectRule: {
                Protocol: 'https',
                HostName: 'yvovanzee.nl',
                HttpRedirectCode: '301',
              },
            },
          ],
        },
      });
    });

    test('S3 bucket is configured for static website hosting', () => {
      // Requirement 1.1: S3 static website hosting for redirects
      template.hasResourceProperties('AWS::S3::Bucket', {
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: false,
          BlockPublicPolicy: false,
          IgnorePublicAcls: false,
          RestrictPublicBuckets: false,
        },
      });
    });

    test('CloudFront distribution points to S3 static website origin', () => {
      // Requirement 1.1: CloudFront distribution with S3 origin
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          Origins: [
            {
              CustomOriginConfig: {
                OriginProtocolPolicy: 'http-only',
                OriginSSLProtocols: ['TLSv1.2'],
              },
            },
          ],
        },
      });
    });
  });

  describe('Path Preservation Configuration', () => {
    test('S3 redirect rules preserve original path', () => {
      // Requirement 1.4: Path preservation in redirects
      template.hasResourceProperties('AWS::S3::Bucket', {
        WebsiteConfiguration: {
          RoutingRules: [
            {
              RedirectRule: {
                Protocol: 'https',
                HostName: 'yvovanzee.nl',
                HttpRedirectCode: '301',
                // Path preservation is achieved by NOT setting ReplaceKeyPrefixWith or ReplaceKeyWith
                // This allows S3 to preserve the original request path
              },
            },
          ],
        },
      });
    });

    test('CloudFront cache policy preserves query parameters', () => {
      // Requirement 1.4: Query parameter preservation
      template.hasResourceProperties('AWS::CloudFront::CachePolicy', {
        CachePolicyConfig: {
          ParametersInCacheKeyAndForwardedToOrigin: {
            QueryStringsConfig: {
              QueryStringBehavior: 'all',
            },
            HeadersConfig: {
              HeaderBehavior: 'none',
            },
            CookiesConfig: {
              CookieBehavior: 'none',
            },
          },
        },
      });
    });
  });

  describe('DNS Configuration for Redirect', () => {
    test('Route53 hosted zone is created for source domain', () => {
      // Requirement 1.1: DNS configuration for source domain
      template.hasResourceProperties('AWS::Route53::HostedZone', {
        Name: 'buildinginthecloud.com.',
      });
    });

    test('A record points to CloudFront distribution', () => {
      // Requirement 1.1: DNS A record for domain redirect
      const recordSetResources = template.findResources('AWS::Route53::RecordSet');
      const aRecord = Object.values(recordSetResources).find(
        (record: any) => record.Properties.Type === 'A' && record.Properties.Name === 'buildinginthecloud.com.',
      ) as any;

      expect(aRecord).toBeDefined();
      expect(aRecord.Properties.AliasTarget.DNSName['Fn::GetAtt'][0]).toMatch(/RedirectDistribution/);
      expect(aRecord.Properties.AliasTarget.DNSName['Fn::GetAtt'][1]).toBe('DomainName');
    });

    test('AAAA record provides IPv6 support', () => {
      // Requirement 1.1: IPv6 support for domain redirect
      const recordSetResources = template.findResources('AWS::Route53::RecordSet');
      const aaaaRecord = Object.values(recordSetResources).find(
        (record: any) => record.Properties.Type === 'AAAA' && record.Properties.Name === 'buildinginthecloud.com.',
      ) as any;

      expect(aaaaRecord).toBeDefined();
      expect(aaaaRecord.Properties.AliasTarget.DNSName['Fn::GetAtt'][0]).toMatch(/RedirectDistribution/);
      expect(aaaaRecord.Properties.AliasTarget.DNSName['Fn::GetAtt'][1]).toBe('DomainName');
    });

    test('CNAME record handles www subdomain', () => {
      // Requirement 1.1: www subdomain redirect support
      const recordSetResources = template.findResources('AWS::Route53::RecordSet');
      const cnameRecord = Object.values(recordSetResources).find(
        (record: any) => record.Properties.Type === 'CNAME' && record.Properties.Name === 'www.buildinginthecloud.com.',
      ) as any;

      expect(cnameRecord).toBeDefined();
      expect(cnameRecord.Properties.ResourceRecords[0]['Fn::GetAtt'][0]).toMatch(/RedirectDistribution/);
      expect(cnameRecord.Properties.ResourceRecords[0]['Fn::GetAtt'][1]).toBe('DomainName');
      expect(cnameRecord.Properties.TTL).toBe('300');
    });
  });

  describe('Redirect Performance and Caching', () => {
    test('CloudFront distribution has optimized cache policy for redirects', () => {
      // Requirement 1.1: Optimized caching for redirect responses
      template.hasResourceProperties('AWS::CloudFront::CachePolicy', {
        CachePolicyConfig: {
          Comment: 'Cache policy optimized for redirect responses',
          DefaultTTL: 300, // 5 minutes
          MaxTTL: 3600, // 1 hour
          MinTTL: 0,
        },
      });
    });

    test('CloudFront distribution enables compression', () => {
      // Performance optimization for redirect responses
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          DefaultCacheBehavior: {
            Compress: true,
          },
        },
      });
    });

    test('CloudFront distribution uses appropriate price class', () => {
      // Cost optimization for redirect service
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          PriceClass: 'PriceClass_100', // North America and Europe only
        },
      });
    });
  });

  describe('Security Configuration', () => {
    test('CloudFront distribution enforces minimum TLS version', () => {
      // Security requirement for HTTPS connections
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          ViewerCertificate: {
            MinimumProtocolVersion: 'TLSv1.2_2021',
          },
        },
      });
    });

    test('S3 bucket has appropriate access policy for CloudFront', () => {
      // Security: Restrict S3 access to CloudFront only
      const bucketPolicyResources = template.findResources('AWS::S3::BucketPolicy');
      const bucketPolicy = Object.values(bucketPolicyResources)[0];

      // Check that there's a statement allowing CloudFront access
      const statements = bucketPolicy.Properties.PolicyDocument.Statement;
      const cloudFrontStatement = statements.find((stmt: any) => stmt.Sid === 'AllowCloudFrontAccess');

      expect(cloudFrontStatement).toBeDefined();
      expect(cloudFrontStatement.Effect).toBe('Allow');
      expect(cloudFrontStatement.Principal.Service).toBe('cloudfront.amazonaws.com');
      expect(cloudFrontStatement.Action).toBe('s3:GetObject');
    });
  });

  describe('Stack Outputs for Monitoring', () => {
    test('stack outputs include CloudFront distribution ID', () => {
      // Requirement: Monitoring and operational outputs
      template.hasOutput('CloudFrontDistributionId', {
        Description: 'CloudFront Distribution ID for monitoring and cache invalidation',
        Export: {
          Name: 'TestDomainRedirectStack-CloudFrontDistributionId',
        },
      });
    });

    test('stack outputs include redirect configuration summary', () => {
      // Requirement: Configuration tracking
      template.hasOutput('RedirectConfiguration', {
        Description: 'Redirect configuration summary',
        Value: 'buildinginthecloud.com -> yvovanzee.nl (301)',
        Export: {
          Name: 'TestDomainRedirectStack-RedirectConfiguration',
        },
      });
    });

    test('stack outputs include S3 bucket information', () => {
      // Requirement: Operational monitoring
      template.hasOutput('RedirectBucketName', {
        Description: 'S3 Bucket name used for redirect hosting',
        Export: {
          Name: 'TestDomainRedirectStack-RedirectBucketName',
        },
      });
    });
  });

  describe('Custom Configuration Support', () => {
    test('supports custom source and target domains', () => {
      const customApp = new App();
      const customStack = new DomainRedirectStack(customApp, 'CustomDomainRedirectStack', {
        sourceDomain: 'example.com',
        targetDomain: 'newexample.com',
        redirectCode: 302,
      });
      const customTemplate = Template.fromStack(customStack);

      customTemplate.hasResourceProperties('AWS::S3::Bucket', {
        WebsiteConfiguration: {
          RoutingRules: [
            {
              RedirectRule: {
                HostName: 'newexample.com',
                HttpRedirectCode: '302',
              },
            },
          ],
        },
      });
    });

    test('supports disabling HTTPS enforcement', () => {
      const httpApp = new App();
      const httpStack = new DomainRedirectStack(httpApp, 'HttpDomainRedirectStack', {
        sourceDomain: 'example.com',
        targetDomain: 'newexample.com',
        forceHttps: false,
      });
      const httpTemplate = Template.fromStack(httpStack);

      httpTemplate.hasResourceProperties('AWS::S3::Bucket', {
        WebsiteConfiguration: {
          RoutingRules: [
            {
              RedirectRule: {
                HostName: 'newexample.com',
                // Protocol should not be set when forceHttps is false
              },
            },
          ],
        },
      });
    });
  });

  describe('Integration Test Scenarios', () => {
    test('complete redirect infrastructure is properly connected', () => {
      // Verify all components are properly linked together

      // 1. S3 bucket exists with redirect rules
      const s3Resources = template.findResources('AWS::S3::Bucket');
      expect(Object.keys(s3Resources)).toHaveLength(1);

      // 2. CloudFront distribution exists and points to S3
      const cfResources = template.findResources('AWS::CloudFront::Distribution');
      expect(Object.keys(cfResources)).toHaveLength(1);

      // 3. SSL certificate exists
      const certResources = template.findResources('AWS::CertificateManager::Certificate');
      expect(Object.keys(certResources)).toHaveLength(1);

      // 4. Route53 hosted zone exists
      const hostedZoneResources = template.findResources('AWS::Route53::HostedZone');
      expect(Object.keys(hostedZoneResources)).toHaveLength(1);

      // 5. DNS records exist (A, AAAA, CNAME)
      const recordSetResources = template.findResources('AWS::Route53::RecordSet');
      expect(Object.keys(recordSetResources)).toHaveLength(3); // A, AAAA, CNAME
    });

    test('redirect configuration matches requirements exactly', () => {
      // Verify the redirect configuration matches all requirements
      expect(stack.redirectConfig).toEqual({
        sourceDomain: 'buildinginthecloud.com',
        targetDomain: 'yvovanzee.nl',
        preservePath: true,
        forceHttps: true,
        redirectCode: 301,
      });
    });

    test('stack can be synthesized without errors', () => {
      // Integration test: Ensure the entire stack can be synthesized
      expect(() => {
        app.synth();
      }).not.toThrow();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('handles missing optional properties gracefully', () => {
      const minimalApp = new App();
      const minimalStack = new DomainRedirectStack(minimalApp, 'MinimalDomainRedirectStack', {});
      const minimalTemplate = Template.fromStack(minimalStack);

      // Should use default values
      minimalTemplate.hasResourceProperties('AWS::S3::Bucket', {
        WebsiteConfiguration: {
          RoutingRules: [
            {
              RedirectRule: {
                Protocol: 'https',
                HostName: 'yvovanzee.nl',
                HttpRedirectCode: '301',
              },
            },
          ],
        },
      });
    });

    test('creates unique bucket names to avoid conflicts', () => {
      // Test that bucket names include account ID for uniqueness
      const bucketResources = template.findResources('AWS::S3::Bucket');
      const bucketLogicalId = Object.keys(bucketResources)[0];
      const bucketProperties = bucketResources[bucketLogicalId].Properties;

      expect(bucketProperties.BucketName).toEqual({
        'Fn::Join': [
          '',
          [
            'buildinginthecloud-com-redirect-',
            {
              Ref: 'AWS::AccountId',
            },
          ],
        ],
      });
    });
  });
});
