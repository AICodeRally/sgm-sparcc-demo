#!/usr/bin/env npx tsx

/**
 * Governance UI Integration Test
 *
 * Tests the complete governance gap analysis workflow:
 * 1. Python API health check
 * 2. API routes accessibility
 * 3. Sample data availability
 */

async function testGovernanceUI() {
  console.log('🧪 GOVERNANCE UI INTEGRATION TEST');
  console.log('================================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Python API Health Check
  console.log('🏥 Test 1: Checking Python API health...');
  totalTests++;

  try {
    const response = await fetch('http://localhost:8000/api/health');
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const health = await response.json();
    if (health.status === 'healthy') {
      console.log('✅ Python API is healthy\n');
      passedTests++;
    } else {
      console.log('❌ Python API is unhealthy\n');
    }
  } catch (error) {
    console.log(`❌ Python API health check failed: ${error}\n`);
    console.log('   Make sure to start the API with: ./start-api.sh\n');
  }

  // Test 2: List Available Reports
  console.log('📋 Test 2: Checking available reports...');
  totalTests++;

  try {
    const response = await fetch('http://localhost:8000/api/reports');
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Found ${data.total_reports} analyzed reports`);
    if (data.reports.length > 0) {
      console.log(`   Sample: ${data.reports[0].document_name}`);
      console.log(`   Gaps: ${data.reports[0].total_gaps}\n`);
    }
    passedTests++;
  } catch (error) {
    console.log(`❌ Failed to list reports: ${error}\n`);
  }

  // Test 3: Test Patches Endpoint
  console.log('🔧 Test 3: Testing patches endpoint...');
  totalTests++;

  try {
    const documentId = '2025 Demo Client Incentive Plan';
    const response = await fetch(
      `http://localhost:8000/api/reports/${encodeURIComponent(documentId)}/patches`
    );

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const patches = await response.text();
    const patchCount = (patches.match(/PATCH #\d+:/g) || []).length;
    console.log(`✅ Retrieved patches file (${patchCount} patches, ${Math.round(patches.length / 1024)}KB)\n`);
    passedTests++;
  } catch (error) {
    console.log(`❌ Failed to get patches: ${error}\n`);
  }

  // Test 4: Test Checklist Endpoint
  console.log('📝 Test 4: Testing checklist endpoint...');
  totalTests++;

  try {
    const documentId = '2025 Demo Client Incentive Plan';
    const response = await fetch(
      `http://localhost:8000/api/reports/${encodeURIComponent(documentId)}/checklist`
    );

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const checklist = await response.text();
    const taskCount = (checklist.match(/\| \d+ \|/g) || []).length;
    console.log(`✅ Retrieved checklist (${taskCount} tasks)\n`);
    passedTests++;
  } catch (error) {
    console.log(`❌ Failed to get checklist: ${error}\n`);
  }

  // Test 5: Component Files Exist
  console.log('📦 Test 5: Checking component files...');
  totalTests++;

  const fs = await import('fs');
  const path = await import('path');

  const componentsToCheck = [
    'components/governance/DocumentUploader.tsx',
    'components/governance/AnalysisResults.tsx',
    'components/governance/PatchViewer.tsx',
    'components/governance/index.ts',
    'app/governance/upload/page.tsx',
    'app/api/governance/analyze/route.ts',
    'app/api/governance/patches/[documentId]/route.ts',
    'app/api/governance/checklist/[documentId]/route.ts',
  ];

  let allFilesExist = true;
  for (const file of componentsToCheck) {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      console.log(`   ❌ Missing: ${file}`);
      allFilesExist = false;
    }
  }

  if (allFilesExist) {
    console.log(`✅ All ${componentsToCheck.length} component files exist\n`);
    passedTests++;
  } else {
    console.log('❌ Some component files are missing\n');
  }

  // Summary
  console.log('================================================================================');
  console.log(`📊 Test Results: ${passedTests}/${totalTests} passed\n`);

  if (passedTests === totalTests) {
    console.log('✅ ALL TESTS PASSED!');
    console.log('\n🚀 Ready to use:');
    console.log('   1. Start Next.js: npm run dev');
    console.log('   2. Open: http://localhost:3000/governance/upload');
    console.log('   3. Upload a compensation plan PDF/DOCX');
    console.log('   4. View analysis results and patches\n');
  } else {
    console.log('⚠️  Some tests failed. Check the output above for details.\n');
    if (passedTests === 0) {
      console.log('💡 Make sure the Python API is running:');
      console.log('   cd <CLIENT_DELIVERY_PACKAGE>/govlens_prototype');
      console.log('   ./start-api.sh\n');
    }
  }

  process.exit(passedTests === totalTests ? 0 : 1);
}

testGovernanceUI().catch((error) => {
  console.error('Test script error:', error);
  process.exit(1);
});
