#!/usr/bin/env ts-node

/**
 * Health Check Script for Domain Redirect
 * 
 * Lightweight health check script for ongoing monitoring.
 * Can be used in CI/CD pipelines or monitoring systems.
 * 
 * Requirements: 1.5, 2.4
 */

import * as https from 'https';
import * as http from 'http';

interface HealthCheckConfig {
  sourceDomain: string;
  targetDomain: string;
  timeout: number;
  expectedStatusCodes: number[];
}

interface HealthCheckResult {
  url: string;
  status: 'healthy' | 'unhealthy' | 'error';
  statusCode?: number;
  location?: string;
  responseTime: number;
  error?: string;
}

class HealthChecker {
  private config: HealthCheckConfig;

  constructor(config: HealthCheckConfig) {
    this.config = config;
  }

  /**
   * Perform health check on redirect functionality
   */
  async check(): Promise<boolean> {
    const testUrls = [
      `http://${this.config.sourceDomain}`,
      `https://${this.config.sourceDomain}`,
      `https://www.${this.config.sourceDomain}`,
    ];

    console.log(`🏥 Health check for ${this.config.sourceDomain} -> ${this.config.targetDomain}`);
    
    const results: HealthCheckResult[] = [];
    
    for (const url of testUrls) {
      const result = await this.checkUrl(url);
      results.push(result);
      
      const statusIcon = result.status === 'healthy' ? '✅' : 
                        result.status === 'unhealthy' ? '⚠️' : '❌';
      
      console.log(`${statusIcon} ${url} (${result.responseTime}ms) -> ${result.location || 'N/A'}`);
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    }

    const healthyCount = results.filter(r => r.status === 'healthy').length;
    const overallHealth = healthyCount >= Math.ceil(testUrls.length * 0.8); // 80% success rate
    
    console.log(`\nOverall Health: ${overallHealth ? '✅ HEALTHY' : '❌ UNHEALTHY'} (${healthyCount}/${testUrls.length})`);
    
    return overallHealth;
  }

  /**
   * Check individual URL health
   */
  private async checkUrl(url: string): Promise<HealthCheckResult> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const isHttps = url.startsWith('https://');
      const client = isHttps ? https : http;
      
      const request = client.get(url, {
        timeout: this.config.timeout,
      }, (res) => {
        const responseTime = Date.now() - startTime;
        const statusCode = res.statusCode || 0;
        const location = res.headers.location;
        
        const isValidRedirect = this.config.expectedStatusCodes.includes(statusCode);
        const isTargetDomain = location?.includes(this.config.targetDomain) || false;
        
        let status: 'healthy' | 'unhealthy' | 'error';
        if (isValidRedirect && isTargetDomain) {
          status = 'healthy';
        } else if (isValidRedirect) {
          status = 'unhealthy'; // Redirecting but not to expected domain
        } else {
          status = 'error';
        }
        
        resolve({
          url,
          status,
          statusCode,
          location,
          responseTime
        });
      });

      request.on('error', (error) => {
        const responseTime = Date.now() - startTime;
        resolve({
          url,
          status: 'error',
          responseTime,
          error: error.message
        });
      });

      request.on('timeout', () => {
        request.destroy();
        const responseTime = Date.now() - startTime;
        resolve({
          url,
          status: 'error',
          responseTime,
          error: 'Request timeout'
        });
      });
    });
  }
}

/**
 * Main execution function
 */
async function main() {
  const config: HealthCheckConfig = {
    sourceDomain: 'buildinginthecloud.com',
    targetDomain: 'yvovanzee.nl',
    timeout: 5000, // 5 seconds
    expectedStatusCodes: [301, 302, 307, 308] // Valid redirect codes
  };

  const checker = new HealthChecker(config);
  const isHealthy = await checker.check();
  
  process.exit(isHealthy ? 0 : 1);
}

// Execute if run directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Health check failed:', error);
    process.exit(1);
  });
}

export { HealthChecker, type HealthCheckConfig };