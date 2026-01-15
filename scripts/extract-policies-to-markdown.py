#!/usr/bin/env python3
"""
Extract Demo Client Policy Documents to Markdown

Extracts text from all 16 policy DOCX files (6 drafts + 10 templates)
and converts them to markdown format for use in the policy library.

Usage:
    python3 scripts/extract-policies-to-markdown.py

Output:
    lib/data/policies/ - Directory with 16 .md files

Requirements:
    pip install python-docx
"""

import os
import json
from pathlib import Path
from typing import Dict, List, Any

try:
    from docx import Document
    from docx.text.paragraph import Paragraph
    from docx.table import Table
except ImportError:
    print("❌ python-docx not installed!")
    print("   Install with: pip3 install python-docx")
    exit(1)

# Paths
POLICIES_PATH = Path("/Users/toddlebaron/Documents/SPM/clients/DemoClient/02_POLICIES")
DRAFT_PATH = POLICIES_PATH / "DRAFT_FOR_REVIEW"
OUTPUT_PATH = Path(__file__).parent.parent / "lib" / "data" / "policies"

# Policy metadata
POLICY_MAPPINGS = {
    # DRAFT policies (require legal review)
    "CLAWBACK_AND_RECOVERY_POLICY_DRAFT.docx": {
        "code": "SCP-001",
        "name": "Clawback and Recovery Policy",
        "category": "Financial Controls",
        "framework_area": "Clawback/Recovery",
        "status": "DRAFT",
        "legal_review_required": True,
    },
    "QUOTA_MANAGEMENT_POLICY_DRAFT.docx": {
        "code": "SCP-002",
        "name": "Quota Management Policy",
        "category": "Performance Management",
        "framework_area": "Quota Management",
        "status": "DRAFT",
        "legal_review_required": True,
    },
    "WINDFALL_LARGE_DEAL_POLICY_DRAFT.docx": {
        "code": "SCP-003",
        "name": "Windfall and Large Deal Policy",
        "category": "Deal Governance",
        "framework_area": "Windfall/Large Deals",
        "status": "DRAFT",
        "legal_review_required": True,
    },
    "SPIF_GOVERNANCE_POLICY_DRAFT.docx": {
        "code": "SCP-004",
        "name": "SPIF Governance Policy",
        "category": "Incentive Programs",
        "framework_area": "SPIF Governance",
        "status": "DRAFT",
        "legal_review_required": True,
    },
    "SECTION_409A_COMPLIANCE_POLICY_DRAFT.docx": {
        "code": "SCP-005",
        "name": "Section 409A Compliance Policy",
        "category": "Legal Compliance",
        "framework_area": "Compliance (409A, State Wage)",
        "status": "DRAFT",
        "legal_review_required": True,
    },
    "STATE_WAGE_LAW_COMPLIANCE_POLICY_DRAFT.docx": {
        "code": "SCP-006",
        "name": "State Wage Law Compliance Policy",
        "category": "Legal Compliance",
        "framework_area": "Compliance (409A, State Wage)",
        "status": "DRAFT",
        "legal_review_required": True,
    },

    # TEMPLATE policies (ready to use)
    "SALES_CREDITING_POLICY.docx": {
        "code": "SCP-007",
        "name": "Sales Crediting Policy",
        "category": "Commission Rules",
        "framework_area": "Sales Crediting",
        "status": "TEMPLATE",
        "legal_review_required": False,
    },
    "DRAWS_AND_GUARANTEES_POLICY.docx": {
        "code": "SCP-008",
        "name": "Draws and Guarantees Policy",
        "category": "Financial Controls",
        "framework_area": "Draws/Guarantees",
        "status": "TEMPLATE",
        "legal_review_required": False,
    },
    "LEAVE_OF_ABSENCE_POLICY.docx": {
        "code": "SCP-009",
        "name": "Leave of Absence Policy",
        "category": "HR Policies",
        "framework_area": "Leave of Absence",
        "status": "TEMPLATE",
        "legal_review_required": False,
    },
    "MID_PERIOD_CHANGE_POLICY.docx": {
        "code": "SCP-010",
        "name": "Mid-Period Change Policy",
        "category": "Plan Administration",
        "framework_area": "Mid-Period Changes",
        "status": "TEMPLATE",
        "legal_review_required": False,
    },
    "PAYMENT_TIMING_POLICY.docx": {
        "code": "SCP-011",
        "name": "Payment Timing Policy",
        "category": "Payroll",
        "framework_area": "Payment Timing",
        "status": "TEMPLATE",
        "legal_review_required": False,
    },
    "TERMINATION_POLICY.docx": {
        "code": "SCP-012",
        "name": "Termination and Final Pay Policy",
        "category": "HR Policies",
        "framework_area": "Termination/Final Pay",
        "status": "TEMPLATE",
        "legal_review_required": False,
    },
    "DATA_RETENTION_POLICY.docx": {
        "code": "SCP-013",
        "name": "Data and Systems Controls Policy",
        "category": "IT Governance",
        "framework_area": "Data/Systems/Controls",
        "status": "TEMPLATE",
        "legal_review_required": False,
    },
    "CAP_AND_THRESHOLD_GUIDELINES.docx": {
        "code": "SCP-014",
        "name": "Territory Management Guidelines",
        "category": "Territory Rules",
        "framework_area": "Territory Management",
        "status": "TEMPLATE",
        "legal_review_required": False,
    },
    "STANDARD_TERMS_AND_CONDITIONS.docx": {
        "code": "SCP-015",
        "name": "Exception and Dispute Resolution Policy",
        "category": "Governance",
        "framework_area": "Exceptions/Disputes",
        "status": "TEMPLATE",
        "legal_review_required": False,
    },
}


