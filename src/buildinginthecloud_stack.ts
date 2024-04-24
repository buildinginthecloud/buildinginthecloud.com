import { Stack, StackProps, aws_route53 } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface BuildingInTheCloudStackProps extends StackProps {
  hostedZoneName: string;
  targetDomainName: string;
}

export class BuildingInTheCloudStack extends Stack {
  constructor(scope: Construct, id: string, props: BuildingInTheCloudStackProps) {
    super(scope, id, props);

    new aws_route53.HostedZone(this, 'HostedZone', {
      zoneName: props.hostedZoneName,
    });

    // new aws_route53_patterns.HttpsRedirect(this, 'Redirect', {
    //   recordNames: [props.hostedZoneName],
    //   targetDomain: props.targetDomainName,
    //   zone: HostedZone,
    // });
  }
}