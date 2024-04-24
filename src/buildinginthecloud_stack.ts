import { Stack, StackProps, aws_route53, aws_route53_patterns } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface BuildingInTheCloudStackProps extends StackProps {
  hostedZoneName: string;
  targetDomainName: string;
}

export class BuildingInTheCloudStack extends Stack {
  constructor(scope: Construct, id: string, props: BuildingInTheCloudStackProps) {
    super(scope, id, props);

    const HostedZone = new aws_route53.HostedZone(this, 'HostedZone', {
      zoneName: props.hostedZoneName,
    });

    new aws_route53_patterns.HttpsRedirect(this, 'Redirect', {
      recordNames: [props.hostedZoneName],
      targetDomain: props.targetDomainName,
      zone: HostedZone,
    });
  }
}