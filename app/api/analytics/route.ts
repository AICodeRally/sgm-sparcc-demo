import { NextResponse } from 'next/server';
import {
  GOVERNANCE_KPIS,
  APPROVAL_VELOCITY_TREND,
  CASE_VOLUME_BY_TYPE,
  SLA_COMPLIANCE_BY_MODULE,
  RISK_DISTRIBUTION,
  POLICY_COVERAGE_HEALTH,
  TOP_PERFORMERS,
  RECENT_HIGHLIGHTS,
} from '@/lib/data/synthetic/analytics.data';

export async function GET() {
  return NextResponse.json({
    governanceKpis: GOVERNANCE_KPIS,
    approvalVelocityTrend: APPROVAL_VELOCITY_TREND,
    caseVolumeByType: CASE_VOLUME_BY_TYPE,
    slaComplianceByModule: SLA_COMPLIANCE_BY_MODULE,
    riskDistribution: RISK_DISTRIBUTION,
    policyCoverageHealth: POLICY_COVERAGE_HEALTH,
    topPerformers: TOP_PERFORMERS,
    recentHighlights: RECENT_HIGHLIGHTS,
  });
}
