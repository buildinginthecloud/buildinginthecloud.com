# Domain Redirect Monitoring Guide

## Overview

This guide provides comprehensive information about monitoring the domain redirect infrastructure, including metrics, alarms, dashboards, and operational procedures.

## Monitoring Architecture

### Key Components
- **CloudFront Distribution**: Primary redirect service
- **S3 Bucket**: Origin for redirect rules
- **Route53**: DNS resolution
- **Certificate Manager**: SSL/TLS certificates
- **CloudWatch**: Metrics, alarms, and dashboards

### Data Flow
```
User Request → Route53 → CloudFront → S3 Redirect Rules → Target Domain
                ↓           ↓           ↓
            CloudWatch ← Metrics ← Access Logs
```

## Key Performance Indicators (KPIs)

### Availability Metrics
- **Uptime**: Target 99.9% availability
- **DNS Resolution Success Rate**: Target 99.95%
- **SSL Certificate Validity**: Continuous monitoring

### Performance Metrics
- **Redirect Response Time**: Target <500ms (95th percentile)
- **Cache Hit Rate**: Target >80%
- **Origin Latency**: Target <2 seconds

### Error Metrics
- **4xx Error Rate**: Target <2%
- **5xx Error Rate**: Target <0.5%
- **DNS Resolution Failures**: Target <0.1%

## CloudWatch Metrics

### CloudFront Metrics
| Metric Name | Description | Unit | Frequency |
|-------------|-------------|------|-----------|
| Requests | Total number of requests | Count | 1 minute |
| BytesDownloaded | Bytes downloaded by viewers | Bytes | 1 minute |
| BytesUploaded | Bytes uploaded to origin | Bytes | 1 minute |
| 4xxErrorRate | Percentage of 4xx errors | Percent | 1 minute |
| 5xxErrorRate | Percentage of 5xx errors | Percent | 1 minute |
| CacheHitRate | Percentage of cache hits | Percent | 1 minute |
| OriginLatency | Time to first byte from origin | Milliseconds | 1 minute |

### Route53 Metrics
| Metric Name | Description | Unit | Frequency |
|-------------|-------------|------|-----------|
| QueryCount | Number of DNS queries | Count | 1 minute |
| ConnectionTime | DNS resolution time | Milliseconds | 1 minute |

### Custom Metrics
```bash
# Publish custom availability metric
aws cloudwatch put-metric-data \
  --namespace "DomainRedirect/Availability" \
  --metric-data MetricName=RedirectSuccess,Value=1,Unit=Count

# Publish response time metric
aws cloudwatch put-metric-data \
  --namespace "DomainRedirect/Performance" \
  --metric-data MetricName=ResponseTime,Value=250,Unit=Milliseconds
```

## CloudWatch Alarms

### Critical Alarms (Immediate Response Required)

#### 1. High 5xx Error Rate
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name "DomainRedirect-5xxErrorRate-Critical" \
  --alarm-description "Critical: High 5xx error rate for domain redirect" \
  --metric-name 5xxErrorRate \
  --namespace AWS/CloudFront \
  --statistic Average \
  --period 300 \
  --threshold 1.0 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:region:account:critical-alerts
```

#### 2. Complete Service Failure
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name "DomainRedirect-NoRequests-Critical" \
  --alarm-description "Critical: No requests received for domain redirect" \
  --metric-name Requests \
  --namespace AWS/CloudFront \
  --statistic Sum \
  --period 600 \
  --threshold 1 \
  --comparison-operator LessThanThreshold \
  --evaluation-periods 3 \
  --treat-missing-data notBreaching
```

### Warning Alarms (Investigation Required)

#### 1. High 4xx Error Rate
- **Threshold**: >5% for 2 consecutive periods
- **Action**: Investigate redirect configuration

#### 2. Low Cache Hit Rate
- **Threshold**: <80% for 3 consecutive periods
- **Action**: Review cache policy configuration

#### 3. High Origin Latency
- **Threshold**: >5 seconds for 3 consecutive periods
- **Action**: Check S3 bucket performance

## Dashboards

### Main Monitoring Dashboard

Access URL: `https://console.aws.amazon.com/cloudwatch/home#dashboards:name=domain-redirect-monitoring`

