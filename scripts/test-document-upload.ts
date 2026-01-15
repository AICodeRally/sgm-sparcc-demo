#!/usr/bin/env tsx

/**
 * Test Document Upload API
 *
 * Tests the complete document upload workflow:
 * 1. Upload document via API
 * 2. Poll status until processing complete
 * 3. Display final results
 */

import * as fs from 'fs';
import * as path from 'path';
import FormData from 'form-data';

const API_BASE_URL = 'http://localhost:3000';
const TENANT_SLUG = 'demo-client';
const TEST_FILE_PATH = '/tmp/test-compensation-plan-structured.txt';

/**
 * Upload document
 */
async function uploadDocument(filePath: string): Promise<any> {
  console.log('📤 Uploading document...\n');
  console.log(`   File: ${path.basename(filePath)}`);
  console.log(`   Size: ${(fs.statSync(filePath).size / 1024).toFixed(2)} KB\n`);

  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));

  const response = await fetch(`${API_BASE_URL}/api/client/${TENANT_SLUG}/documents/upload`, {
    method: 'POST',
    headers: {
      'x-user-id': 'test-user@demo-client.com',
    },
    body: form as any,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Upload failed: ${error}`);
  }

  const result = await response.json();
  console.log('✅ Upload successful!\n');
  console.log(`   Document ID: ${result.documentId}`);
  console.log(`   Status: ${result.status}`);
  console.log(`   File Name: ${result.fileName}`);
  console.log(`   File Size: ${result.fileSize} bytes\n`);

  return result;
}

/**
 * Get document status
 */
async function getDocumentStatus(documentId: string): Promise<any> {
  const response = await fetch(
    `${API_BASE_URL}/api/client/${TENANT_SLUG}/documents/${documentId}/status`
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Status check failed: ${error}`);
  }

  return response.json();
}

/**
 * Poll document status until complete
 */
async function pollUntilComplete(documentId: string): Promise<any> {
  console.log('🔄 Polling processing status...\n');

  const startTime = Date.now();
  let lastStatus = '';

  while (true) {
    const status = await getDocumentStatus(documentId);

    // Show progress if status changed
    if (status.status !== lastStatus) {
      console.log(
        `   [${status.progress.percentage}%] ${status.progress.stage}: ${status.progress.message}`
      );
      lastStatus = status.status;
    }

    // Check if complete or failed
    if (status.status === 'COMPLETED' || status.status === 'READY') {
      console.log(`\n✅ Processing complete in ${Date.now() - startTime}ms\n`);
      return status;
    }

    if (status.status === 'FAILED') {
      console.log(`\n❌ Processing failed: ${status.errorMessage}\n`);
      return status;
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

/**
 * Display final results
 */
function displayResults(status: any): void {
  console.log('='.repeat(70));
  console.log('PROCESSING RESULTS');
  console.log('='.repeat(70));
  console.log('\n');

  console.log('📄 DOCUMENT INFO\n');
  console.log(`   Document ID: ${status.id}`);
  console.log(`   File Name: ${status.fileName}`);
  console.log(`   File Type: ${status.fileType}`);
  console.log(`   File Size: ${(status.fileSize / 1024).toFixed(2)} KB`);
  console.log(`   Uploaded: ${new Date(status.uploadedAt).toLocaleString()}`);
  console.log(`   Uploaded By: ${status.uploadedBy}\n`);

  if (status.totalSections) {
    console.log('📊 PARSING RESULTS\n');
    console.log(`   Total Sections: ${status.totalSections}`);
    console.log(`   Total Words: ${status.totalWords?.toLocaleString() || 'N/A'}`);
    console.log(`   Parsed At: ${new Date(status.parsedAt).toLocaleString()}\n`);
  }

  if (status.sectionMappings) {
    console.log('🔗 SECTION MAPPINGS\n');
    console.log(`   Total Mappings: ${status.sectionMappings.total}`);
    console.log(`   ✅ Accepted: ${status.sectionMappings.accepted}`);
    console.log(`   ⏳ Pending: ${status.sectionMappings.pending}`);
    console.log(`   ❌ Rejected: ${status.sectionMappings.rejected}\n`);
  }

  if (status.recommendations) {
    console.log('💡 POLICY RECOMMENDATIONS\n');
    console.log(`   Total Recommendations: ${status.recommendations.total}`);
    console.log(`   🔴 Critical: ${status.recommendations.critical}`);
    console.log(`   🟡 High: ${status.recommendations.high}`);
    console.log(`   ✅ Applied: ${status.recommendations.applied}\n`);
  }

  if (status.processingTime) {
    console.log('⏱️  PERFORMANCE\n');
    console.log(`   Total Processing Time: ${status.processingTime}ms\n`);
  }

  if (status.errorMessage) {
    console.log('❌ ERROR\n');
    console.log(`   ${status.errorMessage}\n`);
  }
}

/**
 * Main test function
 */
async function main() {
  console.log('🚀 DOCUMENT UPLOAD API TEST\n');
  console.log('='.repeat(70));
  console.log('\n');

  try {
    // Check test file exists
    if (!fs.existsSync(TEST_FILE_PATH)) {
      console.error(`❌ Test file not found: ${TEST_FILE_PATH}`);
      console.log('\nPlease run the document parser test first to create the test file.');
      console.log('   npm run test:parser\n');
      process.exit(1);
    }

    // Step 1: Upload document
    const uploadResult = await uploadDocument(TEST_FILE_PATH);

    // Step 2: Poll until complete
    const finalStatus = await pollUntilComplete(uploadResult.documentId);

    // Step 3: Display results
    displayResults(finalStatus);

    console.log('='.repeat(70));
    console.log('✅ TEST COMPLETE');
    console.log('='.repeat(70));
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

main();
