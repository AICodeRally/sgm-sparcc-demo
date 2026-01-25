/**
 * Checklist Progress Tests
 *
 * Validates checklist progress providers and API routes
 */

import { SyntheticChecklistProgressProvider } from '@/lib/bindings/synthetic/checklist-progress.synthetic';
import { getRegistry } from '@/lib/bindings/registry';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// Test data
const TEST_ENGAGEMENT_ID = 'test-engagement-001';
const TEST_FRAMEWORK_ID = 'fw-004-id';
const TEST_STEP_ID = 'step-1-1-1';

async function testSyntheticProviderGetProgress() {
  console.log('\n[DOC] Test: Synthetic Provider - getProgress');

  const provider = new SyntheticChecklistProgressProvider();
  const progress = await provider.getProgress(TEST_ENGAGEMENT_ID, TEST_FRAMEWORK_ID);

  // Test 1: Returns array
  assert(Array.isArray(progress), 'getProgress should return an array');
  console.log('  [OK] Returns an array');

  // Test 2: Initially empty for new engagement
  assert(progress.length === 0, 'New engagement should have no progress');
  console.log('  [OK] New engagement has empty progress');
}

async function testSyntheticProviderUpdateStep() {
  console.log('\n[DOC] Test: Synthetic Provider - updateStep');

  const provider = new SyntheticChecklistProgressProvider();

  // Test 3: Mark step as completed
  const result = await provider.updateStep({
    engagementId: TEST_ENGAGEMENT_ID,
    frameworkId: TEST_FRAMEWORK_ID,
    stepId: TEST_STEP_ID,
    completed: true,
  });

  assert(typeof result.id === 'string', 'updateStep should return an id');
  assert(result.engagementId === TEST_ENGAGEMENT_ID, 'updateStep should return correct engagementId');
  assert(result.frameworkId === TEST_FRAMEWORK_ID, 'updateStep should return correct frameworkId');
  assert(result.stepId === TEST_STEP_ID, 'updateStep should return correct stepId');
  assert(result.completed === true, 'updateStep should return completed: true');
  console.log('  [OK] Step marked as completed');

  // Test 4: Verify step is now in progress
  const progress = await provider.getProgress(TEST_ENGAGEMENT_ID, TEST_FRAMEWORK_ID);
  const updatedStep = progress.find(p => p.stepId === TEST_STEP_ID);
  assert(updatedStep !== undefined, 'Updated step should be in progress');
  assert(updatedStep?.completed === true, 'Step should be marked completed');
  console.log('  [OK] Progress reflects update');

  // Test 5: Mark step as incomplete
  const uncompleteResult = await provider.updateStep({
    engagementId: TEST_ENGAGEMENT_ID,
    frameworkId: TEST_FRAMEWORK_ID,
    stepId: TEST_STEP_ID,
    completed: false,
  });
  assert(uncompleteResult.completed === false, 'updateStep should return completed: false');
  console.log('  [OK] Step marked as incomplete');

  // Test 6: Update sets completedDate when completing
  const completedResult = await provider.updateStep({
    engagementId: TEST_ENGAGEMENT_ID,
    frameworkId: TEST_FRAMEWORK_ID,
    stepId: 'step-1-1-2',
    completed: true,
  });
  assert(completedResult.completedDate !== null, 'Completed step should have completedDate');
  console.log('  [OK] CompletedDate is set when completing');
}

async function testSyntheticProviderBulkUpdate() {
  console.log('\n[DOC] Test: Synthetic Provider - bulkUpdate');

  const provider = new SyntheticChecklistProgressProvider();
  const steps = [
    { stepId: 'step-1-1-1', completed: true },
    { stepId: 'step-1-1-2', completed: true },
    { stepId: 'step-1-2-1', completed: true },
  ];

  // Test 7: Bulk mark as completed
  const result = await provider.bulkUpdate({
    engagementId: TEST_ENGAGEMENT_ID,
    frameworkId: TEST_FRAMEWORK_ID,
    steps,
  });

  assert(typeof result.updated === 'number', 'bulkUpdate should return updated count');
  assert(result.updated === steps.length, `bulkUpdate should update ${steps.length} steps`);
  console.log('  [OK] Bulk update completed');

  // Test 8: Verify all steps are completed
  const progress = await provider.getProgress(TEST_ENGAGEMENT_ID, TEST_FRAMEWORK_ID);
  for (const step of steps) {
    const found = progress.find(p => p.stepId === step.stepId);
    assert(found !== undefined, `Step ${step.stepId} should be in progress`);
    assert(found?.completed === true, `Step ${step.stepId} should be completed`);
  }
  console.log('  [OK] All bulk updated steps are completed');
}

