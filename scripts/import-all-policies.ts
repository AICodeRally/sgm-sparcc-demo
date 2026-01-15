#!/usr/bin/env tsx

/**
 * Import ALL Demo Client Governance Policies
 * Creates a comprehensive policy library for the governance framework
 */

import fs from 'fs';
import path from 'path';

const POLICIES_PATH = '/Users/toddlebaron/Documents/SPM/clients/DemoClient/02_POLICIES';
const OUTPUT_PATH = path.join(process.cwd(), 'lib/data/governance-policies.json');

interface PolicyDocument {
  policyCode: string;
  policyName: string;
  fileName: string;
  category: string;
  frameworkArea: string;
  status: 'DRAFT' | 'FINAL' | 'TEMPLATE';
  wordCount: number;
  requiresLegalReview: boolean;
  applicableScenarios: string[];
  filePath: string;
}

// Map policy files to framework areas
const policyMapping: Record<string, Partial<PolicyDocument>> = {
  // DRAFT policies (from DRAFT_FOR_REVIEW/)
  'CLAWBACK_AND_RECOVERY_POLICY_DRAFT.docx': {
    policyCode: 'SCP-001',
    policyName: 'Clawback and Recovery Policy',
    frameworkArea: 'Clawback/Recovery',
    category: 'Financial Controls',
    status: 'DRAFT',
    requiresLegalReview: true,
    applicableScenarios: ['Overpayments', 'Commission Errors', 'Cancelled Orders', 'Terminated Employees']
  },
  'QUOTA_MANAGEMENT_POLICY_DRAFT.docx': {
    policyCode: 'SCP-002',
    policyName: 'Quota Management Policy',
    frameworkArea: 'Quota Management',
    category: 'Performance Management',
    status: 'DRAFT',
    requiresLegalReview: true,
    applicableScenarios: ['Quota Setting', 'Quota Adjustments', 'Performance Reviews']
  },
  'WINDFALL_LARGE_DEAL_POLICY_DRAFT.docx': {
    policyCode: 'SCP-003',
    policyName: 'Windfall and Large Deal Policy',
    frameworkArea: 'Windfall/Large Deals',
    category: 'Deal Governance',
    status: 'DRAFT',
    requiresLegalReview: true,
    applicableScenarios: ['Large Deals', 'Windfall Events', 'Deal Approval Thresholds']
  },
  'SPIF_GOVERNANCE_POLICY_DRAFT.docx': {
    policyCode: 'SCP-004',
    policyName: 'SPIF Governance Policy',
    frameworkArea: 'SPIF Governance',
    category: 'Incentive Programs',
    status: 'DRAFT',
    requiresLegalReview: true,
    applicableScenarios: ['SPIFs', 'Contests', 'Special Incentives']
  },
  'SECTION_409A_COMPLIANCE_POLICY_DRAFT.docx': {
    policyCode: 'SCP-005',
    policyName: 'Section 409A Compliance Policy',
    frameworkArea: 'Compliance (409A, State Wage)',
    category: 'Legal Compliance',
    status: 'DRAFT',
    requiresLegalReview: true,
    applicableScenarios: ['Deferred Compensation', 'Tax Compliance', '409A Requirements']
  },
  'STATE_WAGE_LAW_COMPLIANCE_POLICY_DRAFT.docx': {
    policyCode: 'SCP-006',
    policyName: 'State Wage Law Compliance Policy',
    frameworkArea: 'Compliance (409A, State Wage)',
    category: 'Legal Compliance',
    status: 'DRAFT',
    requiresLegalReview: true,
    applicableScenarios: ['State Wage Laws', 'Payment Timing', 'Final Pay']
  },

  // FINAL policies (from 02_POLICIES/)
  'SALES_CREDITING_POLICY.docx': {
    policyCode: 'SCP-007',
    policyName: 'Sales Crediting Policy',
    frameworkArea: 'Sales Crediting',
    category: 'Commission Rules',
    status: 'TEMPLATE',
    requiresLegalReview: false,
    applicableScenarios: ['Split Credit', 'Overlay Credit', 'Team Selling', 'Credit Disputes']
  },
  'DRAWS_AND_GUARANTEES_POLICY.docx': {
    policyCode: 'SCP-008',
    policyName: 'Draws and Guarantees Policy',
    frameworkArea: 'Draws/Guarantees',
    category: 'Financial Controls',
    status: 'TEMPLATE',
    requiresLegalReview: false,
    applicableScenarios: ['Draw Programs', 'Guarantee Periods', 'Recovery Terms']
  },
  'LEAVE_OF_ABSENCE_POLICY.docx': {
    policyCode: 'SCP-009',
    policyName: 'Leave of Absence Policy',
    frameworkArea: 'Leave of Absence',
    category: 'HR Policies',
    status: 'TEMPLATE',
    requiresLegalReview: false,
    applicableScenarios: ['FMLA', 'Medical Leave', 'Parental Leave', 'Sabbatical']
  },
  'MID_PERIOD_CHANGE_POLICY.docx': {
    policyCode: 'SCP-010',
    policyName: 'Mid-Period Change Policy',
    frameworkArea: 'Mid-Period Changes',
    category: 'Plan Administration',
    status: 'TEMPLATE',
    requiresLegalReview: false,
    applicableScenarios: ['Territory Changes', 'Role Changes', 'Plan Modifications']
  },
  'PAYMENT_TIMING_POLICY.docx': {
    policyCode: 'SCP-011',
    policyName: 'Payment Timing Policy',
    frameworkArea: 'Payment Timing',
    category: 'Payroll',
    status: 'TEMPLATE',
    requiresLegalReview: false,
    applicableScenarios: ['Payment Schedule', 'Payment Delays', 'Payment Methods']
  },
  'TERMINATION_POLICY.docx': {
    policyCode: 'SCP-012',
    policyName: 'Termination and Final Pay Policy',
    frameworkArea: 'Termination/Final Pay',
    category: 'HR Policies',
    status: 'TEMPLATE',
    requiresLegalReview: false,
    applicableScenarios: ['Voluntary Termination', 'Involuntary Termination', 'Retirement', 'Final Commission Payments']
  },
  'DATA_RETENTION_POLICY.docx': {
    policyCode: 'SCP-013',
    policyName: 'Data and Systems Controls Policy',
    frameworkArea: 'Data/Systems/Controls',
    category: 'IT Governance',
    status: 'TEMPLATE',
    requiresLegalReview: false,
    applicableScenarios: ['Data Retention', 'System Access', 'Audit Controls', 'Data Privacy']
  },
  'CAP_AND_THRESHOLD_GUIDELINES.docx': {
    policyCode: 'SCP-014',
    policyName: 'Territory Management Guidelines',
    frameworkArea: 'Territory Management',
    category: 'Territory Rules',
    status: 'TEMPLATE',
    requiresLegalReview: false,
    applicableScenarios: ['Territory Assignment', 'Territory Splits', 'Account Assignment', 'Caps and Thresholds']
  },
  'STANDARD_TERMS_AND_CONDITIONS.docx': {
    policyCode: 'SCP-015',
    policyName: 'Exception and Dispute Resolution Policy',
    frameworkArea: 'Exceptions/Disputes',
    category: 'Governance',
    status: 'TEMPLATE',
    requiresLegalReview: false,
    applicableScenarios: ['Plan Exceptions', 'Dispute Resolution', 'Appeals Process']
  },
};

