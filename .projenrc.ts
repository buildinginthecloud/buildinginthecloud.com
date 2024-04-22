import { awscdk } from 'projen';
import { GithubCDKPipeline } from 'projen-pipelines';

const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.138.0',
  defaultReleaseBranch: 'main',
  name: 'buildinginthecloud.com',
  description: 'CDK code for buildingthecloud.com',
  authorEmail: 'no-reply@dontsendmemails.com',
  authorName: 'Yvo van Zee',
  authorUrl: 'buildinginthecloud.com',
  repository: 'https://github.com/buildinginthecloud/buildinginthecloud.com.git',
  projenrcTs: true,
  deps: [
    'projen-pipelines',
    'aws-cdk-github-oidc',
  ],
  devDeps: [
    'projen-pipelines',
    'aws-cdk-github-oidc',
  ],
  autoMerge: true
});

// // Create the pipeline
new GithubCDKPipeline(project,
  {
    stackPrefix: 'BuildingintheCloud',
    pkgNamespace: '@buildinginthecloud',
    stages: [
      {
        name: 'production',
        manualApproval: true,
        env: {
          account: '730335247138',
          region: 'eu-west-1',
        },
      },
    ],
    iamRoleArns: {},
  },
);

project.synth();