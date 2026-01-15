/**
 * SPM Governance Knowledge Base
 *
 * Real governance knowledge from the Governance Library 2026.
 * This replaces synthetic mock data with actual policy requirements,
 * detection patterns, and remediation templates.
 *
 * Source: <CLIENT_DELIVERY_PACKAGE>/
 *   - requirement_matrix.yaml (55 requirements, 16 policies)
 *   - patch_templates/*.yaml (16 remediation templates)
 */

// ============================================================================
// TYPES
// ============================================================================

export interface PolicyRequirement {
  id: string;
  name: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  weight: number;
  detectionPatterns: string[];
  requiredElements: string[];
  scoring: {
    A: string;
    B: string;
    C: string;
  };
  insertionPoint: string;
  patchTemplateId: string;
}

export interface GovernancePolicy {
  code: string;
  name: string;
  category: string;
  frameworkArea: string;
  status: string;
  version: string;
  description: string;
  relatedPolicies: string[];
  requirements: PolicyRequirement[];
}

export interface RiskTrigger {
  id: string;
  name: string;
  description: string;
  patterns: string[];
  negativeMatch: boolean;
  liabilityImpact: number;
  affectedPolicies: string[];
  jurisdictionMultipliers: Record<string, number>;
}

export interface Jurisdiction {
  code: string;
  name: string;
  baseMultiplier: number;
  wageFlags: string[];
  specificRules: Array<{
    rule: string;
    description: string;
    affectedPolicies: string[];
  }>;
}

export interface PatchTemplate {
  policyCode: string;
  policyName: string;
  requirementId: string;
  requirementName: string;
  severity: string;
  insertionPoint: string;
  fullCoverageLanguage: string;
  stateNotes: Record<string, string>;
}

// ============================================================================
// GOVERNANCE POLICIES (16 total)
// ============================================================================

