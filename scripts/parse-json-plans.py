#!/usr/bin/env python3
"""
Parse 27 JSON Plan Analysis Files

Extracts policy coverage from clause extraction JSON files
and maps to 16 standardized policy areas.

Usage:
    python3 scripts/parse-json-plans.py

Output:
    scripts/output/json-plan-analysis.json
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Any
import re

# File paths
ARCHIVE_ROOT = Path(os.environ.get("ARCHIVE_ROOT", "data/demo-client-archive"))
JSON_DIR = ARCHIVE_ROOT / "Analysis/Comp Analysis/plan_analysis/medical"
OUTPUT_DIR = Path(__file__).parent / "output"
OUTPUT_FILE = OUTPUT_DIR / "json-plan-analysis.json"

# Standardized 16 policy areas (from approved plan)
POLICY_AREAS = [
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
    "International Requirements",
]

# Mapping from JSON policy names to standardized policy areas
POLICY_MAPPING = {
    # Windfall/Large Deals
    "Windfall Governance": "Windfall/Large Deals",
    "Large Deal": "Windfall/Large Deals",
    "Unforecasted Deal": "Windfall/Large Deals",

    # Quota Management
    "Quota": "Quota Management",
    "Performance Measurement": "Quota Management",
    "Goal Setting": "Quota Management",

    # Territory Management
    "Territory": "Territory Management",
    "Territory Assignment": "Territory Management",
    "Account Reassignment": "Territory Management",

    # Sales Crediting
    "Commission Earned Definition": "Sales Crediting",
    "Credit Rules": "Sales Crediting",
    "Crediting": "Sales Crediting",
    "Revenue Recognition": "Sales Crediting",

    # Clawback/Recovery
    "Clawback": "Clawback/Recovery",
    "Recovery": "Clawback/Recovery",
    "Chargeback": "Clawback/Recovery",
    "Draw & Chargeback": "Draws/Guarantees",  # Separate: Draws are different

    # SPIF Governance
    "SPIF": "SPIF Governance",
    "SPIFFs": "SPIF Governance",

    # Termination/Final Pay
    "Termination": "Termination/Final Pay",
    "Separation": "Termination/Final Pay",
    "Final Pay": "Termination/Final Pay",

    # New Hire/Onboarding
    "New Hire": "New Hire/Onboarding",
    "Onboarding": "New Hire/Onboarding",
    "Ramp": "New Hire/Onboarding",

    # Leave of Absence
    "Leave of Absence": "Leave of Absence",
    "LOA": "Leave of Absence",

    # Payment Timing
    "Payment Timing": "Payment Timing",
    "Payment Schedule": "Payment Timing",

    # Compliance
    "409A": "Compliance (409A, State Wage)",
    "State Wage": "Compliance (409A, State Wage)",
    "Compliance": "Compliance (409A, State Wage)",

    # Exceptions/Disputes
    "Dispute Process": "Exceptions/Disputes",
    "Dispute Resolution": "Exceptions/Disputes",
    "Exception": "Exceptions/Disputes",

    # Data/Systems/Controls
    "Data Accuracy": "Data/Systems/Controls",
    "System": "Data/Systems/Controls",

    # Draws/Guarantees
    "Draw": "Draws/Guarantees",
    "Guarantee": "Draws/Guarantees",

    # Mid-Period Changes
    "Mid-Period Change": "Mid-Period Changes",
    "Plan Amendment": "Mid-Period Changes",

    # International
    "International": "International Requirements",

    # Expense (maps to multiple)
    "Expense Deductions": "Sales Crediting",
}


def map_policy_to_standard(policy_name: str) -> str:
    """Map JSON policy name to standardized policy area."""
    # Direct match
    if policy_name in POLICY_MAPPING:
        return POLICY_MAPPING[policy_name]

    # Fuzzy match
    policy_lower = policy_name.lower()
    for json_name, standard_name in POLICY_MAPPING.items():
        if json_name.lower() in policy_lower:
            return standard_name

    # Default to original if no match
    return policy_name


def assess_coverage(details: str) -> str:
    """
    Assess policy coverage level based on details.

    Returns:
        - FULL: Detailed enforceable language + thresholds + workflows + SLAs
        - LIMITED: Mentions policy area but lacks detail, thresholds, or clear process
        - NO: Silent on policy area or only has disclaimer language
    """
    details_lower = details.lower()

    # NO coverage indicators
    no_indicators = [
        "gap noted",
        "no clause",
        "not specified",
        "not present",
        "does not specify",
        "silent on",
        "missing",
    ]
    for indicator in no_indicators:
        if indicator in details_lower:
            return "NO"

    # FULL coverage indicators (detailed + specific)
    full_indicators = [
        "specific threshold",
        "approval workflow",
        "defined process",
        "SLA:",
        "within \\d+ days",
        "\\$[0-9,]+ threshold",
        "CRB approval required",
        "formal exception request",
    ]
    full_count = sum(1 for indicator in full_indicators if re.search(indicator, details_lower))

    # LIMITED coverage indicators (mentions but lacks detail)
    limited_indicators = [
        "may",
        "at company discretion",
        "reasonable",
        "case by case",
        "manager approval",
        "subject to",
    ]
    limited_count = sum(1 for indicator in limited_indicators if indicator in details_lower)

    # Detailed text (>100 chars) with specific numbers/processes = FULL
    if len(details) > 100 and (re.search(r'\d+', details) or "process" in details_lower):
        if full_count >= 1 or limited_count == 0:
            return "FULL"

    # Has some detail but vague = LIMITED
    if len(details) > 30 and limited_count > 0:
        return "LIMITED"

    # Default: If has any substantive detail, LIMITED; otherwise NO
    if len(details) > 50 and details_lower != "gap noted.":
        return "LIMITED"

    return "NO"


def parse_json_file(file_path: Path) -> Dict[str, Any]:
    """Parse a single JSON plan file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    if not data or not isinstance(data, list):
        return None

    # Extract plan name from first entry
    plan_name = data[0]['plan'] if data else f"Unknown Plan {file_path.stem}"

    # Build policy coverage map
    policy_coverage = {}
    for entry in data:
        policy_name = entry['policy']
        details = entry['details']

        # Map to standard policy area
        standard_policy = map_policy_to_standard(policy_name)

        # Assess coverage level
        coverage = assess_coverage(details)

        # Store with details
        if standard_policy not in policy_coverage:
            policy_coverage[standard_policy] = {
                'coverage': coverage,
                'details': details,
                'originalPolicy': policy_name,
            }
        else:
            # If we already have this policy, take the best coverage
            existing_coverage = policy_coverage[standard_policy]['coverage']
            if coverage == 'FULL' or (coverage == 'LIMITED' and existing_coverage == 'NO'):
                policy_coverage[standard_policy] = {
                    'coverage': coverage,
                    'details': details,
                    'originalPolicy': policy_name,
                }

    return {
        'planName': plan_name,
        'sourceFile': str(file_path.relative_to(ARCHIVE_ROOT)),
        'policyCoverage': policy_coverage,
    }


