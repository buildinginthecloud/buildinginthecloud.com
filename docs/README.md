# Domain Redirect Documentation

This directory contains operational documentation for the domain redirect infrastructure from buildinginthecloud.com to yvovanzee.nl.

## Documentation Overview

### Core Operational Guides

1. **[Deployment Runbook](./deployment-runbook.md)**
   - Step-by-step deployment procedures
   - Pre-deployment checklist
   - Post-deployment validation
   - DNS delegation instructions

2. **[Rollback Procedures](./rollback-procedures.md)**
   - Emergency rollback scenarios
   - Complete stack rollback procedures
   - DNS reversion steps
   - Post-rollback verification

3. **[Troubleshooting Guide](./troubleshooting-guide.md)**
   - Common issues and solutions
   - Diagnostic commands
   - Performance troubleshooting
   - Log analysis procedures

4. **[Monitoring Guide](./monitoring-guide.md)**
   - CloudWatch metrics and alarms
   - Dashboard configuration
   - Synthetic monitoring setup
   - Alerting procedures

### Technical Specifications

- **[Requirements](../.kiro/specs/domain-redirect/requirements.md)** - Feature requirements in EARS format
- **[Design](../.kiro/specs/domain-redirect/design.md)** - Architecture and technical design
- **[Tasks](../.kiro/specs/domain-redirect/tasks.md)** - Implementation task list

## Quick Reference

### Emergency Contacts
- **DevOps Team**: devops@example.com
- **On-call Engineer**: +1-555-0123
- **AWS Support**: Enterprise Support Case

### Key AWS Resources
- **Stack Name**: `DomainRedirectStack`
- **Source Domain**: `buildinginthecloud.com`
- **Target Domain**: `yvovanzee.nl`
- **AWS Profile**: `yvovanzee`

### Essential Commands

#### Health Check
```bash
# Quick health check
curl -I http://buildinginthecloud.com
curl -I https://buildinginthecloud.com

# Check stack status
aws cloudformation describe-stacks --stack-name DomainRedirectStack
```

#### Emergency Rollback
```bash
# Disable CloudFront distribution
aws cloudfront get-distribution-config --id <distribution-id> > dist-config.json
# Edit dist-config.json to set "Enabled": false
aws cloudfront update-distribution --id <distribution-id> --distribution-config file://dist-config.json --if-match <etag>

# Complete stack rollback
cdk destroy DomainRedirectStack --force
```

#### Monitoring
```bash
# Check alarms
aws cloudwatch describe-alarms --state-value ALARM

# View metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name Requests \
  --dimensions Name=DistributionId,Value=<distribution-id> \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum
```

## Document Maintenance

### Update Schedule
- **Monthly**: Review and update procedures based on operational experience
- **Quarterly**: Comprehensive review of all documentation
- **After Incidents**: Update based on lessons learned

### Version Control
All documentation is version controlled in the main repository. Changes should be:
1. Reviewed by the DevOps team
2. Tested in staging environment when applicable
3. Approved before merging to main branch

### Feedback and Improvements
Please submit feedback and improvement suggestions through:
- GitHub issues for documentation bugs
- Pull requests for proposed changes
- Team meetings for major revisions

## Related Resources

### AWS Documentation
- [CloudFront Developer Guide](https://docs.aws.amazon.com/cloudfront/)
- [Route53 Developer Guide](https://docs.aws.amazon.com/route53/)
- [S3 User Guide](https://docs.aws.amazon.com/s3/)
- [CloudWatch User Guide](https://docs.aws.amazon.com/cloudwatch/)

### Internal Resources
- [Infrastructure Standards](../standards/infrastructure.md)
- [Monitoring Best Practices](../standards/monitoring.md)
- [Incident Response Procedures](../procedures/incident-response.md)

## Support

For questions or issues with this documentation:
1. Check the troubleshooting guide first
2. Search existing GitHub issues
3. Contact the DevOps team
4. Create a new issue if needed

---

**Last Updated**: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Maintained By**: DevOps Team
**Review Cycle**: Monthly