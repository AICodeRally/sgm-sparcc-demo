import type {
  Document,
  CreateDocument,
  UpdateDocument,
  DocumentFilters,
  FileType,
} from '@/lib/contracts/document.contract';
import type { DataType } from '@/lib/contracts/data-type.contract';
import type { IDocumentPort } from '@/lib/ports/document.port';
import { isDemoDataEnabled } from '@/lib/config/binding-config';
import { nextVersion } from '@/lib/contracts/document.contract';
import { ALL_GOVERNANCE_DOCUMENTS } from '@/lib/data/synthetic/governance-documents.data';

/**
 * Synthetic Document Provider - SPARCC Governance (48 documents)
 *
 * Uses SPARCC governance document structure:
 * - 7 Framework docs
 * - 17 Policies
 * - 10 Procedures
 * - 12 Templates
 * - 1 Checklist
 * - 2 Guides
 */
export class SyntheticDocumentProvider implements IDocumentPort {
  private documents: Map<string, Document> = new Map();
  private idCounter = 1;

  constructor() {
    this.initializeSPARCCDocuments();
    this.initializeDemoClientPlans();
  }

  /**
   * Initialize with all 21 Demo Client compensation plans
   * Client data (dataType: 'client')
   */
  private initializeDemoClientPlans() {
    const tenantId = 'demo-tenant-001';
    const now = new Date().toISOString();

    // Demo Client Compensation Plans (21 Total) - Real Production Data
    const DEMO_CLIENT_PLANS = [
      {
        id: 'hs-plan-001',
        tenantId: 'demo-tenant-001',
        documentCode: 'HS-MED-FSC-2025',
        title: 'Medical Surgical Field Sales Consultant (FSC) Standard Full Commission Plan',
        documentType: 'POLICY',
        category: 'Compensation Plans',
        status: 'ACTIVE',
        version: '1.0',
        effectiveDate: '2025-01-01T00:00:00.000Z',
        owner: 'VP Sales Compensation - Medical Division',
        createdBy: 'Demo Client',
        updatedBy: 'System',
        description: 'Medical - Field Sales Consultant (FSC) compensation plan for 2025',
        fileType: 'pdf',
        dataType: 'client' as DataType,
        demoMetadata: null,
        tags: ['Demo Client', 'Medical', 'FY2025', 'ACTIVE'],
      },
      {
        id: 'hs-plan-002',
        tenantId: 'demo-tenant-001',
        documentCode: 'HS-MED-SGE-2025',
        title: 'Medical Strategic Group Executive (SGE) Commission Plan',
        documentType: 'POLICY',
        category: 'Compensation Plans',
        status: 'ACTIVE',
        version: '1.0',
        effectiveDate: '2025-01-01T00:00:00.000Z',
        owner: 'VP Sales Compensation - Medical Division',
        createdBy: 'Demo Client',
        updatedBy: 'System',
        description: 'Medical - Strategic Group Executive (SGE) compensation plan for 2025',
        fileType: 'pdf',
        dataType: 'client' as DataType,
        demoMetadata: null,
        tags: ['Demo Client', 'Medical', 'FY2025', 'ACTIVE'],
      },
      {
        id: 'hs-plan-003',
        tenantId: 'demo-tenant-001',
        documentCode: 'HS-DENT-AE-2025',
        title: 'Dental Account Executive (AE) Commission Plan',
        documentType: 'POLICY',
        category: 'Compensation Plans',
        status: 'ACTIVE',
        version: '1.0',
        effectiveDate: '2025-01-01T00:00:00.000Z',
        owner: 'VP Sales Compensation - Dental Division',
        createdBy: 'Demo Client',
        updatedBy: 'System',
        description: 'Dental - Account Executive (AE) compensation plan for 2025',
        fileType: 'pdf',
        dataType: 'client' as DataType,
        demoMetadata: null,
        tags: ['Demo Client', 'Dental', 'FY2025', 'ACTIVE'],
      },
      {
        id: 'hs-plan-004',
        tenantId: 'demo-tenant-001',
        documentCode: 'HS-DENT-FSC-2025',
        title: 'Dental Field Sales Consultant (FSC) Compensation Plan',
        documentType: 'POLICY',
        category: 'Compensation Plans',
        status: 'ACTIVE',
        version: '1.1',
        effectiveDate: '2025-01-01T00:00:00.000Z',
        owner: 'VP Sales Compensation - Dental Division',
        createdBy: 'Demo Client',
        updatedBy: 'System',
        description: 'Dental - Field Sales Consultant (FSC) compensation plan for 2025',
        fileType: 'pdf',
        dataType: 'client' as DataType,
        demoMetadata: null,
        tags: ['Demo Client', 'Dental', 'FY2025', 'ACTIVE'],
      },
      {
        id: 'hs-plan-005',
        tenantId: 'demo-tenant-001',
        documentCode: 'HS-DENT-EQP-2025',
        title: 'Dental Equipment Specialist Commission Plan',
        documentType: 'POLICY',
        category: 'Compensation Plans',
        status: 'ACTIVE',
        version: '1.0',
        effectiveDate: '2025-01-01T00:00:00.000Z',
        owner: 'VP Sales Compensation - Dental Division',
        createdBy: 'Demo Client',
        updatedBy: 'System',
        description: 'Dental - Equipment Specialist compensation plan for 2025',
        fileType: 'pdf',
        dataType: 'client' as DataType,
        demoMetadata: null,
        tags: ['Demo Client', 'Dental', 'FY2025', 'ACTIVE'],
      },
      {
        id: 'hs-plan-006',
        tenantId: 'demo-tenant-001',
        documentCode: 'HS-DENT-RGM-2025',
        title: 'Dental Regional General Manager (RGM) Commission Plan',
        documentType: 'POLICY',
        category: 'Compensation Plans',
        status: 'ACTIVE',
        version: '1.0',
        effectiveDate: '2025-04-25T00:00:00.000Z',
        owner: 'VP Sales - Dental Division',
        createdBy: 'Demo Client',
        updatedBy: 'System',
        description: 'Dental - Regional General Manager (RGM) compensation plan for 2025',
        fileType: 'pdf',
        dataType: 'client' as DataType,
        demoMetadata: null,
        tags: ['Demo Client', 'Dental', 'FY2025', 'ACTIVE'],
      },
      {
        id: 'hs-plan-007',
        tenantId: 'demo-tenant-001',
        documentCode: 'HS-DENT-EQP-US-2025',
        title: 'US Dental Equipment Specialist Commission Plan',
        documentType: 'POLICY',
        category: 'Compensation Plans',
        status: 'DRAFT',
        version: '1.0',
        effectiveDate: '2025-01-01T00:00:00.000Z',
        owner: 'VP Sales Compensation - Dental Division',
        createdBy: 'Demo Client',
        updatedBy: 'System',
        description: 'Dental - Equipment Specialist (US) compensation plan for 2025',
        fileType: 'pdf',
        dataType: 'client' as DataType,
        demoMetadata: null,
        tags: ['Demo Client', 'Dental', 'FY2025', 'DRAFT'],
      },
      {
        id: 'hs-plan-008',
        tenantId: 'demo-tenant-001',
        documentCode: 'HS-BRASS-DSM-2025',
        title: 'Brasseler Dental District Sales Manager I (DSM I) Commission Plan',
        documentType: 'POLICY',
        category: 'Compensation Plans',
        status: 'DRAFT',
        version: '1.0',
        effectiveDate: '2025-01-01T00:00:00.000Z',
        owner: 'VP Sales - Brasseler Dental',
        createdBy: 'Demo Client',
        updatedBy: 'System',
        description: 'Dental - Brasseler - District Sales Manager I compensation plan for 2025',
        fileType: 'pdf',
        dataType: 'client' as DataType,
        demoMetadata: null,
        tags: ['Demo Client', 'Dental - Brasseler', 'FY2025', 'DRAFT'],
      },
      {
        id: 'hs-plan-009',
        tenantId: 'demo-tenant-001',
        documentCode: 'HS-BRASS-IAM-2025',
        title: 'Brasseler Dental Inside Account Manager (IAM) Commission Plan',
        documentType: 'POLICY',
        category: 'Compensation Plans',
        status: 'ACTIVE',
        version: '2.0',
        effectiveDate: '2025-04-01T00:00:00.000Z',
        owner: 'VP Sales - Brasseler Dental',
        createdBy: 'Demo Client',
        updatedBy: 'System',
        description: 'Dental - Brasseler - Inside Account Manager (IAM) compensation plan for 2025',
        fileType: 'pdf',
        dataType: 'client' as DataType,
        demoMetadata: null,
        tags: ['Demo Client', 'Dental - Brasseler', 'FY2025', 'ACTIVE'],
      },
      {
        id: 'hs-plan-010',
        tenantId: 'demo-tenant-001',
        documentCode: 'HS-HAYES-OSR-2025',
        title: 'Hayes Outside Sales Representative (OSR) Commission Plan',
        documentType: 'POLICY',
        category: 'Compensation Plans',
        status: 'ACTIVE',
        version: '1.0',
        effectiveDate: '2025-01-01T00:00:00.000Z',
        owner: 'VP Sales - Hayes',
        createdBy: 'Demo Client',
        updatedBy: 'System',
        description: 'Medical - Hayes - Outside Sales Representative (OSR) compensation plan for 2025',
        fileType: 'pdf',
        dataType: 'client' as DataType,
        demoMetadata: null,
        tags: ['Demo Client', 'Medical - Hayes', 'FY2025', 'ACTIVE'],
      },
      {
        id: 'hs-plan-011',
        tenantId: 'demo-tenant-001',
        documentCode: 'HS-HSONE-AE-2025',
        title: 'HS ONE Account Executive (AE/SAE) Commission Plan',
        documentType: 'POLICY',
        category: 'Compensation Plans',
        status: 'ACTIVE',
        version: '1.0',
        effectiveDate: '2025-01-01T00:00:00.000Z',
        owner: 'VP Sales - HS ONE',
        createdBy: 'Demo Client',
        updatedBy: 'System',
        description: 'HS ONE - Account Executive / Senior Account Executive compensation plan for 2025',
        fileType: 'pdf',
        dataType: 'client' as DataType,
        demoMetadata: null,
        tags: ['Demo Client', 'HS ONE', 'FY2025', 'ACTIVE'],
      },
      {
        id: 'hs-plan-012',
        tenantId: 'demo-tenant-001',
        documentCode: 'HS-HSONE-SC-2025',
        title: 'HS ONE Sales Consultant (SC) Commission Plan',
        documentType: 'POLICY',
        category: 'Compensation Plans',
        status: 'ACTIVE',
        version: '1.0',
        effectiveDate: '2025-01-01T00:00:00.000Z',
        owner: 'VP Sales - HS ONE',
        createdBy: 'Demo Client',
        updatedBy: 'System',
        description: 'HS ONE - Sales Consultant (SC) compensation plan for 2025',
        fileType: 'pdf',
        dataType: 'client' as DataType,
        demoMetadata: null,
        tags: ['Demo Client', 'HS ONE', 'FY2025', 'ACTIVE'],
      },
      {
        id: 'hs-plan-013',
        tenantId: 'demo-tenant-001',
        documentCode: 'HS-TRIM-ARM-EAST-2025',
        title: 'TriMed East Area Regional Manager (Foot and Ankle) Commission Plan',
        documentType: 'POLICY',
        category: 'Compensation Plans',
        status: 'ACTIVE',
        version: '1.0',
        effectiveDate: '2025-01-01T00:00:00.000Z',
        owner: 'VP Sales - TriMed',
        createdBy: 'Demo Client',
        updatedBy: 'System',
        description: 'Medical - TriMed - Area Regional Manager (East) compensation plan for 2025',
        fileType: 'pdf',
        dataType: 'client' as DataType,
        demoMetadata: null,
        tags: ['Demo Client', 'Medical - TriMed', 'FY2025', 'ACTIVE'],
      },
      {
        id: 'hs-plan-014',
        tenantId: 'demo-tenant-001',
        documentCode: 'HS-TRIM-ARM-WEST-2025',
        title: 'TriMed West Area Regional Manager (Foot and Ankle) Commission Plan',
        documentType: 'POLICY',
        category: 'Compensation Plans',
        status: 'ACTIVE',
        version: '1.0',
        effectiveDate: '2025-01-01T00:00:00.000Z',
        owner: 'VP Sales - TriMed',
        createdBy: 'Demo Client',
        updatedBy: 'System',
        description: 'Medical - TriMed - Area Regional Manager (West) compensation plan for 2025',
        fileType: 'pdf',
        dataType: 'client' as DataType,
        demoMetadata: null,
        tags: ['Demo Client', 'Medical - TriMed', 'FY2025', 'ACTIVE'],
      },
      {
        id: 'hs-plan-015',
        tenantId: 'demo-tenant-001',
        documentCode: 'HS-CORP-HSIP-2025',
        title: 'Demo Client Incentive Plan (HSIP)',
        documentType: 'POLICY',
        category: 'Compensation Plans',
        status: 'ACTIVE',
        version: '1.0',
        effectiveDate: '2025-01-01T00:00:00.000Z',
        owner: 'CHRO',
        createdBy: 'Demo Client',
        updatedBy: 'System',
        description: 'Corporate - All Eligible Employees compensation plan for 2025',
        fileType: 'pdf',
        dataType: 'client' as DataType,
        demoMetadata: null,
        tags: ['Demo Client', 'Corporate', 'FY2025', 'ACTIVE'],
      },
      {
        id: 'hs-plan-016',
        tenantId: 'demo-tenant-001',
        documentCode: 'HS-CORP-HSIP-OVERVIEW-2025',
        title: 'HSIC HSIP Overview',
        documentType: 'GUIDE',
        category: 'Compensation Plans',
        status: 'ACTIVE',
        version: '1.0',
        effectiveDate: '2025-01-01T00:00:00.000Z',
        owner: 'CHRO',
        createdBy: 'Demo Client',
        updatedBy: 'System',
        description: 'Corporate - All Eligible Employees compensation plan for 2025',
        fileType: 'pdf',
        dataType: 'client' as DataType,
        demoMetadata: null,
        tags: ['Demo Client', 'Corporate', 'FY2025', 'ACTIVE'],
      },
      {
        id: 'hs-plan-017',
        tenantId: 'demo-tenant-001',
        documentCode: 'HS-CORP-TSIP-2025',
        title: 'TSIP Plan Summary',
        documentType: 'GUIDE',
        category: 'Compensation Plans',
        status: 'ACTIVE',
        version: '1.0',
        effectiveDate: '2025-01-01T00:00:00.000Z',
        owner: 'VP Sales Operations',
        createdBy: 'Demo Client',
        updatedBy: 'System',
        description: 'Corporate - Territory Sales Representatives compensation plan for 2025',
        fileType: 'pdf',
        dataType: 'client' as DataType,
        demoMetadata: null,
        tags: ['Demo Client', 'Corporate', 'FY2025', 'ACTIVE'],
      },
      {
        id: 'hs-plan-018',
        tenantId: 'demo-tenant-001',
        documentCode: 'HS-COMP-HANDBOOK-2025',
        title: 'Compensation Handbook',
        documentType: 'GUIDE',
        category: 'Compensation Handbook',
        status: 'DRAFT',
        version: '0.9',
        effectiveDate: '2025-09-03T00:00:00.000Z',
        owner: 'VP Sales Compensation',
        createdBy: 'Demo Client',
        updatedBy: 'System',
        description: 'Corporate - All Sales Roles compensation plan for 2025',
        fileType: 'pdf',
        dataType: 'client' as DataType,
        demoMetadata: null,
        tags: ['Demo Client', 'Corporate', 'FY2025', 'DRAFT'],
      },
      {
        id: 'hs-plan-019',
        tenantId: 'demo-tenant-001',
        documentCode: 'HS-ATH-REP-2022',
        title: 'Athletics and Schools Account Representative Quarterly Variable Comp Program',
        documentType: 'POLICY',
        category: 'Compensation Plans',
        status: 'ARCHIVED',
        version: '1.0',
        effectiveDate: '2022-01-01T00:00:00.000Z',
        owner: 'VP Sales - Specialty Markets',
        createdBy: 'Demo Client',
        updatedBy: 'System',
        description: 'Specialty Markets - Account Representative compensation plan for 2022',
        fileType: 'pdf',
        dataType: 'client' as DataType,
        demoMetadata: null,
        tags: ['Demo Client', 'Specialty Markets', 'FY2022', 'ARCHIVED'],
      },
      {
        id: 'hs-plan-020',
        tenantId: 'demo-tenant-001',
        documentCode: 'HS-ZAHN-TM-2023',
        title: 'Zahn Tele-Managed Commission Plan',
        documentType: 'POLICY',
        category: 'Compensation Plans',
        status: 'ARCHIVED',
        version: '1.0',
        effectiveDate: '2023-01-01T00:00:00.000Z',
        owner: 'VP Sales - Zahn Dental',
        createdBy: 'Demo Client',
        updatedBy: 'System',
        description: 'Dental - Zahn - Tele-Managed Sales compensation plan for 2023',
        fileType: 'pdf',
        dataType: 'client' as DataType,
        demoMetadata: null,
        tags: ['Demo Client', 'Dental - Zahn', 'FY2023', 'ARCHIVED'],
      },
      {
        id: 'hs-plan-021',
        tenantId: 'demo-tenant-001',
        documentCode: 'HS-INTL-DE-FAQ-2025',
        title: 'Complan FAQ (Germany)',
        documentType: 'GUIDE',
        category: 'Compensation Plans',
        status: 'ACTIVE',
        version: '1.0',
        effectiveDate: '2025-01-01T00:00:00.000Z',
        owner: 'VP Sales - Germany',
        createdBy: 'Demo Client',
        updatedBy: 'System',
        description: 'International - Germany - All Sales Roles compensation plan for 2025',
        fileType: 'pdf',
        dataType: 'client' as DataType,
        demoMetadata: null,
        tags: ['Demo Client', 'International - Germany', 'FY2025', 'ACTIVE'],
      },
    ];

    DEMO_CLIENT_PLANS.forEach((plan: any) => {
      this.documents.set(plan.id, {
        ...plan,
        createdAt: new Date(plan.effectiveDate),
        lastUpdated: new Date(now),
        effectiveDate: new Date(plan.effectiveDate),
        fileSize: 200000 + Math.floor(Math.random() * 300000), // 200KB-500KB
        filePath: `documents/client/${plan.documentCode}.pdf`,
        retentionPeriod: 7,
        legalReviewStatus: 'NOT_REQUIRED' as const,
      });
    });
  }

