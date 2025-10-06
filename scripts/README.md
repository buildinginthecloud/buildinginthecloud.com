# Domain Redirect Deployment Scripts

This directory contains scripts for deploying and validating the domain redirect infrastructure from `buildinginthecloud.com` to `yvovanzee.nl`.

## Scripts Overview

### 1. `deploy.ts` - CDK Deployment Script

Automated deployment script with comprehensive validation and error handling.

**Features:**
- AWS profile validation
- Pre-deployment checks
- CDK bootstrap management
- Stack output monitoring
- Rollback capabilities

**Usage:**
```bash
# Deploy to development environment
npm run deploy:domain-redirect

# Deploy to production environment
npm run deploy:domain-redirect:prod

# Rollback deployment
npm run rollback:domain-redirect
```

**Requirements Addressed:**
- 2.3: AWS profile configuration
- 3.1: Infrastructure as Code deployment
- 3.3: Stack output monitoring

### 2. `validate-deployment.ts` - Post-Deployment Validation

Comprehensive validation script that verifies deployment success.

**Features:**
- Stack deployment status validation
- DNS propagation checking across multiple DNS servers
- SSL certificate validation
- Redirect functionality testing
- Health check validation
- Performance monitoring

**Usage:**
```bash
# Validate development deployment
npm run validate:domain-redirect

# Validate production deployment
npm run validate:domain-redirect:prod
```

**Test Coverage:**
- HTTP to HTTPS redirects
- Domain redirects (buildinginthecloud.com → yvovanzee.nl)
- Path preservation in redirects
- Query parameter preservation
- DNS resolution (A, AAAA, CNAME records)
- SSL certificate validity
- CloudFront distribution health
- Response time performance

**Requirements Addressed:**
- 1.5: Redirect functionality validation
- 2.4: DNS propagation and health checks

### 3. `health-check.ts` - Ongoing Health Monitoring

Lightweight health check script for continuous monitoring.

**Features:**
- Quick redirect functionality check
- Response time monitoring
- Exit codes for CI/CD integration
- Minimal resource usage

**Usage:**
```bash
# Run health check
npm run health-check:domain-redirect

# Use in monitoring systems (exit code 0 = healthy, 1 = unhealthy)
npm run health-check:domain-redirect && echo "Healthy" || echo "Unhealthy"
```

## Configuration

### AWS Profile Setup

The scripts use the `yvovanzee` AWS profile. Ensure your AWS credentials are configured:

```bash
aws configure --profile yvovanzee
```

### Environment Variables

Required environment variables:
- `CDK_DEFAULT_ACCOUNT`: AWS account ID
- `CDK_DEFAULT_REGION`: AWS region (default: eu-west-1)

These can be set via AWS profile or environment variables.

## Deployment Workflow

### Initial Deployment

1. **Pre-deployment validation**
   ```bash
   npm run deploy:domain-redirect
   ```
   This automatically runs:
   - AWS profile validation
   - Credentials check
   - CDK version compatibility
   - Project structure validation
   - Dependencies check

2. **CDK Bootstrap** (if needed)
   - Automatically checks and runs CDK bootstrap if required

3. **Stack Deployment**
   - Deploys the domain redirect stack
   - Creates stack outputs for monitoring

4. **Post-deployment validation**
   ```bash
   npm run validate:domain-redirect
   ```

### Ongoing Monitoring

Set up periodic health checks:

```bash
# Add to cron for periodic monitoring
*/5 * * * * cd /path/to/project && npm run health-check:domain-redirect
```

## Troubleshooting

### Common Issues

1. **AWS Profile Not Found**
   ```
   Error: AWS profile 'yvovanzee' not found
   ```
   **Solution:** Configure the AWS profile:
   ```bash
   aws configure --profile yvovanzee
   ```

2. **CDK Bootstrap Required**
   ```
   Error: CDK bootstrap required
   ```
   **Solution:** The deployment script automatically handles this, but you can manually run:
   ```bash
   npx cdk bootstrap --profile yvovanzee
   ```

3. **DNS Propagation Issues**
   ```
   Warning: DNS record resolution failed via some servers
   ```
   **Solution:** DNS propagation can take time. Wait 5-15 minutes and re-run validation.

4. **SSL Certificate Validation Failed**
   ```
   Error: SSL certificate invalid or expired
   ```
   **Solution:** Check ACM certificate status in AWS console. Certificate validation via DNS can take time.

5. **Redirect Tests Failing**
   ```
   Error: Redirect tests failed
   ```
   **Solution:** 
   - Check CloudFront distribution status
   - Verify S3 bucket redirect rules
   - Ensure DNS records are properly configured

### Debug Mode

For detailed debugging, you can run the scripts with additional logging:

```bash
# Enable verbose CDK output
CDK_DEBUG=true npm run deploy:domain-redirect

# Check AWS CLI configuration
aws configure list --profile yvovanzee
aws sts get-caller-identity --profile yvovanzee
```

### Manual Verification

You can manually test the redirect functionality:

```bash
# Test HTTP redirect
curl -I http://buildinginthecloud.com

# Test HTTPS redirect
curl -I https://buildinginthecloud.com

# Test path preservation
curl -I https://buildinginthecloud.com/blog

# Test query parameters
curl -I "https://buildinginthecloud.com/search?q=test"
```

Expected response:
```
HTTP/1.1 301 Moved Permanently
Location: https://yvovanzee.nl/
```

## Stack Outputs

The deployment creates the following CloudFormation outputs for monitoring:

- `CloudFrontDistributionId`: For cache invalidation and monitoring
- `CloudFrontDistributionDomainName`: CloudFront endpoint
- `RedirectBucketName`: S3 bucket name
- `RedirectBucketWebsiteUrl`: S3 website endpoint
- `SslCertificateArn`: SSL certificate ARN
- `HostedZoneId`: Route53 hosted zone ID
- `HostedZoneNameServers`: DNS name servers for domain delegation
- `RedirectConfiguration`: Summary of redirect configuration
- `DeploymentTimestamp`: Deployment tracking

## Security Considerations

- Scripts use least-privilege AWS IAM permissions
- SSL/TLS encryption enforced for all connections
- CloudFront provides DDoS protection
- S3 bucket access restricted to CloudFront only

## Performance Expectations

- **DNS Resolution**: < 100ms
- **Redirect Response**: < 500ms
- **SSL Handshake**: < 1000ms
- **Total Redirect Time**: < 2000ms

The validation script will flag performance issues if response times exceed these thresholds.