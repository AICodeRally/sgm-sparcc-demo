/**
 * Migration Script: Convert SPM 101 Framework Glossary to Framework Cards
 *
 * This script transforms the old glossary format (phases > items > entries)
 * into the new Framework Card format for the SPM Knowledge Base.
 *
 * Source: lib/data/synthetic/spm-101-framework.json
 * Target: lib/data/synthetic/spm-kb-cards-migrated.json
 *
 * Usage: npx ts-node scripts/migrate-glossary-to-cards.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// TYPES
// =============================================================================

interface LegacyEntry {
  id: string;
  keyword: string;
  definition: string;
  userType?: string;
}

interface LegacyItem {
  id: string;
  number: number;
  title: string;
  category: string;
  entries: LegacyEntry[];
}

interface LegacyPhase {
  id: string;
  number: number;
  title: string;
  type: string;
  totalItems: number;
  totalEntries: number;
  items: LegacyItem[];
}

interface LegacyFramework {
  phases: LegacyPhase[];
}

// Pillar enum values from the contract
type SPMPillar =
  | 'SALES_PLANNING'
  | 'ICM'
  | 'SALES_INTELLIGENCE'
  | 'GOVERNANCE_COMPLIANCE'
  | 'TECHNOLOGY_PLATFORMS'
  | 'STRATEGY_DESIGN'
  | 'IMPLEMENTATION_CHANGE'
  | 'LEGAL_REGULATORY';

type CardType = 'concept' | 'mechanic' | 'process' | 'role' | 'regulation';

interface FrameworkCard {
  id: string;
  keyword: string;
  aliases: string[];
  pillar: SPMPillar;
  category: string;
  component: string;
  cardType: CardType;
  definition: string;
  whyItMatters?: string;
  extendedDefinition?: string;
  howItWorks?: string;
  example?: string;
  userTypes: string[];
  audienceLevels: ('Practitioner' | 'Executive' | 'Implementer')[];
  whoUsesIt?: { role: string; howTheyUseIt: string }[];
  bestPractices: string[];
  watchOutFor: string[];
  commonMistakes?: string[];
  relatedTerms: string[];
  oppositeTerms?: string[];
  processFlow?: { upstream?: string[]; downstream?: string[]; diagram?: string };
  inputs?: string[];
  outputs?: string[];
  systemsInvolved?: string[];
  timing?: string;
  vendorTerminology?: Record<string, string>;
  regulatoryNotes?: string;
  legalBasis?: string;
  requirements?: string[];
  penalties?: string;
  sourceAuthority: string[];
  tags: string[];
  version: string;
  lastUpdated?: string;
}

interface MigrationResult {
  version: string;
  lastUpdated: string;
  totalMigrated: number;
  byPillar: Record<string, number>;
  byCategory: Record<string, number>;
  cards: FrameworkCard[];
}

// =============================================================================
// MAPPING CONFIGURATION
// =============================================================================

// Map old phase titles to new pillar enum values
const PHASE_TO_PILLAR: Record<string, SPMPillar> = {
  'Sales Planning': 'SALES_PLANNING',
  'ICM': 'ICM',
  'Incentive Compensation Management': 'ICM',
  'Sales Intelligence': 'SALES_INTELLIGENCE',
};

// Map user types to standardized format
const USER_TYPE_MAPPING: Record<string, string[]> = {
  'SPM Data Engineer': ['Data Engineer', 'SPM Admin'],
  'SPM Sales Ops Manager': ['Sales Ops Manager', 'Sales Ops'],
  'SPM Comp Admin': ['Comp Admin', 'Compensation Analyst'],
  'SPM Finance': ['Finance', 'FP&A'],
  'SPM Sales Leader': ['Sales Leader', 'Sales Manager'],
  'SPM Sales Rep': ['Sales Rep', 'Account Executive'],
  'SPM Implementation': ['Implementation Consultant', 'SPM Consultant'],
  'SPM Analyst': ['Analyst', 'Business Analyst'],
  'ICM Admin': ['ICM Admin', 'Comp Admin'],
  'ICM Analyst': ['ICM Analyst', 'Compensation Analyst'],
  'ICM Finance': ['Finance', 'FP&A'],
  'Data Analyst': ['Data Analyst', 'Analytics'],
  'BI Developer': ['BI Developer', 'Report Developer'],
  'Sales Ops Analyst': ['Sales Ops Analyst', 'Sales Operations'],
  'Analytics Manager': ['Analytics Manager', 'Sales Analytics'],
};

// Map old categories to standardized taxonomy categories
const CATEGORY_MAPPING: Record<string, string> = {
  'Sales Data': 'Sales Data',
  'Sales Hierarchies': 'Sales Hierarchies',
  'Sales Role Definition': 'Sales Role Definition',
  'Sales Plan Design': 'Sales Plan Design',
  'Territory Definition': 'Territory Definition',
  'Quota Definition': 'Quota Definition',
  'Sales Data Classification': 'Sales Data Classification',
  'Capacity Planning': 'Capacity Planning',
  'Coverage Models': 'Coverage Models',
  'Account Segmentation': 'Account Segmentation',
  'Plan Mechanics': 'Plan Mechanics',
  'Payment Types': 'Payment Types',
  'Crediting Rules': 'Crediting Rules',
  'Calculation Concepts': 'Calculation Concepts',
  'Commission Statements': 'Commission Statements',
  'Adjustments & Corrections': 'Adjustments & Corrections',
  'Special Programs': 'Special Programs',
  'Plan Administration': 'Plan Administration',
  'Proration Rules': 'Proration Rules',
  'Reporting': 'Reporting',
  'Forecasting': 'Forecasting',
  'Performance Analytics': 'Performance Analytics',
  'AI/ML Capabilities': 'AI/ML Capabilities',
  'Visualization': 'Visualization',
  'Data Quality': 'Data Quality',
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Generate a kebab-case ID from pillar, category, and keyword
 */
