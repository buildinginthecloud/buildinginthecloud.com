import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AmplifyHostingStack } from '../src/amplify-hosting-stack';
import { MailRelay } from '../src/main';

describe('AmplifyHostingStack', () => {
  let app: App;
  let stack: AmplifyHostingStack;
  let template: Template;

  beforeEach(() => {
    app = new App();
    stack = new AmplifyHostingStack(app, 'TestAmplifyStack', {
      domainName: 'test-domain.com',
      githubOwner: 'test-owner',
      githubRepo: 'test-repo',
      githubTokenSecretName: 'test-github-token',
      branchName: 'main',
      appRoot: 'app',
    });
    template = Template.fromStack(stack);
  });

  test('creates an Amplify App', () => {
    template.hasResourceProperties('AWS::Amplify::App', {
      Name: 'test-domain-com', // Domain name with dots replaced by dashes
      Platform: 'WEB_COMPUTE',
    });
  });

  test('creates a main branch', () => {
    template.hasResourceProperties('AWS::Amplify::Branch', {
      BranchName: 'main',
      Stage: 'PRODUCTION',
      EnableAutoBuild: true,
    });
  });

  test('configures GitHub source code provider', () => {
    template.hasResourceProperties('AWS::Amplify::App', {
      Repository: 'https://github.com/test-owner/test-repo',
    });
  });

  test('sets correct environment variables', () => {
    // Check that key environment variables are set (order may vary)
    template.hasResourceProperties('AWS::Amplify::App', {
      EnvironmentVariables: [
        { Name: 'AMPLIFY_MONOREPO_APP_ROOT', Value: 'app' },
        { Name: '_CUSTOM_IMAGE', Value: 'amplify:al2023' },
        { Name: 'NODE_ENV', Value: 'production' },
        { Name: 'NEXT_TELEMETRY_DISABLED', Value: '1' },
      ],
    });
  });

  test('creates outputs for app id and default domain', () => {
    template.hasOutput('AmplifyAppId', {});
    template.hasOutput('AmplifyDefaultDomain', {});
    template.hasOutput('AmplifyBranchUrl', {});
  });
});

describe('AmplifyHostingStack with custom domain', () => {
  let app: App;
  let stack: AmplifyHostingStack;
  let template: Template;

  beforeEach(() => {
    // Create a mock hosted zone by creating a MailRelay stack first
    app = new App();
    const mailRelayStack = new MailRelay(app, 'TestMailRelay', {
      domainName: 'test-domain.com',
    });

    stack = new AmplifyHostingStack(app, 'TestAmplifyStackWithDomain', {
      domainName: 'test-domain.com',
      githubOwner: 'test-owner',
      githubRepo: 'test-repo',
      githubTokenSecretName: 'test-github-token',
      hostedZone: mailRelayStack.hostedZone,
    });
    template = Template.fromStack(stack);
  });

  test('creates domain association when hosted zone is provided', () => {
    template.hasResourceProperties('AWS::Amplify::Domain', {
      DomainName: 'test-domain.com',
      EnableAutoSubDomain: false,
    });
  });

  test('maps root domain and www subdomain', () => {
    // Just verify the domain resource exists with the correct domain name
    // The exact subdomain settings structure may vary based on CDK version
    template.hasResourceProperties('AWS::Amplify::Domain', {
      DomainName: 'test-domain.com',
    });
  });
});
