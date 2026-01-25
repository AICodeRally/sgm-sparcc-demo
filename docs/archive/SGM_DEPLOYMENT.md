# SGM (Sales Governance Manager) - Deployment Guide

## Overview

SGM is a comprehensive document management and governance system for sales compensation governance. It provides document versioning, approval workflows, governance committee management, compliance tracking, and full-text search.

## Quick Start

### Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000/sgm` to access the SGM dashboard.

### Production Build

```bash
npm run build
npm start
```

## System Architecture

### Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Database**: Prisma (configured for PostgreSQL)
- **File Storage**: Local (development) or S3 (production)
- **Authentication**: (Configure as needed)

### Key Components

#### Contracts & Ports (lib/)
- `contracts/document.contract.ts` - Document entity with lifecycle
- `contracts/committee.contract.ts` - Governance committee structure
- `contracts/approval-workflow.contract.ts` - Approval workflow definitions
- `ports/document.port.ts` - Document service interface
- `ports/committee.port.ts` - Committee service interface
- `ports/file-storage.port.ts` - File storage abstraction

#### Bindings (lib/bindings/)
- `synthetic/` - In-memory implementations for development/demo
- `registry.ts` - Service locator for dependency injection
- `config/binding-config.ts` - Configuration management

#### Pages (app/sgm/)
- `/sgm` - Dashboard hub
- `/sgm/documents` - Document library
- `/sgm/documents/[id]` - Document detail & viewer
- `/sgm/documents/[id]/versions` - Version history
- `/sgm/approvals` - Approval queue
- `/sgm/committees` - Committee management
- `/sgm/governance-matrix` - Policy/authority/compliance matrices
- `/sgm/decisions` - Decision log
- `/sgm/search` - Full-text search
- `/sgm/compliance` - Compliance dashboard

### API Endpoints

#### Documents
- `GET /api/sgm/documents` - List documents with filters
- `POST /api/sgm/documents` - Create document
- `GET /api/sgm/documents/[id]` - Get document
- `PUT /api/sgm/documents/[id]` - Update document
- `DELETE /api/sgm/documents/[id]` - Archive document
- `GET /api/sgm/documents/[id]/download` - Download file
- `GET /api/sgm/documents/[id]/versions` - Version history
- `POST /api/sgm/documents/[id]/versions` - Create version
- `POST /api/sgm/documents/[id]/lifecycle` - Transition states

#### Search
- `GET /api/sgm/search` - Full-text search

## Features

### Document Management
- ✅ Multi-format support (.md, .docx, .pdf, .xlsx, .pptx)
- ✅ Semantic versioning (major.minor.patch)
- ✅ Document lifecycle (DRAFT → ACTIVE → ARCHIVED)
- ✅ File validation and checksums
- ✅ Effective dating and expiration

### Approval Workflows
- ✅ Multi-step approval chains
- ✅ Role-based routing
- ✅ SLA tracking with escalation
- ✅ Decision logging and audit trail
- ✅ Workflow stepper visualization

### Governance
- ✅ Committee management (SGCC, CRB)
- ✅ Decision authority matrices
- ✅ Member and role tracking
- ✅ Quorum requirements

### Organization & Search
- ✅ Document library with filtering
- ✅ Full-text search across metadata
- ✅ Category and tag organization
- ✅ Status and type filtering

### Compliance
- ✅ Retention period tracking
- ✅ Legal review status
- ✅ Compliance flag mapping
- ✅ Issue tracking dashboard
- ✅ Decision log

## Configuration

### Environment Variables

See `.env.example` for available options. Key settings:

```env
# Binding mode (synthetic for demo, live for production)
BINDING_MODE=synthetic

# Database (for live mode)
DATABASE_URL=postgresql://...

# File storage (for production)
AWS_REGION=us-east-1
AWS_BUCKET_NAME=sgm-documents
```

### Binding Modes

1. **Synthetic** (Development/Demo)
   - In-memory data storage
   - No external dependencies
   - Includes sample documents and committees

2. **Live** (Production)
   - PostgreSQL database via Prisma
   - S3 file storage
   - Real document persistence

## Sample Data

The system includes 10 Demo Client governance documents:
- **Frameworks**: SGCC Charter, CRB Charter
- **Policies**: Sales Crediting, Quota Management, Payment Timing, SPIF, Windfall, Clawback
- **Procedures**: Commission Reconciliation, Dispute Resolution

## Deployment

### Vercel (Recommended)

```bash
vercel link
vercel env add DATABASE_URL
vercel env add AWS_REGION
vercel env add AWS_BUCKET_NAME
vercel env add AWS_ACCESS_KEY_ID
vercel env add AWS_SECRET_ACCESS_KEY
vercel deploy --prod
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### PostgreSQL Setup

```sql
CREATE DATABASE sgm;
```

Then run migrations:
```bash
npx prisma migrate deploy
```

## Future Enhancements

### Phase 7: Integrations (Not yet implemented)
- Salesforce (SFDC) - Account/opportunity data
- Xactly/CapIQ/Varicent - SPM system data
- Workday - HCM/payroll data
- Generic webhook connector

### Phase 8: Advanced Features
- Document relationship graphs
- AI-powered document analysis
- Custom workflow builders
- Multi-tenant support (currently single-tenant ready)

## Development Notes

### Architecture Pattern
Uses **Contracts/Ports/Bindings** pattern for clean separation:
- **Contracts**: Entity definitions (TypeScript types/Zod schemas)
- **Ports**: Service interfaces (what operations are needed)
- **Bindings**: Implementations (synthetic for demo, live for production)

### Adding New Document Types
1. Update `DocumentTypeSchema` in `contracts/document.contract.ts`
2. Add default values to `defaultBindingConfig` in `config/binding-config.ts`
3. Add sample data to `Demo Client_SAMPLE_DOCUMENTS` in `bindings/synthetic/document.synthetic.ts`

### Adding New Committees
1. Add to `initializeSampleCommittees()` in `bindings/synthetic/committee.synthetic.ts`
2. Update governance matrix in `app/sgm/governance-matrix/page.tsx`

## Support & Documentation

- **Architecture**: See `lib/` folder structure
- **Routes**: Check `app/api/sgm/` for API endpoints
- **UI Components**: See `app/sgm/` for page implementations
- **Utilities**: Check `lib/utils/` for helpers

## Version History

- **v1.0.0** - Initial release with core document management, approvals, and governance features
