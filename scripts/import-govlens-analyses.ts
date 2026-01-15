/**
 * Import GovLens Analysis Results into Client Dashboard
 *
 * Reads all *_gap_analysis.json files from GovLens output directory
 * and imports them into the clientPlanAnalysis database table.
 *
 * Run: npx tsx scripts/import-govlens-analyses.ts
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// GovLens output directory
const GOVLENS_OUTPUT_DIR =
  process.env.GOVLENS_OUTPUT_DIR ||
  path.join(process.cwd(), 'data', 'govlens-output');

interface GovLensAnalysis {
  document: {
    filename: string;
    title?: string;
    effective_date?: string;
  };
  analysis: {
    date: string;
    overall_coverage_pct: number;
    overall_liability_score: number;
  };
  summary: {
    total_requirements: number;
    total_gaps: number;
    gaps_by_severity: {
      CRITICAL: number;
      HIGH: number;
      MEDIUM: number;
      LOW: number;
    };
    coverage_by_grade: {
      A: number;
      B: number;
      C: number;
    };
  };
  gaps: Array<{
    policy_code: string;
    policy_name: string;
    severity: string;
    coverage_grade: string;
  }>;
}

async function main() {
  console.log('🚀 Importing GovLens analysis results...\n');

  // 1. Ensure Demo Client tenant and engagement exist
  console.log('🏢 Checking Demo Client tenant...');
  let tenant = await prisma.tenant.findUnique({
    where: { slug: 'demo-client' },
    include: { clientEngagement: true },
  });

  if (!tenant) {
    console.log('   Creating Demo Client tenant...');
    tenant = await prisma.tenant.create({
      data: {
        name: 'Demo Client, Inc.',
        slug: 'demo-client',
        tier: 'BETA',
        status: 'ACTIVE',
        features: {
          maxDocuments: 1000,
          maxUsers: 50,
          aiEnabled: true,
          clientDashboard: true,
        },
        settings: {
          industry: 'Healthcare Distribution',
          branding: {
            primaryColor: '#0066cc',
            secondaryColor: '#003d7a',
          },
        },
      },
      include: { clientEngagement: true },
    });
    console.log(`✅ Created tenant: ${tenant.name}`);
  } else {
    console.log(`✅ Found tenant: ${tenant.name}`);
  }

  // 2. Ensure engagement exists
  let engagement = tenant.clientEngagement;
  if (!engagement) {
    console.log('   Creating client engagement...');
    engagement = await prisma.clientEngagement.create({
      data: {
        tenantId: tenant.id,
        type: 'GAP_ANALYSIS',
        status: 'ACTIVE',
        startDate: new Date('2025-01-01'),
        targetEndDate: new Date('2025-03-31'),
        consultantTeam: [
          { id: 'consultant-1', name: 'Sarah Johnson', role: 'Lead Consultant' },
          { id: 'consultant-2', name: 'Michael Chen', role: 'Governance Specialist' },
        ],
        clientContacts: [
          { name: 'David Miller', title: 'VP Sales Operations', email: 'david.miller@demo-client.com' },
          { name: 'Lisa Wang', title: 'Director Compensation', email: 'lisa.wang@demo-client.com' },
        ],
        brandingConfig: {
          primaryColor: '#0066cc',
          secondaryColor: '#003d7a',
          companyName: 'Demo Client',
        },
        metadata: {
          source: 'GovLens API Analysis',
          importDate: new Date().toISOString(),
        },
      },
    });
    console.log(`✅ Created engagement`);
  } else {
    console.log(`✅ Found engagement: ${engagement.type}`);
  }

  // 3. Read all gap_analysis.json files
  console.log('\n📂 Reading GovLens analysis files...');
  const files = fs.readdirSync(GOVLENS_OUTPUT_DIR)
    .filter(f => f.endsWith('_gap_analysis.json'));

  console.log(`✅ Found ${files.length} analysis files\n`);

  // 4. Import each analysis
  console.log('📊 Importing analyses...');
  let successCount = 0;
  let errorCount = 0;

  for (const file of files) {
    try {
      const filePath = path.join(GOVLENS_OUTPUT_DIR, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const analysis: GovLensAnalysis = JSON.parse(content);

      // Generate plan code from filename
      const planCode = generatePlanCode(file);
      const planName = analysis.document.title || formatPlanName(file);

      // Calculate policy coverage object
      const policyCoverage = buildPolicyCoverage(analysis);

      // Calculate risk score (0-100)
      const riskScore = calculateRiskScore(analysis);

      // Upsert plan analysis
      await prisma.clientPlanAnalysis.upsert({
        where: {
          engagementId_planCode: {
            engagementId: engagement.id,
            planCode,
          },
        },
        update: {
          planName,
          planType: inferPlanType(planName),
          businessUnit: inferBusinessUnit(planName),
          coverageFull: analysis.summary.coverage_by_grade.A || 0,
          coverageLimited: analysis.summary.coverage_by_grade.B || 0,
          coverageNo: analysis.summary.coverage_by_grade.C || 0,
          riskScore,
          policyCoverage,
        },
        create: {
          engagementId: engagement.id,
          planCode,
          planName,
          planType: inferPlanType(planName),
          businessUnit: inferBusinessUnit(planName),
          coverageFull: analysis.summary.coverage_by_grade.A || 0,
          coverageLimited: analysis.summary.coverage_by_grade.B || 0,
          coverageNo: analysis.summary.coverage_by_grade.C || 0,
          riskScore,
          policyCoverage,
        },
      });

      console.log(`   ✓ ${planName}: Coverage ${analysis.analysis.overall_coverage_pct.toFixed(0)}%, Risk ${riskScore}, Gaps ${analysis.summary.total_gaps}`);
      successCount++;
    } catch (error: any) {
      console.error(`   ✗ Failed to import ${file}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\n✅ Import complete: ${successCount} succeeded, ${errorCount} failed\n`);

  // 5. Summary
  const totalPlans = await prisma.clientPlanAnalysis.count({
    where: { engagementId: engagement.id },
  });

  console.log('📈 Summary:');
  console.log(`   Tenant: ${tenant.name}`);
  console.log(`   Total Plans in Database: ${totalPlans}`);
  console.log(`\n🔗 View at: http://localhost:3003/client/demo-client/plans\n`);
}

// Helper Functions

function generatePlanCode(filename: string): string {
  // Remove _gap_analysis.json suffix
  const base = filename.replace('_gap_analysis.json', '');

  // Generate short code from first letters
  const words = base.split(/[\s_-]+/).filter(w => w.length > 0);
  const code = words
    .slice(0, 4)
    .map(w => w[0].toUpperCase())
    .join('');

  return `HS-${code}`;
}

function formatPlanName(filename: string): string {
  // Remove _gap_analysis.json and clean up
  return filename
    .replace('_gap_analysis.json', '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function inferPlanType(planName: string): string {
  const lower = planName.toLowerCase();

  if (lower.includes('sales') || lower.includes('commission') || lower.includes('account representative')) {
    return 'SALES';
  }
  if (lower.includes('executive') || lower.includes('manager')) {
    return 'EXECUTIVE';
  }
  if (lower.includes('service')) {
    return 'SERVICE';
  }

  return 'SALES';
}

function inferBusinessUnit(planName: string): string {
  const lower = planName.toLowerCase();

  if (lower.includes('dental')) return 'Dental';
  if (lower.includes('medical')) return 'Medical';
  if (lower.includes('surgical')) return 'Surgical';
  if (lower.includes('federal')) return 'Federal';
  if (lower.includes('corporate')) return 'Corporate';
  if (lower.includes('athletics') || lower.includes('schools')) return 'Athletics & Schools';
  if (lower.includes('trimed')) return 'TriMed';
  if (lower.includes('hayes')) return 'Hayes';
  if (lower.includes('brasseler')) return 'Brasseler';

  return 'Field Sales';
}

function buildPolicyCoverage(analysis: GovLensAnalysis): any {
  // Group gaps by policy
  const policyCoverageMap = new Map<string, { full: number, limited: number, no: number }>();

  // Initialize all 17 policy areas
  for (let i = 1; i <= 17; i++) {
    const code = `SCP-${String(i).padStart(3, '0')}`;
    policyCoverageMap.set(code, { full: 0, limited: 0, no: 0 });
  }

  // Count gaps by policy and grade
  for (const gap of analysis.gaps) {
    const stats = policyCoverageMap.get(gap.policy_code);
    if (stats) {
      if (gap.coverage_grade === 'A') stats.full++;
      else if (gap.coverage_grade === 'B') stats.limited++;
      else if (gap.coverage_grade === 'C') stats.no++;
    }
  }

  // Convert to policy coverage array
  const policies = Array.from(policyCoverageMap.entries()).map(([code, stats]) => {
    let coverage: 'FULL' | 'LIMITED' | 'NO' = 'NO';

    if (stats.full > 0 && stats.limited === 0 && stats.no === 0) {
      coverage = 'FULL';
    } else if (stats.full > 0 || stats.limited > 0) {
      coverage = 'LIMITED';
    }

    return {
      policyArea: code,
      policyName: getPolicyName(code),
      coverage,
      notes: coverage === 'LIMITED' ? `${stats.full} full, ${stats.limited} partial, ${stats.no} missing` : undefined,
    };
  });

  return { policies };
}

function getPolicyName(code: string): string {
  const policyNames: Record<string, string> = {
    'SCP-001': 'Clawback and Recovery Policy',
    'SCP-002': 'Retroactive Adjustments Policy',
    'SCP-003': 'Territory Change Procedure',
    'SCP-004': 'Quota Relief Policy',
    'SCP-005': '409A Compliance Framework',
    'SCP-006': 'Draw Repayment Terms',
    'SCP-007': 'Credit Allocation Rules',
    'SCP-008': 'Multi-Agent Split Logic',
    'SCP-009': 'New Hire Ramp Rules',
    'SCP-010': 'Plan Change Protocol',
    'SCP-011': 'Dispute Resolution SLA',
    'SCP-012': 'Windfall Deal Policy',
    'SCP-013': 'Payment Timing Guarantee',
    'SCP-014': 'Override Governance',
    'SCP-015': 'Termination Payout Policy',
    'SCP-016': 'Calculation Transparency',
    'SCP-017': 'Plan Document Control',
  };

  return policyNames[code] || code;
}

function calculateRiskScore(analysis: GovLensAnalysis): number {
  // Risk score based on:
  // - Critical gaps: 10 points each
  // - High gaps: 5 points each
  // - Medium gaps: 2 points each
  // - Low gaps: 1 point each

  const { gaps_by_severity } = analysis.summary;

  const score = (
    (gaps_by_severity.CRITICAL || 0) * 10 +
    (gaps_by_severity.HIGH || 0) * 5 +
    (gaps_by_severity.MEDIUM || 0) * 2 +
    (gaps_by_severity.LOW || 0) * 1
  );

  // Cap at 100
  return Math.min(score, 100);
}

// Run import
main()
  .catch((error) => {
    console.error('❌ Import failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
