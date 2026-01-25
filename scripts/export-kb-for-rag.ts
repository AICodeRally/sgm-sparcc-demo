#!/usr/bin/env npx tsx
/**
 * Export SPM Knowledge Base to RAG-compatible format
 *
 * Creates chunked documents for ingestion into AICR's RAG system.
 * Each Framework Card is chunked into multiple searchable segments.
 *
 * Usage:
 *   npx tsx scripts/export-kb-for-rag.ts
 *
 * Output:
 *   lib/data/synthetic/spm-kb-rag-export.json
 */

import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// TYPES
// =============================================================================

interface FrameworkCard {
  id: string;
  keyword: string;
  aliases?: string[];
  pillar: string;
  category: string;
  component: string;
  cardType: string;
  definition: string;
  whyItMatters?: string;
  extendedDefinition?: string;
  howItWorks?: string;
  example?: string;
  userTypes?: string[];
  audienceLevels?: string[];
  whoUsesIt?: Array<{ role: string; howTheyUseIt: string }>;
  bestPractices?: string[];
  watchOutFor?: string[];
  commonMistakes?: string[];
  relatedTerms?: string[];
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
  sourceAuthority?: string[];
  tags?: string[];
}

interface RAGChunk {
  id: string;
  cardId: string;
  keyword: string;
  chunkType: 'definition' | 'guidance' | 'process' | 'vendor' | 'regulatory' | 'full';
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
  version: string;
  exportedAt: string;
  source: string;
  totalCards: number;
  totalChunks: number;
  chunksByType: Record<string, number>;
  chunks: RAGChunk[];
}

// =============================================================================
// CHUNKING LOGIC
// =============================================================================

const CHARS_PER_TOKEN = 4;

function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

function generateChunkId(cardId: string, chunkType: string): string {
  return `${cardId}:${chunkType}`;
}

function createDefinitionChunk(card: FrameworkCard): RAGChunk {
  const parts: string[] = [
    `# ${card.keyword}`,
    '',
    `**Definition:** ${card.definition}`,
  ];

  if (card.aliases && card.aliases.length > 0) {
    parts.push(`**Also known as:** ${card.aliases.join(', ')}`);
  }

  if (card.whyItMatters) {
    parts.push('', `**Why It Matters:** ${card.whyItMatters}`);
  }

  if (card.extendedDefinition) {
    parts.push('', card.extendedDefinition);
  }

  const content = parts.join('\n');

  return {
    id: generateChunkId(card.id, 'definition'),
    cardId: card.id,
    keyword: card.keyword,
    chunkType: 'definition',
    content,
    metadata: {
      pillar: card.pillar,
      category: card.category,
      component: card.component,
      cardType: card.cardType,
      audienceLevels: card.audienceLevels || ['Practitioner'],
      tags: card.tags || [],
      relatedTerms: card.relatedTerms || [],
    },
    tokenEstimate: estimateTokens(content),
  };
}

function createGuidanceChunk(card: FrameworkCard): RAGChunk | null {
  const parts: string[] = [];

  if (card.howItWorks) {
    parts.push(`**How It Works:** ${card.howItWorks}`);
  }

  if (card.example) {
    parts.push('', `**Example:** ${card.example}`);
  }

  if (card.bestPractices && card.bestPractices.length > 0) {
    parts.push('', '**Best Practices:**');
    card.bestPractices.forEach(bp => parts.push(`- ${bp}`));
  }

  if (card.watchOutFor && card.watchOutFor.length > 0) {
    parts.push('', '**Watch Out For:**');
    card.watchOutFor.forEach(wo => parts.push(`- ${wo}`));
  }

  if (card.commonMistakes && card.commonMistakes.length > 0) {
    parts.push('', '**Common Mistakes:**');
    card.commonMistakes.forEach(cm => parts.push(`- ${cm}`));
  }

  if (parts.length === 0) return null;

  const content = `# ${card.keyword} - Guidance\n\n${parts.join('\n')}`;

  return {
    id: generateChunkId(card.id, 'guidance'),
    cardId: card.id,
    keyword: card.keyword,
    chunkType: 'guidance',
    content,
    metadata: {
      pillar: card.pillar,
      category: card.category,
      component: card.component,
      cardType: card.cardType,
      audienceLevels: card.audienceLevels || ['Practitioner'],
      tags: card.tags || [],
      relatedTerms: card.relatedTerms || [],
    },
    tokenEstimate: estimateTokens(content),
  };
}

