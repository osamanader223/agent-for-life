// [Person 1 - AI]
// Usage: npx tsx lib/ai/__tests__/batch-test.ts [invoices-dir]
// Runs all images/PDFs in a directory and prints a summary table.
import { config } from 'dotenv';
config({ path: '.env.local' });

import fs from 'fs';
import path from 'path';
import { extractInvoice } from '../demo-extract';

const SUPPORTED = new Set(['.jpg', '.jpeg', '.png', '.webp', '.pdf']);
const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
};

interface Row {
  file: string;
  ok: boolean;
  confidence: number | null;
  needsReview: boolean | null;
  vendor: string | null;
  date: string | null;
  total: number | null;
  vatOk: boolean | null;
  ms: number;
  error?: string;
}

async function main() {
  const dir = path.resolve(process.argv[2] ?? 'public/samples');
  if (!fs.existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(dir)
    .filter((f) => SUPPORTED.has(path.extname(f).toLowerCase()))
    .sort();

  if (files.length === 0) {
    console.error('No supported files found in', dir);
    process.exit(1);
  }

  console.log(`\nBatch extracting ${files.length} file(s) from ${dir}\n`);

  const rows: Row[] = [];

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const ext = path.extname(file).toLowerCase();
    const mimeType = MIME[ext] ?? 'application/octet-stream';
    const buffer = fs.readFileSync(fullPath);

    if (buffer.length < 100) {
      rows.push({
        file,
        ok: false,
        confidence: null,
        needsReview: null,
        vendor: null,
        date: null,
        total: null,
        vatOk: null,
        ms: 0,
        error: 'File too small — placeholder?',
      });
      continue;
    }

    process.stdout.write(`  ${file} ... `);
    const result = await extractInvoice(buffer.toString('base64'), mimeType);
    console.log(result.ok ? `✓ ${(result.confidence * 100).toFixed(0)}%` : `✗ ${result.error}`);

    if (!result.ok) {
      rows.push({ file, ok: false, confidence: null, needsReview: null, vendor: null, date: null, total: null, vatOk: null, ms: result.processingTimeMs, error: result.error });
      continue;
    }

    const f = result.fields;
    let vatOk: boolean | null = null;
    if (f.subtotal !== null && f.vat_amount !== null && f.total !== null) {
      const expected = Math.round((f.subtotal + f.vat_amount) * 100);
      const actual = Math.round(f.total * 100);
      vatOk = Math.abs(expected - actual) <= 100; // 1 SAR tolerance
    }

    rows.push({
      file,
      ok: true,
      confidence: result.confidence,
      needsReview: result.needsReview,
      vendor: f.vendor_name ?? f.vendor_name_ar,
      date: f.invoice_date,
      total: f.total,
      vatOk,
      ms: result.processingTimeMs,
    });
  }

  // Summary table
  console.log('\n' + '═'.repeat(90));
  console.log(
    'File'.padEnd(30) +
    'OK'.padEnd(5) +
    'Conf'.padEnd(8) +
    'Review'.padEnd(9) +
    'VAT✓'.padEnd(7) +
    'Vendor'.padEnd(25) +
    'ms'
  );
  console.log('─'.repeat(90));
  for (const r of rows) {
    console.log(
      r.file.padEnd(30) +
      (r.ok ? '✓' : '✗').padEnd(5) +
      (r.confidence !== null ? `${(r.confidence * 100).toFixed(0)}%` : '-').padEnd(8) +
      (r.needsReview !== null ? (r.needsReview ? 'yes' : 'no') : '-').padEnd(9) +
      (r.vatOk !== null ? (r.vatOk ? '✓' : '✗') : '-').padEnd(7) +
      (r.vendor ?? '-').slice(0, 23).padEnd(25) +
      r.ms
    );
  }
  console.log('─'.repeat(90));

  const success = rows.filter((r) => r.ok);
  const avgConf = success.length
    ? success.reduce((s, r) => s + (r.confidence ?? 0), 0) / success.length
    : 0;

  console.log(`\nTotal: ${rows.length} | Success: ${success.length} | Avg confidence: ${(avgConf * 100).toFixed(1)}%`);
  console.log(`Needs review: ${success.filter((r) => r.needsReview).length} | VAT arithmetic OK: ${success.filter((r) => r.vatOk === true).length}/${success.filter((r) => r.vatOk !== null).length}`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