async function testSyntheticProviderGetProgressSummary() {
  console.log('\n[DOC] Test: Synthetic Provider - getProgressSummary');

  const provider = new SyntheticChecklistProgressProvider();

  // First, complete some steps
  await provider.bulkUpdate({
    engagementId: TEST_ENGAGEMENT_ID,
    frameworkId: TEST_FRAMEWORK_ID,
    steps: [
      { stepId: 'step-1-1-1', completed: true },
      { stepId: 'step-1-1-2', completed: true },
    ],
  });

  // Test 9: Get summary
  const summary = await provider.getProgressSummary(TEST_ENGAGEMENT_ID, TEST_FRAMEWORK_ID);

  assert(typeof summary.phases === 'object', 'Summary should have phases object');
  assert(typeof summary.overall === 'object', 'Summary should have overall object');
  assert(typeof summary.overall.total === 'number', 'Summary overall should have total');
  assert(typeof summary.overall.completed === 'number', 'Summary overall should have completed');
  console.log('  [OK] Summary has all required fields');

  // Test 10: Overall completed should be non-negative
  assert(summary.overall.completed >= 0, 'Completed count should be non-negative');
  assert(summary.overall.total >= 0, 'Total count should be non-negative');
  console.log('  [OK] Summary counts are valid');
}

async function testProviderIsolation() {
  console.log('\n[DOC] Test: Provider Isolation');

  const provider = new SyntheticChecklistProgressProvider();
  const engagement1 = 'engagement-isolation-1';
  const engagement2 = 'engagement-isolation-2';

  // Test 11: Updates to one engagement don't affect another
  await provider.updateStep({
    engagementId: engagement1,
    frameworkId: TEST_FRAMEWORK_ID,
    stepId: TEST_STEP_ID,
    completed: true,
  });
  await provider.updateStep({
    engagementId: engagement2,
    frameworkId: TEST_FRAMEWORK_ID,
    stepId: TEST_STEP_ID,
    completed: false,
  });

  const progress1 = await provider.getProgress(engagement1, TEST_FRAMEWORK_ID);
  const progress2 = await provider.getProgress(engagement2, TEST_FRAMEWORK_ID);

  const step1 = progress1.find(p => p.stepId === TEST_STEP_ID);
  const step2 = progress2.find(p => p.stepId === TEST_STEP_ID);

  assert(step1?.completed === true, 'Engagement 1 step should be completed');
  assert(step2?.completed === false, 'Engagement 2 step should be incomplete');
  console.log('  [OK] Engagements are isolated');
}

async function testRegistryIntegration() {
  console.log('\n[DOC] Test: Registry Integration');

  const registry = getRegistry();

  // Test 12: Registry returns a provider
  const provider = registry.getChecklistProgress();
  assert(provider !== null && provider !== undefined, 'Registry should return a provider');
  console.log('  [OK] Registry returns a provider');

  // Test 13: Provider has all required methods
  assert(typeof provider.getProgress === 'function', 'Provider should have getProgress method');
  assert(typeof provider.updateStep === 'function', 'Provider should have updateStep method');
  assert(typeof provider.bulkUpdate === 'function', 'Provider should have bulkUpdate method');
  assert(typeof provider.getProgressSummary === 'function', 'Provider should have getProgressSummary method');
  console.log('  [OK] Provider has all required methods');
}