export const GOVERNANCE_POLICIES: GovernancePolicy[] = [
  {
    code: 'SCP-001',
    name: 'Clawback and Recovery Policy',
    category: 'Financial Controls',
    frameworkArea: 'Clawback/Recovery',
    status: 'DRAFT',
    version: '0.1.0',
    description: 'Establishes the framework for recovering sales compensation payments that were made in error, based on inaccurate data, or where the underlying business transaction has been reversed or cancelled.',
    relatedPolicies: ['SCP-005', 'SCP-006', 'SCP-012'],
    requirements: [
      {
        id: 'R-001-01',
        name: 'Revenue Reversal Clawback',
        description: 'Plan must address clawback for cancelled/reversed transactions',
        severity: 'HIGH',
        weight: 0.30,
        detectionPatterns: ['clawback', 'chargeback', 'recovery', 'reversal.*commission', 'cancellation.*adjust', 'return.*deduct', 'credit memo.*commission'],
        requiredElements: ['triggering_events', 'threshold', 'timing'],
        scoring: {
          A: 'Has explicit clawback with triggers, thresholds, timing, and approval process',
          B: 'Mentions adjustments/chargebacks but lacks formal clawback framework (no thresholds, no timing)',
          C: 'Silent on recovery of overpayments or explicitly prohibits clawback'
        },
        insertionPoint: 'Section: When is Commission Earned OR create new Section: Clawback and Recovery',
        patchTemplateId: 'TPL-001-01'
      },
      {
        id: 'R-001-02',
        name: 'Approval Authority Matrix',
        description: 'Clawback amounts require tiered approval based on dollar value',
        severity: 'MEDIUM',
        weight: 0.25,
        detectionPatterns: ['approval.*clawback', 'authorize.*recovery', 'manager.*approve', 'VP.*approve', 'CRB.*review'],
        requiredElements: ['approval_tiers', 'approval_roles'],
        scoring: {
          A: 'Explicit approval matrix by dollar threshold with named roles',
          B: 'Mentions management approval required but no specific tiers or thresholds',
          C: 'No approval requirement stated for clawbacks'
        },
        insertionPoint: 'Within clawback section, after triggering events',
        patchTemplateId: 'TPL-001-02'
      },
      {
        id: 'R-001-03',
        name: 'Recovery Mechanism',
        description: 'Defines method of recovering overpaid commissions with limits',
        severity: 'HIGH',
        weight: 0.25,
        detectionPatterns: ['payroll deduction', 'offset.*future.*commission', 'repayment.*plan', 'deduct.*next.*payment', 'recovery.*mechanism'],
        requiredElements: ['max_deduction_rate', 'notice_period', 'recovery_timeline'],
        scoring: {
          A: 'Explicit recovery method with percentage limits, notice period, and timeline',
          B: "Says 'company may deduct' or 'offset from future' without limits or notice",
          C: "No recovery mechanism defined or only says 'immediate repayment required'"
        },
        insertionPoint: 'Section: Draw Payments or within Clawback section',
        patchTemplateId: 'TPL-001-03'
      },
      {
        id: 'R-001-04',
        name: 'Appeals Process',
        description: 'Employee right to dispute clawback with defined process',
        severity: 'MEDIUM',
        weight: 0.20,
        detectionPatterns: ['appeal.*clawback', 'dispute.*recovery', 'contest.*deduction', 'review.*clawback', 'challenge.*recovery'],
        requiredElements: ['appeal_timeline', 'review_body', 'decision_timeline'],
        scoring: {
          A: 'Formal appeals process with timeline, review body, and decision commitment',
          B: 'General dispute language exists but not specific to clawback appeals',
          C: "No appeals right for clawbacks or states 'decisions are final'"
        },
        insertionPoint: 'Within clawback section, at end',
        patchTemplateId: 'TPL-001-04'
      }
    ]
  },
  {
    code: 'SCP-002',
    name: 'Quota Management Policy',
    category: 'Performance Management',
    frameworkArea: 'Quota Management',
    status: 'DRAFT',
    version: '0.1.0',
    description: 'Establishes a standardized framework for setting, managing, and adjusting sales quotas. Ensures quotas are fair, achievable, aligned with business objectives, and consistently applied.',
    relatedPolicies: ['SCP-010', 'SCP-014'],
    requirements: [
      {
        id: 'R-002-01',
        name: 'Quota Setting Methodology',
        description: 'Documented approach to setting quotas with defined factors',
        severity: 'MEDIUM',
        weight: 0.25,
        detectionPatterns: ['quota.*methodology', 'quota.*setting.*process', 'territory potential', 'historical performance', 'quota.*calculation', 'quota.*factors'],
        requiredElements: ['factors', 'weights', 'data_sources'],
        scoring: {
          A: 'Multi-factor methodology with weights and data sources documented',
          B: "Quotas mentioned but methodology not explained or vague reference to 'analysis'",
          C: "Quotas assigned without methodology disclosure or 'determined by management'"
        },
        insertionPoint: 'New Section: Quota Setting Methodology',
        patchTemplateId: 'TPL-002-01'
      },
      {
        id: 'R-002-02',
        name: 'Mid-Year Adjustment Governance',
        description: 'Approval thresholds and governance for quota changes during plan year',
        severity: 'HIGH',
        weight: 0.30,
        detectionPatterns: ['quota.*change.*approval', 'quota.*adjustment.*requires', 'mid-year.*quota', 'quota.*modification'],
        requiredElements: ['approval_tiers', 'qualifying_triggers', 'non_qualifying_reasons'],
        scoring: {
          A: 'Approval tiers by magnitude with qualifying and non-qualifying triggers defined',
          B: 'Mentions changes possible with approval but no specific governance framework',
          C: "Silent on quota changes OR says 'change anytime at sole discretion'"
        },
        insertionPoint: 'Section: Modifications to Plan or new Quota Governance section',
        patchTemplateId: 'TPL-002-02'
      }
    ]
  },
  {
    code: 'SCP-003',
    name: 'Windfall and Large Deal Policy',
    category: 'Deal Governance',
    frameworkArea: 'Windfall/Large Deals',
    status: 'DRAFT',
    version: '0.1.0',
    description: 'Establishes governance and treatment guidelines for windfall sales transactions and unusually large deals that have the potential to create disproportionate compensation outcomes.',
    relatedPolicies: ['SCP-007'],
    requirements: [
      {
        id: 'R-003-01',
        name: 'Windfall Triggers Definition',
        description: 'Quantified criteria for what constitutes a windfall/large deal',
        severity: 'HIGH',
        weight: 0.35,
        detectionPatterns: ['windfall', 'large deal', 'exceptional.*transaction', 'disproportionate.*commission', 'single deal.*quota'],
        requiredElements: ['transaction_threshold', 'commission_threshold', 'quota_threshold'],
        scoring: {
          A: 'Explicit windfall criteria with multiple quantified triggers',
          B: 'Large deal mentioned or single cap but no comprehensive triggers',
          C: 'No windfall definition or triggers'
        },
        insertionPoint: 'New Section: Large Deal Governance',
        patchTemplateId: 'TPL-003-01'
      },
      {
        id: 'R-003-02',
        name: 'CRB Review Requirement',
        description: 'Formal review body oversight of windfall deals',
        severity: 'HIGH',
        weight: 0.35,
        detectionPatterns: ['CRB.*review', 'Compensation Review Board', 'executive.*review.*large', 'special.*approval.*deal', 'committee.*review'],
        requiredElements: ['review_body', 'review_timeline', 'documentation'],
        scoring: {
          A: 'CRB review required with timeline, documentation requirements, and decision authority',
          B: "Management discretion mentioned or 'may be reviewed' language",
          C: 'No review requirement for large deals'
        },
        insertionPoint: 'Within windfall section',
        patchTemplateId: 'TPL-003-02'
      }
    ]
  },
  {
    code: 'SCP-005',
    name: 'Section 409A Compliance Policy',
    category: 'Legal Compliance',
    frameworkArea: 'Compliance (409A, State Wage)',
    status: 'DRAFT',
    version: '0.1.0',
    description: 'Establishes compliance standards and procedures for Internal Revenue Code Section 409A, which governs deferred compensation arrangements.',
    relatedPolicies: ['SCP-011', 'SCP-006'],
    requirements: [
      {
        id: 'R-005-01',
        name: 'Short-Term Deferral Safe Harbor',
        description: 'Payment timing complies with 2.5-month rule (March 15)',
        severity: 'CRITICAL',
        weight: 0.40,
        detectionPatterns: ['409A', 'short.term deferral', 'March 15', '2.5 months', '2½ months', 'short-term deferral'],
        requiredElements: ['payment_deadline', 'safe_harbor_reference'],
        scoring: {
          A: 'Explicit 409A language with short-term deferral safe harbor timing confirmed',
          B: 'Payment timing exists that would satisfy safe harbor but no 409A reference',
          C: 'No 409A compliance language or payment timing may violate safe harbor'
        },
        insertionPoint: 'Section: Standard Terms and Conditions or Payment of Commissions',
        patchTemplateId: 'TPL-005-01'
      },
      {
        id: 'R-005-02',
        name: '409A Savings Clause',
        description: 'Protection language ensuring plan construed for 409A compliance',
        severity: 'CRITICAL',
        weight: 0.35,
        detectionPatterns: ['409A.*compliance', 'construed.*409A', 'limited.*409A', 'interpreted.*409A', 'conform.*409A', 'exempt.*409A'],
        requiredElements: ['savings_language', 'amendment_authority'],
        scoring: {
          A: 'Explicit 409A savings clause with amendment authority for compliance',
          B: 'General legal compliance language not specific to 409A',
          C: 'No savings clause or 409A compliance language'
        },
        insertionPoint: 'Section: Standard Terms and Conditions',
        patchTemplateId: 'TPL-005-02'
      }
    ]
  },
  {
    code: 'SCP-006',
    name: 'State Wage Law Compliance Policy',
    category: 'Legal Compliance',
    frameworkArea: 'Compliance (409A, State Wage)',
    status: 'DRAFT',
    version: '0.1.0',
    description: 'Establishes compliance requirements for state wage and hour laws, particularly California Labor Code Section 2751 and multi-state final payment requirements.',
    relatedPolicies: ['SCP-012', 'SCP-001', 'SCP-008'],
    requirements: [
      {
        id: 'R-006-01',
        name: 'California Written Agreement Requirement',
        description: 'Compliance with CA Labor Code Section 2751',
        severity: 'CRITICAL',
        weight: 0.35,
        detectionPatterns: ['California', 'Labor Code', 'written.*agreement', '§2751', '2751', 'commission agreement'],
        requiredElements: ['written_agreement_language', 'labor_code_reference', 'participant_acknowledgment'],
        scoring: {
          A: 'Explicit CA written agreement requirement with Labor Code §2751 reference',
          B: 'Has acknowledgment but no CA-specific language or Labor Code reference',
          C: 'No California compliance provisions or written agreement requirement'
        },
        insertionPoint: 'Section: Acknowledgement or new Section: State Compliance',
        patchTemplateId: 'TPL-006-01'
      },
      {
        id: 'R-006-02',
        name: 'Final Payment Timing by State',
        description: 'State-specific final payment timing upon termination',
        severity: 'CRITICAL',
        weight: 0.35,
        detectionPatterns: ['final.*payment.*state', 'termination.*payment.*California', 'final.*pay.*72 hours', 'immediate.*payment.*termination', 'state.*law.*final'],
        requiredElements: ['ca_involuntary', 'ca_voluntary', 'state_matrix'],
        scoring: {
          A: 'State-specific final payment timing matrix with CA immediate/72-hour rules',
          B: 'Final payment mentioned but no state-specific timing or only partial',
          C: "No final payment timing provisions or 'per standard payroll'"
        },
        insertionPoint: 'Section: Payment Upon Termination',
        patchTemplateId: 'TPL-006-02'
      }
    ]
  },
  {
    code: 'SCP-007',
    name: 'Sales Crediting Policy',
    category: 'Commission Rules',
    frameworkArea: 'Sales Crediting',
    status: 'FINAL',
    version: '1.0.0',
    description: 'Establishes rules for crediting sales to representatives, including territory ownership, split credit scenarios, and team selling provisions.',
    relatedPolicies: ['SCP-014', 'SCP-003'],
    requirements: [
      {
        id: 'R-007-01',
        name: 'Territory-Based Crediting Rules',
        description: 'Primary crediting based on territory/account ownership',
        severity: 'HIGH',
        weight: 0.30,
        detectionPatterns: ['territory.*credit', 'account.*owner', 'assigned.*territory', 'coded.*territory', 'territory.*commission'],
        requiredElements: ['primary_rule', 'ownership_definition'],
        scoring: {
          A: 'Clear territory-based crediting with ownership definition and system of record',
          B: "Territory mentioned but crediting rules unclear or 'as determined by management'",
          C: 'No territory-based crediting rules or ownership undefined'
        },
        insertionPoint: 'Section: Definitions or new Sales Crediting section',
        patchTemplateId: 'TPL-007-01'
      },
      {
        id: 'R-007-02',
        name: 'Split Credit Governance',
        description: 'Rules and approval for split credit scenarios',
        severity: 'MEDIUM',
        weight: 0.25,
        detectionPatterns: ['split.*credit', 'shared.*commission', 'team.*selling', 'multi.*rep', 'collaboration.*credit'],
        requiredElements: ['split_scenarios', 'split_percentages', 'approval_required'],
        scoring: {
          A: 'Split credit scenarios defined with percentages and approval process',
          B: 'Splits mentioned but rules incomplete or no approval process',
          C: 'No split credit provisions'
        },
        insertionPoint: 'Within crediting section',
        patchTemplateId: 'TPL-007-02'
      }
    ]
  },
  {
    code: 'SCP-008',
    name: 'Draws and Guarantees Policy',
    category: 'Financial Controls',
    frameworkArea: 'Draws/Guarantees',
    status: 'FINAL',
    version: '1.0.0',
    description: 'Establishes standards for recoverable and non-recoverable draws, guarantee periods, and repayment terms.',
    relatedPolicies: ['SCP-001', 'SCP-006', 'SCP-012'],
    requirements: [
      {
        id: 'R-008-01',
        name: 'Draw Type Classification',
        description: 'Clear distinction between recoverable and non-recoverable draws',
        severity: 'HIGH',
        weight: 0.35,
        detectionPatterns: ['recoverable.*draw', 'non-recoverable', 'guarantee', 'draw.*type', 'repayment.*draw'],
        requiredElements: ['draw_types', 'default_type'],
        scoring: {
          A: 'Clear classification of draw types with definitions and default specified',
          B: 'Draw mentioned but type unclear or only one type defined',
          C: "No draw classification or 'draw against commissions' without detail"
        },
        insertionPoint: 'Section: Draw Payments',
        patchTemplateId: 'TPL-008-01'
      }
    ]
  },
  {
    code: 'SCP-009',
    name: 'Leave of Absence Policy',
    category: 'HR Policies',
    frameworkArea: 'Leave of Absence',
    status: 'FINAL',
    version: '1.0.0',
    description: 'Establishes treatment of sales compensation during leaves of absence, including FMLA, military, disability, and parental leave.',
    relatedPolicies: ['SCP-002', 'SCP-012'],
    requirements: [
      {
        id: 'R-009-01',
        name: 'FMLA Compliance',
        description: 'FMLA-compliant treatment of compensation during protected leave',
        severity: 'CRITICAL',
        weight: 0.35,
        detectionPatterns: ['FMLA', 'Family.*Medical.*Leave', 'protected.*leave', 'qualifying.*leave'],
        requiredElements: ['fmla_reference', 'protected_treatment'],
        scoring: {
          A: 'Explicit FMLA compliance language with protected treatment defined',
          B: 'Leave mentioned but no FMLA-specific language or may conflict',
          C: "No FMLA provisions or 'must be employed' conflicts with FMLA"
        },
        insertionPoint: 'Section: Leave of Absence',
        patchTemplateId: 'TPL-009-01'
      }
    ]
  },
  {
    code: 'SCP-010',
    name: 'Mid-Period Change Policy',
    category: 'Plan Administration',
    frameworkArea: 'Mid-Period Changes',
    status: 'FINAL',
    version: '1.0.0',
    description: 'Establishes governance for changes to compensation plans during the performance period, including notification and pro-ration requirements.',
    relatedPolicies: ['SCP-002'],
    requirements: [
      {
        id: 'R-010-01',
        name: 'Change Approval Thresholds',
        description: 'Approval levels based on change impact magnitude',
        severity: 'HIGH',
        weight: 0.40,
        detectionPatterns: ['change.*approval', 'modification.*requires', 'plan.*change.*approve'],
        requiredElements: ['approval_tiers', 'impact_calculation'],
        scoring: {
          A: 'Tiered approval thresholds by impact magnitude with calculation method',
          B: 'Approval mentioned but no tiers or impact-based governance',
          C: "No change approval requirements or 'change anytime at sole discretion'"
        },
        insertionPoint: 'Section: Modifications to Plan',
        patchTemplateId: 'TPL-010-01'
      },
      {
        id: 'R-010-02',
        name: 'Advance Notice Requirement',
        description: 'Required notice period before changes take effect',
        severity: 'HIGH',
        weight: 0.35,
        detectionPatterns: ['notice.*change', 'advance.*notification', 'days.*notice', 'prior.*notice'],
        requiredElements: ['notice_period', 'notice_method'],
        scoring: {
          A: 'Specific advance notice period with method defined',
          B: "Notice 'will be provided' without specific period",
          C: "No notice requirement or 'effective immediately'"
        },
        insertionPoint: 'Section: Modifications to Plan',
        patchTemplateId: 'TPL-010-02'
      }
    ]
  },
  {
    code: 'SCP-011',
    name: 'Payment Timing Policy',
    category: 'Payroll',
    frameworkArea: 'Payment Timing',
    status: 'FINAL',
    version: '1.0.0',
    description: 'Establishes standards for commission payment schedules, data cut-off dates, and statement delivery.',
    relatedPolicies: ['SCP-005', 'SCP-012'],
    requirements: [
      {
        id: 'R-011-01',
        name: 'Payment Schedule Definition',
        description: 'Specific payment dates by plan type',
        severity: 'HIGH',
        weight: 0.40,
        detectionPatterns: ['payment.*schedule', 'paid.*monthly', 'paid.*quarterly', 'commission.*date', 'pay.*date'],
        requiredElements: ['payment_frequency', 'specific_dates', 'payment_calendar'],
        scoring: {
          A: 'Specific payment dates with full calendar for the year',
          B: "Frequency defined but no specific dates (e.g., 'monthly')",
          C: "No payment schedule or 'per standard payroll'"
        },
        insertionPoint: 'Section: Payment of Commissions',
        patchTemplateId: 'TPL-011-01'
      }
    ]
  },
  {
    code: 'SCP-012',
    name: 'Termination and Final Pay Policy',
    category: 'HR Policies',
    frameworkArea: 'Termination/Final Pay',
    status: 'FINAL',
    version: '1.0.0',
    description: 'Establishes treatment of sales compensation upon termination of employment, including final payment timing and earned commission rules.',
    relatedPolicies: ['SCP-006', 'SCP-008', 'SCP-001'],
    requirements: [
      {
        id: 'R-012-01',
        name: 'Termination Type Distinctions',
        description: 'Different treatment for voluntary, involuntary, and for-cause termination',
        severity: 'CRITICAL',
        weight: 0.35,
        detectionPatterns: ['voluntary.*termination', 'involuntary.*termination', 'for.*cause', 'resignation', 'termination.*type'],
        requiredElements: ['voluntary_treatment', 'involuntary_treatment', 'for_cause_treatment'],
        scoring: {
          A: 'Distinct treatment for voluntary, involuntary, and for-cause with specifics',
          B: 'Termination mentioned but no distinction between types',
          C: 'No termination type distinctions'
        },
        insertionPoint: 'Section: Payment Upon Termination',
        patchTemplateId: 'TPL-012-01'
      }
    ]
  },
  {
    code: 'SCP-014',
    name: 'Territory Management Policy',
    category: 'Territory Rules',
    frameworkArea: 'Territory Management',
    status: 'FINAL',
    version: '1.0.0',
    description: 'Establishes rules for territory assignment, changes, and coverage.',
    relatedPolicies: ['SCP-007', 'SCP-002'],
    requirements: [
      {
        id: 'R-014-01',
        name: 'Territory Assignment Rules',
        description: 'How territories are assigned and documented',
        severity: 'MEDIUM',
        weight: 0.35,
        detectionPatterns: ['territory.*assign', 'territory.*ownership', 'account.*assignment', 'territory.*definition'],
        requiredElements: ['assignment_method', 'system_of_record'],
        scoring: {
          A: 'Territory assignment rules with system of record defined',
          B: 'Territories mentioned but assignment method unclear',
          C: 'No territory assignment rules'
        },
        insertionPoint: 'Section: Definitions or new Territory section',
        patchTemplateId: 'TPL-014-01'
      }
    ]
  },
  {
    code: 'SCP-015',
    name: 'Exception and Dispute Resolution Policy',
    category: 'Governance',
    frameworkArea: 'Exceptions/Disputes',
    status: 'FINAL',
    version: '1.0.0',
    description: 'Establishes processes for handling exceptions to policy and resolving compensation disputes.',
    relatedPolicies: ['SCP-001'],
    requirements: [
      {
        id: 'R-015-01',
        name: 'Dispute Filing Process',
        description: 'How employees raise compensation disputes',
        severity: 'HIGH',
        weight: 0.40,
        detectionPatterns: ['dispute.*process', 'dispute.*raise', 'question.*commission', 'challenge.*calculation'],
        requiredElements: ['filing_timeline', 'filing_method'],
        scoring: {
          A: 'Clear dispute filing process with timeline and method',
          B: 'Can raise concerns but no formal process',
          C: "No dispute process or 'not subject to review'"
        },
        insertionPoint: 'New Section: Dispute Resolution',
        patchTemplateId: 'TPL-015-01'
      },
      {
        id: 'R-015-02',
        name: 'Escalation Path',
        description: 'Multi-level escalation for unresolved disputes',
        severity: 'MEDIUM',
        weight: 0.30,
        detectionPatterns: ['escalat', 'appeal', 'next level', 'review committee'],
        requiredElements: ['escalation_levels', 'timeline_per_level'],
        scoring: {
          A: 'Multi-level escalation with timelines per level',
          B: 'Escalation mentioned but levels/timelines unclear',
          C: 'No escalation path'
        },
        insertionPoint: 'Section: Dispute Resolution',
        patchTemplateId: 'TPL-015-02'
      }
    ]
  },
  {
    code: 'SCP-016',
    name: 'New Hire and Onboarding Policy',
    category: 'HR Policies',
    frameworkArea: 'New Hire/Onboarding',
    status: 'FINAL',
    version: '1.0.0',
    description: 'Establishes compensation treatment for new hires including ramp periods, guarantees, and plan assignment.',
    relatedPolicies: ['SCP-008'],
    requirements: [
      {
        id: 'R-016-01',
        name: 'Ramp Period Definition',
        description: 'How new hire ramp periods work',
        severity: 'MEDIUM',
        weight: 0.50,
        detectionPatterns: ['ramp.*period', 'new.*hire.*ramp', 'onboarding.*compensation', 'first.*months'],
        requiredElements: ['ramp_duration', 'ramp_treatment'],
        scoring: {
          A: 'Ramp period defined with duration and treatment',
          B: 'Ramp mentioned but details incomplete',
          C: 'No ramp period provisions'
        },
        insertionPoint: 'New Section: New Hire Provisions',
        patchTemplateId: 'TPL-016-01'
      }
    ]
  }
];