function generateCardId(pillar: SPMPillar, category: string, keyword: string): string {
  const pillarPrefix = pillar.toLowerCase().replace(/_/g, '-').slice(0, 2);
  const catSlug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 10);
  const keywordSlug = keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 20);

  // Generate a short hash suffix for uniqueness
  const hash = Math.abs(hashCode(keyword + category)).toString(36).slice(0, 4);

  return `${pillarPrefix}-${catSlug}-${keywordSlug}-${hash}`;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

/**
 * Normalize user type to standard format
 */
function normalizeUserTypes(userType?: string): string[] {
  if (!userType) return ['Practitioner'];

  const mapped = USER_TYPE_MAPPING[userType];
  if (mapped) return mapped;

  // Clean up and return as-is if not in mapping
  return [userType.replace(/^(SPM|ICM)\s+/i, '').trim()];
}

/**
 * Determine audience levels based on user type
 */
function determineAudienceLevels(userType?: string): ('Practitioner' | 'Executive' | 'Implementer')[] {
  if (!userType) return ['Practitioner'];

  const type = userType.toLowerCase();

  if (type.includes('leader') || type.includes('manager')) {
    return ['Practitioner', 'Executive'];
  }
  if (type.includes('implementation') || type.includes('engineer') || type.includes('developer')) {
    return ['Practitioner', 'Implementer'];
  }
  if (type.includes('finance') || type.includes('analyst')) {
    return ['Practitioner'];
  }

  return ['Practitioner'];
}

/**
 * Generate tags from keyword and category
 */
function generateTags(keyword: string, category: string, pillar: SPMPillar): string[] {
  const tags: string[] = [];

  // Add pillar-based tag
  const pillarTag = pillar.toLowerCase().replace(/_/g, '-');
  tags.push(pillarTag);

  // Add category-based tag
  const categoryTag = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  if (categoryTag && categoryTag !== pillarTag) {
    tags.push(categoryTag);
  }

  // Add keyword-based tags (simple word extraction)
  const words = keyword.toLowerCase().split(/\s+/);
  words.forEach(word => {
    if (word.length > 3 && !tags.includes(word)) {
      tags.push(word);
    }
  });

  return tags.slice(0, 5); // Limit to 5 tags
}

// =============================================================================
// MIGRATION LOGIC
// =============================================================================

