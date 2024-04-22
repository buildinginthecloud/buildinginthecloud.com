import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { BuildingInTheCloudStack } from '../src/buildinginthecloud_stack';

test('Snapshot', () => {
  const app = new App();
  const stack = new BuildingInTheCloudStack(app, 'test', { hostedZoneName: 'test.aws', targetDomainName: 'yvovanzee.nl' });

  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});