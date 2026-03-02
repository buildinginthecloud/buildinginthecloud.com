import { App } from 'aws-cdk-lib';
import { CertificateStack } from './certificate-stack';
import { RedirectStack } from './redirect-stack';
import { StaticHostingStack } from './static-hosting-stack';

// Environment configuration
const devEnv = {
  account: '517095477860',
  region: 'eu-central-1',
} as const;

const usEast1Env = {
  account: '517095477860',
  region: 'us-east-1',
} as const;

const HOSTED_ZONE_ID = 'Z005047721YOSJOMI0XAF';
const DOMAIN_NAME = 'buildinginthecloud.com';

const YVOVANZEE_DOMAIN = 'yvovanzee.nl';
const YVOVANZEE_HOSTED_ZONE_ID = 'Z2VG0YOP0ID7IU';

const app = new App();

// Certificate stack in us-east-1 (required for CloudFront)
const certificateStack = new CertificateStack(app, 'certificate', {
  env: usEast1Env,
  domainName: DOMAIN_NAME,
  hostedZoneId: HOSTED_ZONE_ID,
  crossRegionReferences: true,
});

// Static hosting stack (S3 + CloudFront)
new StaticHostingStack(app, 'static-hosting', {
  env: devEnv,
  domainName: DOMAIN_NAME,
  hostedZoneId: HOSTED_ZONE_ID,
  certificateArn: certificateStack.certificateArn,
  crossRegionReferences: true,
});

// Certificate for yvovanzee.nl in us-east-1 (required for CloudFront)
const yvovanzeeeCertStack = new CertificateStack(app, 'yvovanzee-certificate', {
  env: usEast1Env,
  domainName: YVOVANZEE_DOMAIN,
  hostedZoneId: YVOVANZEE_HOSTED_ZONE_ID,
  crossRegionReferences: true,
});

// Redirect yvovanzee.nl → buildinginthecloud.com/cv
new RedirectStack(app, 'yvovanzee-redirect', {
  env: devEnv,
  domainName: YVOVANZEE_DOMAIN,
  hostedZoneId: YVOVANZEE_HOSTED_ZONE_ID,
  certificateArn: yvovanzeeeCertStack.certificateArn,
  redirectTo: 'https://buildinginthecloud.com/cv',
  crossRegionReferences: true,
});

app.synth();
