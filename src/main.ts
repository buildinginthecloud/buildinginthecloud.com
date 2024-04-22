import { PipelineApp } from './app';
import { BuildingInTheCloudStack } from './buildinginthecloud_stack';


const Env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new PipelineApp({
  provideProductionStack: (scope, id, props) => {
    return new BuildingInTheCloudStack(scope, id, {
      ...props,
      hostedZoneName: 'buildinginthecloud.com',
      targetDomainName: 'yvovanzee.nl',
      env: Env,
    });
  },

});
app.synth();