function migrateEntry(
  entry: LegacyEntry,
  item: LegacyItem,
  phase: LegacyPhase
): FrameworkCard {
  // Determine pillar from phase
  const pillar = PHASE_TO_PILLAR[phase.title] || 'SALES_PLANNING';

  // Use item title as component, category from item
  const category = CATEGORY_MAPPING[item.category] || item.category;
  const component = item.title;

  // Normalize user types
  const userTypes = normalizeUserTypes(entry.userType);
  const audienceLevels = determineAudienceLevels(entry.userType);

  // Generate ID
  const id = generateCardId(pillar, category, entry.keyword);

  // Generate tags
  const tags = generateTags(entry.keyword, category, pillar);

  return {
    id,
    keyword: entry.keyword,
    aliases: [], // To be enriched later
    pillar,
    category,
    component,
    cardType: 'concept', // Base level - can be upgraded later
    definition: entry.definition,
    // Fields to be enriched later (empty/undefined)
    whyItMatters: undefined,
    extendedDefinition: undefined,
    howItWorks: undefined,
    example: undefined,
    userTypes,
    audienceLevels,
    whoUsesIt: undefined, // To be enriched later
    bestPractices: [], // To be enriched later
    watchOutFor: [], // To be enriched later
    commonMistakes: undefined, // To be enriched later
    relatedTerms: [], // To be enriched later
    oppositeTerms: undefined, // To be enriched later
    processFlow: undefined, // To be enriched later
    inputs: undefined, // To be enriched later
    outputs: undefined, // To be enriched later
    systemsInvolved: undefined, // To be enriched later
    timing: undefined, // To be enriched later
    vendorTerminology: undefined, // To be enriched later
    regulatoryNotes: undefined, // To be enriched later
    legalBasis: undefined, // To be enriched later
    requirements: undefined, // To be enriched later
    penalties: undefined, // To be enriched later
    sourceAuthority: [], // To be enriched later
    tags,
    version: '1.0.0',
    lastUpdated: new Date().toISOString().split('T')[0],
  };
}

function migrateFramework(framework: LegacyFramework): MigrationResult {
  const cards: FrameworkCard[] = [];
  const byPillar: Record<string, number> = {};
  const byCategory: Record<string, number> = {};

  for (const phase of framework.phases) {
    const pillar = PHASE_TO_PILLAR[phase.title] || 'SALES_PLANNING';

    for (const item of phase.items) {
      for (const entry of item.entries) {
        const card = migrateEntry(entry, item, phase);
        cards.push(card);

        // Track stats
        byPillar[pillar] = (byPillar[pillar] || 0) + 1;
        byCategory[item.category] = (byCategory[item.category] || 0) + 1;
      }
    }
  }

  return {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    totalMigrated: cards.length,
    byPillar,
    byCategory,
    cards,
  };
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  console.log('='.repeat(60));
  console.log('SPM Glossary to Framework Cards Migration');
  console.log('='.repeat(60));
  console.log();

  // Paths
  const basePath = path.resolve(__dirname, '..');
  const sourcePath = path.join(basePath, 'lib/data/synthetic/spm-101-framework.json');
  const targetPath = path.join(basePath, 'lib/data/synthetic/spm-kb-cards-migrated.json');

  // Read source file
  console.log(`Reading source: ${sourcePath}`);
  const sourceData = fs.readFileSync(sourcePath, 'utf-8');
  const framework: LegacyFramework = JSON.parse(sourceData);

  // Count entries in source
  let totalEntries = 0;
  for (const phase of framework.phases) {
    for (const item of phase.items) {
      totalEntries += item.entries.length;
    }
  }
  console.log(`Found ${totalEntries} glossary entries across ${framework.phases.length} phases`);
  console.log();

  // Migrate
  console.log('Migrating entries to Framework Cards...');
  const result = migrateFramework(framework);

  // Write output
  console.log(`Writing output: ${targetPath}`);
  fs.writeFileSync(targetPath, JSON.stringify(result, null, 2), 'utf-8');

  // Print stats
  console.log();
  console.log('='.repeat(60));
  console.log('MIGRATION COMPLETE');
  console.log('='.repeat(60));
  console.log();
  console.log(`Total cards migrated: ${result.totalMigrated}`);
  console.log();
  console.log('Cards by Pillar:');
  console.log('-'.repeat(40));
  for (const [pillar, count] of Object.entries(result.byPillar).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${pillar.padEnd(25)} ${count.toString().padStart(5)}`);
  }
  console.log();
  console.log('Cards by Category:');
  console.log('-'.repeat(40));
  for (const [category, count] of Object.entries(result.byCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${category.padEnd(30)} ${count.toString().padStart(5)}`);
  }
  console.log();
  console.log('Fields to enrich later:');
  console.log('-'.repeat(40));
  console.log('  - aliases');
  console.log('  - whyItMatters');
  console.log('  - extendedDefinition');
  console.log('  - howItWorks');
  console.log('  - example');
  console.log('  - whoUsesIt');
  console.log('  - bestPractices');
  console.log('  - watchOutFor');
  console.log('  - commonMistakes');
  console.log('  - relatedTerms');
  console.log('  - vendorTerminology');
  console.log('  - (and more for mechanic/process/regulation cards)');
  console.log();
  console.log(`Output written to: ${targetPath}`);
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
