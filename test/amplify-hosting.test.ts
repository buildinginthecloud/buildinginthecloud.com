import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AmplifyHostingStack } from '../src/amplify-hosting-stack';

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
      branchName: 'main',
      appRoot: 'app',
    });
    template = Template.fromStack(stack);
  });

  test('creates an Amplify App', () => {
    template.hasResourceProperties('AWS::Amplify::App', {
      Name: 'test-domain-com',
      Platform: 'WEB',
    });
  });

  test('creates a main branch', () => {
    template.hasResourceProperties('AWS::Amplify::Branch', {
      BranchName: 'main',
      Stage: 'PRODUCTION',
      EnableAutoBuild: true,
    });
  });

  test('configures GitHub repository', () => {
    template.hasResourceProperties('AWS::Amplify::App', {
      Repository: 'https://github.com/test-owner/test-repo',
    });
  });

  test('sets correct environment variables', () => {
    template.hasResourceProperties('AWS::Amplify::App', {
      EnvironmentVariables: [
        { Name: 'AMPLIFY_MONOREPO_APP_ROOT', Value: 'app' },
        { Name: '_CUSTOM_IMAGE', Value: 'amplify:al2023' },
        { Name: 'NODE_ENV', Value: 'production' },
        { Name: 'NEXT_TELEMETRY_DISABLED', Value: '1' },
      ],
    });
  });

  test('creates IAM role for Amplify', () => {
    template.hasResourceProperties('AWS::IAM::Role', {
      AssumeRolePolicyDocument: {
        Statement: [
          {
            Action: 'sts:AssumeRole',
            Effect: 'Allow',
            Principal: {
              Service: 'amplify.amazonaws.com',
            },
          },
        ],
      },
    });
  });

  test('creates custom domain', () => {
    template.hasResourceProperties('AWS::Amplify::Domain', {
      DomainName: 'test-domain.com',
      EnableAutoSubDomain: false,
      SubDomainSettings: [
        { BranchName: 'main', Prefix: '' },
        { BranchName: 'main', Prefix: 'www' },
      ],
    });
  });

  test('creates outputs', () => {
    template.hasOutput('AmplifyAppId', {});
    template.hasOutput('AmplifyDefaultDomain', {});
    template.hasOutput('AmplifyAppArn', {});
    template.hasOutput('AmplifyDomainStatus', {});
  });
});
