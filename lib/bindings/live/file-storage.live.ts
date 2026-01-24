/**
 * Live File Storage Provider - Local filesystem implementation
 *
 * Stores files in the local filesystem under the uploads/ directory.
 * Uses crypto.createHash for SHA-256 checksums and fs/promises for file operations.
 * Can be swapped for Vercel Blob or S3 in production.
 */

import type { IFileStoragePort } from '@/lib/ports/file-storage.port';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

const UPLOADS_ROOT = path.join('/Users/toddlebaron/dev/sgm-sparcc-demo', 'uploads');

/**
 * Map file extension to MIME content type
 */
function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.csv': 'text/csv',
    '.txt': 'text/plain',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.html': 'text/html',
    '.xml': 'application/xml',
    '.zip': 'application/zip',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Calculate SHA-256 checksum of a buffer
 */
function calculateChecksum(data: Buffer): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export class LiveFileStorageProvider implements IFileStoragePort {
  /**
   * Ensure the target directory exists
   */
  private async ensureDir(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, { recursive: true });
  }

  /**
   * Resolve the full filesystem path for a bucket/file
   */
  private resolvePath(bucket: string, fileName: string): string {
    return path.join(UPLOADS_ROOT, bucket, fileName);
  }

  async uploadFile(
    file: File,
    bucket: string,
    fileName: string
  ): Promise<{ path: string; checksum: string; size: number }> {
    const targetDir = path.join(UPLOADS_ROOT, bucket);
    await this.ensureDir(targetDir);

    const targetPath = this.resolvePath(bucket, fileName);

    // Convert File (Web API) to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Write file to disk
    await fs.writeFile(targetPath, buffer);

    // Calculate checksum
    const checksum = calculateChecksum(buffer);

    // Relative path for storage reference
    const relativePath = path.join(bucket, fileName);

    return {
      path: relativePath,
      checksum,
      size: buffer.length,
    };
  }

  async downloadFile(filePath: string): Promise<Buffer> {
    const fullPath = path.join(UPLOADS_ROOT, filePath);

    try {
      const buffer = await fs.readFile(fullPath);
      return buffer;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw new Error(`File not found: ${filePath}`);
      }
      throw error;
    }
  }

  async getFileUrl(filePath: string): Promise<string> {
    // For local filesystem, return a relative path
    // In production, this would return a signed URL for S3/Blob
    return `/uploads/${filePath}`;
  }

  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(UPLOADS_ROOT, filePath);

    try {
      await fs.unlink(fullPath);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // File already doesn't exist, treat as success
        return;
      }
      throw error;
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    const fullPath = path.join(UPLOADS_ROOT, filePath);

    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async getFileMetadata(filePath: string): Promise<{ size: number; contentType: string }> {
    const fullPath = path.join(UPLOADS_ROOT, filePath);

    try {
      const stats = await fs.stat(fullPath);
      return {
        size: stats.size,
        contentType: getContentType(fullPath),
      };
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw new Error(`File not found: ${filePath}`);
      }
      throw error;
    }
  }

  async copyFile(
    sourcePath: string,
    destinationPath: string
  ): Promise<{ path: string; checksum: string }> {
    const fullSourcePath = path.join(UPLOADS_ROOT, sourcePath);
    const fullDestPath = path.join(UPLOADS_ROOT, destinationPath);

    // Ensure destination directory exists
    const destDir = path.dirname(fullDestPath);
    await this.ensureDir(destDir);

    // Read source file
    const buffer = await fs.readFile(fullSourcePath);

    // Write to destination
    await fs.writeFile(fullDestPath, buffer);

    // Calculate checksum of copied file
    const checksum = calculateChecksum(buffer);

    return {
      path: destinationPath,
      checksum,
    };
  }
}