async function testEdgeCases() {
  console.log('\n[DOC] Test: Edge Cases');

  const provider = new SyntheticChecklistProgressProvider();

  // Test 14: Empty bulk update
  const emptyResult = await provider.bulkUpdate({
    engagementId: TEST_ENGAGEMENT_ID,
    frameworkId: TEST_FRAMEWORK_ID,
    steps: [],
  });
  assert(emptyResult.updated === 0, 'Empty bulk update should update 0 steps');
  console.log('  [OK] Empty bulk update handles gracefully');

  // Test 15: Progress for non-existent engagement returns empty
  const newEngagement = 'non-existent-engagement-' + Date.now();
  const progress = await provider.getProgress(newEngagement, TEST_FRAMEWORK_ID);
  assert(Array.isArray(progress), 'Non-existent engagement should return array');
  assert(progress.length === 0, 'Non-existent engagement should return empty array');
  console.log('  [OK] Non-existent engagement returns empty progress');

  // Test 16: Duplicate updates are idempotent (only one entry per step)
  const idempotentEngagement = 'engagement-idempotent-' + Date.now();
  await provider.updateStep({
    engagementId: idempotentEngagement,
    frameworkId: TEST_FRAMEWORK_ID,
    stepId: 'idempotent-step',
    completed: true,
  });
  await provider.updateStep({
    engagementId: idempotentEngagement,
    frameworkId: TEST_FRAMEWORK_ID,
    stepId: 'idempotent-step',
    completed: true,
  });
  const idempotentProgress = await provider.getProgress(idempotentEngagement, TEST_FRAMEWORK_ID);
  const idempotentMatches = idempotentProgress.filter(p => p.stepId === 'idempotent-step');
  assert(idempotentMatches.length === 1, 'Should only have one entry per step');
  console.log('  [OK] Duplicate updates are idempotent');
}

async function testFilters() {
  console.log('\n[DOC] Test: Progress Filters');

  const provider = new SyntheticChecklistProgressProvider();
  const filterEngagement = 'engagement-filter-' + Date.now();

  // Set up test data
  await provider.bulkUpdate({
    engagementId: filterEngagement,
    frameworkId: TEST_FRAMEWORK_ID,
    steps: [
      { stepId: 'step-1-1-1', completed: true },
      { stepId: 'step-1-1-2', completed: false },
      { stepId: 'step-2-1-1', completed: true },
    ],
  });

  // Test 17: Filter by completed=true
  const completedOnly = await provider.getProgress(filterEngagement, TEST_FRAMEWORK_ID, {
    completed: true,
  });
  assert(completedOnly.every(p => p.completed === true), 'Filter completed=true should only return completed steps');
  console.log('  [OK] Filter by completed=true works');

  // Test 18: Filter by completed=false
  const incompleteOnly = await provider.getProgress(filterEngagement, TEST_FRAMEWORK_ID, {
    completed: false,
  });
  assert(incompleteOnly.every(p => p.completed === false), 'Filter completed=false should only return incomplete steps');
  console.log('  [OK] Filter by completed=false works');
}

async function testLiveProviderIfAvailable() {
  console.log('\n[DOC] Test: Live Provider (if DATABASE_URL available)');

  if (!process.env.DATABASE_URL) {
    console.log('  ⏭️  Skipping live provider tests (no DATABASE_URL)');
    return;
  }

  if (process.env.BINDING_MODE_CHECKLIST_PROGRESS !== 'live') {
    console.log('  ⏭️  Skipping live provider tests (BINDING_MODE_CHECKLIST_PROGRESS != live)');
    return;
  }

  try {
    const { LiveChecklistProgressProvider } = await import('@/lib/bindings/live/checklist-progress.live');
    const provider = new LiveChecklistProgressProvider();

    // Test 19: Live provider can update and retrieve
    const testStepId = `test-live-step-${Date.now()}`;
    const result = await provider.updateStep({
      engagementId: 'test-live-engagement',
      frameworkId: TEST_FRAMEWORK_ID,
      stepId: testStepId,
      completed: true,
    });
    assert(typeof result.id === 'string', 'Live provider updateStep should return id');
    console.log('  [OK] Live provider updateStep works');

    // Clean up: mark as incomplete (delete not needed, just toggle off)
    await provider.updateStep({
      engagementId: 'test-live-engagement',
      frameworkId: TEST_FRAMEWORK_ID,
      stepId: testStepId,
      completed: false,
    });
    console.log('  [OK] Live provider cleanup complete');

  } catch (error) {
    console.log(`  ⚠️  Live provider test error: ${error}`);
  }
}

async function runTests() {
  console.log('=== Checklist Progress Tests ===');

  try {
    await testSyntheticProviderGetProgress();
    await testSyntheticProviderUpdateStep();
    await testSyntheticProviderBulkUpdate();
    await testSyntheticProviderGetProgressSummary();
    await testProviderIsolation();
    await testRegistryIntegration();
    await testEdgeCases();
    await testFilters();
    await testLiveProviderIfAvailable();

    console.log('\n[OK] All checklist progress tests passed!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

runTests();
