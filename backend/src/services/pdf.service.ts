// ─── PDF Service ────────────────────────────────
// Handles PDF text extraction and Supabase Storage uploads.

import { createClient } from '@supabase/supabase-js';
import pdfParse from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';

// Supabase client — used ONLY for storage (database is handled by Prisma).
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

// ─── Extract text from a PDF buffer ─────────────

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text.trim();
}

// ─── Upload PDF to Supabase Storage ─────────────

export async function uploadPDFToStorage(
  userId: string,
  fileBuffer: Buffer,
  fileName: string
): Promise<string> {
  const filePath = `${userId}/${uuidv4()}_${fileName}`;
  const { error } = await supabase.storage
    .from('pdfs')
    .upload(filePath, fileBuffer, { contentType: 'application/pdf' });

  if (error) throw new Error(`PDF upload failed: ${error.message}`);
  return filePath;
}