// ============================================================================
// RISK TRIGGERS (8 total)
// ============================================================================

export const RISK_TRIGGERS: RiskTrigger[] = [
  {
    id: 'RT-001',
    name: 'Retro/Discretion Posture',
    description: 'Broad discretionary language that allows retroactive changes without participant protection. Increases enforceability risk and perceived unfairness.',
    patterns: ['change.*cancel.*at any time', 'sole discretion', 'not subject to review.*court', 'company reserves the right', 'may.*modify.*without notice', 'management.*discretion'],
    negativeMatch: false,
    liabilityImpact: 1,
    affectedPolicies: ['SCP-002', 'SCP-010', 'SCP-015'],
    jurisdictionMultipliers: { CA: 1.3, NY: 1.2, DEFAULT: 1.0 }
  },
  {
    id: 'RT-002',
    name: 'Earned-After-Deductions',
    description: 'Commission is defined as "earned only after" deductions are subtracted. In California, commissions are earned when the deal closes, not after deductions. Creates significant wage claim risk.',
    patterns: ['earned only after', 'deemed earned.*subtracted', 'before.*commission is deemed earned', 'commission.*earned.*after.*deduct', 'not earned until.*deduct'],
    negativeMatch: false,
    liabilityImpact: 2,
    affectedPolicies: ['SCP-006', 'SCP-001'],
    jurisdictionMultipliers: { CA: 2.0, NY: 1.5, DEFAULT: 1.0 }
  },
  {
    id: 'RT-003',
    name: 'Recoverable Draw with Termination/Death Repayment',
    description: 'Recoverable draw that requires repayment upon termination or death. Creates high risk under state wage laws, particularly California where deductions from final pay have strict limits.',
    patterns: ['recoverable draw', 'pay back.*overdraw', 'repayment.*termination', 'overdraw.*death', 'repay.*separation', 'balance due.*termination'],
    negativeMatch: false,
    liabilityImpact: 2,
    affectedPolicies: ['SCP-006', 'SCP-008', 'SCP-012'],
    jurisdictionMultipliers: { CA: 2.0, NY: 1.5, DEFAULT: 1.0 }
  },
  {
    id: 'RT-004',
    name: 'AR Deductions from Commissions',
    description: 'Accounts receivable deductions from commissions based on unpaid invoices. May conflict with earned commission principles in some states.',
    patterns: ['AR.*deduct', 'unpaid invoice.*subtract', 'accounts receivable.*commission', 'past due.*deduct', 'collection.*deduct'],
    negativeMatch: false,
    liabilityImpact: 1,
    affectedPolicies: ['SCP-001', 'SCP-006'],
    jurisdictionMultipliers: { CA: 1.5, NY: 1.2, DEFAULT: 1.0 }
  },
  {
    id: 'RT-005',
    name: 'No Dispute Timeline',
    description: 'Absence of a defined timeline for raising disputes. Indicates lack of formal dispute resolution process.',
    patterns: ['dispute.*\\d+.*days', 'appeal.*\\d+.*days', 'raise.*concern.*within'],
    negativeMatch: true,
    liabilityImpact: 1,
    affectedPolicies: ['SCP-015'],
    jurisdictionMultipliers: { CA: 1.2, DEFAULT: 1.0 }
  },
  {
    id: 'RT-006',
    name: 'Spiff/Bonus Employment Requirement',
    description: 'Requirement to be employed at payment date to receive SPIFs or bonuses. May conflict with state laws regarding earned compensation and FMLA protections.',
    patterns: ['must be employed.*spiff', 'employed at.*time.*award', 'must be employed.*bonus', 'employed.*payment.*date', 'actively employed.*receive'],
    negativeMatch: false,
    liabilityImpact: 1,
    affectedPolicies: ['SCP-009', 'SCP-012'],
    jurisdictionMultipliers: { CA: 1.5, DEFAULT: 1.0 }
  },
  {
    id: 'RT-007',
    name: 'Unlimited Cap / No Accelerator Limit',
    description: 'Stacking premiums or accelerators without a cap. Creates windfall risk and potential budget overruns.',
    patterns: ['no.*cap', 'unlimited.*earning', 'no.*maximum'],
    negativeMatch: false,
    liabilityImpact: 1,
    affectedPolicies: ['SCP-003'],
    jurisdictionMultipliers: { DEFAULT: 1.0 }
  },
  {
    id: 'RT-008',
    name: 'Management Discretion on Crediting',
    description: 'Crediting determined by "management" or "company" without clear rules. Creates dispute risk and perceived unfairness.',
    patterns: ['determined by management', 'as.*company.*determines', 'at.*discretion.*management', 'management.*assign'],
    negativeMatch: false,
    liabilityImpact: 1,
    affectedPolicies: ['SCP-007', 'SCP-014'],
    jurisdictionMultipliers: { DEFAULT: 1.0 }
  }
];

