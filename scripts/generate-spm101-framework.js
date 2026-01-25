const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const workbook = XLSX.readFile('/Users/toddlebaron/Downloads/spm_framework_v1.xlsx');
const sheet = workbook.Sheets['SPM Framework'];
const data = XLSX.utils.sheet_to_json(sheet);

// Group by process -> category -> component
const structure = {};
data.forEach(row => {
  const process = (row.process || '').trim();
  const category = (row.category || '').trim();
  const component = (row.component || '').trim();

  if (!structure[process]) structure[process] = {};
  if (!structure[process][category]) structure[process][category] = {};
  if (!structure[process][category][component]) structure[process][category][component] = [];

  structure[process][category][component].push({
    keyword: (row.keyword || '').trim(),
    definition: (row.definition || '').trim(),
    user_type: row.user_type
  });
});

// Build the framework JSON
const phases = [];
let phaseNumber = 1;

Object.keys(structure).forEach(process => {
  // Each process becomes a phase
  const categories = Object.keys(structure[process]);
  const items = [];
  let itemNumber = 1;

  categories.forEach(category => {
    const components = Object.keys(structure[process][category]);

    components.forEach(component => {
      const keywords = structure[process][category][component];

      // Each component becomes an item with keywords as entries
      items.push({
        id: `item-${phaseNumber}-${itemNumber}`,
        number: itemNumber,
        title: component,
        category: category,
        entries: keywords.map((kw, idx) => ({
          id: `entry-${phaseNumber}-${itemNumber}-${idx + 1}`,
          keyword: kw.keyword,
          definition: kw.definition,
          userType: kw.user_type
        }))
      });
      itemNumber++;
    });
  });

  const totalEntries = items.reduce((sum, item) => sum + item.entries.length, 0);

  phases.push({
    id: `phase-${phaseNumber}`,
    number: phaseNumber,
    title: process,
    type: 'reference',
    totalItems: items.length,
    totalEntries: totalEntries,
    items: items
  });

  phaseNumber++;
});

const framework = { phases };

// Write to JSON file
const outputPath = path.join(__dirname, '../lib/data/synthetic/spm-101-framework.json');
fs.writeFileSync(outputPath, JSON.stringify(framework, null, 2));
console.log('Generated SPM 101 Framework:');
console.log('- Phases:', phases.length);
phases.forEach(p => {
  console.log(`  ${p.number}. ${p.title}: ${p.totalItems} items, ${p.totalEntries} entries`);
});
console.log('\nSaved to:', outputPath);
