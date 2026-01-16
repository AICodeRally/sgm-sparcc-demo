/**
 * Document Links & Relationships
 * Graph visualization of policy dependencies
 */

export type LinkType =
  | 'REFERENCES'
  | 'IMPLEMENTS'
  | 'GOVERNED_BY'
  | 'EVIDENCE_FOR'
  | 'SUPERSEDES'
  | 'RELATED_TO';

export interface DocumentLink {
  id: string;
  sourceDocCode: string;
  targetDocCode: string;
  linkType: LinkType;
  description?: string;
  createdAt: string;
}

export interface DocumentNode {
  id: string;
  documentCode: string;
  title: string;
  type: string;
  status: string;
  incomingLinks: number;
  outgoingLinks: number;
}

export interface LinkTypeInfo {
  name: string;
  description: string;
  color: string;
}

export interface GraphStats {
  totalDocuments: number;
  totalLinks: number;
}

/**
 * Document relationship links
 */
export const DOCUMENT_LINKS: DocumentLink[] = [
  // Framework → Policy relationships
  {
    id: 'link-001',
    sourceDocCode: 'SCP-001',
    targetDocCode: 'GC-001',
    linkType: 'GOVERNED_BY',
    description: 'Plan Design Policy governed by SGCC Charter',
    createdAt: '2025-01-01',
  },
  {
    id: 'link-002',
    sourceDocCode: 'SCP-007',
    targetDocCode: 'CRB-001',
    linkType: 'GOVERNED_BY',
    description: 'Windfall Policy governed by CRB Charter',
    createdAt: '2025-01-01',
  },
  {
    id: 'link-003',
    sourceDocCode: 'SCP-017',
    targetDocCode: 'SCP-001',
    linkType: 'REFERENCES',
    description: 'Mid-Period Plan Change references Plan Design Policy',
    createdAt: '2025-11-15',
  },

  // Policy → Procedure relationships
  {
    id: 'link-004',
    sourceDocCode: 'PROC-001',
    targetDocCode: 'SCP-001',
    linkType: 'IMPLEMENTS',
    description: 'Plan Design Procedure implements Plan Design Policy',
    createdAt: '2025-01-15',
  },
  {
    id: 'link-005',
    sourceDocCode: 'PROC-002',
    targetDocCode: 'SCP-009',
    linkType: 'IMPLEMENTS',
    description: 'Commission Payment implements Commission Calculation Policy',
    createdAt: '2025-01-15',
  },
  {
    id: 'link-006',
    sourceDocCode: 'PROC-003',
    targetDocCode: 'SCP-009',
    linkType: 'IMPLEMENTS',
    description: 'Statement Distribution implements Commission Policy',
    createdAt: '2025-01-15',
  },

  // Policy → Template relationships
  {
    id: 'link-007',
    sourceDocCode: 'TMPL-001',
    targetDocCode: 'SCP-001',
    linkType: 'IMPLEMENTS',
    description: 'Plan Document Template implements Plan Design Policy',
    createdAt: '2025-01-20',
  },
  {
    id: 'link-008',
    sourceDocCode: 'TMPL-002',
    targetDocCode: 'SCP-010',
    linkType: 'IMPLEMENTS',
    description: 'SPIF Template implements SPIF Policy',
    createdAt: '2025-01-20',
  },

  // Cross-policy references
  {
    id: 'link-009',
    sourceDocCode: 'SCP-011',
    targetDocCode: 'SCP-013',
    linkType: 'RELATED_TO',
    description: 'Exception Policy related to Dispute Resolution',
    createdAt: '2025-02-01',
  },
  {
    id: 'link-010',
    sourceDocCode: 'SCP-003',
    targetDocCode: 'SCP-005',
    linkType: 'REFERENCES',
    description: 'Territory Policy references Split Credit Rules',
    createdAt: '2025-02-01',
  },
  {
    id: 'link-011',
    sourceDocCode: 'SCP-006',
    targetDocCode: 'SCP-002',
    linkType: 'REFERENCES',
    description: 'New Hire Ramp references Quota Setting',
    createdAt: '2025-02-01',
  },
  {
    id: 'link-012',
    sourceDocCode: 'SCP-012',
    targetDocCode: 'SCP-014',
    linkType: 'REFERENCES',
    description: 'Draw Policy references Clawback Policy',
    createdAt: '2025-02-01',
  },

  // Compliance relationships
  {
    id: 'link-013',
    sourceDocCode: 'SCP-015',
    targetDocCode: 'GC-001',
    linkType: 'EVIDENCE_FOR',
    description: 'Compliance Policy provides evidence for SGCC governance',
    createdAt: '2025-03-01',
  },
  {
    id: 'link-014',
    sourceDocCode: 'PROC-005',
    targetDocCode: 'SCP-015',
    linkType: 'IMPLEMENTS',
    description: 'Audit Procedure implements Compliance Policy',
    createdAt: '2025-03-01',
  },

  // Supersedes relationships (version history)
  {
    id: 'link-015',
    sourceDocCode: 'SCP-017',
    targetDocCode: 'SCP-001',
    linkType: 'SUPERSEDES',
    description: 'v2.0 Mid-Period Policy supersedes v1.0 guidance in Plan Design',
    createdAt: '2025-12-15',
  },
];

