# Domain Redirect Rollback Procedures

## Overview

This document outlines procedures for rolling back the domain redirect infrastructure in case of issues or failures during deployment or operation.

## Rollback Scenarios

### 1. Failed Initial Deployment

**When to Use**: CDK deployment fails or stack is in an inconsistent state

**Procedure**:
```bash
# Set AWS profile
export AWS_PROFILE=yvovanzee

# Check stack status
aws cloudformation describe-stacks --stack-name DomainRedirectStack

# If stack is in ROLLBACK_COMPLETE or CREATE_FAILED state
cdk destroy DomainRedirectStack --force

# Clean up any remaining resources manually if needed
aws s3 rm s3://<bucket-name> --recursive
aws s3 rb s3://<bucket-name>
```

**Verification**:
```bash
# Verify stack is deleted
aws cloudformation describe-stacks --stack-name DomainRedirectStack
# Should return: Stack with id DomainRedirectStack does not exist
```

### 2. DNS Issues After Deployment

**When to Use**: DNS resolution problems or incorrect routing after deployment

**Procedure**:
```bash
# Option 1: Revert DNS at registrar level
# 1. Log into domain registrar (e.g., GoDaddy, Namecheap)
# 2. Change name servers back to previous values
# 3. Wait for DNS propagation (up to 48 hours)

# Option 2: Update Route53 records to point elsewhere
aws route53 change-resource-record-sets \
  --hosted-zone-id <zone-id> \
  --change-batch file://revert-dns-changes.json
```

**DNS Change Batch Example** (`revert-dns-changes.json`):
```json
{
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "buildinginthecloud.com",
        "Type": "A",
        "TTL": 300,
        "ResourceRecords": [
          {
            "Value": "1.2.3.4"
          }
        ]
      }
    }
  ]
}
```

### 3. CloudFront Distribution Issues

**When to Use**: CloudFront errors, SSL issues, or performance problems

**Procedure**:
```bash
# Disable CloudFront distribution (faster than deletion)
aws cloudfront get-distribution-config \
  --id <distribution-id> > distribution-config.json

# Edit distribution-config.json to set "Enabled": false
# Then update the distribution
aws cloudfront update-distribution \
  --id <distribution-id> \
  --distribution-config file://distribution-config.json \
  --if-match <etag>

# Verify distribution is disabled
aws cloudfront get-distribution --id <distribution-id>
```

### 4. Complete Stack Rollback

**When to Use**: Major issues requiring complete infrastructure removal

**Procedure**:
```bash
# 1. Disable CloudFront distribution first (prevents deletion delays)
aws cloudfront get-distribution-config --id <distribution-id> > dist-config.json
# Edit dist-config.json to set "Enabled": false
aws cloudfront update-distribution --id <distribution-id> --distribution-config file://dist-config.json --if-match <etag>

# 2. Wait for distribution to be disabled (can take 15-20 minutes)
aws cloudfront wait distribution-deployed --id <distribution-id>

# 3. Destroy the CDK stack
cdk destroy DomainRedirectStack --force

# 4. Clean up any remaining resources
aws s3 rm s3://<redirect-bucket> --recursive
aws s3 rm s3://<logs-bucket> --recursive
aws s3 rb s3://<redirect-bucket>
aws s3 rb s3://<logs-bucket>
```

## Rollback Decision Matrix

| Issue Type | Severity | Recommended Action | Estimated Time |
|------------|----------|-------------------|----------------|
| DNS Resolution Failure | High | Revert DNS at registrar | 2-48 hours |
| SSL Certificate Issues | Medium | Redeploy with fixed config | 30-60 minutes |
| CloudFront 5xx Errors | High | Disable distribution | 15-20 minutes |
| S3 Redirect Issues | Medium | Update S3 configuration | 5-10 minutes |
| Complete Stack Failure | Critical | Full stack rollback | 30-60 minutes |

## Pre-Rollback Checklist

- [ ] Identify the root cause of the issue
- [ ] Determine impact on users and traffic
- [ ] Notify stakeholders about planned rollback
- [ ] Backup current configuration and logs
- [ ] Verify rollback procedure steps
- [ ] Prepare communication for users if needed

## Rollback Verification Steps

### 1. DNS Verification
```bash
# Test DNS resolution
dig buildinginthecloud.com
nslookup buildinginthecloud.com

# Test from multiple locations
curl -I http://buildinginthecloud.com
curl -I https://buildinginthecloud.com
```

### 2. SSL Certificate Verification
```bash
# Check SSL certificate
openssl s_client -connect buildinginthecloud.com:443 -servername buildinginthecloud.com

# Verify certificate chain
curl -vI https://buildinginthecloud.com
```

### 3. Redirect Functionality
```bash
# Test redirect behavior
curl -L -I http://buildinginthecloud.com
curl -L -I https://buildinginthecloud.com
curl -L -I https://www.buildinginthecloud.com

# Test path preservation
curl -L -I http://buildinginthecloud.com/test-path
```

## Post-Rollback Actions

### Immediate Actions (0-1 hour)
- [ ] Verify all services are functioning correctly
- [ ] Monitor error rates and traffic patterns
- [ ] Update monitoring dashboards and alerts
- [ ] Communicate status to stakeholders

### Short-term Actions (1-24 hours)
- [ ] Analyze root cause of the issue
- [ ] Document lessons learned
- [ ] Plan corrective actions for re-deployment
- [ ] Review and update procedures if needed

### Long-term Actions (1-7 days)
- [ ] Implement fixes for identified issues
- [ ] Test fixes in staging environment
- [ ] Plan new deployment with improved procedures
- [ ] Update documentation and runbooks

## Emergency Rollback Contacts

### Primary Contacts
- **DevOps Lead**: devops-lead@example.com
- **Infrastructure Team**: infrastructure@example.com
- **On-call Engineer**: +1-555-0123

### Escalation Path
1. **Level 1**: On-call Engineer
2. **Level 2**: DevOps Lead
3. **Level 3**: Infrastructure Manager
4. **Level 4**: CTO

## Rollback Communication Template

### Internal Communication
```
Subject: [URGENT] Domain Redirect Rollback in Progress

Team,

We are currently performing a rollback of the domain redirect infrastructure due to [ISSUE_DESCRIPTION].

Status: IN PROGRESS
Expected Resolution: [TIME_ESTIMATE]
Impact: [USER_IMPACT_DESCRIPTION]

Actions Taken:
- [ACTION_1]
- [ACTION_2]

Next Steps:
- [NEXT_STEP_1]
- [NEXT_STEP_2]

Will provide updates every 30 minutes.

[YOUR_NAME]
```

### External Communication (if needed)
```
We are currently experiencing technical difficulties with buildinginthecloud.com redirects. 
Our team is working to resolve the issue. 
Expected resolution: [TIME_ESTIMATE]
Updates: [STATUS_PAGE_URL]
```

## Testing Rollback Procedures

### Monthly Rollback Drill
- [ ] Practice DNS rollback in staging environment
- [ ] Test CloudFront distribution disabling
- [ ] Verify communication procedures
- [ ] Update procedures based on findings

### Staging Environment Testing
```bash
# Deploy to staging first
cdk deploy DomainRedirectStack-Staging

# Test rollback procedures
cdk destroy DomainRedirectStack-Staging

# Verify cleanup
aws cloudformation list-stacks --stack-status-filter DELETE_COMPLETE
```

## Related Documentation

- [Deployment Runbook](./deployment-runbook.md)
- [Troubleshooting Guide](./troubleshooting-guide.md)
- [Monitoring and Alerting](./monitoring-guide.md)