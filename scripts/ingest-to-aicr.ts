#!/usr/bin/env npx tsx
/**
 * Ingest SGM-SPARCC content into AICR RAG system
 *
 * Content Sources:
 * 1. SPM Knowledge Base cards (617 chunks from RAG export)
 * 2. SCP Policies (17 policies - JSON structured)
 * 3. SCP Policies (17 policies - Markdown full text)
 * 4. SPM 101 Framework (glossary entries)
 * 5. Governance Checklist
 *
 * Usage:
 *   npx tsx scripts/ingest-to-aicr.ts
 *
 * Output:
 *   Creates files in ~/dev/aicr for ingestion:
 *   - sgm-sparcc-kb-ingest.json (KB cards)
 *   - sgm-sparcc-policies-ingest.json (SCP policies)
 *   - sgm-sparcc-framework-ingest.json (Framework)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// =============================================================================
// TYPES
// =============================================================================

interface IngestDocument {
  path: string;
  content: string;
  metadata?: Record<string, string | string[]>;
}

interface IngestBatch {
  collection: string;
  source: string;
  timestamp: string;
  documents: IngestDocument[];
}

interface RAGChunk {
  id: string;
  cardId: string;
  keyword: string;
  chunkType: string;
  content: string;
  metadata: {
    pillar: string;
    category: string;
    component: string;
    cardType: string;
    audienceLevels: string[];
    tags: string[];
    relatedTerms: string[];
  };
  tokenEstimate: number;
}

interface RAGExport {
  chunks: RAGChunk[];
}

interface SCPPolicy {
  code: string;
  name: string;
  category: string;
  frameworkArea: string;
  purpose?: { summary: string; objectives?: string[] };
  scope?: { appliesTo?: string[]; exclusions?: string[]; geographic?: string[] };
  definitions?: Array<{ term: string; definition: string }>;
  provisions?: Array<{
    id: string;
    title: string;
    content: string;
    priority?: string;
    subProvisions?: Array<{ id: string; title: string; content: string; items?: string[] }>;
  }>;
  approvalMatrix?: Array<{ threshold: string; approver: string; escalation?: string }>;
  exceptions?: { process?: string; approvers?: string[] };
  compliance?: { regulations?: string[]; auditRequirements?: string[] };
  references?: string[];
}

// =============================================================================
// KB CARDS INGESTION
// =============================================================================

function processKBCards(ragExportPath: string): IngestDocument[] {
  console.log('Processing KB Cards...');

  const rawData = fs.readFileSync(ragExportPath, 'utf-8');
  const ragExport: RAGExport = JSON.parse(rawData);

  const documents: IngestDocument[] = ragExport.chunks.map(chunk => ({
    path: `spm/kb/${chunk.chunkType}/${chunk.id}.md`,
    content: chunk.content,
    metadata: {
      source: 'spm-kb',
      cardId: chunk.cardId,
      keyword: chunk.keyword,
      chunkType: chunk.chunkType,
      pillar: chunk.metadata.pillar,
      category: chunk.metadata.category,
      cardType: chunk.metadata.cardType,
      tags: chunk.metadata.tags,
    }
  }));

  console.log(`  Processed ${documents.length} KB chunks`);
  return documents;
}

// =============================================================================
// SCP POLICIES INGESTION
// =============================================================================

function chunkPolicy(policy: SCPPolicy): IngestDocument[] {
  const docs: IngestDocument[] = [];
  const baseMetadata = {
    source: 'scp-policy',
    policyCode: policy.code,
    policyName: policy.name,
    category: policy.category,
    frameworkArea: policy.frameworkArea,
  };

  // Overview chunk
  if (policy.purpose?.summary) {
    const overviewContent = [
      `# ${policy.code}: ${policy.name}`,
      '',
      `**Category:** ${policy.category}`,
      `**Framework Area:** ${policy.frameworkArea}`,
      '',
      '## Purpose',
      policy.purpose.summary,
    ];

    if (policy.purpose.objectives?.length) {
      overviewContent.push('', '### Objectives');
      policy.purpose.objectives.forEach(obj => overviewContent.push(`- ${obj}`));
    }

    docs.push({
      path: `spm/policies/${policy.code}/overview.md`,
      content: overviewContent.join('\n'),
      metadata: { ...baseMetadata, section: 'overview' }
    });
  }

  // Scope chunk
  if (policy.scope) {
    const scopeContent = [`# ${policy.code} - Scope`, ''];
    if (policy.scope.appliesTo?.length) {
      scopeContent.push('## Applies To');
      policy.scope.appliesTo.forEach(item => scopeContent.push(`- ${item}`));
    }
    if (policy.scope.exclusions?.length) {
      scopeContent.push('', '## Exclusions');
      policy.scope.exclusions.forEach(item => scopeContent.push(`- ${item}`));
    }
    if (policy.scope.geographic?.length) {
      scopeContent.push('', `**Geographic:** ${policy.scope.geographic.join(', ')}`);
    }

    docs.push({
      path: `spm/policies/${policy.code}/scope.md`,
      content: scopeContent.join('\n'),
      metadata: { ...baseMetadata, section: 'scope' }
    });
  }

  // Definitions chunk
  if (policy.definitions?.length) {
    const defContent = [`# ${policy.code} - Definitions`, ''];
    policy.definitions.forEach(def => {
      defContent.push(`**${def.term}:** ${def.definition}`, '');
    });

    docs.push({
      path: `spm/policies/${policy.code}/definitions.md`,
      content: defContent.join('\n'),
      metadata: { ...baseMetadata, section: 'definitions' }
    });
  }

  // Provisions - one chunk per provision
  if (policy.provisions?.length) {
    policy.provisions.forEach(prov => {
      const provContent = [
        `# ${policy.code} - ${prov.title}`,
        '',
        prov.content,
      ];

      if (prov.priority) {
        provContent.push('', `**Priority:** ${prov.priority}`);
      }

      if (prov.subProvisions?.length) {
        prov.subProvisions.forEach(sub => {
          provContent.push('', `## ${sub.title}`, '', sub.content);
          if (sub.items?.length) {
            sub.items.forEach(item => provContent.push(`- ${item}`));
          }
        });
      }

      docs.push({
        path: `spm/policies/${policy.code}/provisions/${prov.id}.md`,
        content: provContent.join('\n'),
        metadata: { ...baseMetadata, section: 'provision', provisionId: prov.id, priority: prov.priority || 'STANDARD' }
      });
    });
  }

  // Approval Matrix chunk
  if (policy.approvalMatrix?.length) {
    const approvalContent = [`# ${policy.code} - Approval Matrix`, '', '| Threshold | Approver | Escalation |', '|-----------|----------|------------|'];
    policy.approvalMatrix.forEach(row => {
      approvalContent.push(`| ${row.threshold} | ${row.approver} | ${row.escalation || '-'} |`);
    });

    docs.push({
      path: `spm/policies/${policy.code}/approval-matrix.md`,
      content: approvalContent.join('\n'),
      metadata: { ...baseMetadata, section: 'approval-matrix' }
    });
  }

  // Compliance chunk
  if (policy.compliance) {
    const compContent = [`# ${policy.code} - Compliance Requirements`, ''];
    if (policy.compliance.regulations?.length) {
      compContent.push('## Applicable Regulations');
      policy.compliance.regulations.forEach(reg => compContent.push(`- ${reg}`));
    }
    if (policy.compliance.auditRequirements?.length) {
      compContent.push('', '## Audit Requirements');
      policy.compliance.auditRequirements.forEach(req => compContent.push(`- ${req}`));
    }

    docs.push({
      path: `spm/policies/${policy.code}/compliance.md`,
      content: compContent.join('\n'),
      metadata: { ...baseMetadata, section: 'compliance' }
    });
  }

  return docs;
}

function processSCPPolicies(policiesDir: string): IngestDocument[] {
  console.log('Processing SCP Policies...');

  const documents: IngestDocument[] = [];
  const policyFiles = fs.readdirSync(policiesDir)
    .filter(f => f.startsWith('SCP-') && f.endsWith('.json'));

  for (const file of policyFiles) {
    const filePath = path.join(policiesDir, file);
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const policy: SCPPolicy = JSON.parse(rawData);

    const policyDocs = chunkPolicy(policy);
    documents.push(...policyDocs);
    console.log(`  ${policy.code}: ${policyDocs.length} chunks`);
  }

  // Also add MD files as full documents
  const mdFiles = fs.readdirSync(policiesDir)
    .filter(f => f.startsWith('SCP-') && f.endsWith('.md'));

  for (const file of mdFiles) {
    const filePath = path.join(policiesDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const code = file.replace('.md', '');

    documents.push({
      path: `spm/policies/${code}/full-text.md`,
      content,
      metadata: {
        source: 'scp-policy-md',
        policyCode: code,
        section: 'full-text'
      }
    });
  }

  console.log(`  Total: ${documents.length} policy chunks`);
  return documents;
}

// =============================================================================
// FRAMEWORK INGESTION
// =============================================================================

interface FrameworkEntry {
  id: string;
  keyword: string;
  definition: string;
  userType?: string;
}

interface FrameworkItem {
  id: string;
  title: string;
  category: string;
  entries: FrameworkEntry[];
}

interface FrameworkPhase {
  id: string;
  title: string;
  items: FrameworkItem[];
}

interface Framework {
  phases: FrameworkPhase[];
}

function processFramework(frameworkPath: string): IngestDocument[] {
  console.log('Processing SPM 101 Framework...');

  const rawData = fs.readFileSync(frameworkPath, 'utf-8');
  const framework: Framework = JSON.parse(rawData);

  const documents: IngestDocument[] = [];

  for (const phase of framework.phases) {
    // Phase overview
    const phaseContent = [
      `# SPM 101: ${phase.title}`,
      '',
      `Phase covering ${phase.items.length} categories.`,
      '',
      '## Categories',
    ];
    phase.items.forEach(item => {
      phaseContent.push(`- **${item.title}** (${item.category}): ${item.entries.length} terms`);
    });

    documents.push({
      path: `spm/framework/${phase.id}/overview.md`,
      content: phaseContent.join('\n'),
      metadata: {
        source: 'spm-framework',
        phase: phase.title,
        section: 'overview'
      }
    });

    // Each category as a chunk
    for (const item of phase.items) {
      const itemContent = [
        `# ${phase.title}: ${item.title}`,
        '',
        `**Category:** ${item.category}`,
        '',
        '## Terms',
        '',
      ];

      item.entries.forEach(entry => {
        itemContent.push(`### ${entry.keyword}`);
        itemContent.push(entry.definition);
        if (entry.userType) {
          itemContent.push(`*User Type: ${entry.userType}*`);
        }
        itemContent.push('');
      });

      documents.push({
        path: `spm/framework/${phase.id}/${item.id}.md`,
        content: itemContent.join('\n'),
        metadata: {
          source: 'spm-framework',
          phase: phase.title,
          category: item.category,
          component: item.title
        }
      });
    }
  }

  console.log(`  Processed ${documents.length} framework chunks`);
  return documents;
}

// =============================================================================
// GOVERNANCE CHECKLIST
// =============================================================================

function processGovernanceChecklist(checklistPath: string): IngestDocument[] {
  console.log('Processing Governance Checklist...');

  const rawData = fs.readFileSync(checklistPath, 'utf-8');
  const checklist = JSON.parse(rawData);

  const documents: IngestDocument[] = [];

  // Convert checklist to searchable chunks
  if (Array.isArray(checklist.categories)) {
    for (const category of checklist.categories) {
      const content = [
        `# Governance Checklist: ${category.name}`,
        '',
        category.description || '',
        '',
        '## Items',
        '',
      ];

      if (Array.isArray(category.items)) {
        category.items.forEach((item: { title: string; description?: string; required?: boolean }) => {
          content.push(`- **${item.title}**${item.required ? ' (Required)' : ''}`);
          if (item.description) content.push(`  ${item.description}`);
        });
      }

      documents.push({
        path: `spm/governance/checklist/${category.id || category.name.toLowerCase().replace(/\s+/g, '-')}.md`,
        content: content.join('\n'),
        metadata: {
          source: 'governance-checklist',
          category: category.name
        }
      });
    }
  }

  console.log(`  Processed ${documents.length} governance chunks`);
  return documents;
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  console.log('='.repeat(60));
  console.log('SGM-SPARCC Content Ingestion for AICR RAG');
  console.log('='.repeat(60));
  console.log();

  const basePath = path.resolve(__dirname, '..');
  const aicrPath = path.join(os.homedir(), 'dev/aicr');
  const outputDir = path.join(aicrPath, 'data/sgm-sparcc-ingest');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Collect all documents
  const allDocuments: IngestDocument[] = [];

  // 1. KB Cards
  const kbExportPath = path.join(basePath, 'lib/data/synthetic/spm-kb-rag-export.json');
  if (fs.existsSync(kbExportPath)) {
    const kbDocs = processKBCards(kbExportPath);
    allDocuments.push(...kbDocs);
  } else {
    console.log('  KB export not found, skipping...');
  }

  // 2. SCP Policies
  const policiesDir = path.join(basePath, 'lib/data/policies');
  if (fs.existsSync(policiesDir)) {
    const policyDocs = processSCPPolicies(policiesDir);
    allDocuments.push(...policyDocs);
  }

  // 3. SPM Framework
  const frameworkPath = path.join(basePath, 'lib/data/synthetic/spm-101-framework.json');
  if (fs.existsSync(frameworkPath)) {
    const frameworkDocs = processFramework(frameworkPath);
    allDocuments.push(...frameworkDocs);
  }

  // 4. Governance Checklist
  const checklistPath = path.join(basePath, 'lib/data/synthetic/governance-checklist.json');
  if (fs.existsSync(checklistPath)) {
    const checklistDocs = processGovernanceChecklist(checklistPath);
    allDocuments.push(...checklistDocs);
  }

  // Create ingestion batch
  const batch: IngestBatch = {
    collection: 'rag:spm-core',
    source: 'sgm-sparcc-demo',
    timestamp: new Date().toISOString(),
    documents: allDocuments
  };

  // Write output
  const outputPath = path.join(outputDir, 'sgm-sparcc-ingest.json');
  fs.writeFileSync(outputPath, JSON.stringify(batch, null, 2), 'utf-8');

  // Summary
  console.log();
  console.log('='.repeat(60));
  console.log('INGESTION PREP COMPLETE');
  console.log('='.repeat(60));
  console.log();
  console.log(`Total documents: ${allDocuments.length}`);
  console.log(`Output: ${outputPath}`);
  console.log();

  // Group by source
  const bySource: Record<string, number> = {};
  allDocuments.forEach(doc => {
    const source = (doc.metadata?.source as string) || 'unknown';
    bySource[source] = (bySource[source] || 0) + 1;
  });

  console.log('Documents by source:');
  Object.entries(bySource)
    .sort((a, b) => b[1] - a[1])
    .forEach(([source, count]) => {
      console.log(`  ${source.padEnd(25)} ${count}`);
    });

  console.log();
  console.log('Next step: Run ingestion in AICR');
  console.log('  cd ~/dev/aicr');
  console.log('  npx tsx apps/aicr/scripts/ingest-sgm-sparcc.ts');
}

main().catch(err => {
  console.error('Ingestion prep failed:', err);
  process.exit(1);
});
