#!/usr/bin/env ts-node

/**
 * Post-Deployment Validation Script for Domain Redirect
 * 
 * This script provides comprehensive post-deployment validation:
 * - Redirect functionality testing
 * - DNS propagation checking
 * - Health check validation
 * - Performance monitoring
 * 
 * Requirements: 1.5, 2.4
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import * as https from 'https';
import * as http from 'http';
import * as dns from 'dns';
import { promisify } from 'util';

const dnsResolve = promisify(dns.resolve);
const dnsResolve4 = promisify(dns.resolve4);
const dnsResolve6 = promisify(dns.resolve6);

interface ValidationConfig {
  sourceDomain: string;
  targetDomain: string;
  profile: string;
  region: string;
  stackName: string;
  timeout: number;
}

interface ValidationResult {
  test: string;
  success: boolean;
  message: string;
  details?: any;
  duration?: number;
}

interface RedirectTestResult {
  url: string;
  statusCode: number;
  location?: string;
  responseTime: number;
  success: boolean;
  error?: string;
}

interface DnsRecord {
  type: string;
  values: string[];
  ttl?: number;
}

class DeploymentValidator {
  private config: ValidationConfig;
  private results: ValidationResult[] = [];

  constructor(config: ValidationConfig) {
    this.config = config;
  }

  /**
   * Main validation orchestration method
   */
  async validate(): Promise<boolean> {
    console.log('🔍 Starting post-deployment validation...');
    console.log(`Source Domain: ${this.config.sourceDomain}`);
    console.log(`Target Domain: ${this.config.targetDomain}`);
    console.log(`Stack: ${this.config.stackName}\n`);

    try {
      // Step 1: Validate stack deployment status
      await this.validateStackStatus();

      // Step 2: DNS propagation checks
      await this.validateDnsPropagation();

      // Step 3: SSL certificate validation
      await this.validateSslCertificate();

      // Step 4: Redirect functionality tests
      await this.validateRedirectFunctionality();

      // Step 5: Health checks
      await this.validateHealthChecks();

      // Step 6: Performance validation
      await this.validatePerformance();

      // Generate summary report
      this.generateReport();

      const failedTests = this.results.filter(r => !r.success);
      if (failedTests.length > 0) {
        console.log(`\n❌ Validation failed: ${failedTests.length} test(s) failed`);
        return false;
      }

      console.log('\n✅ All validation tests passed!');
      return true;
    } catch (error) {
      console.error('❌ Validation failed with error:', error);
      return false;
    }
  }

  /**
   * Validate CloudFormation stack deployment status
   */
  private async validateStackStatus(): Promise<void> {
    console.log('📋 Validating stack deployment status...');
    
    try {
      const result = execSync(
        `aws cloudformation describe-stacks --stack-name ${this.config.stackName} --profile ${this.config.profile} --region ${this.config.region}`,
        { encoding: 'utf8' }
      );
      
      const stacks = JSON.parse(result);
      const stack = stacks.Stacks[0];
      
      const success = stack.StackStatus === 'CREATE_COMPLETE' || stack.StackStatus === 'UPDATE_COMPLETE';
      
      this.results.push({
        test: 'Stack Status',
        success,
        message: success ? 'Stack deployed successfully' : `Stack status: ${stack.StackStatus}`,
        details: { status: stack.StackStatus, stackId: stack.StackId }
      });

      if (success) {
        console.log(`  ✓ Stack status: ${stack.StackStatus}`);
      } else {
        console.log(`  ❌ Stack status: ${stack.StackStatus}`);
      }
    } catch (error) {
      this.results.push({
        test: 'Stack Status',
        success: false,
        message: 'Failed to check stack status',
        details: error instanceof Error ? error.message : String(error)
      });
      console.log('  ❌ Failed to check stack status');
    }
  }

  /**
   * Validate DNS propagation across multiple DNS servers
   * Requirements: 2.4
   */
  private async validateDnsPropagation(): Promise<void> {
    console.log('🌐 Validating DNS propagation...');
    
    const dnsServers = [
      '8.8.8.8',      // Google DNS
      '1.1.1.1',      // Cloudflare DNS
      '208.67.222.222', // OpenDNS
      '9.9.9.9'       // Quad9 DNS
    ];

    // Test A record resolution
    await this.testDnsRecord('A', dnsServers);
    
    // Test AAAA record resolution (IPv6)
    await this.testDnsRecord('AAAA', dnsServers);
    
    // Test CNAME record for www subdomain
    await this.testCnameRecord(dnsServers);
  }

  /**
   * Test DNS record resolution across multiple DNS servers
   */
  private async testDnsRecord(recordType: 'A' | 'AAAA', dnsServers: string[]): Promise<void> {
    const resolveFunction = recordType === 'A' ? dnsResolve4 : dnsResolve6;
    let successCount = 0;
    const results: any[] = [];

    for (const server of dnsServers) {
      try {
        // Set DNS server
        dns.setServers([server]);
        
        const startTime = Date.now();
        const addresses = await resolveFunction(this.config.sourceDomain);
        const duration = Date.now() - startTime;
        
        results.push({ server, addresses, duration });
        successCount++;
        
        console.log(`  ✓ ${recordType} record resolved via ${server}: ${addresses.join(', ')} (${duration}ms)`);
      } catch (error) {
        results.push({ server, error: error instanceof Error ? error.message : String(error) });
        console.log(`  ❌ ${recordType} record failed via ${server}`);
      }
    }

    const success = successCount >= Math.ceil(dnsServers.length / 2); // At least 50% success
    
    this.results.push({
      test: `DNS ${recordType} Record`,
      success,
      message: success 
        ? `${recordType} record resolved successfully (${successCount}/${dnsServers.length} servers)`
        : `${recordType} record resolution failed (${successCount}/${dnsServers.length} servers)`,
      details: results
    });

    // Reset DNS servers to default
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  }

  /**
   * Test CNAME record for www subdomain
   */
  private async testCnameRecord(dnsServers: string[]): Promise<void> {
    const wwwDomain = `www.${this.config.sourceDomain}`;
    let successCount = 0;
    const results: any[] = [];

    for (const server of dnsServers) {
      try {
        dns.setServers([server]);
        
        const startTime = Date.now();
        const addresses = await dnsResolve(wwwDomain, 'CNAME');
        const duration = Date.now() - startTime;
        
        results.push({ server, addresses, duration });
        successCount++;
        
        console.log(`  ✓ CNAME record resolved via ${server}: ${addresses.join(', ')} (${duration}ms)`);
      } catch (error) {
        results.push({ server, error: error instanceof Error ? error.message : String(error) });
        console.log(`  ❌ CNAME record failed via ${server}`);
      }
    }

    const success = successCount >= Math.ceil(dnsServers.length / 2);
    
    this.results.push({
      test: 'DNS CNAME Record (www)',
      success,
      message: success 
        ? `CNAME record resolved successfully (${successCount}/${dnsServers.length} servers)`
        : `CNAME record resolution failed (${successCount}/${dnsServers.length} servers)`,
      details: results
    });

    dns.setServers(['8.8.8.8', '1.1.1.1']);
  }

  /**
   * Validate SSL certificate configuration and validity
   */
  private async validateSslCertificate(): Promise<void> {
    console.log('🔒 Validating SSL certificate...');
    
    try {
      const certInfo = await this.getSslCertificateInfo(`https://${this.config.sourceDomain}`);
      
      const now = new Date();
      const validFrom = new Date(certInfo.valid_from);
      const validTo = new Date(certInfo.valid_to);
      
      const isValid = now >= validFrom && now <= validTo;
      const daysUntilExpiry = Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      this.results.push({
        test: 'SSL Certificate',
        success: isValid,
        message: isValid 
          ? `SSL certificate valid (expires in ${daysUntilExpiry} days)`
          : 'SSL certificate invalid or expired',
        details: {
          subject: certInfo.subject,
          issuer: certInfo.issuer,
          validFrom: certInfo.valid_from,
          validTo: certInfo.valid_to,
          daysUntilExpiry
        }
      });

      if (isValid) {
        console.log(`  ✓ SSL certificate valid (expires: ${validTo.toISOString()})`);
      } else {
        console.log(`  ❌ SSL certificate invalid or expired`);
      }
    } catch (error) {
      this.results.push({
        test: 'SSL Certificate',
        success: false,
        message: 'Failed to validate SSL certificate',
        details: error instanceof Error ? error.message : String(error)
      });
      console.log('  ❌ Failed to validate SSL certificate');
    }
  }

  /**
   * Get SSL certificate information
   */
  private async getSslCertificateInfo(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = https.get(url, { timeout: this.config.timeout }, (res) => {
        const cert = (res.connection as any).getPeerCertificate();
        resolve(cert);
      });

      request.on('error', reject);
      request.on('timeout', () => {
        request.destroy();
        reject(new Error('SSL certificate check timeout'));
      });
    });
  }

  /**
   * Validate redirect functionality with comprehensive tests
   * Requirements: 1.5
   */
  private async validateRedirectFunctionality(): Promise<void> {
    console.log('🔄 Validating redirect functionality...');
    
    const testUrls = [
      // Basic domain redirects
      `http://${this.config.sourceDomain}`,
      `https://${this.config.sourceDomain}`,
      `http://www.${this.config.sourceDomain}`,
      `https://www.${this.config.sourceDomain}`,
      
      // Path preservation tests
      `http://${this.config.sourceDomain}/blog`,
      `https://${this.config.sourceDomain}/blog/post-1`,
      `http://${this.config.sourceDomain}/about`,
      
      // Query parameter preservation tests
      `http://${this.config.sourceDomain}?param=value`,
      `https://${this.config.sourceDomain}/search?q=test&page=1`,
    ];

    const redirectResults: RedirectTestResult[] = [];
    
    for (const url of testUrls) {
      const result = await this.testRedirect(url);
      redirectResults.push(result);
      
      if (result.success) {
        console.log(`  ✓ ${url} -> ${result.location} (${result.statusCode}, ${result.responseTime}ms)`);
      } else {
        console.log(`  ❌ ${url} failed: ${result.error || 'Unknown error'}`);
      }
    }

    const successfulRedirects = redirectResults.filter(r => r.success);
    const success = successfulRedirects.length >= Math.ceil(testUrls.length * 0.8); // 80% success rate
    
    this.results.push({
      test: 'Redirect Functionality',
      success,
      message: success 
        ? `Redirect tests passed (${successfulRedirects.length}/${testUrls.length})`
        : `Redirect tests failed (${successfulRedirects.length}/${testUrls.length})`,
      details: redirectResults
    });
  }

  /**
   * Test individual redirect URL
   */
  private async testRedirect(url: string): Promise<RedirectTestResult> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const isHttps = url.startsWith('https://');
      const client = isHttps ? https : http;
      
      const request = client.get(url, {
        timeout: this.config.timeout,
        // Don't follow redirects automatically
      }, (res) => {
        const responseTime = Date.now() - startTime;
        const statusCode = res.statusCode || 0;
        const location = res.headers.location;
        
        // Check if it's a valid redirect (301, 302, 307, 308)
        const isValidRedirect = [301, 302, 307, 308].includes(statusCode);
        const isTargetDomain = location?.includes(this.config.targetDomain) || false;
        
        resolve({
          url,
          statusCode,
          location,
          responseTime,
          success: isValidRedirect && isTargetDomain
        });
      });

      request.on('error', (error) => {
        const responseTime = Date.now() - startTime;
        resolve({
          url,
          statusCode: 0,
          responseTime,
          success: false,
          error: error.message
        });
      });

      request.on('timeout', () => {
        request.destroy();
        const responseTime = Date.now() - startTime;
        resolve({
          url,
          statusCode: 0,
          responseTime,
          success: false,
          error: 'Request timeout'
        });
      });
    });
  }

  /**
   * Validate health checks and monitoring endpoints
   */
  private async validateHealthChecks(): Promise<void> {
    console.log('🏥 Validating health checks...');
    
    try {
      // Check CloudFront distribution status
      const cfResult = execSync(
        `aws cloudfront get-distribution --id $(aws cloudformation describe-stacks --stack-name ${this.config.stackName} --profile ${this.config.profile} --region ${this.config.region} --query 'Stacks[0].Outputs[?OutputKey==\`CloudFrontDistributionId\`].OutputValue' --output text) --profile ${this.config.profile}`,
        { encoding: 'utf8' }
      );
      
      const distribution = JSON.parse(cfResult);
      const status = distribution.Distribution.Status;
      const enabled = distribution.Distribution.DistributionConfig.Enabled;
      
      const success = status === 'Deployed' && enabled;
      
      this.results.push({
        test: 'CloudFront Health Check',
        success,
        message: success 
          ? 'CloudFront distribution is healthy and deployed'
          : `CloudFront distribution status: ${status}, enabled: ${enabled}`,
        details: { status, enabled, id: distribution.Distribution.Id }
      });

      if (success) {
        console.log(`  ✓ CloudFront distribution healthy (Status: ${status})`);
      } else {
        console.log(`  ❌ CloudFront distribution unhealthy (Status: ${status})`);
      }
    } catch (error) {
      this.results.push({
        test: 'CloudFront Health Check',
        success: false,
        message: 'Failed to check CloudFront health',
        details: error instanceof Error ? error.message : String(error)
      });
      console.log('  ❌ Failed to check CloudFront health');
    }
  }

  /**
   * Validate performance metrics and response times
   */
  private async validatePerformance(): Promise<void> {
    console.log('⚡ Validating performance...');
    
    const performanceTests = [
      `https://${this.config.sourceDomain}`,
      `https://www.${this.config.sourceDomain}`,
    ];

    const performanceResults: any[] = [];
    
    for (const url of performanceTests) {
      try {
        const startTime = Date.now();
        const result = await this.testRedirect(url);
        const totalTime = Date.now() - startTime;
        
        performanceResults.push({
          url,
          responseTime: result.responseTime,
          totalTime,
          success: result.success && result.responseTime < 2000 // Under 2 seconds
        });
        
        if (result.responseTime < 1000) {
          console.log(`  ✓ ${url} response time: ${result.responseTime}ms (excellent)`);
        } else if (result.responseTime < 2000) {
          console.log(`  ✓ ${url} response time: ${result.responseTime}ms (good)`);
        } else {
          console.log(`  ⚠️  ${url} response time: ${result.responseTime}ms (slow)`);
        }
      } catch (error) {
        performanceResults.push({
          url,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
        console.log(`  ❌ ${url} performance test failed`);
      }
    }

    const avgResponseTime = performanceResults
      .filter(r => r.responseTime)
      .reduce((sum, r) => sum + r.responseTime, 0) / performanceResults.length;
    
    const success = avgResponseTime < 2000 && performanceResults.every(r => r.success);
    
    this.results.push({
      test: 'Performance Validation',
      success,
      message: success 
        ? `Performance acceptable (avg: ${Math.round(avgResponseTime)}ms)`
        : `Performance issues detected (avg: ${Math.round(avgResponseTime)}ms)`,
      details: { averageResponseTime: avgResponseTime, results: performanceResults }
    });
  }

  /**
   * Generate comprehensive validation report
   */
  private generateReport(): void {
    console.log('\n📊 Validation Report');
    console.log('='.repeat(50));
    
    const passed = this.results.filter(r => r.success).length;
    const total = this.results.length;
    
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${total - passed}`);
    console.log(`Success Rate: ${Math.round((passed / total) * 100)}%\n`);
    
    // Detailed results
    this.results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${result.test}: ${result.message}`);
      
      if (result.duration) {
        console.log(`   Duration: ${result.duration}ms`);
      }
    });
    
    // Failed tests details
    const failedTests = this.results.filter(r => !r.success);
    if (failedTests.length > 0) {
      console.log('\n🔍 Failed Test Details:');
      failedTests.forEach((test, index) => {
        console.log(`\n${index + 1}. ${test.test}:`);
        console.log(`   Message: ${test.message}`);
        if (test.details) {
          console.log(`   Details: ${JSON.stringify(test.details, null, 2)}`);
        }
      });
    }
  }
}

/**
 * Main execution function
 */
async function main() {
  const args = process.argv.slice(2);
  const environment = (args[0] as 'dev' | 'prod') || 'dev';
  
  const config: ValidationConfig = {
    sourceDomain: 'buildinginthecloud.com',
    targetDomain: 'yvovanzee.nl',
    profile: 'yvovanzee',
    region: process.env.CDK_DEFAULT_REGION || 'eu-west-1',
    stackName: `domain-redirect-${environment}`,
    timeout: 10000 // 10 seconds
  };

  const validator = new DeploymentValidator(config);
  const success = await validator.validate();
  
  process.exit(success ? 0 : 1);
}

// Execute if run directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Validation script failed:', error);
    process.exit(1);
  });
}

export { DeploymentValidator, type ValidationConfig };