function createProcessChunk(card: FrameworkCard): RAGChunk | null {
  if (card.cardType !== 'process') return null;

  const parts: string[] = [];

  if (card.processFlow) {
    if (card.processFlow.upstream && card.processFlow.upstream.length > 0) {
      parts.push(`**Upstream:** ${card.processFlow.upstream.join(' → ')}`);
    }
    if (card.processFlow.downstream && card.processFlow.downstream.length > 0) {
      parts.push(`**Downstream:** ${card.processFlow.downstream.join(' → ')}`);
    }
    if (card.processFlow.diagram) {
      parts.push('', `**Flow:** ${card.processFlow.diagram}`);
    }
  }

  if (card.inputs && card.inputs.length > 0) {
    parts.push('', '**Inputs:**');
    card.inputs.forEach(input => parts.push(`- ${input}`));
  }

  if (card.outputs && card.outputs.length > 0) {
    parts.push('', '**Outputs:**');
    card.outputs.forEach(output => parts.push(`- ${output}`));
  }

  if (card.systemsInvolved && card.systemsInvolved.length > 0) {
    parts.push('', `**Systems:** ${card.systemsInvolved.join(', ')}`);
  }

  if (card.timing) {
    parts.push('', `**Timing:** ${card.timing}`);
  }

  if (parts.length === 0) return null;

  const content = `# ${card.keyword} - Process Flow\n\n${parts.join('\n')}`;

  return {
    id: generateChunkId(card.id, 'process'),
    cardId: card.id,
    keyword: card.keyword,
    chunkType: 'process',
    content,
    metadata: {
      pillar: card.pillar,
      category: card.category,
      component: card.component,
      cardType: card.cardType,
      audienceLevels: card.audienceLevels || ['Practitioner'],
      tags: card.tags || [],
      relatedTerms: card.relatedTerms || [],
    },
    tokenEstimate: estimateTokens(content),
  };
}

function createVendorChunk(card: FrameworkCard): RAGChunk | null {
  if (!card.vendorTerminology || Object.keys(card.vendorTerminology).length === 0) {
    return null;
  }

  const parts: string[] = ['**Vendor Terminology:**'];
  Object.entries(card.vendorTerminology).forEach(([vendor, term]) => {
    parts.push(`- **${vendor}:** ${term}`);
  });

  const content = `# ${card.keyword} - Vendor Terminology\n\n${parts.join('\n')}`;

  return {
    id: generateChunkId(card.id, 'vendor'),
    cardId: card.id,
    keyword: card.keyword,
    chunkType: 'vendor',
    content,
    metadata: {
      pillar: card.pillar,
      category: card.category,
      component: card.component,
      cardType: card.cardType,
      audienceLevels: card.audienceLevels || ['Practitioner'],
      tags: card.tags || [],
      relatedTerms: card.relatedTerms || [],
    },
    tokenEstimate: estimateTokens(content),
  };
}

function createRegulatoryChunk(card: FrameworkCard): RAGChunk | null {
  if (card.cardType !== 'regulation') return null;

  const parts: string[] = [];

  if (card.legalBasis) {
    parts.push(`**Legal Basis:** ${card.legalBasis}`);
  }

  if (card.regulatoryNotes) {
    parts.push('', `**Regulatory Notes:** ${card.regulatoryNotes}`);
  }

  if (card.requirements && card.requirements.length > 0) {
    parts.push('', '**Requirements:**');
    card.requirements.forEach(req => parts.push(`- ${req}`));
  }

  if (card.penalties) {
    parts.push('', `**Penalties:** ${card.penalties}`);
  }

  if (parts.length === 0) return null;

  const content = `# ${card.keyword} - Regulatory Information\n\n${parts.join('\n')}`;

  return {
    id: generateChunkId(card.id, 'regulatory'),
    cardId: card.id,
    keyword: card.keyword,
    chunkType: 'regulatory',
    content,
    metadata: {
      pillar: card.pillar,
      category: card.category,
      component: card.component,
      cardType: card.cardType,
      audienceLevels: card.audienceLevels || ['Practitioner'],
      tags: card.tags || [],
      relatedTerms: card.relatedTerms || [],
    },
    tokenEstimate: estimateTokens(content),
  };
}

