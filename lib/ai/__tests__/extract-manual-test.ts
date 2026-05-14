// [Person 1 - AI]
// Usage: npx tsx lib/ai/__tests__/extract-manual-test.ts <path-to-invoice>
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { extractInvoice } from '../demo-extract';

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: npx tsx lib/ai/__tests__/extract-manual-test.ts <path-to-invoice>');
    process.exit(1);
    return;
  }

  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    console.error(`File not found: ${resolved}`);
    process.exit(1);
    return;
  }

  const ext = path.extname(resolved).toLowerCase();
  const mimeMap: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf',
  };
  const mimeType = mimeMap[ext] ?? 'application/octet-stream';

  const fileBuffer = fs.readFileSync(resolved);
  const fileBase64 = fileBuffer.toString('base64');

  console.log(`\nExtracting: ${resolved}`);
  console.log(`MIME type : ${mimeType}`);
  console.log(`File size : ${(fileBuffer.length / 1024).toFixed(1)} KB\n`);

  const result = await extractInvoice(fileBase64, mimeType);

  if ('error' in result) {
    console.error('=== Extraction Failed ===');
    console.error(`Error: ${result.error}`);
    console.error(`Processing: ${result.processingTimeMs} ms`);
    process.exit(1);
    return;
  }

  console.log('=== Extraction Result ===');
  console.log(JSON.stringify(result.fields, null, 2));
  console.log('\n--- Metadata ---');
  console.log(`Confidence    : ${(result.confidence * 100).toFixed(1)}%`);
  console.log(`Language      : ${result.language}`);
  console.log(`Needs review  : ${result.needsReview}`);
  console.log(`Processing    : ${result.processingTimeMs} ms`);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