/**
 * Document nodes for graph visualization
 */
export const DOCUMENT_NODES: DocumentNode[] = [
  // Frameworks
  { id: 'GC-001', documentCode: 'GC-001', title: 'SGCC Charter', type: 'FRAMEWORK', status: 'APPROVED', incomingLinks: 0, outgoingLinks: 2 },
  { id: 'CRB-001', documentCode: 'CRB-001', title: 'CRB Charter', type: 'FRAMEWORK', status: 'APPROVED', incomingLinks: 0, outgoingLinks: 1 },

  // Policies
  { id: 'SCP-001', documentCode: 'SCP-001', title: 'Plan Design & Approval Policy', type: 'POLICY', status: 'APPROVED', incomingLinks: 2, outgoingLinks: 3 },
  { id: 'SCP-002', documentCode: 'SCP-002', title: 'Quota Setting Framework', type: 'POLICY', status: 'APPROVED', incomingLinks: 1, outgoingLinks: 0 },
  { id: 'SCP-003', documentCode: 'SCP-003', title: 'Territory Alignment Policy', type: 'POLICY', status: 'APPROVED', incomingLinks: 0, outgoingLinks: 1 },
  { id: 'SCP-005', documentCode: 'SCP-005', title: 'Split Credit Rules', type: 'POLICY', status: 'APPROVED', incomingLinks: 1, outgoingLinks: 0 },
  { id: 'SCP-006', documentCode: 'SCP-006', title: 'New Hire Ramp Policy', type: 'POLICY', status: 'APPROVED', incomingLinks: 0, outgoingLinks: 1 },
  { id: 'SCP-007', documentCode: 'SCP-007', title: 'Windfall Deal Review', type: 'POLICY', status: 'APPROVED', incomingLinks: 1, outgoingLinks: 0 },
  { id: 'SCP-009', documentCode: 'SCP-009', title: 'Commission Calculation', type: 'POLICY', status: 'APPROVED', incomingLinks: 0, outgoingLinks: 2 },
  { id: 'SCP-010', documentCode: 'SCP-010', title: 'SPIF Design & Approval', type: 'POLICY', status: 'APPROVED', incomingLinks: 0, outgoingLinks: 1 },
  { id: 'SCP-011', documentCode: 'SCP-011', title: 'Exception Request Policy', type: 'POLICY', status: 'APPROVED', incomingLinks: 0, outgoingLinks: 1 },
  { id: 'SCP-012', documentCode: 'SCP-012', title: 'Draw & Guarantee Policy', type: 'POLICY', status: 'APPROVED', incomingLinks: 0, outgoingLinks: 1 },
  { id: 'SCP-013', documentCode: 'SCP-013', title: 'Dispute Resolution', type: 'POLICY', status: 'APPROVED', incomingLinks: 1, outgoingLinks: 0 },
  { id: 'SCP-014', documentCode: 'SCP-014', title: 'Clawback Policy', type: 'POLICY', status: 'APPROVED', incomingLinks: 1, outgoingLinks: 0 },
  { id: 'SCP-015', documentCode: 'SCP-015', title: 'Compliance & Audit', type: 'POLICY', status: 'APPROVED', incomingLinks: 1, outgoingLinks: 1 },
  { id: 'SCP-017', documentCode: 'SCP-017', title: 'Mid-Period Plan Change', type: 'POLICY', status: 'IN_REVIEW', incomingLinks: 0, outgoingLinks: 2 },

  // Procedures
  { id: 'PROC-001', documentCode: 'PROC-001', title: 'Plan Design Procedure', type: 'PROCEDURE', status: 'APPROVED', incomingLinks: 1, outgoingLinks: 0 },
  { id: 'PROC-002', documentCode: 'PROC-002', title: 'Commission Payment', type: 'PROCEDURE', status: 'APPROVED', incomingLinks: 1, outgoingLinks: 0 },
  { id: 'PROC-003', documentCode: 'PROC-003', title: 'Statement Distribution', type: 'PROCEDURE', status: 'APPROVED', incomingLinks: 1, outgoingLinks: 0 },
  { id: 'PROC-005', documentCode: 'PROC-005', title: 'Audit Procedure', type: 'PROCEDURE', status: 'APPROVED', incomingLinks: 1, outgoingLinks: 0 },

  // Templates
  { id: 'TMPL-001', documentCode: 'TMPL-001', title: 'Plan Document Template', type: 'TEMPLATE', status: 'APPROVED', incomingLinks: 1, outgoingLinks: 0 },
  { id: 'TMPL-002', documentCode: 'TMPL-002', title: 'SPIF Template', type: 'TEMPLATE', status: 'APPROVED', incomingLinks: 1, outgoingLinks: 0 },
];