  /**
   * Initialize with all 48 SPARCC governance documents
   */
  private initializeSPARCCDocuments() {
    const tenantId = 'demo-tenant-001';
    const now = new Date().toISOString();

    ALL_GOVERNANCE_DOCUMENTS.forEach((govDoc, index) => {
      const docId = `doc-${String(index + 1).padStart(3, '0')}`;

      const document: Document = {
        id: docId,
        tenantId,
        documentCode: govDoc.documentCode,
        title: govDoc.title,
        description: govDoc.description || '',
        documentType: govDoc.documentType as any,
        category: govDoc.category,
        tags: this.generateTags(govDoc),
        version: govDoc.version + '.0', // Convert to semantic versioning (e.g., "1.0" -> "1.0.0")
        status: govDoc.status as any,
        fileType: 'md',
        filePath: `documents/${govDoc.documentCode}.md`,
        fileSize: 15000 + Math.floor(Math.random() * 50000), // 15-65KB
        owner: govDoc.owner,
        createdBy: govDoc.owner,
        createdAt: new Date(this.generateCreatedDate(govDoc.status)),
        lastUpdated: new Date(now),
        effectiveDate: govDoc.effectiveDate ? new Date(govDoc.effectiveDate) : undefined,
        retentionPeriod: 7,
        legalReviewStatus: this.getLegalReviewStatus(govDoc),
        // Data Type Classification
        dataType: 'demo' as DataType,
        demoMetadata: {
          year: 2025,
          bu: 'SPARCC',
          division: 'Governance',
          category: 'Sample Data'
        },
      };

      this.documents.set(docId, document);
    });
  }