// ============================================================================
// JURISDICTIONS (6 total)
// ============================================================================

export const JURISDICTIONS: Jurisdiction[] = [
  {
    code: 'CA',
    name: 'California',
    baseMultiplier: 1.5,
    wageFlags: ['final_pay_immediate', 'written_agreement_required', 'deduction_consent_strict', 'earned_on_close_not_payment', 'clawback_limits', 'waiting_time_penalties', 'itemized_statement_required'],
    specificRules: [
      { rule: 'Labor Code §2751', description: 'Written commission agreement required', affectedPolicies: ['SCP-006'] },
      { rule: 'Labor Code §201/202', description: 'Final pay timing requirements', affectedPolicies: ['SCP-006', 'SCP-012'] },
      { rule: 'Labor Code §224', description: 'Written deduction authorization required', affectedPolicies: ['SCP-001', 'SCP-008'] }
    ]
  },
  {
    code: 'NY',
    name: 'New York',
    baseMultiplier: 1.2,
    wageFlags: ['final_pay_next_payday', 'deduction_consent_required', 'commission_agreement_recommended'],
    specificRules: [
      { rule: 'NY Labor Law §191', description: 'Timely payment requirements', affectedPolicies: ['SCP-006', 'SCP-011'] }
    ]
  },
  {
    code: 'TX',
    name: 'Texas',
    baseMultiplier: 1.0,
    wageFlags: ['at_will_strong', 'limited_deduction_restrictions'],
    specificRules: []
  },
  {
    code: 'IL',
    name: 'Illinois',
    baseMultiplier: 1.1,
    wageFlags: ['final_pay_next_payday', 'deduction_consent_required'],
    specificRules: [
      { rule: '820 ILCS 115', description: 'Wage Payment and Collection Act', affectedPolicies: ['SCP-006', 'SCP-012'] }
    ]
  },
  {
    code: 'MA',
    name: 'Massachusetts',
    baseMultiplier: 1.2,
    wageFlags: ['strict_wage_laws', 'commission_protection'],
    specificRules: [
      { rule: 'M.G.L. c. 149 §148', description: 'Wage Act provisions', affectedPolicies: ['SCP-006'] }
    ]
  },
  {
    code: 'DEFAULT',
    name: 'Other States',
    baseMultiplier: 1.0,
    wageFlags: [],
    specificRules: []
  }
];

