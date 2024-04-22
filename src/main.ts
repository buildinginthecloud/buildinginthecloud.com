import { PipelineApp } from './app';
import { BuildingInTheCloudStack } from './buildinginthecloud_stack';


const Env = {
  account: '730335247138',
  region: 'eu-west-1',
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