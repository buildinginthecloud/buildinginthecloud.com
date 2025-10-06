# Domain Redirect Deployment Runbook

## Overview

This runbook provides step-by-step instructions for deploying and managing the domain redirect from buildinginthecloud.com to yvovanzee.nl using AWS CDK.

## Prerequisites

### Required Tools
- AWS CLI v2.x configured with appropriate credentials
- Node.js v18+ and npm
- AWS CDK v2.x installed globally (`npm install -g aws-cdk`)
- Access to AWS account with appropriate permissions

### Required AWS Permissions
The deployment requires the following AWS service permissions:
- CloudFormation (full access)
- S3 (create/manage buckets)
- CloudFront (create/manage distributions)
- Route53 (manage hosted zones and records)
- Certificate Manager (create/manage certificates)
- CloudWatch (create alarms and dashboards)
- IAM (create service roles and policies)

### Environment Setup
```bash
# Clone the repository
git clone <repository-url>
cd domain-redirect

# Install dependencies
npm install

# Configure AWS profile (if not already done)
aws configure --profile yvovanzee
```

## Pre-Deployment Checklist

- [ ] Verify AWS credentials are configured correctly
- [ ] Confirm domain ownership for buildinginthecloud.com
- [ ] Ensure DNS delegation is ready for Route53
- [ ] Review redirect configuration in `src/types.ts`
- [ ] Run unit tests: `npm test`
- [ ] Run integration tests: `npm run test:integration`

## Deployment Steps

### 1. Initial Deployment

```bash
# Set AWS profile
export AWS_PROFILE=yvovanzee

# Bootstrap CDK (first time only)
cdk bootstrap

# Deploy the stack
cdk deploy DomainRedirectStack --require-approval never

# Verify deployment
npm run validate-deployment
```

### 2. DNS Delegation

After initial deployment, update your domain registrar to use Route53 name servers:

1. Get name servers from stack output:
   ```bash
   aws cloudformation describe-stacks \
     --stack-name DomainRedirectStack \
     --query 'Stacks[0].Outputs[?OutputKey==`HostedZoneNameServers`].OutputValue' \
     --output text
   ```

2. Update domain registrar DNS settings with the returned name servers

3. Wait for DNS propagation (can take up to 48 hours)

### 3. Post-Deployment Validation

```bash
# Run comprehensive validation
npm run validate-deployment

# Test redirect functionality
curl -I http://buildinginthecloud.com
curl -I https://buildinginthecloud.com
curl -I https://www.buildinginthecloud.com

# Check SSL certificate
openssl s_client -connect buildinginthecloud.com:443 -servername buildinginthecloud.com
```

## Monitoring and Alerting

### CloudWatch Dashboard
Access the monitoring dashboard:
```bash
# Get dashboard URL from stack output
aws cloudformation describe-stacks \
  --stack-name DomainRedirectStack \
  --query 'Stacks[0].Outputs[?OutputKey==`MonitoringDashboardUrl`].OutputValue' \
  --output text
```

### Key Metrics to Monitor
- **Request Count**: Total requests to CloudFront distribution
- **Error Rates**: 4xx and 5xx error percentages
- **Cache Hit Rate**: Should be >80% for optimal performance
- **Origin Latency**: Response time from S3 origin

### Configured Alarms
1. **4xx Error Rate**: Alerts when >5% for 2 consecutive periods
2. **5xx Error Rate**: Alerts when >1% for 2 consecutive periods
3. **Cache Hit Rate**: Alerts when <80% for 3 consecutive periods
4. **Origin Response Time**: Alerts when >5 seconds for 3 consecutive periods

## Maintenance Tasks

### Monthly Tasks
- [ ] Review CloudWatch metrics and alarms
- [ ] Check S3 access logs for unusual patterns
- [ ] Verify SSL certificate expiration (auto-renewed by ACM)
- [ ] Review CloudFront cache performance

### Quarterly Tasks
- [ ] Review and optimize CloudFront cache policies
- [ ] Analyze access logs for traffic patterns
- [ ] Update documentation if needed
- [ ] Test disaster recovery procedures

## Troubleshooting

### Common Issues

#### 1. DNS Resolution Problems
**Symptoms**: Domain not resolving or resolving to wrong IP
**Diagnosis**:
```bash
dig buildinginthecloud.com
nslookup buildinginthecloud.com
```
**Resolution**:
- Verify Route53 hosted zone configuration
- Check domain registrar DNS settings
- Wait for DNS propagation (up to 48 hours)

#### 2. SSL Certificate Issues
**Symptoms**: SSL/TLS errors or certificate warnings
**Diagnosis**:
```bash
aws acm describe-certificate --certificate-arn <cert-arn>
```
**Resolution**:
- Verify certificate validation status
- Check DNS validation records in Route53
- Ensure certificate is in us-east-1 region for CloudFront

#### 3. Redirect Not Working
**Symptoms**: 404 errors or incorrect redirects
**Diagnosis**:
```bash
curl -v http://buildinginthecloud.com
aws s3 website s3://<bucket-name> --index-document index.html
```
**Resolution**:
- Verify S3 bucket redirect rules configuration
- Check CloudFront distribution origin settings
- Validate S3 bucket policy allows CloudFront access

#### 4. High Error Rates
**Symptoms**: CloudWatch alarms firing for 4xx/5xx errors
**Diagnosis**:
- Check CloudFront access logs in S3
- Review CloudWatch metrics for error patterns
- Verify S3 bucket availability

**Resolution**:
- Investigate S3 bucket issues
- Check CloudFront distribution configuration
- Review redirect rules syntax

## Emergency Contacts

- **Primary**: DevOps Team - devops@example.com
- **Secondary**: Infrastructure Team - infrastructure@example.com
- **AWS Support**: Enterprise Support Case

## Related Documentation

- [Rollback Procedures](./rollback-procedures.md)
- [Troubleshooting Guide](./troubleshooting-guide.md)
- [Architecture Documentation](../.kiro/specs/domain-redirect/design.md)
- [Requirements](../.kiro/specs/domain-redirect/requirements.md)