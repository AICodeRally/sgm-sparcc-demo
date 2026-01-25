const XLSX = require('xlsx');
const workbook = XLSX.readFile('/Users/toddlebaron/Downloads/spm_framework_v1.xlsx');
const sheet = workbook.Sheets['SPM Framework'];
const data = XLSX.utils.sheet_to_json(sheet);

console.log('Total rows:', data.length);
console.log('');

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

// Print structure summary
Object.keys(structure).forEach(process => {
  console.log('\n=== ' + process + ' ===');
  Object.keys(structure[process]).forEach(category => {
    const components = Object.keys(structure[process][category]);
    const totalKeywords = components.reduce((sum, c) => sum + structure[process][category][c].length, 0);
    console.log('  ' + category + ' (' + components.length + ' components, ' + totalKeywords + ' keywords)');
    components.forEach(component => {
      console.log('    - ' + component + ': ' + structure[process][category][component].length + ' keywords');
    });
  });
});