  private generateTags(govDoc: any): string[] {
    const tags: string[] = [govDoc.documentType.toLowerCase()];

    // Add category-based tags
    if (govDoc.category) {
      tags.push(govDoc.category.toLowerCase().replace(/\s+/g, '-'));
    }

    // Add document-code prefix as tag
    const prefix = govDoc.documentCode.split('-')[0];
    if (prefix) tags.push(prefix.toLowerCase());

    // Add specific tags based on content
    if (govDoc.documentCode.includes('SGCC') || govDoc.documentCode === 'GC-001') {
      tags.push('sgcc', 'committee');
    }
    if (govDoc.documentCode.includes('CRB') || govDoc.documentCode === 'CRB-001') {
      tags.push('crb', 'windfall', 'large-deals');
    }
    if (govDoc.title.toLowerCase().includes('compliance')) {
      tags.push('compliance', 'legal');
    }
    if (govDoc.title.toLowerCase().includes('spif')) {
      tags.push('spif', 'incentives');
    }

    return [...new Set(tags)]; // Remove duplicates
  }

  private generateCreatedDate(status: string): string {
    // Approved/Active docs created in November
    if (status === 'APPROVED' || status === 'ACTIVE') {
      return '2025-11-01T00:00:00.000Z';
    }
    // Draft/Under Review more recent
    if (status === 'DRAFT') {
      return '2025-12-10T00:00:00.000Z';
    }
    if (status === 'UNDER_REVIEW') {
      return '2025-12-05T00:00:00.000Z';
    }
    return '2025-11-15T00:00:00.000Z';
  }

