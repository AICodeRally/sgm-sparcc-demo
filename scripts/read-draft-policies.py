#!/usr/bin/env python3
"""
Read 6 DRAFT BHG Policies

Extracts text from Word documents and creates summary of policy scope.

Usage:
    python3 scripts/read-draft-policies.py

Output:
    scripts/output/draft-policies-summary.json
"""

import json
import os
from pathlib import Path
from docx import Document
from typing import Dict, List, Any

# File paths
ARCHIVE_ROOT = Path(os.environ.get("ARCHIVE_ROOT", "data/demo-client-archive"))
DRAFT_DIR = ARCHIVE_ROOT / "CLIENT_DELIVERY_PACKAGE/02_POLICIES/DRAFT_FOR_REVIEW"
OUTPUT_DIR = Path(__file__).parent / "output"
OUTPUT_FILE = OUTPUT_DIR / "draft-policies-summary.json"

# 6 DRAFT policies
DRAFT_POLICIES = [
    "CLAWBACK_AND_RECOVERY_POLICY_DRAFT.docx",
    "QUOTA_MANAGEMENT_POLICY_DRAFT.docx",
    "WINDFALL_LARGE_DEAL_POLICY_DRAFT.docx",
    "SPIF_GOVERNANCE_POLICY_DRAFT.docx",
    "SECTION_409A_COMPLIANCE_POLICY_DRAFT.docx",
    "STATE_WAGE_LAW_COMPLIANCE_POLICY_DRAFT.docx",
]


def extract_text_from_docx(file_path: Path) -> str:
    """Extract all text from a Word document."""
    try:
        doc = Document(file_path)
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        return "\n".join(paragraphs)
    except Exception as e:
        return f"Error reading document: {e}"


def analyze_policy(file_path: Path) -> Dict[str, Any]:
    """Analyze a policy document and extract key information."""
    text = extract_text_from_docx(file_path)

    # Extract basic info
    policy_name = file_path.stem.replace("_DRAFT", "").replace("_", " ").title()
    lines = text.split("\n")

    # Find key sections
    purpose = ""
    scope = ""
    key_provisions = []

    for i, line in enumerate(lines):
        line_lower = line.lower()
        if "purpose" in line_lower and len(line) < 100:
            # Get next 2-3 paragraphs
            purpose = "\n".join(lines[i+1:i+4])
        elif "scope" in line_lower and len(line) < 100:
            scope = "\n".join(lines[i+1:i+4])
        elif any(keyword in line_lower for keyword in ["threshold", "requirement", "approval", "process", "sla"]):
            if len(line) > 30 and len(line) < 200:
                key_provisions.append(line.strip())

    # Count which plans this policy would apply to (based on keywords)
    applicable_plans = {
        "Medical": "medical" in text.lower() or "med surg" in text.lower(),
        "Dental": "dental" in text.lower(),
        "Surgical": "surgical" in text.lower() or "surg" in text.lower(),
        "Specialty": "specialty" in text.lower() or "equipment" in text.lower(),
        "All Plans": "all plans" in text.lower() or "all compensation" in text.lower(),
    }

    return {
        "fileName": file_path.name,
        "policyName": policy_name,
        "wordCount": len(text.split()),
        "purpose": purpose[:500] if purpose else "Not extracted",
        "scope": scope[:500] if scope else "Not extracted",
        "keyProvisions": key_provisions[:10],  # Top 10
        "applicablePlans": [k for k, v in applicable_plans.items() if v] or ["Unknown"],
        "fullText": text[:2000],  # First 2000 chars for reference
    }


def main():
    print("🚀 Reading 6 DRAFT BHG policies...")
    print(f"📂 Source: {DRAFT_DIR}\n")

    # Check if directory exists
    if not DRAFT_DIR.exists():
        print(f"❌ Directory not found: {DRAFT_DIR}")
        return 1

    # Read all 6 DRAFT policies
    policies = []
    for policy_file in DRAFT_POLICIES:
        file_path = DRAFT_DIR / policy_file
        if not file_path.exists():
            print(f"⚠️  File not found: {policy_file}")
            continue

        print(f"📖 Reading: {policy_file}...")
        policy_data = analyze_policy(file_path)
        policies.append(policy_data)
        print(f"   ✅ {policy_data['wordCount']} words | Applies to: {', '.join(policy_data['applicablePlans'])}")

    print(f"\n✅ Read {len(policies)} DRAFT policies\n")

    # Compile output
    output_data = {
        "metadata": {
            "source": str(DRAFT_DIR),
            "totalPolicies": len(policies),
        },
        "policies": policies,
    }

    # Write to JSON
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)

    print(f"✅ Policy summaries written to: {OUTPUT_FILE}\n")

    # Display summary
    print("📊 DRAFT Policy Summary:")
    print("═" * 90)
    for policy in policies:
        print(f"   {policy['policyName'][:50]:52} | {policy['wordCount']:5} words")
    print("═" * 90)
    print()

    print("🎉 Policy reading complete!")
    return 0


if __name__ == '__main__':
    exit(main())