function chunkCard(card: FrameworkCard): RAGChunk[] {
  const chunks: RAGChunk[] = [];

  // Always create definition chunk
  chunks.push(createDefinitionChunk(card));

  // Guidance chunk (if has best practices, how it works, etc.)
  const guidanceChunk = createGuidanceChunk(card);
  if (guidanceChunk) chunks.push(guidanceChunk);

  // Process chunk (for process cards)
  const processChunk = createProcessChunk(card);
  if (processChunk) chunks.push(processChunk);

  // Vendor terminology chunk
  const vendorChunk = createVendorChunk(card);
  if (vendorChunk) chunks.push(vendorChunk);

  // Regulatory chunk (for regulation cards)
  const regulatoryChunk = createRegulatoryChunk(card);
  if (regulatoryChunk) chunks.push(regulatoryChunk);

  return chunks;
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  console.log('='.repeat(60));
  console.log('SPM Knowledge Base RAG Export');
  console.log('='.repeat(60));
  console.log();

  const basePath = path.resolve(__dirname, '..');
  const dataPath = path.join(basePath, 'lib/data/synthetic');

  // Load all card sources
  const sampleCards: FrameworkCard[] = JSON.parse(
    fs.readFileSync(path.join(dataPath, 'spm-kb-sample-cards.json'), 'utf-8')
  ).sampleCards;

  const migratedData = JSON.parse(
    fs.readFileSync(path.join(dataPath, 'spm-kb-cards-migrated.json'), 'utf-8')
  );
  const migratedCards: FrameworkCard[] = migratedData.cards || [];

  const newPillarsData = JSON.parse(
    fs.readFileSync(path.join(dataPath, 'spm-kb-cards-new-pillars.json'), 'utf-8')
  );
  const newPillarsCards: FrameworkCard[] = newPillarsData.cards || [];

  // Check for expansion file
  let expansionCards: FrameworkCard[] = [];
  const expansionPath = path.join(dataPath, 'spm-kb-cards-expansion.json');
  if (fs.existsSync(expansionPath)) {
    const expansionData = JSON.parse(fs.readFileSync(expansionPath, 'utf-8'));
    expansionCards = expansionData.cards || [];
  }

  // Combine and dedupe
  const allCards = [...sampleCards, ...migratedCards, ...newPillarsCards, ...expansionCards];
  const uniqueCards = allCards.reduce((acc, card) => {
    if (!acc.find(c => c.id === card.id)) {
      acc.push(card);
    }
    return acc;
  }, [] as FrameworkCard[]);

  console.log(`Loaded ${uniqueCards.length} unique Framework Cards`);
  console.log(`  - Sample: ${sampleCards.length}`);
  console.log(`  - Migrated: ${migratedCards.length}`);
  console.log(`  - New Pillars: ${newPillarsCards.length}`);
  console.log(`  - Expansion: ${expansionCards.length}`);
  console.log();

  // Chunk all cards
  const allChunks: RAGChunk[] = [];
  const chunksByType: Record<string, number> = {};

  for (const card of uniqueCards) {
    const cardChunks = chunkCard(card);
    allChunks.push(...cardChunks);

    for (const chunk of cardChunks) {
      chunksByType[chunk.chunkType] = (chunksByType[chunk.chunkType] || 0) + 1;
    }
  }

  console.log(`Generated ${allChunks.length} RAG chunks`);
  console.log('Chunks by type:');
  Object.entries(chunksByType)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}`);
    });

  const totalTokens = allChunks.reduce((sum, chunk) => sum + chunk.tokenEstimate, 0);
  console.log(`Estimated total tokens: ${totalTokens.toLocaleString()}`);
  console.log();

  // Create export
  const ragExport: RAGExport = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    source: 'spm-knowledge-base',
    totalCards: uniqueCards.length,
    totalChunks: allChunks.length,
    chunksByType,
    chunks: allChunks,
  };

  // Write export
  const outputPath = path.join(dataPath, 'spm-kb-rag-export.json');
  fs.writeFileSync(outputPath, JSON.stringify(ragExport, null, 2), 'utf-8');

  console.log('='.repeat(60));
  console.log('EXPORT COMPLETE');
  console.log('='.repeat(60));
  console.log(`Output: ${outputPath}`);
  console.log();
  console.log('Next steps:');
  console.log('1. Copy spm-kb-rag-export.json to ~/dev/aicr');
  console.log('2. Run AICR ingestion script to load into RAG system');
}

main().catch(err => {
  console.error('Export failed:', err);
  process.exit(1);
});
