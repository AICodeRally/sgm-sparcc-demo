'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DocumentUpload from '@/components/documents/DocumentUpload';

export default function UploadPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (files: File[], metadata: any) => {
    setUploading(true);

    try {
      for (const file of files) {
        // Create form data for file upload
        const formData = new FormData();
        formData.append('file', file);

        // In a real implementation, this would use a separate upload endpoint
        // For now, we'll create a document and simulate file attachment
        const response = await fetch('/api/sgm/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentCode: metadata.documentCode,
            title: metadata.title || file.name,
            documentType: metadata.documentType,
            description: `Uploaded: ${file.name}`,
            fileType: file.name.split('.').pop()?.toLowerCase() || 'md',
            status: 'DRAFT',
            version: '1.0.0',
            createdBy: 'system',
            owner: 'Demo User',
            tenantId: 'demo-tenant-001',
            // Mark uploaded documents as REAL data (not demo)
            isDemo: false,
            demoMetadata: null,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
      }

      // Redirect back to documents
      router.push('/documents');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--color-surface-alt)]">
      {/* Header */}
      <div className="bg-[color:var(--color-surface)] border-b border-[color:var(--color-border)] shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link href="/documents" className="text-[color:var(--color-info)] hover:text-[color:var(--color-primary)] text-sm mb-4 inline-block">
            ← Back to Documents
          </Link>
          <h1 className="text-3xl font-bold text-[color:var(--color-foreground)]">Upload Documents</h1>
          <p className="text-[color:var(--color-muted)] mt-1">Upload one or more governance documents</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {uploading ? (
          <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] p-8 text-center">
            <p className="text-[color:var(--color-muted)]">Uploading documents...</p>
          </div>
        ) : (
          <DocumentUpload
            onUpload={handleUpload}
            onClose={() => router.push('/documents')}
          />
        )}
      </div>
    </div>
  );
}