def extract_text_from_docx(file_path: Path) -> str:
    """Extract all text content from a DOCX file."""
    try:
        doc = Document(file_path)
        text_parts = []

        for element in doc.element.body:
            if element.tag.endswith('p'):
                # Paragraph
                para = Paragraph(element, doc)
                text = para.text.strip()
                if text:
                    # Detect heading style
                    if para.style.name.startswith('Heading'):
                        level = para.style.name[-1] if para.style.name[-1].isdigit() else '1'
                        text_parts.append(f"{'#' * int(level)} {text}\n")
                    else:
                        text_parts.append(f"{text}\n")
            elif element.tag.endswith('tbl'):
                # Table - simple rendering
                table = Table(element, doc)
                for row in table.rows:
                    row_text = " | ".join(cell.text.strip() for cell in row.cells)
                    if row_text:
                        text_parts.append(f"| {row_text} |\n")
                text_parts.append("\n")

        return "".join(text_parts)
    except Exception as e:
        print(f"   ❌ Error extracting {file_path.name}: {e}")
        return ""


def extract_all_policies():
    """Extract all policy documents to markdown."""
    print("🚀 Extracting Demo Client Policy Documents to Markdown")
    print("=" * 70)

    # Create output directory
    OUTPUT_PATH.mkdir(parents=True, exist_ok=True)

    extracted_count = 0
    skipped_count = 0
    error_count = 0

    # Create index file
    index_data = {
        "policies": [],
        "metadata": {
            "total_policies": 0,
            "draft_policies": 0,
            "template_policies": 0,
            "extracted_date": "2026-01-08",
        }
    }

    # Process DRAFT policies
    print(f"\n📝 Processing DRAFT Policies ({DRAFT_PATH}):")
    if DRAFT_PATH.exists():
        for filename, metadata in POLICY_MAPPINGS.items():
            if metadata["status"] != "DRAFT":
                continue

            file_path = DRAFT_PATH / filename
            if not file_path.exists():
                print(f"   ⚠️  Not found: {filename}")
                skipped_count += 1
                continue

            # Extract text
            print(f"   📄 Extracting: {metadata['name']}...")
            content = extract_text_from_docx(file_path)

            if not content:
                print(f"   ❌ Failed to extract: {filename}")
                error_count += 1
                continue

            # Create markdown file
            output_file = OUTPUT_PATH / f"{metadata['code']}.md"
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(f"# {metadata['name']}\n\n")
                f.write(f"**Policy Code:** {metadata['code']}  \n")
                f.write(f"**Category:** {metadata['category']}  \n")
                f.write(f"**Framework Area:** {metadata['framework_area']}  \n")
                f.write(f"**Status:** {metadata['status']}  \n")
                f.write(f"**Legal Review Required:** {'Yes' if metadata['legal_review_required'] else 'No'}  \n\n")
                f.write("---\n\n")
                f.write(content)

            print(f"   ✅ Saved: {output_file.name}")
            extracted_count += 1

            # Add to index
            index_data["policies"].append({
                "code": metadata["code"],
                "name": metadata["name"],
                "category": metadata["category"],
                "framework_area": metadata["framework_area"],
                "status": metadata["status"],
                "legal_review_required": metadata["legal_review_required"],
                "file_path": f"lib/data/policies/{metadata['code']}.md",
                "word_count": len(content.split()),
            })
    else:
        print(f"   ⚠️  Directory not found: {DRAFT_PATH}")

    # Process TEMPLATE policies
    print(f"\n📄 Processing TEMPLATE Policies ({POLICIES_PATH}):")
    for filename, metadata in POLICY_MAPPINGS.items():
        if metadata["status"] != "TEMPLATE":
            continue

        file_path = POLICIES_PATH / filename
        if not file_path.exists():
            print(f"   ⚠️  Not found: {filename}")
            skipped_count += 1
            continue

        # Extract text
        print(f"   📄 Extracting: {metadata['name']}...")
        content = extract_text_from_docx(file_path)

        if not content:
            print(f"   ❌ Failed to extract: {filename}")
            error_count += 1
            continue

        # Create markdown file
        output_file = OUTPUT_PATH / f"{metadata['code']}.md"
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(f"# {metadata['name']}\n\n")
            f.write(f"**Policy Code:** {metadata['code']}  \n")
            f.write(f"**Category:** {metadata['category']}  \n")
            f.write(f"**Framework Area:** {metadata['framework_area']}  \n")
            f.write(f"**Status:** {metadata['status']}  \n")
            f.write(f"**Legal Review Required:** {'Yes' if metadata['legal_review_required'] else 'No'}  \n\n")
            f.write("---\n\n")
            f.write(content)

        print(f"   ✅ Saved: {output_file.name}")
        extracted_count += 1

        # Add to index
        index_data["policies"].append({
            "code": metadata["code"],
            "name": metadata["name"],
            "category": metadata["category"],
            "framework_area": metadata["framework_area"],
            "status": metadata["status"],
            "legal_review_required": metadata["legal_review_required"],
            "file_path": f"lib/data/policies/{metadata['code']}.md",
            "word_count": len(content.split()),
        })

    # Update index metadata
    index_data["metadata"]["total_policies"] = extracted_count
    index_data["metadata"]["draft_policies"] = len([p for p in index_data["policies"] if p["status"] == "DRAFT"])
    index_data["metadata"]["template_policies"] = len([p for p in index_data["policies"] if p["status"] == "TEMPLATE"])

    # Save index file
    index_file = OUTPUT_PATH / "index.json"
    with open(index_file, 'w', encoding='utf-8') as f:
        json.dump(index_data, f, indent=2, ensure_ascii=False)

    print(f"\n{'=' * 70}")
    print(f"📊 Summary:")
    print(f"   ✅ Extracted: {extracted_count} policies")
    print(f"   ⏭️  Skipped: {skipped_count} policies")
    print(f"   ❌ Errors: {error_count} policies")
    print(f"\n💾 Output Directory: {OUTPUT_PATH}")
    print(f"📋 Index File: {index_file}")
    print(f"\n🎉 Policy extraction complete!")


if __name__ == '__main__':
    extract_all_policies()