#### Widget Configuration
```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/CloudFront", "Requests", "DistributionId", "DISTRIBUTION_ID"]
        ],
        "period": 300,
        "stat": "Sum",
        "region": "us-east-1",
        "title": "Total Requests"
      }
    },
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/CloudFront", "4xxErrorRate", "DistributionId", "DISTRIBUTION_ID"],
          [".", "5xxErrorRate", ".", "."]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1",
        "title": "Error Rates"
      }
    }
  ]
}
```

### Performance Dashboard Widgets

1. **Request Volume**
   - Total requests per minute
   - Requests by geographic region
   - Peak vs. average traffic

2. **Error Analysis**
   - 4xx error rate trend
   - 5xx error rate trend
   - Error distribution by status code

3. **Performance Metrics**
   - Cache hit rate
   - Origin latency
   - Response time percentiles

4. **Infrastructure Health**
   - CloudFront distribution status
   - S3 bucket availability
   - SSL certificate expiry

## Log Analysis

### CloudFront Access Logs

#### Log Format
```
date time x-edge-location sc-bytes c-ip cs-method cs(Host) cs-uri-stem sc-status cs(Referer) cs(User-Agent) cs-uri-query cs(Cookie) x-edge-result-type x-edge-request-id x-host-header cs-protocol cs-bytes time-taken x-forwarded-for ssl-protocol ssl-cipher x-edge-response-result-type cs-protocol-version fle-status fle-encrypted-fields c-port time-to-first-byte x-edge-detailed-result-type sc-content-type sc-content-len sc-range-start sc-range-end
```

#### Useful Log Queries

**Top Error Responses**:
```bash
zcat *.gz | awk '$9 >= 400 {print $9}' | sort | uniq -c | sort -nr
```

**Geographic Distribution**:
```bash
zcat *.gz | awk '{print $3}' | sort | uniq -c | sort -nr | head -20
```

**User Agent Analysis**:
```bash
zcat *.gz | awk -F'\t' '{print $10}' | sort | uniq -c | sort -nr | head -10
```

**Response Time Analysis**:
```bash
zcat *.gz | awk '{if($19>1) print $19, $7}' | sort -nr | head -20
```

### CloudWatch Logs Insights

#### Query Examples

**Error Analysis**:
```sql
fields @timestamp, status, uri, user_agent
| filter status >= 400
| stats count() by status
| sort count desc
```

**Performance Analysis**:
```sql
fields @timestamp, time_taken, uri
| filter time_taken > 1
| stats avg(time_taken), max(time_taken), count() by bin(5m)
| sort @timestamp desc
```

**Geographic Analysis**:
```sql
fields @timestamp, edge_location, count
| stats sum(count) by edge_location
| sort sum desc
| limit 20
```

## Alerting and Notifications

### SNS Topics Configuration

#### Critical Alerts
```bash
aws sns create-topic --name domain-redirect-critical-alerts
aws sns subscribe \
  --topic-arn arn:aws:sns:region:account:domain-redirect-critical-alerts \
  --protocol email \
  --notification-endpoint devops-critical@example.com
```

#### Warning Alerts
```bash
aws sns create-topic --name domain-redirect-warning-alerts
aws sns subscribe \
  --topic-arn arn:aws:sns:region:account:domain-redirect-warning-alerts \
  --protocol email \
  --notification-endpoint devops-warnings@example.com
```

### Slack Integration
```bash
# Create Slack webhook integration
aws sns subscribe \
  --topic-arn arn:aws:sns:region:account:domain-redirect-critical-alerts \
  --protocol https \
  --notification-endpoint https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

## Synthetic Monitoring

### Health Check Script
```bash
#!/bin/bash
# synthetic-monitor.sh - Run every 5 minutes

DOMAIN="buildinginthecloud.com"
TARGET="yvovanzee.nl"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Test HTTP redirect
HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code},%{redirect_url},%{time_total}" http://$DOMAIN)
HTTP_CODE=$(echo $HTTP_RESPONSE | cut -d',' -f1)
REDIRECT_URL=$(echo $HTTP_RESPONSE | cut -d',' -f2)
RESPONSE_TIME=$(echo $HTTP_RESPONSE | cut -d',' -f3)

