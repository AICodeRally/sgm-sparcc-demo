/**
 * SGM Diagnostics Script
 *
 * Displays current binding configuration, database settings, and schema validation
 */

import { getRegistry } from '@/lib/bindings/registry';

function main() {
  console.log('\n=== SGM Diagnostics ===\n');

  const registry = getRegistry();
  const diagnostics = registry.getDiagnostics();

  console.log('Binding Modes:');
  console.log(`  Policy:     ${diagnostics.modes.policy}`);
  console.log(`  Territory:  ${diagnostics.modes.territory}`);
  console.log(`  Approval:   ${diagnostics.modes.approval}`);
  console.log(`  Audit:      ${diagnostics.modes.audit}`);
  console.log(`  Link:       ${diagnostics.modes.link}`);
  console.log(`  Search:     ${diagnostics.modes.search}`);
  console.log(`  Document:   ${diagnostics.modes.document}`);
  console.log(`  Committee:  ${diagnostics.modes.committee}`);

  console.log('\nDatabase Configuration:');
  console.log(`  DATABASE_URL Present:  ${diagnostics.database.hasUrl}`);
  console.log(`  Schema Parameter:      ${diagnostics.database.hasSchemaParam ? 'YES' : 'NO'}`);
  console.log(`  Schema Target:         ${diagnostics.database.schemaTarget}`);
  console.log(`  Live Mode Active:      ${diagnostics.database.isLiveMode}`);

  console.log('\nSystem Status:');
  console.log(`  External Dependencies: ${diagnostics.hasExternalDependencies ? 'YES' : 'NO'}`);

  if (diagnostics.database.isLiveMode && !diagnostics.database.hasSchemaParam) {
    console.log('\n[WARN]  WARNING: Live mode enabled but DATABASE_URL missing schema parameter!');
    console.log('   Expected: postgresql://...?schema=sgm_summit_demo');
  }

  if (diagnostics.database.isLiveMode && diagnostics.database.hasSchemaParam) {
    console.log('\n[OK] Configuration valid for live mode with schema isolation');
  }

  console.log('\n=======================\n');
}

main();
