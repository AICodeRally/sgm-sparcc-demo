const fs = require('fs');

// Load all card files
const files = [
  'lib/data/synthetic/spm-kb-cards-migrated.json',
  'lib/data/synthetic/spm-kb-cards-new-pillars.json',
  'lib/data/synthetic/spm-kb-cards-expansion.json',
  'lib/data/synthetic/spm-kb-cards-expansion-2.json',
  'lib/data/synthetic/spm-kb-cards-expansion-3.json',
  'lib/data/synthetic/spm-kb-cards-expansion-4.json',
  'lib/data/synthetic/spm-kb-cards-expansion-6.json',
  'lib/data/synthetic/spm-kb-sample-cards.json'
];

const allCards = [];
const seenIds = new Set();

files.forEach(file => {
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const cards = data.cards || data.sampleCards || [];
    cards.forEach(card => {
      // Normalize keyword field
      const keyword = card.keyword || card.term;
      if (keyword && !seenIds.has(card.id)) {
        seenIds.add(card.id);
        allCards.push({
          id: card.id,
          keyword: keyword,
          pillar: card.pillar,
          category: card.category,
          cardType: card.cardType,
          definition: card.definition,
          aliases: card.aliases || [],
          relatedTerms: card.relatedTerms || [],
          tags: card.tags || []
        });
      }
    });
  } catch (e) {
    console.error('Error loading', file, e.message);
  }
});

// Generate RAG chunks
const ragChunks = allCards.map(card => ({
  id: card.id + '-rag',
  cardId: card.id,
  keyword: card.keyword,
  chunkType: 'full',
  content: [
    card.keyword,
    card.definition,
    card.aliases.length ? 'Also known as: ' + card.aliases.join(', ') : '',
    card.relatedTerms.length ? 'Related: ' + card.relatedTerms.join(', ') : ''
  ].filter(Boolean).join('. '),
  metadata: {
    pillar: card.pillar,
    category: card.category,
    cardType: card.cardType,
    tags: card.tags
  }
}));

// Count by pillar
const pillarCounts = {};
ragChunks.forEach(chunk => {
  pillarCounts[chunk.metadata.pillar] = (pillarCounts[chunk.metadata.pillar] || 0) + 1;
});

const output = {
  version: '2.0.0',
  generatedAt: new Date().toISOString(),
  totalChunks: ragChunks.length,
  pillarCounts: pillarCounts,
  chunks: ragChunks
};

fs.writeFileSync('lib/data/synthetic/spm-kb-rag-export.json', JSON.stringify(output, null, 2));
console.log('Generated RAG export with', ragChunks.length, 'chunks');
console.log('Pillar counts:', JSON.stringify(pillarCounts, null, 2));