# Test HTTPS redirect
HTTPS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code},%{redirect_url},%{time_total}" https://$DOMAIN)
HTTPS_CODE=$(echo $HTTPS_RESPONSE | cut -d',' -f1)
HTTPS_REDIRECT_URL=$(echo $HTTPS_RESPONSE | cut -d',' -f2)
HTTPS_RESPONSE_TIME=$(echo $HTTPS_RESPONSE | cut -d',' -f3)

# Publish metrics to CloudWatch
aws cloudwatch put-metric-data \
  --namespace "DomainRedirect/Synthetic" \
  --metric-data \
    MetricName=HTTPRedirectSuccess,Value=$([[ $HTTP_CODE == "301" ]] && echo 1 || echo 0),Unit=Count,Timestamp=$TIMESTAMP \
    MetricName=HTTPSRedirectSuccess,Value=$([[ $HTTPS_CODE == "301" ]] && echo 1 || echo 0),Unit=Count,Timestamp=$TIMESTAMP \
    MetricName=ResponseTime,Value=${RESPONSE_TIME%.*},Unit=Milliseconds,Timestamp=$TIMESTAMP

# Check if redirect target is correct
if [[ $REDIRECT_URL == *"$TARGET"* ]]; then
  aws cloudwatch put-metric-data \
    --namespace "DomainRedirect/Synthetic" \
    --metric-data MetricName=CorrectTarget,Value=1,Unit=Count,Timestamp=$TIMESTAMP
else
  aws cloudwatch put-metric-data \
    --namespace "DomainRedirect/Synthetic" \
    --metric-data MetricName=CorrectTarget,Value=0,Unit=Count,Timestamp=$TIMESTAMP
fi
```

### Route53 Health Checks
```bash
# Create Route53 health check
aws route53 create-health-check \
  --caller-reference "domain-redirect-$(date +%s)" \
  --health-check-config \
    Type=HTTPS,ResourcePath=/,FullyQualifiedDomainName=buildinginthecloud.com,Port=443,RequestInterval=30,FailureThreshold=3
```

## Operational Procedures

### Daily Monitoring Tasks
- [ ] Review CloudWatch dashboard for anomalies
- [ ] Check alarm status and resolve any issues
- [ ] Verify synthetic monitoring results
- [ ] Review error logs for patterns

### Weekly Monitoring Tasks
- [ ] Analyze traffic patterns and trends
- [ ] Review performance metrics and optimize if needed
- [ ] Check SSL certificate expiry dates
- [ ] Update monitoring thresholds if necessary

### Monthly Monitoring Tasks
- [ ] Generate performance reports
- [ ] Review and optimize CloudWatch costs
- [ ] Update monitoring documentation
- [ ] Test alerting mechanisms

## Cost Optimization

### CloudWatch Costs
- **Metrics**: $0.30 per metric per month
- **Alarms**: $0.10 per alarm per month
- **Dashboard**: $3.00 per dashboard per month
- **Logs**: $0.50 per GB ingested

### Optimization Strategies
1. **Metric Retention**: Set appropriate retention periods
2. **Log Filtering**: Filter out unnecessary log entries
3. **Alarm Consolidation**: Combine related alarms where possible
4. **Dashboard Optimization**: Remove unused widgets

## Troubleshooting Monitoring Issues

### Missing Metrics
```bash
# Check if CloudFront is generating metrics
aws cloudwatch list-metrics --namespace AWS/CloudFront

# Verify distribution is receiving traffic
aws cloudfront get-distribution-config --id DISTRIBUTION_ID
```

### Alarm Not Firing
```bash
# Check alarm configuration
aws cloudwatch describe-alarms --alarm-names ALARM_NAME

# Test alarm manually
aws cloudwatch set-alarm-state \
  --alarm-name ALARM_NAME \
  --state-value ALARM \
  --state-reason "Manual test"
```

### Dashboard Issues
```bash
# Verify dashboard exists
aws cloudwatch list-dashboards

# Get dashboard configuration
aws cloudwatch get-dashboard --dashboard-name DASHBOARD_NAME
```

## Related Documentation

- [Deployment Runbook](./deployment-runbook.md)
- [Troubleshooting Guide](./troubleshooting-guide.md)
- [Rollback Procedures](./rollback-procedures.md)
- [Architecture Design](../.kiro/specs/domain-redirect/design.md)