/**
 * Get links for a specific document
 */
export function getDocumentLinks(documentCode: string) {
  return DOCUMENT_LINKS.filter(
    link => link.sourceDocCode === documentCode || link.targetDocCode === documentCode
  );
}

/**
 * Get related documents
 */
export function getRelatedDocuments(documentCode: string) {
  const links = getDocumentLinks(documentCode);
  const relatedCodes = new Set<string>();

  links.forEach(link => {
    if (link.sourceDocCode === documentCode) {
      relatedCodes.add(link.targetDocCode);
    } else {
      relatedCodes.add(link.sourceDocCode);
    }
  });

  return DOCUMENT_NODES.filter(node => relatedCodes.has(node.documentCode));
}

/**
 * Link type metadata
 */
export const LINK_TYPE_INFO = {
  REFERENCES: {
    name: 'References',
    color: '#3b82f6',
    description: 'Document references another document'
  },
  IMPLEMENTS: {
    name: 'Implements',
    color: '#10b981',
    description: 'Procedure/Template implements a Policy'
  },
  GOVERNED_BY: {
    name: 'Governed By',
    color: '#8b5cf6',
    description: 'Policy governed by Framework/Charter'
  },
  EVIDENCE_FOR: {
    name: 'Evidence For',
    color: '#f59e0b',
    description: 'Document provides evidence for compliance'
  },
  SUPERSEDES: {
    name: 'Supersedes',
    color: '#ef4444',
    description: 'New version supersedes old version'
  },
  RELATED_TO: {
    name: 'Related To',
    color: '#6b7280',
    description: 'Documents are related'
  },
};

/**
 * Graph statistics
 */
export const GRAPH_STATS = {
  totalDocuments: DOCUMENT_NODES.length,
  totalLinks: DOCUMENT_LINKS.length,
  avgLinksPerDoc: (DOCUMENT_LINKS.length * 2 / DOCUMENT_NODES.length).toFixed(1),
  byLinkType: {
    REFERENCES: DOCUMENT_LINKS.filter(l => l.linkType === 'REFERENCES').length,
    IMPLEMENTS: DOCUMENT_LINKS.filter(l => l.linkType === 'IMPLEMENTS').length,
    GOVERNED_BY: DOCUMENT_LINKS.filter(l => l.linkType === 'GOVERNED_BY').length,
    EVIDENCE_FOR: DOCUMENT_LINKS.filter(l => l.linkType === 'EVIDENCE_FOR').length,
    SUPERSEDES: DOCUMENT_LINKS.filter(l => l.linkType === 'SUPERSEDES').length,
    RELATED_TO: DOCUMENT_LINKS.filter(l => l.linkType === 'RELATED_TO').length,
  },
};
