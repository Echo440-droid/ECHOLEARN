// ─── Document Service ───────────────────────────
// Handles text extraction from PDF and DOCX files, and Supabase Storage uploads.

import { createClient } from '@supabase/supabase-js';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { v4 as uuidv4 } from 'uuid';

// Supabase client — used ONLY for storage (database is handled by Prisma).
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

// ─── Supported file types ───────────────────────

export type SupportedFileType = 'pdf' | 'docx';

// Magic-byte detection for uploaded files.
export function detectFileType(buffer: Buffer): SupportedFileType | null {
  // PDF: starts with "%PDF"
  if (buffer.length >= 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return 'pdf';
  }
  // DOCX (ZIP): starts with PK\x03\x04
  if (buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04) {
    return 'docx';
  }
  return null;
}

// ─── Extract text from a PDF buffer ─────────────

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text.trim();
}

// ─── Extract text from a DOCX buffer ────────────

export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  // TODO(security): mammoth parses DOCX (ZIP/XML) — external entities are not
  // expanded by default, but keep an eye on future CVEs for the library.
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}

// ─── Unified text extraction dispatcher ─────────

export async function extractTextFromDocument(
  buffer: Buffer,
  fileType: SupportedFileType
): Promise<string> {
  switch (fileType) {
    case 'pdf':
      return extractTextFromPDF(buffer);
    case 'docx':
      return extractTextFromDOCX(buffer);
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

// Content-type map for storage uploads.
const CONTENT_TYPE_MAP: Record<SupportedFileType, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

// ─── Upload document to Supabase Storage ────────

export async function uploadDocumentToStorage(
  userId: string,
  fileBuffer: Buffer,
  fileName: string,
  fileType: SupportedFileType
): Promise<string> {
  // Sanitise the file name so the storage key contains no spaces,
  // apostrophes, or other characters Supabase Storage rejects.
  const safeName = fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')   // replace problematic chars
    .replace(/_{2,}/g, '_');              // collapse consecutive underscores
  const filePath = `${userId}/${uuidv4()}_${safeName}`;
  const { error } = await supabase.storage
    .from('pdfs')
    .upload(filePath, fileBuffer, { contentType: CONTENT_TYPE_MAP[fileType] });

  if (error) throw new Error(`Document upload failed: ${error.message}`);
  return filePath;
}

// ─── Re-export legacy names for backward compat ─

export { uploadDocumentToStorage as uploadPDFToStorage };
