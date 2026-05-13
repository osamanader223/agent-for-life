// [Person 3 - Backend]
import { extractInvoice } from '@/lib/ai/demo-extract';
import type { ExtractionResult } from '@/types/demo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return Response.json({ ok: false, error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return Response.json(
        { ok: false, error: 'File too large. Maximum size is 10 MB.' },
        { status: 413 }
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return Response.json(
        { ok: false, error: 'Unsupported file type. Use JPEG, PNG, WebP, or PDF.' },
        { status: 415 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');

    const result: ExtractionResult = await extractInvoice(base64, file.type);

    if (!result.ok) {
      return Response.json({ ok: false, error: result.error ?? 'Extraction failed' }, { status: 422 });
    }

    return Response.json({ ok: true, data: result });
  } catch (err) {
    console.error('[demo/extract]', err);
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