async function importAllPolicies() {
  console.log('🔍 Importing All Governance Policies');
  console.log('═'.repeat(60));

  const policies: PolicyDocument[] = [];

  // Process DRAFT policies
  const draftPath = path.join(POLICIES_PATH, 'DRAFT_FOR_REVIEW');
  const draftFiles = fs.readdirSync(draftPath).filter(f => f.endsWith('.docx'));

  console.log(`\n📝 DRAFT Policies (${draftFiles.length}):`);
  for (const fileName of draftFiles) {
    const mapping = policyMapping[fileName];
    if (mapping) {
      const filePath = path.join(draftPath, fileName);
      const stats = fs.statSync(filePath);

      policies.push({
        policyCode: mapping.policyCode!,
        policyName: mapping.policyName!,
        fileName,
        category: mapping.category!,
        frameworkArea: mapping.frameworkArea!,
        status: 'DRAFT',
        wordCount: 0, // Would need DOCX parser to get actual word count
        requiresLegalReview: mapping.requiresLegalReview!,
        applicableScenarios: mapping.applicableScenarios!,
        filePath,
      });

      console.log(`  ✓ ${mapping.policyCode} - ${mapping.policyName}`);
    }
  }

  // Process FINAL policies
  const finalFiles = fs.readdirSync(POLICIES_PATH)
    .filter(f => f.endsWith('.docx') && !f.startsWith('~'));

  console.log(`\n📄 TEMPLATE Policies (${finalFiles.length}):`);
  for (const fileName of finalFiles) {
    const mapping = policyMapping[fileName];
    if (mapping) {
      const filePath = path.join(POLICIES_PATH, fileName);
      const stats = fs.statSync(filePath);

      policies.push({
        policyCode: mapping.policyCode!,
        policyName: mapping.policyName!,
        fileName,
        category: mapping.category!,
        frameworkArea: mapping.frameworkArea!,
        status: 'TEMPLATE',
        wordCount: 0,
        requiresLegalReview: mapping.requiresLegalReview!,
        applicableScenarios: mapping.applicableScenarios!,
        filePath,
      });

      console.log(`  ✓ ${mapping.policyCode} - ${mapping.policyName}`);
    }
  }

  // Save to JSON
  const output = {
    metadata: {
      totalPolicies: policies.length,
      draftPolicies: policies.filter(p => p.status === 'DRAFT').length,
      templatePolicies: policies.filter(p => p.status === 'TEMPLATE').length,
      lastUpdated: new Date().toISOString(),
      frameworkVersion: '1.0',
    },
    policies: policies.sort((a, b) => a.policyCode.localeCompare(b.policyCode)),
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));

  console.log('\n' + '═'.repeat(60));
  console.log('📊 Summary:');
  console.log(`   Total Policies: ${policies.length}`);
  console.log(`   DRAFT (requires legal review): ${output.metadata.draftPolicies}`);
  console.log(`   TEMPLATE (ready to use): ${output.metadata.templatePolicies}`);
  console.log(`\n💾 Saved to: ${OUTPUT_PATH}`);
  console.log('\n✅ Policy Library Created!');
}

importAllPolicies()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