  private getLegalReviewStatus(govDoc: any): 'NOT_REQUIRED' | 'PENDING' | 'APPROVED' | 'REJECTED' {
    // All policies require legal review
    if (govDoc.documentType === 'POLICY') {
      if (govDoc.status === 'APPROVED' || govDoc.status === 'ACTIVE') {
        return 'APPROVED';
      }
      if (govDoc.status === 'UNDER_REVIEW' || govDoc.status === 'DRAFT') {
        return 'PENDING';
      }
    }

    // Frameworks also require legal review
    if (govDoc.documentType === 'FRAMEWORK') {
      return govDoc.status === 'APPROVED' ? 'APPROVED' : 'NOT_REQUIRED';
    }

    return 'NOT_REQUIRED';
  }

  async findAll(filters: DocumentFilters): Promise<Document[]> {
    let results = Array.from(this.documents.values()).filter(
      doc => doc.tenantId === filters.tenantId
    );

    if (filters.status) {
      results = results.filter(doc => doc.status === filters.status);
    }

    if (filters.documentType) {
      results = results.filter(doc => doc.documentType === filters.documentType);
    }

    if (filters.category) {
      results = results.filter(doc => doc.category === filters.category);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      results = results.filter(
        doc =>
          doc.title.toLowerCase().includes(searchLower) ||
          doc.documentCode.toLowerCase().includes(searchLower) ||
          (doc.description && doc.description.toLowerCase().includes(searchLower)) ||
          (doc.tags && doc.tags.some(tag => tag.includes(searchLower)))
      );
    }

    // Sort by lastUpdated descending (most recent first)
    results.sort((a, b) =>
      b.lastUpdated.getTime() - a.lastUpdated.getTime()
    );

    return results;
  }

