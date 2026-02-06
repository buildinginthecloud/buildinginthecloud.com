import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { CertificateStack } from '../src/certificate-stack';

describe('CertificateStack', () => {
  let app: App;
  let stack: CertificateStack;
  let template: Template;

  beforeEach(() => {
    app = new App();
    stack = new CertificateStack(app, 'TestCertificateStack', {
      env: { region: 'us-east-1', account: '123456789012' },
      domainName: 'test-domain.com',
      hostedZoneId: 'Z123456789',
    });
    template = Template.fromStack(stack);
  });

  test('creates an ACM certificate', () => {
    template.hasResourceProperties('AWS::CertificateManager::Certificate', {
      DomainName: 'test-domain.com',
      SubjectAlternativeNames: ['www.test-domain.com'],
      ValidationMethod: 'DNS',
    });
  });

  test('creates certificate output', () => {
    template.hasOutput('CertificateArn', {});
  });

  test('exposes certificate ARN property', () => {
    expect(stack.certificateArn).toBeDefined();
  });
});
