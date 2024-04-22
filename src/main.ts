import { App, Stack, StackProps, aws_route53, aws_route53_patterns } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class BuildingInTheCloudStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const BuildingInTheCloud = new aws_route53.HostedZone(this, 'HostedZone', {
      zoneName: 'buildinginthecloud.com',
    });

    new aws_route53_patterns.HttpsRedirect(this, 'Redirect', {
      recordNames: ['buildinginthecloud.com'],
      targetDomain: 'yvovanzee.nl',
      zone: BuildingInTheCloud,
    });
  }
}
const Env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();
new BuildingInTheCloudStack(app, 'BuildingInTheCloudCom', { env: Env });
app.synth();