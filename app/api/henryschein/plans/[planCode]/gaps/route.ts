import { NextRequest, NextResponse } from 'next/server';
import { loadHenryScheinPlan } from '@/lib/data/henryschein-plans';
import { getPolicyByFrameworkArea, extractPurpose, extractKeyProvisions } from '@/lib/data/policy-library';
import fs from 'fs';
import path from 'path';

/**
 * Get governance gap analysis for a specific Henry Schein plan
 * Combines real plan content with policy coverage analysis
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ planCode: string }> }
) {
  try {
    const { planCode } = await params;

    // Load the real plan content
    const plan = loadHenryScheinPlan(planCode);
    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found', planCode },
        { status: 404 }
      );
    }

    // Load gap analysis data
    const gapAnalysisPath = path.join(process.cwd(), 'scripts/output/json-plan-analysis.json');

    if (!fs.existsSync(gapAnalysisPath)) {
      // Return plan with no gap data
      return NextResponse.json({
        plan,
        gapAnalysis: null,
        message: 'Gap analysis not available'
      });
    }

    const gapData = JSON.parse(fs.readFileSync(gapAnalysisPath, 'utf-8'));

    // Find the matching plan in gap analysis
    // Map plan codes to plan names in the analysis
    const planNameMap: Record<string, string | null> = {
      // Medical Division
      'HS-MED-FSC-2025': 'Medical FSC Standard',
      'HS-MED-ISC-2025': 'Medical ISC Standard v3',
      'HS-MED-SGE-2025': 'Medical SGE Bonus',

      // Dental Division
      'HS-DENT-AE-2025': 'Dental AE',
      'HS-DENT-FSC-2025': 'Dental FSC',
      'HS-DENT-EQP-2025': 'Dental Equipment Specialist',
      'HS-DENT-EQP-US-2025': 'Dental Equipment Specialist',
      'HS-DENT-RGM-2025': 'Dental RGM Bonus',

      // Brasseler Dental
      'HS-BRASS-DSM-2025': 'Brasseler DSM I',
      'HS-BRASS-IAM-2025': 'Brasseler IAM',

      // Hayes Medical
      'HS-HAYES-OSR-2025': 'Hayes OSR',

      // TriMed
      'HS-TRIM-ARM-EAST-2025': 'TriMed East Area RM',
      'HS-TRIM-ARM-WEST-2025': 'TriMed West Area RM',

      // HS ONE (no gap analysis yet)
      'HS-HSONE-AE-2025': null,
      'HS-HSONE-SC-2025': null,

      // Corporate Plans (no gap analysis yet)
      'HS-CORP-HSIP-2025': null,
      'HS-CORP-HSIP-OVERVIEW-2025': null,
      'HS-CORP-TSIP-2025': null,
      'HS-COMP-HANDBOOK-2025': null,

      // Archived Plans
      'HS-ATH-REP-2022': null,
      'HS-ZAHN-TM-2023': null,
      'HS-INTL-DE-FAQ-2025': null,
    };

    const planNameInAnalysis = planNameMap[planCode];
    const gapAnalysis = planNameInAnalysis
      ? gapData.plans.find((p: any) => p.planName === planNameInAnalysis)
      : null;

    if (!gapAnalysis) {
      return NextResponse.json({
        plan,
        gapAnalysis: null,
        message: `No gap analysis found for ${planCode}`
      });
    }

    // Map policy coverage to plan sections
    const sectionsWithGaps = plan.sections.map(section => {
      // Try to find matching policy coverage based on section title
      const matchingPolicies = Object.entries(gapAnalysis.policyCoverage || {})
        .filter(([policyName]: [string, any]) => {
          const sectionTitle = section.title.toLowerCase();
          const policy = policyName.toLowerCase();
          // Simple matching - can be improved
          return sectionTitle.includes(policy.split(' ')[0]) ||
                 policy.includes(sectionTitle.split(' ')[0]);
        });

      if (matchingPolicies.length > 0) {
        const [policyName, policyData]: [string, any] = matchingPolicies[0];
        return {
          ...section,
          gapStatus: policyData.coverage, // FULL, LIMITED, NO
          gapDetails: policyData.details,
          policyName,
        };
      }

      // No direct match - mark as complete if section has content
      return {
        ...section,
        gapStatus: section.content ? 'FULL' : 'NO',
        gapDetails: null,
        policyName: null,
      };
    });

    // Get the full governance framework (16 standard policies)
    const standardPolicies = gapData.metadata?.standardPolicyAreas || [
      "Windfall/Large Deals",
      "Quota Management",
      "Territory Management",
      "Sales Crediting",
      "Clawback/Recovery",
      "SPIF Governance",
      "Termination/Final Pay",
      "New Hire/Onboarding",
      "Leave of Absence",
      "Payment Timing",
      "Compliance (409A, State Wage)",
      "Exceptions/Disputes",
      "Data/Systems/Controls",
      "Draws/Guarantees",
      "Mid-Period Changes",
      "International Requirements"
    ];

    // Show all framework policies with their coverage status
    const governancePolicies = standardPolicies.map((policyName: string) => {
      const coverage = gapAnalysis.policyCoverage?.[policyName];

      // Find matching policy template from policy library
      const policyTemplate = getPolicyByFrameworkArea(policyName);

      const isGap = !coverage || coverage.coverage === 'LIMITED' || coverage.coverage === 'NO';

      return {
        id: `policy-${policyName.toLowerCase().replace(/[\s/()]/g, '-')}`,
        sectionNumber: '',
        title: policyName,
        content: coverage?.details || '',
        level: 1,
        category: 'GOVERNANCE_POLICIES',
        gapStatus: coverage?.coverage || 'NO', // If not analyzed, mark as NO coverage
        gapDetails: coverage?.details || `No ${policyName} provisions found in plan document. This policy area requires documentation for full governance compliance.`,
        policyName,
        // Include policy template text for gaps
        draftContent: isGap && policyTemplate ? policyTemplate.content : null,
        draftPurpose: isGap && policyTemplate ? extractPurpose(policyTemplate.content) : null,
        draftKeyProvisions: isGap && policyTemplate ? extractKeyProvisions(policyTemplate.content) : null,
      };
    });

    // Calculate proper stats including all framework policies
    const fullCoverageCount = governancePolicies.filter((p: any) => p.gapStatus === 'FULL').length;
    const limitedCoverageCount = governancePolicies.filter((p: any) => p.gapStatus === 'LIMITED').length;
    const noCoverageCount = governancePolicies.filter((p: any) => p.gapStatus === 'NO').length;

    return NextResponse.json({
      plan: {
        ...plan,
        sections: [...sectionsWithGaps, ...governancePolicies],
      },
      gapAnalysis: {
        planName: gapAnalysis.planName,
        coverageStats: {
          full: fullCoverageCount,
          limited: limitedCoverageCount,
          no: noCoverageCount,
          total: standardPolicies.length,
          percentage: Math.round((fullCoverageCount / standardPolicies.length) * 100),
        },
        totalPolicies: standardPolicies.length,
        frameworkPolicies: standardPolicies,
      },
    });

  } catch (error) {
    console.error('Error loading plan gaps:', error);
    return NextResponse.json(
      { error: 'Failed to load plan gap analysis' },
      { status: 500 }
    );
  }
}
