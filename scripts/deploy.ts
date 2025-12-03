#!/usr/bin/env ts-node

/**
 * CDK Deployment Script for Domain Redirect
 * 
 * This script provides automated deployment with:
 * - AWS profile validation
 * - Pre-deployment checks
 * - Stack output monitoring
 * - Error handling and rollback capabilities
 * 
 * Requirements: 2.3, 3.1, 3.3
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import * as path from 'path';

interface DeploymentConfig {
  profile: string;
  region: string;
  stackName: string;
  environment: 'dev' | 'prod';
}

interface ValidationResult {
  success: boolean;
  message: string;
  details?: string;
}

class DomainRedirectDeployer {
  private config: DeploymentConfig;

  constructor(config: DeploymentConfig) {
    this.config = config;
  }

  /**
   * Main deployment orchestration method
   */
  async deploy(): Promise<void> {
    console.log('🚀 Starting Domain Redirect deployment...');
    console.log(`Environment: ${this.config.environment}`);
    console.log(`Stack: ${this.config.stackName}`);
    console.log(`Profile: ${this.config.profile}`);
    console.log(`Region: ${this.config.region}\n`);

    try {
      // Step 1: Pre-deployment validation
      await this.runPreDeploymentValidation();

      // Step 2: CDK Bootstrap (if needed)
      await this.ensureBootstrap();

      // Step 3: CDK Deploy
      await this.executeCdkDeploy();

      // Step 4: Post-deployment validation
      await this.validateDeployment();

      console.log('✅ Deployment completed successfully!');
    } catch (error) {
      console.error('❌ Deployment failed:', error);
      process.exit(1);
    }
  }

  /**
   * Run comprehensive pre-deployment validation checks
   * Requirements: 3.1, 3.3
   */
  private async runPreDeploymentValidation(): Promise<void> {
    console.log('🔍 Running pre-deployment validation...');

    const validations = [
      this.validateAwsProfile(),
      this.validateAwsCredentials(),
      this.validateCdkVersion(),
      this.validateProjectStructure(),
      this.validateDependencies(),
      this.validateEnvironmentVariables(),
    ];

    for (const validation of validations) {
      const result = await validation;
      if (!result.success) {
        throw new Error(`Validation failed: ${result.message}${result.details ? '\n' + result.details : ''}`);
      }
      console.log(`  ✓ ${result.message}`);
    }

    console.log('✅ Pre-deployment validation passed\n');
  }

  /**
   * Validate AWS profile configuration
   */
  private async validateAwsProfile(): Promise<ValidationResult> {
    try {
      // Check if profile exists in AWS config
      const result = execSync(`aws configure list-profiles`, { encoding: 'utf8' });
      const profiles = result.split('\n').filter(p => p.trim());
      
      if (!profiles.includes(this.config.profile)) {
        return {
          success: false,
          message: `AWS profile '${this.config.profile}' not found`,
          details: `Available profiles: ${profiles.join(', ')}`
        };
      }

      return {
        success: true,
        message: `AWS profile '${this.config.profile}' validated`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to validate AWS profile',
        details: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Validate AWS credentials are working
   */
  private async validateAwsCredentials(): Promise<ValidationResult> {
    try {
      const result = execSync(
        `aws sts get-caller-identity --profile ${this.config.profile}`,
        { encoding: 'utf8' }
      );
      
      const identity = JSON.parse(result);
      
      return {
        success: true,
        message: `AWS credentials validated for account: ${identity.Account}`
      };
    } catch (error) {
      return {
        success: false,
        message: 'AWS credentials validation failed',
        details: 'Please ensure your AWS profile is configured with valid credentials'
      };
    }
  }

  /**
   * Validate CDK version compatibility
   */
  private async validateCdkVersion(): Promise<ValidationResult> {
    try {
      const result = execSync('npx aws-cdk --version', { encoding: 'utf8' });
      const version = result.trim();
      
      // Check if CDK version is compatible (v2.x.x)
      if (!version.includes('2.')) {
        return {
          success: false,
          message: 'CDK version incompatible',
          details: `Found: ${version}, Required: CDK v2.x.x`
        };
      }

      return {
        success: true,
        message: `CDK version validated: ${version}`
      };
    } catch (error) {
      return {
        success: false,
        message: 'CDK version check failed',
        details: 'Please ensure AWS CDK is installed'
      };
    }
  }

  /**
   * Validate project structure and required files
   */
  private async validateProjectStructure(): Promise<ValidationResult> {
    const requiredFiles = [
      'package.json',
      'cdk.json',
      'src/main.ts',
      'src/domain-redirect-stack.ts',
      'src/types.ts'
    ];

    const missingFiles = requiredFiles.filter(file => !existsSync(file));
    
    if (missingFiles.length > 0) {
      return {
        success: false,
        message: 'Project structure validation failed',
        details: `Missing files: ${missingFiles.join(', ')}`
      };
    }

    return {
      success: true,
      message: 'Project structure validated'
    };
  }

  /**
   * Validate Node.js dependencies are installed
   */
  private async validateDependencies(): Promise<ValidationResult> {
    try {
      if (!existsSync('node_modules')) {
        return {
          success: false,
          message: 'Dependencies not installed',
          details: 'Run "npm install" to install dependencies'
        };
      }

      // Check if CDK dependencies are available
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
      const requiredDeps = ['aws-cdk-lib', 'constructs'];
      
      const missingDeps = requiredDeps.filter(dep => 
        !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
      );

      if (missingDeps.length > 0) {
        return {
          success: false,
          message: 'Required CDK dependencies missing',
          details: `Missing: ${missingDeps.join(', ')}`
        };
      }

      return {
        success: true,
        message: 'Dependencies validated'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Dependency validation failed',
        details: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Validate required environment variables
   */
  private async validateEnvironmentVariables(): Promise<ValidationResult> {
    const requiredEnvVars = ['CDK_DEFAULT_ACCOUNT', 'CDK_DEFAULT_REGION'];
    const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missingVars.length > 0) {
      return {
        success: false,
        message: 'Required environment variables missing',
        details: `Missing: ${missingVars.join(', ')}\nSet these via AWS profile or environment`
      };
    }

    return {
      success: true,
      message: 'Environment variables validated'
    };
  }

  /**
   * Ensure CDK bootstrap is completed for the target account/region
   */
  private async ensureBootstrap(): Promise<void> {
    console.log('🔧 Checking CDK bootstrap status...');
    
    try {
      // Check if bootstrap stack exists
      const result = execSync(
        `aws cloudformation describe-stacks --stack-name CDKToolkit --profile ${this.config.profile} --region ${this.config.region}`,
        { encoding: 'utf8', stdio: 'pipe' }
      );
      
      console.log('  ✓ CDK bootstrap already completed');
    } catch (error) {
      console.log('  ⚠️  CDK bootstrap required, running bootstrap...');
      
      try {
        execSync(
          `npx cdk bootstrap --profile ${this.config.profile} aws://${process.env.CDK_DEFAULT_ACCOUNT}/${this.config.region}`,
          { stdio: 'inherit' }
        );
        console.log('  ✅ CDK bootstrap completed');
      } catch (bootstrapError) {
        throw new Error(`CDK bootstrap failed: ${bootstrapError}`);
      }
    }
  }

  /**
   * Execute CDK deployment with proper error handling
   * Requirements: 2.3, 3.1
   */
  private async executeCdkDeploy(): Promise<void> {
    console.log('🚀 Executing CDK deployment...');
    
    try {
      const deployCommand = [
        'npx cdk deploy',
        this.config.stackName,
        `--profile ${this.config.profile}`,
        '--require-approval never',
        '--outputs-file cdk-outputs.json',
        '--verbose'
      ].join(' ');

      console.log(`Running: ${deployCommand}`);
      
      execSync(deployCommand, { 
        stdio: 'inherit',
        env: {
          ...process.env,
          AWS_PROFILE: this.config.profile,
          AWS_REGION: this.config.region
        }
      });
      
      console.log('✅ CDK deployment completed');
    } catch (error) {
      throw new Error(`CDK deployment failed: ${error}`);
    }
  }

  /**
   * Validate deployment success and extract stack outputs
   * Requirements: 3.3
   */
  private async validateDeployment(): Promise<void> {
    console.log('🔍 Validating deployment...');
    
    try {
      // Check if stack was deployed successfully
      const result = execSync(
        `aws cloudformation describe-stacks --stack-name ${this.config.stackName} --profile ${this.config.profile} --region ${this.config.region}`,
        { encoding: 'utf8' }
      );
      
      const stacks = JSON.parse(result);
      const stack = stacks.Stacks[0];
      
      if (stack.StackStatus !== 'CREATE_COMPLETE' && stack.StackStatus !== 'UPDATE_COMPLETE') {
        throw new Error(`Stack deployment failed with status: ${stack.StackStatus}`);
      }

      console.log(`  ✓ Stack status: ${stack.StackStatus}`);
      
      // Display stack outputs for monitoring
      if (stack.Outputs && stack.Outputs.length > 0) {
        console.log('\n📊 Stack Outputs (for monitoring):');
        stack.Outputs.forEach((output: any) => {
          console.log(`  ${output.OutputKey}: ${output.OutputValue}`);
          if (output.Description) {
            console.log(`    Description: ${output.Description}`);
          }
        });
      }

      // Check if CDK outputs file was created
      if (existsSync('cdk-outputs.json')) {
        console.log('  ✓ CDK outputs file created: cdk-outputs.json');
      }

      console.log('✅ Deployment validation completed');
    } catch (error) {
      throw new Error(`Deployment validation failed: ${error}`);
    }
  }

  /**
   * Rollback deployment in case of failure
   */
  async rollback(): Promise<void> {
    console.log('🔄 Rolling back deployment...');
    
    try {
      execSync(
        `npx cdk destroy ${this.config.stackName} --profile ${this.config.profile} --force`,
        { stdio: 'inherit' }
      );
      console.log('✅ Rollback completed');
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
}

/**
 * Main execution function
 */
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const environment = (args[0] as 'dev' | 'prod') || 'dev';
  
  // Configuration based on environment
  const config: DeploymentConfig = {
    profile: process.env.AWS_PROFILE || 'yvovanzee', // Configurable via environment variable
    region: process.env.CDK_DEFAULT_REGION || 'eu-west-1',
    stackName: `domain-redirect-${environment}`,
    environment
  };

  // Handle rollback command
  if (args.includes('--rollback')) {
    const deployer = new DomainRedirectDeployer(config);
    await deployer.rollback();
    return;
  }

  // Execute deployment
  const deployer = new DomainRedirectDeployer(config);
  await deployer.deploy();
}

// Execute if run directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Deployment script failed:', error);
    process.exit(1);
  });
}

export { DomainRedirectDeployer, type DeploymentConfig };