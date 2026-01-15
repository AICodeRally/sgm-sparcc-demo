/**
 * Policy Library Loader
 *
 * Loads all governance policy templates from JSON files.
 * JSON format eliminates markdown artifacts and enables structured queries.
 * Supports both Template policies (SCP-xxx.json) and legacy Custom policies.
 */

import fs from 'fs';
import path from 'path';
import type { PolicyJSON } from '@/lib/contracts/policy-json.contract';

export interface PolicyTemplate {
  code: string;
  name: string;
  category: string;
  frameworkArea: string;
  status: 'DRAFT' | 'TEMPLATE' | 'APPROVED';
  legalReviewRequired: boolean;
  content: string; // Deprecated: kept for backward compatibility
  contentJSON?: PolicyJSON; // NEW: Structured policy data
  wordCount: number;
  source: 'Template' | 'Custom';
}

// Framework area mapping for Custom policies (based on filename)
const CUSTOM_FRAMEWORK_MAPPING: Record<string, string> = {
  'CLAWBACK_RECOVERY_POLICY.md': 'Clawback/Recovery',
  'DATA_RETENTION_POLICY.md': 'Data/Systems/Controls',
  'LEAVE_OF_ABSENCE_POLICY.md': 'Leave of Absence',
  'PAYMENT_TIMING_POLICY.md': 'Payment Timing',
  'QUOTA_TERRITORY_MANAGEMENT_POLICY.md': 'Territory Management',
  'SALES_CREDITING_POLICY.md': 'Sales Crediting',
  'SPIF_GOVERNANCE_POLICY.md': 'SPIF Governance',
  'TERMINATION_POLICY.md': 'Termination/Final Pay',
  'WINDFALL_LARGE_DEAL_POLICY.md': 'Windfall/Large Deals',
};

const POLICIES_DIR = path.join(process.cwd(), 'lib/data/policies');

let cachedPolicies: PolicyTemplate[] | null = null;

/**
 * Load all policy templates from markdown files
 */
export function loadAllPolicies(): PolicyTemplate[] {
  if (cachedPolicies) {
    return cachedPolicies;
  }

  const policies: PolicyTemplate[] = [];

  // Load Template policies (SCP-xxx.md format)
  const templatePolicies = loadTemplatePolicies();
  policies.push(...templatePolicies);

  // Load Custom policies
  const customPolicies = loadCustomPolicies();
  policies.push(...customPolicies);

  cachedPolicies = policies;
  return policies;
}

/**
 * Load Template policies (SCP-xxx.json format)
 *
 * Reads structured JSON files instead of markdown to eliminate artifacts.
 * Falls back to markdown if JSON not available (for backward compatibility).
 */
function loadTemplatePolicies(): PolicyTemplate[] {
  const policies: PolicyTemplate[] = [];

  // Load index file
  const indexPath = path.join(POLICIES_DIR, 'index.json');
  if (!fs.existsSync(indexPath)) {
    console.warn('Policy index not found:', indexPath);
    return policies;
  }

  const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

  for (const policyMeta of index.policies || []) {
    // Try to load JSON file first
    const jsonPath = path.join(POLICIES_DIR, `${policyMeta.code}.json`);
    const mdPath = path.join(process.cwd(), policyMeta.file_path);

    let policyJSON: PolicyJSON | undefined;
    let content: string = '';

    if (fs.existsSync(jsonPath)) {
      // Load JSON file (preferred)
      try {
        policyJSON = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

        // Generate clean content string from JSON for backward compatibility
        if (policyJSON) {
          content = generateContentFromJSON(policyJSON);
        }
      } catch (error) {
        console.error(`Error loading JSON for ${policyMeta.code}:`, error);
      }
    }

    // Fall back to markdown if JSON not available
    if (!policyJSON && fs.existsSync(mdPath)) {
      console.warn(`JSON not found for ${policyMeta.code}, falling back to markdown`);
      content = fs.readFileSync(mdPath, 'utf-8');
    }

    if (!content && !policyJSON) {
      console.warn('Policy file not found:', policyMeta.code);
      continue;
    }

    policies.push({
      code: policyMeta.code,
      name: policyMeta.name,
      category: policyMeta.category,
      frameworkArea: policyMeta.framework_area,
      status: policyMeta.status === 'DRAFT' ? 'DRAFT' : 'TEMPLATE',
      legalReviewRequired: policyMeta.legal_review_required,
      content,
      contentJSON: policyJSON,
      wordCount: policyMeta.word_count,
      source: 'Template',
    });
  }

  return policies;
}

/**
 * Generate clean content string from PolicyJSON
 *
 * Converts structured JSON to plain text for backward compatibility.
 * This eliminates markdown artifacts while providing readable text.
 */