def main():
    print("🚀 Parsing 27 JSON plan analysis files...")
    print(f"📂 Source: {JSON_DIR}")
    print(f"📂 Output: {OUTPUT_FILE}\n")

    # Find all plan JSON files
    json_files = sorted(JSON_DIR.glob("plan*_clause_extract.json"))

    if not json_files:
        print(f"❌ No JSON files found in {JSON_DIR}")
        return 1

    print(f"📋 Found {len(json_files)} JSON files\n")

    # Parse all files
    plans = []
    for file_path in json_files:
        print(f"   Parsing: {file_path.name}...")
        plan_data = parse_json_file(file_path)
        if plan_data:
            plans.append(plan_data)

    print(f"\n✅ Parsed {len(plans)} plans\n")

    # Calculate statistics
    print("📊 Calculating coverage statistics...")

    # Per-plan coverage percentages
    for plan in plans:
        coverage = plan['policyCoverage']
        full = sum(1 for p in coverage.values() if p['coverage'] == 'FULL')
        limited = sum(1 for p in coverage.values() if p['coverage'] == 'LIMITED')
        total = len(coverage)
        percentage = round((full + 0.5 * limited) / total * 100, 1) if total > 0 else 0

        plan['coverageStats'] = {
            'full': full,
            'limited': limited,
            'no': total - full - limited,
            'total': total,
            'percentage': percentage,
        }

    # Global statistics
    global_stats = {
        'totalPlans': len(plans),
        'totalPolicyAreasTracked': len(POLICY_AREAS),
        'averageCoverage': round(sum(p['coverageStats']['percentage'] for p in plans) / len(plans), 1) if plans else 0,
    }

    # Compile output
    output_data = {
        'metadata': {
            'source': str(JSON_DIR),
            'totalFiles': len(json_files),
            'standardPolicyAreas': POLICY_AREAS,
        },
        'globalStats': global_stats,
        'plans': plans,
    }

    # Write to JSON
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)

    print(f"✅ Data written to {OUTPUT_FILE}\n")

    # Display summary
    print("📊 Summary:")
    print("═" * 90)
    print(f"   Total Plans:         {global_stats['totalPlans']}")
    print(f"   Policy Areas:        {global_stats['totalPolicyAreasTracked']}")
    print(f"   Average Coverage:    {global_stats['averageCoverage']}%")
    print("═" * 90)
    print()

    # Display top/bottom plans by coverage
    print("📊 Plan Coverage Ranking:")
    print("═" * 90)
    sorted_plans = sorted(plans, key=lambda x: x['coverageStats']['percentage'], reverse=True)
    for plan in sorted_plans:
        stats = plan['coverageStats']
        name = plan['planName'][:40]
        print(f"   {name:42} | Full: {stats['full']:2} | Limited: {stats['limited']:2} | No: {stats['no']:2} | {stats['percentage']:5.1f}%")
    print("═" * 90)
    print()

    print("🎉 Parsing complete!")
    return 0


if __name__ == '__main__':
    exit(main())
