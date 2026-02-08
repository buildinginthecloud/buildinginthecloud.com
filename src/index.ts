// Export stacks for use in landing zone pipeline
export { MailRelay } from './main';
export { CertificateStack } from './certificate-stack';
export { StaticHostingStack } from './static-hosting-stack';

// Export types
export type { MailRelayProps, CertificateStackProps, StaticHostingProps } from './types';
export { MAIL_CONFIG } from './types';