  async findById(id: string): Promise<Document | null> {
    const doc = this.documents.get(id);
    return doc || null;
  }

  async findByType(tenantId: string, documentType: Document['documentType']): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      doc => doc.tenantId === tenantId && doc.documentType === documentType
    );
  }

  async findByStatus(tenantId: string, status: Document['status']): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      doc => doc.tenantId === tenantId && doc.status === status
    );
  }

  async findActive(tenantId: string, asOfDate?: Date): Promise<Document[]> {
    const targetDate = asOfDate || new Date();
    return Array.from(this.documents.values()).filter(
      doc => doc.tenantId === tenantId && doc.status === 'ACTIVE' &&
        (!doc.effectiveDate || doc.effectiveDate <= targetDate) &&
        (!doc.expirationDate || doc.expirationDate > targetDate)
    );
  }

  async findVersions(documentId: string): Promise<Document[]> {
    const doc = await this.findById(documentId);
    if (!doc) return [];

    // Find all documents with same documentCode (different versions)
    return Array.from(this.documents.values()).filter(
      d => d.documentCode === doc.documentCode && d.tenantId === doc.tenantId
    );
  }

  async findLatestVersion(tenantId: string, documentCode: string): Promise<Document | null> {
    const docs = Array.from(this.documents.values()).filter(
      d => d.documentCode === documentCode && d.tenantId === tenantId
    );

    if (docs.length === 0) return null;

    // Sort by version (assuming semantic versioning)
    docs.sort((a, b) => b.version.localeCompare(a.version));
    return docs[0];
  }

  async create(data: CreateDocument): Promise<Document> {
    const id = `doc-custom-${this.idCounter++}`;
    const now = new Date().toISOString();

    const document: Document = {
      id,
      tenantId: data.tenantId,
      documentCode: data.documentCode,
      title: data.title,
      description: data.description || '',
      documentType: data.documentType,
      category: data.category || '',
      tags: data.tags || [],
      version: data.version,
      status: data.status,
      fileType: data.fileType,
      filePath: data.filePath,
      fileSize: data.fileSize,
      owner: data.owner,
      createdBy: data.createdBy,
      createdAt: new Date(now),
      lastUpdated: new Date(now),
      retentionPeriod: data.retentionPeriod,
      legalReviewStatus: data.legalReviewStatus,
      dataType: data.dataType || 'client',
      demoMetadata: data.demoMetadata,
    };

    this.documents.set(id, document);
    return document;
  }

  async update(data: UpdateDocument): Promise<Document> {
    const existing = await this.findById(data.id);
    if (!existing) {
      throw new Error(`Document not found: ${data.id}`);
    }

    const updated: Document = {
      ...existing,
      ...data,
      lastUpdated: new Date(),
    };

    this.documents.set(data.id, updated);
    return updated;
  }

  async uploadFile(documentId: string, file: File, fileType: FileType): Promise<Document> {
    throw new Error('uploadFile not implemented in synthetic provider');
  }

  async downloadFile(documentId: string): Promise<Buffer> {
    throw new Error('downloadFile not implemented in synthetic provider');
  }

  async getFileUrl(documentId: string): Promise<string> {
    const doc = await this.findById(documentId);
    if (!doc) throw new Error(`Document not found: ${documentId}`);
    return doc.filePath;
  }

  async createVersion(
    documentId: string,
    changes: Partial<Document>,
    bumpType: 'major' | 'minor' | 'patch'
  ): Promise<Document> {
    throw new Error('createVersion not implemented in synthetic provider');
  }

  async submitForReview(documentId: string, submittedBy: string): Promise<Document> {
    return this.update({
      id: documentId,
      updatedBy: submittedBy,
      status: 'UNDER_REVIEW',
    });
  }

  async submitForApproval(documentId: string, submittedBy: string, workflowId?: string): Promise<Document> {
    return this.update({
      id: documentId,
      updatedBy: submittedBy,
      status: 'PENDING_APPROVAL',
      approvalWorkflowId: workflowId,
    });
  }

  async approve(documentId: string, approvedBy: string, comments?: string): Promise<Document> {
    return this.update({
      id: documentId,
      updatedBy: approvedBy,
      status: 'APPROVED',
    });
  }

  async activate(documentId: string, activatedBy: string): Promise<Document> {
    return this.update({
      id: documentId,
      updatedBy: activatedBy,
      status: 'ACTIVE',
    });
  }

  async archive(documentId: string, archivedBy: string): Promise<Document> {
    return this.update({
      id: documentId,
      updatedBy: archivedBy,
      status: 'ARCHIVED',
    });
  }

  async reject(documentId: string, rejectedBy: string, reason: string): Promise<Document> {
    return this.update({
      id: documentId,
      updatedBy: rejectedBy,
      status: 'DRAFT',
    });
  }

  async delete(id: string, deletedBy: string): Promise<void> {
    const doc = await this.findById(id);
    if (!doc) {
      throw new Error(`Document not found: ${id}`);
    }
    this.documents.delete(id);
  }

  async countByStatus(tenantId: string): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    Array.from(this.documents.values())
      .filter(doc => doc.tenantId === tenantId)
      .forEach(doc => {
        counts[doc.status] = (counts[doc.status] || 0) + 1;
      });
    return counts;
  }

  async countByType(tenantId: string): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    Array.from(this.documents.values())
      .filter(doc => doc.tenantId === tenantId)
      .forEach(doc => {
        counts[doc.documentType] = (counts[doc.documentType] || 0) + 1;
      });
    return counts;
  }

  async search(tenantId: string, query: string): Promise<Document[]> {
    return this.findAll({ tenantId, search: query });
  }

  async findNeedingReview(tenantId: string): Promise<Document[]> {
    const now = new Date();
    return Array.from(this.documents.values()).filter(
      doc => doc.tenantId === tenantId && doc.nextReview && doc.nextReview <= now
    );
  }

  async findPendingApproval(tenantId: string): Promise<Document[]> {
    return this.findByStatus(tenantId, 'PENDING_APPROVAL');
  }

  async linkDocuments(sourceDocId: string, targetDocId: string, relationType: string): Promise<void> {
    // Simplified implementation - just update relatedDocs array
    const source = await this.findById(sourceDocId);
    if (!source) throw new Error(`Source document not found: ${sourceDocId}`);

    const relatedDocs = source.relatedDocs || [];
    if (!relatedDocs.includes(targetDocId)) {
      await this.update({
        id: sourceDocId,
        updatedBy: 'system',
        relatedDocs: [...relatedDocs, targetDocId],
      });
    }
  }

  async unlinkDocuments(sourceDocId: string, targetDocId: string): Promise<void> {
    const source = await this.findById(sourceDocId);
    if (!source) throw new Error(`Source document not found: ${sourceDocId}`);

    const relatedDocs = source.relatedDocs || [];
    await this.update({
      id: sourceDocId,
      updatedBy: 'system',
      relatedDocs: relatedDocs.filter(id => id !== targetDocId),
    });
  }
}
