# Domain Redirect Troubleshooting Guide

## Overview

This guide provides comprehensive troubleshooting procedures for the domain redirect infrastructure from buildinginthecloud.com to yvovanzee.nl.

## Quick Diagnostic Commands

### System Health Check
```bash
# Check stack status
aws cloudformation describe-stacks --stack-name DomainRedirectStack

# Test redirect functionality
curl -I http://buildinginthecloud.com
curl -I https://buildinginthecloud.com
curl -I https://www.buildinginthecloud.com

# Check DNS resolution
dig buildinginthecloud.com
nslookup buildinginthecloud.com

# Validate SSL certificate
openssl s_client -connect buildinginthecloud.com:443 -servername buildinginthecloud.com
```

### Get Resource Information
```bash
# Get CloudFront distribution ID
aws cloudformation describe-stacks \
  --stack-name DomainRedirectStack \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
  --output text

# Get S3 bucket names
aws cloudformation describe-stacks \
  --stack-name DomainRedirectStack \
  --query 'Stacks[0].Outputs[?OutputKey==`RedirectBucketName`].OutputValue' \
  --output text

# Get Route53 hosted zone ID
aws cloudformation describe-stacks \
  --stack-name DomainRedirectStack \
  --query 'Stacks[0].Outputs[?OutputKey==`HostedZoneId`].OutputValue' \
  --output text
```

## Common Issues and Solutions

### 1. DNS Resolution Issues

#### Symptoms
- Domain not resolving
- DNS queries timing out
- Wrong IP addresses returned

#### Diagnosis
```bash
# Check DNS propagation globally
dig @8.8.8.8 buildinginthecloud.com
dig @1.1.1.1 buildinginthecloud.com
dig @208.67.222.222 buildinginthecloud.com

# Check Route53 records
aws route53 list-resource-record-sets --hosted-zone-id <zone-id>

# Check name servers at registrar
whois buildinginthecloud.com | grep "Name Server"
```

#### Solutions
1. **DNS Propagation Delay**
   ```bash
   # Wait for propagation (up to 48 hours)
   # Check propagation status
   dig +trace buildinginthecloud.com
   ```

2. **Incorrect Name Servers**
   ```bash
   # Get correct name servers from Route53
   aws route53 get-hosted-zone --id <zone-id>
   # Update at domain registrar
   ```

3. **Missing DNS Records**
   ```bash
   # Verify A and AAAA records exist
   aws route53 list-resource-record-sets --hosted-zone-id <zone-id> \
     --query 'ResourceRecordSets[?Type==`A` || Type==`AAAA`]'
   ```

### 2. SSL/TLS Certificate Issues

#### Symptoms
- SSL certificate warnings in browser
- "Certificate not valid" errors
- HTTPS connections failing

#### Diagnosis
```bash
# Check certificate status
aws acm describe-certificate --certificate-arn <cert-arn>

# Test SSL connection
openssl s_client -connect buildinginthecloud.com:443 -servername buildinginthecloud.com

# Check certificate chain
curl -vI https://buildinginthecloud.com 2>&1 | grep -E "(SSL|TLS|certificate)"
```

#### Solutions
1. **Certificate Validation Pending**
   ```bash
   # Check validation records in Route53
   aws route53 list-resource-record-sets --hosted-zone-id <zone-id> \
     --query 'ResourceRecordSets[?Type==`CNAME`]'
   
   # Wait for validation (can take up to 30 minutes)
   aws acm wait certificate-validated --certificate-arn <cert-arn>
   ```

2. **Certificate in Wrong Region**
   ```bash
   # Verify certificate is in us-east-1 for CloudFront
   aws acm list-certificates --region us-east-1
   ```

3. **Domain Mismatch**
   ```bash
   # Verify certificate covers both apex and www domains
   aws acm describe-certificate --certificate-arn <cert-arn> \
     --query 'Certificate.SubjectAlternativeNames'
   ```

### 3. CloudFront Distribution Issues

#### Symptoms
- 502/503 errors from CloudFront
- Slow response times
- Cache misses

#### Diagnosis
```bash
# Check distribution status
aws cloudfront get-distribution --id <distribution-id>

# Check CloudFront metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name Requests \
  --dimensions Name=DistributionId,Value=<distribution-id> \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-01T23:59:59Z \
  --period 3600 \
  --statistics Sum

# Check origin health
curl -I <s3-website-url>
```

#### Solutions
1. **Distribution Not Deployed**
   ```bash
   # Wait for deployment to complete
   aws cloudfront wait distribution-deployed --id <distribution-id>
   ```

2. **Origin Issues**
   ```bash
   # Check S3 bucket website configuration
   aws s3api get-bucket-website --bucket <bucket-name>
   
   # Verify bucket policy allows CloudFront access
   aws s3api get-bucket-policy --bucket <bucket-name>
   ```

3. **Cache Issues**
   ```bash
   # Invalidate CloudFront cache
   aws cloudfront create-invalidation \
     --distribution-id <distribution-id> \
     --paths "/*"
   ```

### 4. S3 Redirect Configuration Issues

#### Symptoms
- 404 errors instead of redirects
- Redirects not preserving paths
- Wrong redirect status codes

#### Diagnosis
```bash
# Check S3 website configuration
aws s3api get-bucket-website --bucket <bucket-name>

# Test S3 website endpoint directly
curl -I <s3-website-url>

# Check bucket policy
aws s3api get-bucket-policy --bucket <bucket-name>
```

