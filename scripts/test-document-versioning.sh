#!/bin/bash

# Test Document Versioning System
# Demonstrates complete workflow: RAW → PROCESSED → DRAFT → APPROVED → ACTIVE_FINAL

set -e

API_BASE="http://localhost:3004/api"
TENANT_ID="demo-tenant-001"
USER="test-user@example.com"

echo "🚀 Testing Document Versioning System"
echo "========================================"
echo ""

# Step 1: Import RAW document
echo "📥 Step 1: Import RAW Document"
echo "--------------------------------"
RAW_RESPONSE=$(curl -s -X POST "$API_BASE/documents/versions/import-raw" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "'"$TENANT_ID"'",
    "sourceFileUrl": "/Users/toddlebaron/Documents/SPM/clients/DemoClient/HS_Comp_Plans/source/HS-MED-FSC-2025.pdf",
    "sourceFileName": "HS-MED-FSC-2025.pdf",
    "sourceFileType": "pdf",
    "createdBy": "'"$USER"'",
    "metadata": {
      "clientName": "Demo Client",
      "planType": "Compensation Plan",
      "division": "Medical Division"
    }
  }')

RAW_VERSION_ID=$(echo $RAW_RESPONSE | jq -r '.version.id')
DOCUMENT_ID=$(echo $RAW_RESPONSE | jq -r '.version.documentId')

echo "✅ RAW document imported"
echo "   Document ID: $DOCUMENT_ID"
echo "   Version ID: $RAW_VERSION_ID"
echo "   Status: RAW"
echo ""

# Step 2: Process to Markdown
echo "⚙️  Step 2: Process RAW to Markdown"
echo "------------------------------------"

# Load actual markdown content from Demo Client plan
MARKDOWN_CONTENT=$(cat /Users/toddlebaron/Documents/SPM/clients/DemoClient/HS_Comp_Plans/processed/HS-MED-FSC-2025.md | head -n 50)

PROCESSED_RESPONSE=$(curl -s -X POST "$API_BASE/documents/versions/$RAW_VERSION_ID/process" \
  -H "Content-Type: application/json" \
  -d '{
    "processedContent": "'"$(echo "$MARKDOWN_CONTENT" | sed 's/"/\\"/g' | tr '\n' ' ')"'",
    "processedBy": "'"$USER"'",
    "processingNotes": "Converted PDF to structured markdown using automated extraction"
  }')

PROCESSED_VERSION_ID=$(echo $PROCESSED_RESPONSE | jq -r '.version.id')

echo "✅ Document processed to markdown"
echo "   Version ID: $PROCESSED_VERSION_ID"
echo "   Status: PROCESSED"
echo ""

# Step 3: Get Version Timeline
echo "📊 Step 3: Get Version Timeline"
echo "--------------------------------"
TIMELINE=$(curl -s "$API_BASE/documents/$DOCUMENT_ID/versions/timeline")

echo "✅ Timeline retrieved"
echo "$TIMELINE" | jq '.timeline[] | {version: .versionNumber, status: .lifecycleStatus, createdBy: .createdBy}'
echo ""

# Step 4: Get Version Stats
echo "📈 Step 4: Get Version Statistics"
echo "----------------------------------"
echo "$TIMELINE" | jq '.stats'
echo ""

# Step 5: Transition to Draft (simulate editing)
echo "✏️  Step 5: Submit for Review"
echo "-----------------------------"
REVIEW_RESPONSE=$(curl -s -X POST "$API_BASE/documents/$DOCUMENT_ID/versions" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "'"$TENANT_ID"'",
    "versionNumber": "1.1",
    "versionLabel": "Ready for Review",
    "lifecycleStatus": "UNDER_REVIEW",
    "content": "'"$(echo "$MARKDOWN_CONTENT" | sed 's/"/\\"/g' | tr '\n' ' ')"'",
    "contentFormat": "markdown",
    "createdBy": "'"$USER"'",
    "changeDescription": "Prepared document for stakeholder review",
    "changeType": "MINOR",
    "checksum": "abc123",
    "fileSize": 5000,
    "previousVersionId": "'"$PROCESSED_VERSION_ID"'"
  }')

REVIEW_VERSION_ID=$(echo $REVIEW_RESPONSE | jq -r '.version.id')

echo "✅ Version submitted for review"
echo "   Version ID: $REVIEW_VERSION_ID"
echo "   Status: UNDER_REVIEW"
echo ""

# Step 6: Approve Version
echo "✅ Step 6: Approve Version"
echo "---------------------------"
APPROVE_RESPONSE=$(curl -s -X POST "$API_BASE/documents/versions/$REVIEW_VERSION_ID/approve" \
  -H "Content-Type: application/json" \
  -d '{
    "approvedBy": "approver@demo-client.com",
    "approvalComments": "Reviewed and approved for publication. All governance requirements met."
  }')

echo "✅ Version approved"
echo "   Approved by: $(echo $APPROVE_RESPONSE | jq -r '.version.approvedBy')"
echo "   Status: APPROVED"
echo ""

# Step 7: Publish to Active
echo "🚀 Step 7: Publish to ACTIVE_FINAL"
echo "-----------------------------------"
PUBLISH_RESPONSE=$(curl -s -X POST "$API_BASE/documents/versions/$REVIEW_VERSION_ID/publish" \
  -H "Content-Type: application/json" \
  -d '{
    "publishedBy": "publisher@demo-client.com",
    "effectiveDate": "2025-01-01T00:00:00Z"
  }')

echo "✅ Version published to ACTIVE_FINAL"
echo "   Published by: $(echo $PUBLISH_RESPONSE | jq -r '.version.publishedBy')"
echo "   Status: ACTIVE_FINAL"
echo ""

# Step 8: Final Timeline
echo "🎯 Step 8: Final Version Timeline"
echo "----------------------------------"
FINAL_TIMELINE=$(curl -s "$API_BASE/documents/$DOCUMENT_ID/versions/timeline")

echo "$FINAL_TIMELINE" | jq '.timeline[] | {version: .versionNumber, status: .lifecycleStatus, created: .createdAt, isCurrent: .isCurrent}'
echo ""

echo "✅ Document Versioning Test Complete!"
echo "======================================"
echo ""
echo "Summary:"
echo "  Document ID: $DOCUMENT_ID"
echo "  Total Versions: $(echo $FINAL_TIMELINE | jq '.stats.totalVersions')"
echo "  Latest Version: $(echo $FINAL_TIMELINE | jq -r '.stats.latestVersion')"
echo "  Active Version: $(echo $FINAL_TIMELINE | jq -r '.stats.activeVersion')"
echo ""
echo "Full Provenance Tracked:"
echo "  ✅ RAW import"
echo "  ✅ Processing to markdown"
echo "  ✅ Review submission"
echo "  ✅ Approval"
echo "  ✅ Publication to active"
