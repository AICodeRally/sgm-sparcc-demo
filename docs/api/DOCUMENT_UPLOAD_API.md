# Document Upload API Documentation

## Overview

The Document Upload API enables automated ingestion of compensation plan documents (PDF, DOCX, TXT, Excel) with complete workflow processing:

1. **Upload** → File validation and storage
2. **Parse** → Text extraction and section detection
3. **Map** → AI-powered section mapping to template
4. **Analyze** → Policy gap detection
5. **Recommend** → Policy recommendation generation

---

## Endpoints

### 1. Upload Document

**POST** `/api/client/[tenantSlug]/documents/upload`

Upload a compensation plan document for processing.

#### Request

**Headers:**
- `Content-Type: multipart/form-data`
- `x-user-id: string` (optional) - User ID for audit tracking

**Body (multipart):**
- `file: File` - Document file to upload

**Supported File Types:**
- PDF (`.pdf`)
- Microsoft Word (`.docx`, `.doc`)
- Plain Text (`.txt`)
- Microsoft Excel (`.xlsx`, `.xls`)

**File Size Limit:** 50MB

#### Response

**Success (200):**
```json
{
  "success": true,
  "documentId": "clx1234567890",
  "status": "UPLOADED",
  "fileName": "the Company Compensation Plan 2025.pdf",
  "fileSize": 12582912
}
```

**Error (400 - Bad Request):**
```json
{
  "success": false,
  "error": "Unsupported file type: application/zip. Allowed types: PDF, DOCX, TXT, XLSX"
}
```

**Error (500 - Internal Server Error):**
```json
{
  "success": false,
  "error": "Internal server error: ..."
}
```

---

### 2. Get Upload Configuration

**GET** `/api/client/[tenantSlug]/documents/upload`

Returns upload configuration and limits.

#### Response

```json
{
  "allowedFileTypes": ["pdf", "docx", "doc", "txt", "xlsx", "xls"],
  "maxFileSize": 52428800,
  "maxFileSizeMB": 50
}
```

---

### 3. Get Document Status

**GET** `/api/client/[tenantSlug]/documents/[docId]/status`

Returns current processing status and progress for uploaded document.

#### Response

```json
{
  "id": "clx1234567890",
  "status": "ANALYZING",
  "fileName": "the Company Compensation Plan 2025.pdf",
  "fileType": "pdf",
  "fileSize": 12582912,
  "uploadedAt": "2026-01-08T21:30:00.000Z",
  "uploadedBy": "sarah.johnson@company.com",
  "parsedAt": "2026-01-08T21:30:15.000Z",
  "totalSections": 48,
  "totalWords": 15432,
  "processingTime": 22500,
  "progress": {
    "stage": "Analyzing",
    "percentage": 85,
    "message": "Analyzing policy gaps..."
  },
  "planId": null,
  "sectionMappings": {
    "total": 48,
    "accepted": 38,
    "pending": 7,
    "rejected": 3
  },
  "recommendations": {
    "total": 12,
    "critical": 2,
    "high": 5,
    "applied": 0
  },
  "errorMessage": null
}
```

---

## Processing Workflow

### Status Progression

```
UPLOADED (10%)
   ↓ Parsing document...
PARSING (25%)
   ↓ Extracting text and detecting sections
PARSED (40%)
   ↓ Mapping sections to template
MAPPING (55%)
   ↓ Generating section mappings
MAPPED (70%)
   ↓ Analyzing policy gaps
ANALYZING (85%)
   ↓ Detecting missing policies
ANALYZED (90%)
   ↓ Generating recommendations
READY (95%)
   ↓ Ready for review
COMPLETED (100%)
```

**Alternative Path:**
```
FAILED (0%) - Processing failed, see errorMessage
```

---

## Usage Examples

### cURL

```bash
# Upload document
curl -X POST \
  http://localhost:3000/api/client/company/documents/upload \
  -H "x-user-id: sarah.johnson@company.com" \
  -F "file=@/path/to/plan.pdf"

# Response:
# {
#   "success": true,
#   "documentId": "clx1234567890",
#   "status": "UPLOADED",
#   "fileName": "plan.pdf",
#   "fileSize": 12582912
# }

# Poll status
curl http://localhost:3000/api/client/company/documents/clx1234567890/status

# Response:
# {
#   "status": "ANALYZING",
#   "progress": { "stage": "Analyzing", "percentage": 85, ... },
#   ...
# }
```

### JavaScript (fetch)

```javascript
// Upload document
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const uploadResponse = await fetch(
  '/api/client/company/documents/upload',
  {
    method: 'POST',
    headers: {
      'x-user-id': 'sarah.johnson@company.com',
    },
    body: formData,
  }
);

const { documentId } = await uploadResponse.json();

// Poll status until complete
const pollStatus = async () => {
  const statusResponse = await fetch(
    `/api/client/company/documents/${documentId}/status`
  );

  const status = await statusResponse.json();

  if (status.status === 'READY' || status.status === 'COMPLETED') {
    console.log('Processing complete!', status);
    return status;
  }

  if (status.status === 'FAILED') {
    console.error('Processing failed:', status.errorMessage);
    return status;
  }

  // Continue polling
  setTimeout(pollStatus, 2000);
};

pollStatus();
```

### TypeScript (Node.js)