#### Solutions
1. **Missing Redirect Rules**
   ```bash
   # Verify redirect rules are configured
   aws s3api get-bucket-website --bucket <bucket-name> \
     --query 'RoutingRules'
   ```

2. **Incorrect Redirect Configuration**
   ```bash
   # Update redirect rules via CDK
   cdk deploy DomainRedirectStack
   ```

3. **Bucket Access Issues**
   ```bash
   # Check bucket public access settings
   aws s3api get-public-access-block --bucket <bucket-name>
   
   # Verify bucket policy
   aws s3api get-bucket-policy --bucket <bucket-name>
   ```

### 5. Monitoring and Alerting Issues

#### Symptoms
- CloudWatch alarms not firing
- Missing metrics data
- Dashboard not loading

#### Diagnosis
```bash
# Check CloudWatch alarms
aws cloudwatch describe-alarms \
  --alarm-names <alarm-name>

# Check metrics availability
aws cloudwatch list-metrics \
  --namespace AWS/CloudFront \
  --dimensions Name=DistributionId,Value=<distribution-id>

# Verify dashboard exists
aws cloudwatch list-dashboards
```

#### Solutions
1. **Missing Metrics**
   ```bash
   # Wait for metrics to appear (can take up to 15 minutes)
   # Verify CloudFront distribution is receiving traffic
   ```

2. **Alarm Configuration Issues**
   ```bash
   # Redeploy stack to fix alarm configuration
   cdk deploy DomainRedirectStack
   ```

## Performance Troubleshooting

### Slow Redirect Response Times

#### Diagnosis
```bash
# Test response times from different locations
curl -w "@curl-format.txt" -o /dev/null -s http://buildinginthecloud.com

# Check CloudFront edge location performance
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name OriginLatency \
  --dimensions Name=DistributionId,Value=<distribution-id> \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average,Maximum
```

#### Solutions
1. **Optimize Cache Settings**
   ```bash
   # Review cache policy configuration
   aws cloudfront get-cache-policy --id <cache-policy-id>
   ```

2. **Check S3 Performance**
   ```bash
   # Test S3 website endpoint directly
   time curl -I <s3-website-url>
   ```

### High Error Rates

#### Diagnosis
```bash
# Check error metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name 4xxErrorRate \
  --dimensions Name=DistributionId,Value=<distribution-id> \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average

# Analyze access logs
aws s3 cp s3://<logs-bucket>/cloudfront-access-logs/ . --recursive
```

#### Solutions
1. **Analyze Log Patterns**
   ```bash
   # Parse CloudFront logs for error patterns
   grep " 4[0-9][0-9] " *.gz | head -20
   grep " 5[0-9][0-9] " *.gz | head -20
   ```

2. **Check Origin Health**
   ```bash
   # Verify S3 bucket is accessible
   aws s3 ls s3://<bucket-name>/
   ```

## Curl Format File for Performance Testing

Create `curl-format.txt`:
```
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
```

## Log Analysis Commands

### CloudFront Access Logs
```bash
# Download recent logs
aws s3 sync s3://<logs-bucket>/cloudfront-access-logs/ ./logs/

# Analyze top requests
zcat logs/*.gz | awk '{print $7}' | sort | uniq -c | sort -nr | head -20

# Check error responses
zcat logs/*.gz | awk '$9 >= 400 {print $9, $7}' | sort | uniq -c | sort -nr

# Analyze user agents
zcat logs/*.gz | awk -F'\t' '{print $10}' | sort | uniq -c | sort -nr | head -10
```

### CloudWatch Insights Queries
```sql
-- Top error responses
fields @timestamp, status, uri
| filter status >= 400
| stats count() by status
| sort count desc

-- Slow requests
fields @timestamp, time_taken, uri
| filter time_taken > 5
| sort @timestamp desc
| limit 100
```

## Escalation Procedures

### When to Escalate
- Multiple systems affected
- Error rates > 10%
- Complete service outage
- Security incidents

### Escalation Contacts
1. **Level 1**: On-call Engineer (immediate response)
2. **Level 2**: DevOps Lead (within 30 minutes)
3. **Level 3**: Infrastructure Manager (within 1 hour)
4. **Level 4**: CTO (critical issues only)

### Information to Include
- Issue description and impact
- Steps already taken
- Current error rates/metrics
- Affected user count estimate
- Relevant log snippets

## Preventive Measures

### Regular Health Checks
```bash
#!/bin/bash
# health-check.sh - Run daily
echo "Checking domain redirect health..."

# Test redirects
curl -I http://buildinginthecloud.com | grep "301\|302"
curl -I https://buildinginthecloud.com | grep "301\|302"

# Check SSL certificate expiry
openssl s_client -connect buildinginthecloud.com:443 -servername buildinginthecloud.com 2>/dev/null | \
  openssl x509 -noout -dates

# Check CloudWatch alarms
aws cloudwatch describe-alarms --state-value ALARM --query 'MetricAlarms[].AlarmName'
```

### Monitoring Best Practices
- Set up synthetic monitoring for critical paths
- Monitor from multiple geographic locations
- Set appropriate alarm thresholds
- Regular review of metrics and logs

## Related Documentation

- [Deployment Runbook](./deployment-runbook.md)
- [Rollback Procedures](./rollback-procedures.md)
- [Architecture Design](../.kiro/specs/domain-redirect/design.md)