// ============================================================================
// PATCH TEMPLATES (key remediation examples)
// ============================================================================

export const PATCH_TEMPLATES: PatchTemplate[] = [
  {
    policyCode: 'SCP-001',
    policyName: 'Clawback and Recovery Policy',
    requirementId: 'R-001-01',
    requirementName: 'Revenue Reversal Clawback',
    severity: 'HIGH',
    insertionPoint: 'Section: When is Commission Earned',
    fullCoverageLanguage: `**CLAWBACK AND RECOVERY PROVISION**

Commission payments are subject to adjustment or recovery ("clawback") under the following circumstances:

1. **Triggering Events**: Commission clawback applies when:
   - Customer cancels order within [90/120/180] days of invoice
   - Customer returns product for refund or credit
   - Revenue is reversed due to billing error, dispute, or chargeback
   - Order is determined to be fraudulent or in violation of company policy
   - Customer fails to pay within [60/90/120] days of invoice due date

2. **Clawback Calculation**:
   - For full cancellations/returns: 100% of commission paid on the affected transaction
   - For partial returns: Pro-rata reduction based on returned value
   - For payment defaults: Commission recovered after [90/120] days past due

3. **Timing of Recovery**:
   - Clawback amounts will be deducted from the next available commission payment
   - If insufficient future commissions, balance may be carried forward for up to [12] months
   - In no event shall recovery reduce current period payment below minimum wage equivalents

4. **Notice Requirements**:
   - Employee will be notified in writing within [30] days of triggering event
   - Notification will include: original transaction, amount subject to recovery, recovery timing, and dispute process

5. **Dispute Process**:
   - Employee may dispute clawback determination within [15] business days of notice
   - Disputes reviewed by [Sales Operations / Compensation Committee]
   - Decision rendered within [10] business days of dispute filing

6. **Limitations**:
   - No clawback for events occurring more than [12/18/24] months after commission payment
   - Clawback does not apply to performance bonuses already paid and vested
   - Terminal pay subject to [STATE]-specific regulations`,
    stateNotes: {
      CA: 'California Labor Code §201-203 requires all earned wages (including commissions) be paid upon termination. Clawback of previously paid commissions from final paycheck may be prohibited. Consult legal counsel for terminal pay scenarios.',
      NY: 'New York Labor Law §191 requires timely payment of commissions. Recovery mechanisms must not reduce pay below minimum wage and must comply with written agreement requirements.'
    }
  },
  {
    policyCode: 'SCP-006',
    policyName: 'State Wage Law Compliance Policy',
    requirementId: 'R-006-01',
    requirementName: 'CA Labor Code 2751 Compliance',
    severity: 'CRITICAL',
    insertionPoint: 'Plan Document Header / Signature Section',
    fullCoverageLanguage: `**CALIFORNIA LABOR CODE §2751 COMPLIANCE**

This compensation plan constitutes a written agreement setting forth the method by which commissions shall be computed and paid, as required by California Labor Code Section 2751.

**REQUIRED DISCLOSURES FOR CALIFORNIA EMPLOYEES:**

1. **Method of Computation**:
   - Commissions are calculated as described in Section [X] of this plan
   - Rate(s): [Specify all applicable rates]
   - Calculation formula: [Describe formula]
   - Crediting rules: [When revenue is credited to employee]

2. **Payment Timing**:
   - Commissions are paid on a [monthly] basis
   - Payment date: [Specify day of month]
   - Commissions for any given period paid within [XX] days of period close

3. **Definitions**:
   - "Earned" means: [Define when commission is considered earned]
   - "Commissionable Revenue" means: [Define what revenue qualifies]

**ACKNOWLEDGMENT (California Employees)**:

I acknowledge that I have received a copy of this compensation plan, which sets forth the method by which my commissions will be computed and paid. I understand the terms of this plan and agree to its provisions.

Employee Signature: ___________________________ Date: ___________
Printed Name: ________________________________ Employee ID: ______

A signed copy of this acknowledgment will be provided to the employee.`,
    stateNotes: {
      CA: 'CRITICAL: California Labor Code §2751 requires a SIGNED written agreement describing the method of computing and paying commissions. Failure to comply may result in waiting time penalties under LC §§201-203 (up to 30 days wages).',
      NY: 'New York Labor Law §191 requires commission salespeople be paid per written agreement terms. Employers must provide written notice of commission terms at hiring and obtain signed acknowledgment within 10 days.',
      MA: 'Massachusetts General Laws c.149 §148 requires all earned wages, including commissions, be paid on final day of employment for both voluntary and involuntary terminations.'
    }
  },
  {
    policyCode: 'SCP-006',
    policyName: 'State Wage Law Compliance Policy',
    requirementId: 'R-006-02',
    requirementName: 'Final Pay Timing Provisions',
    severity: 'CRITICAL',
    insertionPoint: 'Section: Termination of Employment',
    fullCoverageLanguage: `**FINAL PAY AND COMMISSION SETTLEMENT**

Upon termination of employment (voluntary or involuntary), the following provisions apply to unpaid commissions:

1. **Timing of Final Commission Payment**:

   | State | Voluntary Resignation | Involuntary Termination |
   |-------|----------------------|------------------------|
   | California | Within 72 hours (if <72 hrs notice) or final day (if ≥72 hrs notice) | Final day of employment |
   | New York | Next regular payday | Next regular payday |
   | Illinois | Next regular payday | Next regular payday |
   | Massachusetts | Final day of employment | Final day of employment |
   | All Others | Within [10] days or next regular payday |

2. **Earned Commission Calculation**:
   - All commissions earned through last day of employment will be paid
   - "Earned" defined per plan terms and applicable state law
   - Disputes regarding earned status resolved per dispute policy

3. **Pending Transactions**:
   - Transactions closed but not yet invoiced: Paid on normal schedule
   - Transactions in pipeline: Not paid (unless plan provides otherwise)
   - Multi-year contracts: Paid only for fulfilled portion as of termination

4. **Clawback Limitations**:
   - No clawback from final paycheck except as permitted by law
   - California: Clawback from final pay generally prohibited
   - Other states: Per plan terms with proper written authorization

5. **Documentation**:
   - Final commission statement provided with last payment
   - Includes: All transactions, adjustments, and final balance
   - Copy retained in employee file for [7] years`,
    stateNotes: {
      CA: 'Final pay for terminated employees must include all earned commissions. For employees who quit: within 72 hours (or immediately if 72+ hours notice). For employees terminated: immediately on final day.',
      NY: 'New York requires final pay on the next regular payday.',
      MA: 'Massachusetts requires all earned wages on final day for both voluntary and involuntary terminations.'
    }
  }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getPolicyByCode(code: string): GovernancePolicy | undefined {
  return GOVERNANCE_POLICIES.find(p => p.code === code);
}

export function getRequirementById(id: string): PolicyRequirement | undefined {
  for (const policy of GOVERNANCE_POLICIES) {
    const req = policy.requirements.find(r => r.id === id);
    if (req) return req;
  }
  return undefined;
}

export function getPoliciesByCategory(category: string): GovernancePolicy[] {
  return GOVERNANCE_POLICIES.filter(p => p.category === category);
}

export function getCriticalRequirements(): PolicyRequirement[] {
  const critical: PolicyRequirement[] = [];
  for (const policy of GOVERNANCE_POLICIES) {
    critical.push(...policy.requirements.filter(r => r.severity === 'CRITICAL'));
  }
  return critical;
}

export function getRiskTriggersByJurisdiction(jurisdiction: string): RiskTrigger[] {
  return RISK_TRIGGERS.filter(rt =>
    rt.jurisdictionMultipliers[jurisdiction] !== undefined ||
    rt.jurisdictionMultipliers['DEFAULT'] !== undefined
  );
}

export function getJurisdiction(code: string): Jurisdiction | undefined {
  return JURISDICTIONS.find(j => j.code === code);
}

export function getPatchTemplate(policyCode: string, requirementId: string): PatchTemplate | undefined {
  return PATCH_TEMPLATES.find(pt =>
    pt.policyCode === policyCode && pt.requirementId === requirementId
  );
}

// ============================================================================
// RAG CONTEXT BUILDER
// ============================================================================

export function buildGovernanceRAGContext(): string {
  const policySummary = GOVERNANCE_POLICIES.map(p =>
    `- ${p.code}: ${p.name} (${p.category}) - ${p.requirements.length} requirements`
  ).join('\n');

  const criticalReqs = getCriticalRequirements();
  const criticalSummary = criticalReqs.map(r =>
    `- ${r.id}: ${r.name} (${r.severity})`
  ).join('\n');

  const riskSummary = RISK_TRIGGERS.map(rt =>
    `- ${rt.id}: ${rt.name} - Liability Impact: ${rt.liabilityImpact}`
  ).join('\n');

  const jurisdictionSummary = JURISDICTIONS.filter(j => j.code !== 'DEFAULT').map(j =>
    `- ${j.name}: Multiplier ${j.baseMultiplier}x, Flags: ${j.wageFlags.slice(0,3).join(', ')}`
  ).join('\n');

  return `## Governance Library Summary
Total Policies: ${GOVERNANCE_POLICIES.length}
Total Requirements: ${GOVERNANCE_POLICIES.reduce((sum, p) => sum + p.requirements.length, 0)}
Risk Triggers: ${RISK_TRIGGERS.length}
Jurisdictions: ${JURISDICTIONS.length}

## Policies
${policySummary}

## Critical Requirements (Highest Risk)
${criticalSummary}

## Risk Triggers
${riskSummary}

## Key Jurisdictions
${jurisdictionSummary}`;
}

// ============================================================================
// KNOWLEDGE SUMMARY (for system prompt)
// ============================================================================

export const GOVERNANCE_KNOWLEDGE_SUMMARY = `
## SPM Governance Framework - Policy Library 2026

### Policy Categories
1. **Financial Controls**: Clawback (SCP-001), Draws (SCP-008)
2. **Legal Compliance**: 409A (SCP-005), State Wage Law (SCP-006)
3. **Performance Management**: Quota (SCP-002), Windfall (SCP-003)
4. **Commission Rules**: Sales Crediting (SCP-007), Payment Timing (SCP-011)
5. **HR Policies**: Leave (SCP-009), Termination (SCP-012), New Hire (SCP-016)
6. **Plan Administration**: Mid-Period Changes (SCP-010), Territory (SCP-014)
7. **Governance**: Disputes (SCP-015)

### Critical Compliance Requirements
- **409A Short-Term Deferral**: Payments by March 15 (2.5-month safe harbor)
- **CA Labor Code §2751**: SIGNED written commission agreement required
- **CA Final Pay**: Immediate on termination, 72 hours for resignation
- **FMLA Compliance**: No forfeit of earned comp during protected leave

### Key Risk Triggers (8 total)
- RT-001: Retro/Discretion Posture - "sole discretion", "change anytime"
- RT-002: Earned-After-Deductions - CA risk for "earned only after deductions"
- RT-003: Recoverable Draw Repayment - death/termination repayment clauses
- RT-004: AR Deductions - deducting for unpaid invoices
- RT-005: No Dispute Timeline - missing formal dispute process
- RT-006: Employment Requirement - "must be employed to receive"
- RT-007: Unlimited Cap - windfall exposure without limits
- RT-008: Management Discretion - vague crediting rules

### Jurisdiction Risk Multipliers
- California: 1.5x base (strictest)
- New York: 1.2x
- Massachusetts: 1.2x
- Illinois: 1.1x
- Texas: 1.0x (most employer-friendly)

### Remediation Process
For each gap, we provide:
1. Policy code and requirement ID
2. Severity (CRITICAL/HIGH/MEDIUM/LOW)
3. Insertion point in plan document
4. Full coverage template language
5. State-specific compliance notes
`;