```typescript
import FormData from 'form-data';
import fs from 'fs';

// Upload document
async function uploadDocument(filePath: string) {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));

  const response = await fetch(
    'http://localhost:3000/api/client/company/documents/upload',
    {
      method: 'POST',
      headers: {
        'x-user-id': 'sarah.johnson@company.com',
      },
      body: form as any,
    }
  );

  return response.json();
}

// Get status
async function getStatus(documentId: string) {
  const response = await fetch(
    `http://localhost:3000/api/client/company/documents/${documentId}/status`
  );

  return response.json();
}

// Usage
const { documentId } = await uploadDocument('./plan.pdf');
const status = await getStatus(documentId);
```

---

## Testing

### Using Test Script

```bash
# Run end-to-end test
npx tsx scripts/test-document-upload.ts

# Output:
# 🚀 DOCUMENT UPLOAD API TEST
# ======================================================================
#
# 📤 Uploading document...
#    File: test-compensation-plan-structured.txt
#    Size: 125.45 KB
#
# ✅ Upload successful!
#    Document ID: clx1234567890
#    Status: UPLOADED
#    File Name: test-compensation-plan-structured.txt
#    File Size: 128512 bytes
#
# 🔄 Polling processing status...
#    [10%] Uploaded: Document uploaded successfully
#    [25%] Parsing: Extracting text and detecting sections...
#    [40%] Parsed: Document parsed successfully
#    [55%] Mapping: Mapping sections to template...
#    [70%] Mapped: Sections mapped successfully
#    [85%] Analyzing: Analyzing policy gaps...
#    [90%] Analyzed: Gap analysis complete
#    [95%] Ready: Ready for review
#
# ✅ Processing complete in 22500ms
#
# ======================================================================
# PROCESSING RESULTS
# ======================================================================
#
# 📄 DOCUMENT INFO
#    Document ID: clx1234567890
#    File Name: test-compensation-plan-structured.txt
#    File Type: txt
#    File Size: 125.50 KB
#    Uploaded: 1/8/2026, 9:30:00 PM
#    Uploaded By: test-user@company.com
#
# 📊 PARSING RESULTS
#    Total Sections: 48
#    Total Words: 15,432
#    Parsed At: 1/8/2026, 9:30:15 PM
#
# 🔗 SECTION MAPPINGS
#    Total Mappings: 48
#    ✅ Accepted: 38
#    ⏳ Pending: 7
#    ❌ Rejected: 3
#
# 💡 POLICY RECOMMENDATIONS
#    Total Recommendations: 12
#    🔴 Critical: 2
#    🟡 High: 5
#    ✅ Applied: 0
#
# ⏱️  PERFORMANCE
#    Total Processing Time: 22500ms
#
# ======================================================================
# ✅ TEST COMPLETE
# ======================================================================
```

---

## Database Schema

### UploadedDocument

```prisma
model UploadedDocument {
  id              String   @id @default(cuid())
  tenantId        String
  fileName        String
  fileType        String   // pdf, docx, txt, xlsx
  fileSize        Int
  filePath        String
  checksum        String   // SHA-256
  status          DocumentIngestionStatus
  uploadedBy      String
  uploadedAt      DateTime @default(now())
  parsedContent   Json?    // Structured JSON from parser
  parsedAt        DateTime?
  totalSections   Int?
  totalWords      Int?
  processingTime  Int?
  planId          String?
  errorMessage    String?

  sectionMappings       SectionMapping[]
  policyRecommendations PolicyRecommendation[]
}

enum DocumentIngestionStatus {
  UPLOADED
  PARSING
  PARSED
  MAPPING
  MAPPED
  ANALYZING
  ANALYZED
  READY
  COMPLETED
  FAILED
}
```

---

## Error Handling

### Common Errors

**1. File Too Large**
```json
{
  "success": false,
  "error": "File too large: 75.25MB. Max size: 50MB"
}
```

**2. Unsupported File Type**
```json
{
  "success": false,
  "error": "Unsupported file type: application/zip. Allowed types: PDF, DOCX, TXT, XLSX"
}
```

**3. No File Uploaded**
```json
{
  "success": false,
  "error": "No file uploaded"
}
```

**4. Processing Failed**
```json
{
  "status": "FAILED",
  "errorMessage": "Failed to parse PDF: Invalid PDF structure"
}
```

---

## Performance Metrics

### Typical Processing Times

| Document Size | Pages | Processing Time |
|--------------|-------|----------------|
| 100 KB (TXT) | N/A   | 2-5 seconds    |
| 5 MB (PDF)   | 25    | 10-15 seconds  |
| 12 MB (PDF)  | 87    | 20-30 seconds  |
| 20 MB (DOCX) | 150   | 35-50 seconds  |

### Breakdown

- **Parsing**: 40-50% of total time
- **Section Mapping**: 20-30% of total time
- **Gap Analysis**: 15-20% of total time
- **Recommendations**: 5-10% of total time

---

## Next Steps

After document processing completes (`status: READY`):

1. **Review Section Mappings** - `/api/client/[tenantSlug]/documents/[docId]/mappings`
2. **Review Gap Analysis** - `/api/client/[tenantSlug]/documents/[docId]/gaps`
3. **Review Recommendations** - `/api/client/[tenantSlug]/documents/[docId]/recommendations`
4. **Create Plan** - `/api/client/[tenantSlug]/documents/[docId]/create-plan`

See [Complete Workflow Documentation](./DOCUMENT_WORKFLOW.md) for full details.

## See also
- `docs/KB_OVERVIEW.md`
- `docs/KB_PAGE_INDEX.md`
- Relevant KB routes: /documents/upload, /governance/upload, /documents
