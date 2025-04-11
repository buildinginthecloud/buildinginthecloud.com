import type { StackProps } from 'aws-cdk-lib';

export interface MailRelayProps extends StackProps {
  /**
   * The domain name for which the mail relay is being configured
   * @default 'buildinginthecloud.com'
   */
  readonly domainName?: string;
  readonly targetDomainName?: string;
}