function generateContentFromJSON(policy: PolicyJSON): string {
  const lines: string[] = [];

  // Header
  lines.push(policy.name);
  lines.push('='.repeat(policy.name.length));
  lines.push('');
  lines.push(`Policy Code: ${policy.code}`);
  lines.push(`Category: ${policy.category}`);
  lines.push(`Framework Area: ${policy.frameworkArea}`);
  lines.push(`Status: ${policy.status}`);
  lines.push(`Version: ${policy.version}`);
  lines.push('');

  // Purpose
  lines.push('PURPOSE');
  lines.push('-'.repeat(50));
  lines.push(policy.purpose.summary);
  lines.push('');

  if (policy.purpose.objectives.length > 0) {
    lines.push('Objectives:');
    policy.purpose.objectives.forEach((obj) => {
      lines.push(`  • ${obj}`);
    });
    lines.push('');
  }

  // Scope
  if (policy.scope && policy.scope.appliesTo.length > 0) {
    lines.push('SCOPE');
    lines.push('-'.repeat(50));
    lines.push('Applies to:');
    policy.scope.appliesTo.forEach((item) => {
      lines.push(`  • ${item}`);
    });
    lines.push('');
  }

  // Definitions
  if (policy.definitions && policy.definitions.length > 0) {
    lines.push('DEFINITIONS');
    lines.push('-'.repeat(50));
    policy.definitions.forEach((def) => {
      lines.push(`${def.term}: ${def.definition}`);
      lines.push('');
    });
  }

  // Provisions
  if (policy.provisions && policy.provisions.length > 0) {
    lines.push('KEY PROVISIONS');
    lines.push('-'.repeat(50));
    policy.provisions.forEach((prov, index) => {
      lines.push(`${index + 1}. ${prov.title}`);
      lines.push(`   ${prov.content}`);
      lines.push('');

      // Sub-provisions
      if (prov.subProvisions && prov.subProvisions.length > 0) {
        prov.subProvisions.forEach((sub) => {
          lines.push(`   ${sub.title}`);
          if (sub.items && sub.items.length > 0) {
            sub.items.forEach((item) => {
              lines.push(`     • ${item}`);
            });
          }
          lines.push('');
        });
      }
    });
  }

  // Compliance
  if (policy.compliance) {
    lines.push('COMPLIANCE REFERENCES');
    lines.push('-'.repeat(50));

    if (policy.compliance.federalLaws.length > 0) {
      lines.push('Federal Laws:');
      policy.compliance.federalLaws.forEach((law) => {
        lines.push(`  • ${law}`);
      });
      lines.push('');
    }

    if (policy.compliance.stateLaws.length > 0) {
      lines.push('State Laws:');
      policy.compliance.stateLaws.forEach((law) => {
        lines.push(`  • ${law}`);
      });
      lines.push('');
    }
  }

  // Related policies
  if (policy.relatedPolicies && policy.relatedPolicies.length > 0) {
    lines.push('RELATED POLICIES');
    lines.push('-'.repeat(50));
    policy.relatedPolicies.forEach((code) => {
      lines.push(`  • ${code}`);
    });
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Load Custom policies (direct markdown files)
 */
function loadCustomPolicies(): PolicyTemplate[] {
  const policies: PolicyTemplate[] = [];

  for (const [filename, frameworkArea] of Object.entries(CUSTOM_FRAMEWORK_MAPPING)) {
    const filePath = path.join(POLICIES_DIR, filename);

    if (!fs.existsSync(filePath)) {
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    // Extract policy name and code from content
    const nameMatch = content.match(/^#\s+(.+)$/m);
    const codeMatch = content.match(/\*\*Policy Code:\*\*\s+(\S+)/);

    const name = nameMatch ? nameMatch[1] : filename.replace('.md', '').replace(/_/g, ' ');
    const code = codeMatch ? codeMatch[1] : `CUSTOM-${policies.length + 1}`;

    policies.push({
      code,
      name,
      category: getCategoryFromFrameworkArea(frameworkArea),
      frameworkArea,
      status: 'APPROVED',
      legalReviewRequired: false,
      content,
      wordCount: content.split(/\s+/).length,
      source: 'Custom',
    });
  }

  return policies;
}

/**
 * Get policy by framework area
 */
export function getPolicyByFrameworkArea(frameworkArea: string): PolicyTemplate | null {
  const policies = loadAllPolicies();

  // Normalize framework area for matching
  const normalized = frameworkArea.toLowerCase().trim();

  return policies.find(p =>
    p.frameworkArea.toLowerCase() === normalized
  ) || null;
}

/**
 * Get all policies for a specific framework area (may return multiple)
 */
export function getPoliciesByFrameworkArea(frameworkArea: string): PolicyTemplate[] {
  const policies = loadAllPolicies();

  const normalized = frameworkArea.toLowerCase().trim();

  return policies.filter(p =>
    p.frameworkArea.toLowerCase() === normalized
  );
}

/**
 * Extract purpose section from policy content
 */
export function extractPurpose(content: string): string | null {
  const purposeMatch = content.match(/##?\s+PURPOSE\s*\n+([\s\S]+?)(?=\n##|\n---|\n\*\*|$)/i);
  return purposeMatch ? purposeMatch[1].trim() : null;
}

/**
 * Extract key provisions from policy content
 */
export function extractKeyProvisions(content: string): string[] {
  const provisions: string[] = [];

  // Look for numbered or bulleted lists after headers
  const sections = content.split(/\n##\s+/);

  for (const section of sections) {
    // Skip purpose/overview sections
    if (section.match(/^(PURPOSE|OVERVIEW|INTRODUCTION)/i)) {
      continue;
    }

    // Extract first heading and first paragraph
    const headingMatch = section.match(/^(.+?)\n/);
    if (headingMatch) {
      const heading = headingMatch[1].trim();
      const paragraphMatch = section.match(/\n+(.+?)(?=\n\n|\n-|\n\d+\.|\n##|$)/);
      if (paragraphMatch) {
        provisions.push(`${heading}: ${paragraphMatch[1].trim()}`);
      }
    }
  }

  return provisions.slice(0, 5); // Return top 5 provisions
}

/**
 * Map framework area to category
 */
function getCategoryFromFrameworkArea(frameworkArea: string): string {
  const mapping: Record<string, string> = {
    'Clawback/Recovery': 'Financial Controls',
    'Quota Management': 'Performance Management',
    'Territory Management': 'Territory Rules',
    'Sales Crediting': 'Commission Rules',
    'SPIF Governance': 'Incentive Programs',
    'Windfall/Large Deals': 'Deal Governance',
    'Termination/Final Pay': 'HR Policies',
    'Leave of Absence': 'HR Policies',
    'Payment Timing': 'Payroll',
    'Compliance (409A, State Wage)': 'Legal Compliance',
    'Exceptions/Disputes': 'Governance',
    'Data/Systems/Controls': 'IT Governance',
    'Draws/Guarantees': 'Financial Controls',
    'Mid-Period Changes': 'Plan Administration',
    'New Hire/Onboarding': 'HR Policies',
    'International Requirements': 'Legal Compliance',
  };

  return mapping[frameworkArea] || 'Governance';
}

/**
 * Get statistics about the policy library
 */
export function getPolicyLibraryStats() {
  const policies = loadAllPolicies();

  return {
    totalPolicies: policies.length,
    byStatus: {
      draft: policies.filter(p => p.status === 'DRAFT').length,
      template: policies.filter(p => p.status === 'TEMPLATE').length,
      approved: policies.filter(p => p.status === 'APPROVED').length,
    },
    bySource: {
      template: policies.filter(p => p.source === 'Template').length,
      custom: policies.filter(p => p.source === 'Custom').length,
    },
    frameworkAreas: Array.from(new Set(policies.map(p => p.frameworkArea))).sort(),
    withJSON: policies.filter(p => p.contentJSON !== undefined).length,
  };
}

/**
 * Get policy by code
 *
 * @param code - Policy code (e.g., "SCP-001")
 * @returns Policy template or null if not found
 */
export function getPolicyByCode(code: string): PolicyTemplate | null {
  const policies = loadAllPolicies();
  return policies.find(p => p.code === code) || null;
}

/**
 * Get policy as JSON
 *
 * Returns structured PolicyJSON if available, otherwise null.
 * Use this for gap analysis, AI processing, and structured queries.
 *
 * @param code - Policy code (e.g., "SCP-001")
 * @returns PolicyJSON or null
 */
export function getPolicyAsJSON(code: string): PolicyJSON | null {
  const policy = getPolicyByCode(code);
  return policy?.contentJSON || null;
}

/**
 * Get all policies as JSON
 *
 * Returns only policies that have been converted to JSON format.
 * Useful for bulk operations like gap analysis.
 *
 * @returns Array of PolicyJSON objects
 */
export function getAllPoliciesAsJSON(): PolicyJSON[] {
  const policies = loadAllPolicies();
  return policies
    .filter(p => p.contentJSON !== undefined)
    .map(p => p.contentJSON!);
}

/**
 * Search policies by keywords
 *
 * Uses the keywords from policy compliance metadata for fuzzy matching.
 * Works with JSON policies only.
 *
 * @param keyword - Keyword to search for
 * @returns Array of matching policies
 */
export function searchPoliciesByKeyword(keyword: string): PolicyTemplate[] {
  const policies = loadAllPolicies();
  const normalized = keyword.toLowerCase().trim();

  return policies.filter(p => {
    if (!p.contentJSON) return false;

    // Search in keywords
    const keywords = p.contentJSON.compliance.keywords || [];
    if (keywords.some(k => k.toLowerCase().includes(normalized))) {
      return true;
    }

    // Search in name and framework area
    if (p.name.toLowerCase().includes(normalized)) {
      return true;
    }

    if (p.frameworkArea.toLowerCase().includes(normalized)) {
      return true;
    }

    return false;
  });
}
