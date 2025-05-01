import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

describe('GitHub Workflow Files', () => {
  describe('auto-approve.yml', () => {
    let workflowContent: any;

    beforeEach(() => {
      const workflowPath = path.join(__dirname, '..', '.github', 'workflows', 'auto-approve.yml');
      const fileContent = fs.readFileSync(workflowPath, 'utf8');
      workflowContent = yaml.load(fileContent);
    });

    test('should use PROJEN_GITHUB_TOKEN for authentication', () => {
      // Get the steps from the approve job
      const steps = workflowContent.jobs.approve.steps;

      // Find the auto-approve-action step
      const autoApproveStep = steps.find(
        (step: any) => step.uses && step.uses.startsWith('hmarr/auto-approve-action@'),
      );

      // Verify it uses the correct token
      expect(autoApproveStep).toBeDefined();
      expect(autoApproveStep.with['github-token']).toBe('${{ secrets.PROJEN_GITHUB_TOKEN }}');
    });

    test('should include yvthepief in the auto-approve condition', () => {
      // Check if the condition includes the user yvthepief
      const condition = workflowContent.jobs.approve.if;
      expect(condition).toContain("github.event.pull_request.user.login == 'yvthepief'");
    });
  });

  describe('build.yml', () => {
    let workflowContent: any;

    beforeEach(() => {
      const workflowPath = path.join(__dirname, '..', '.github', 'workflows', 'build.yml');
      const fileContent = fs.readFileSync(workflowPath, 'utf8');
      workflowContent = yaml.load(fileContent);
    });

    test('should use PROJEN_GITHUB_TOKEN for authentication in self-mutation job', () => {
      // Get the steps from the self-mutation job
      const steps = workflowContent.jobs['self-mutation'].steps;

      // Find the checkout step
      const checkoutStep = steps.find((step: any) => step.uses && step.uses.startsWith('actions/checkout@'));

      // Verify it uses the correct token
      expect(checkoutStep).toBeDefined();
      expect(checkoutStep.with.token).toBe('${{ secrets.PROJEN_GITHUB_TOKEN }}');
    });
  });
});
