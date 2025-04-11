import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { MailRelay } from '../src/main';
import { MAIL_CONFIG } from '../src/types';

describe('MailRelay Stack', () => {
  let app: App;
  let stack: MailRelay;
  let template: Template;

  beforeEach(() => {
    app = new App();
    stack = new MailRelay(app, 'TestStack', {
      domainName: 'test-domain.com',
      targetDomainName: 'target-domain.com',
    });
    template = Template.fromStack(stack);
  });

  test('creates a Route53 hosted zone', () => {
    template.hasResourceProperties('AWS::Route53::HostedZone', {
      Name: 'test-domain.com.',
    });
  });

  test('creates SPF record', () => {
    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Type: 'TXT',
      Name: 'apple-domain=test-domain.com.',
      ResourceRecords: [MAIL_CONFIG.SPF_RECORD],
      TTL: String(MAIL_CONFIG.TTL * 60), // TTL in seconds
    });
  });

  test('creates DKIM CNAME record', () => {
    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Type: 'CNAME',
      Name: 'sig1._domainkey.test-domain.com.',
      ResourceRecords: ['sig1.dkim.test-domain.com.at.icloudmailadmin.com'],
      TTL: String(MAIL_CONFIG.TTL * 60),
    });
  });

  test('creates MX records', () => {
    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Type: 'MX',
      Name: 'test-domain.com.',
      ResourceRecords: [
        '10 mx01.mail.icloud.com',
        '20 mx02.mail.icloud.com',
      ],
      TTL: String(MAIL_CONFIG.TTL * 60),
    });
  });

  test('creates HTTPS redirect', () => {
    template.resourceCountIs('AWS::CloudFront::Distribution', 1);
    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Type: 'A',
      Name: 'test-domain.com.',
    });
  });

  test('snapshot test', () => {
    expect(template.toJSON()).toMatchSnapshot();
  });
});
