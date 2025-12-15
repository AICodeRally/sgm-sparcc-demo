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
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
      }

      // Redirect back to documents
      router.push('/sgm/documents');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link href="/sgm/documents" className="text-blue-600 hover:text-blue-700 text-sm mb-4 inline-block">
            ← Back to Documents
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Upload Documents</h1>
          <p className="text-gray-600 mt-1">Upload one or more governance documents</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {uploading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-600">Uploading documents...</p>
          </div>
        ) : (
          <DocumentUpload
            onUpload={handleUpload}
            onClose={() => router.push('/sgm/documents')}
          />
        )}
      </div>
    </div>
  );
}
