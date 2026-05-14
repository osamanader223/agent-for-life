// [Person 1 - AI]
// Usage: npx tsx lib/ai/__tests__/batch-test.ts [invoices-dir]
// Runs all images/PDFs in a directory. Multi-page PDFs are split per page.
import { config } from 'dotenv';
config({ path: '.env.local' });

import fs from 'fs';
import path from 'path';
import { extractInvoice, getPdfPageCount, extractPdfPage } from '../demo-extract';

const SUPPORTED = new Set(['.jpg', '.jpeg', '.png', '.webp', '.pdf']);
const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
};

interface Row {
  label: string;
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

async function processImage(label: string, base64: string, mime: string): Promise<Row> {
  process.stdout.write(`  ${label.padEnd(35)} ... `);
  const result = await extractInvoice(base64, mime);
  const tag = result.ok ? `✓ ${(result.confidence * 100).toFixed(0)}%` : `✗ ${result.error}`;
  console.log(tag);

  if (!result.ok) {
    return { label, ok: false, confidence: null, needsReview: null, vendor: null, date: null, total: null, vatOk: null, ms: result.processingTimeMs, error: result.error };
  }

  const f = result.fields;
  let vatOk: boolean | null = null;
  if (f.subtotal !== null && f.vat_amount !== null && f.total !== null) {
    const computed = Math.round((f.subtotal + f.vat_amount) * 100);
    const actual = Math.round(f.total * 100);
    vatOk = Math.abs(computed - actual) <= 100; // 1 SAR tolerance
  }

  return {
    label,
    ok: true,
    confidence: result.confidence,
    needsReview: result.needsReview,
    vendor: f.vendor_name ?? f.vendor_name_ar,
    date: f.invoice_date,
    total: f.total,
    vatOk,
    ms: result.processingTimeMs,
  };
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

  console.log(`\nBatch extracting from: ${dir}\n`);

  const rows: Row[] = [];

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const ext = path.extname(file).toLowerCase();
    const buffer = fs.readFileSync(fullPath);

    if (buffer.length < 100) {
      rows.push({ label: file, ok: false, confidence: null, needsReview: null, vendor: null, date: null, total: null, vatOk: null, ms: 0, error: 'Placeholder stub (<100 bytes)' });
      continue;
    }

    const base64 = buffer.toString('base64');

    if (ext === '.pdf') {
      // Split multi-page PDFs — each page is one invoice
      console.log(`  [PDF] ${file} — counting pages...`);
      const pageCount = await getPdfPageCount(base64);
      console.log(`        ${pageCount} page(s) found`);

      for (let p = 1; p <= pageCount; p++) {
        const label = pageCount === 1 ? file : `${file} [p${p}/${pageCount}]`;
        const pageDataUrl = await extractPdfPage(base64, p);
        // extractPdfPage returns a data:image/png;base64,... URL — strip prefix for extractInvoice
        const pageBase64 = pageDataUrl.replace(/^data:image\/png;base64,/, '');
        const row = await processImage(label, pageBase64, 'image/png');
        rows.push(row);
      }
    } else {
      const mime = MIME[ext] ?? 'application/octet-stream';
      const row = await processImage(file, base64, mime);
      rows.push(row);
    }
  }

  // Summary table
  const W = 100;
  console.log('\n' + '═'.repeat(W));
  console.log(
    'Invoice'.padEnd(38) +
    'OK'.padEnd(5) +
    'Conf'.padEnd(7) +
    'Review'.padEnd(8) +
    'VAT✓'.padEnd(7) +
    'Total SAR'.padEnd(12) +
    'ms'
  );
  console.log('─'.repeat(W));

  for (const r of rows) {
    console.log(
      r.label.slice(0, 36).padEnd(38) +
      (r.ok ? '✓' : '✗').padEnd(5) +
      (r.confidence !== null ? `${(r.confidence * 100).toFixed(0)}%` : '-').padEnd(7) +
      (r.needsReview !== null ? (r.needsReview ? 'yes' : 'no') : '-').padEnd(8) +
      (r.vatOk !== null ? (r.vatOk ? '✓' : '✗') : '-').padEnd(7) +
      (r.total !== null ? r.total.toFixed(2) : '-').padEnd(12) +
      r.ms +
      (r.error ? `  ← ${r.error}` : '')
    );
  }

  console.log('─'.repeat(W));

  const success = rows.filter((r) => r.ok);
  const avgConf = success.length
    ? success.reduce((s, r) => s + (r.confidence ?? 0), 0) / success.length
    : 0;
  const vatChecked = success.filter((r) => r.vatOk !== null);
  const vatPassed = success.filter((r) => r.vatOk === true);
  const avgMs = rows.length ? rows.reduce((s, r) => s + r.ms, 0) / rows.length : 0;

  console.log(`\nTotal invoices : ${rows.length}`);
  console.log(`Success        : ${success.length} / ${rows.length} (${((success.length / rows.length) * 100).toFixed(0)}%)`);
  console.log(`Avg confidence : ${(avgConf * 100).toFixed(1)}%`);
  console.log(`Needs review   : ${success.filter((r) => r.needsReview).length}`);
  console.log(`VAT arithmetic : ${vatPassed.length} / ${vatChecked.length} passed`);
  console.log(`Avg time       : ${avgMs.toFixed(0)} ms/invoice`);

  const gate = success.length / rows.length >= 0.85 && avgConf >= 0.75;
  console.log(`\nDay 3 gate (≥85% success, ≥75% avg conf): ${gate ? '✅ PASS' : '❌ FAIL'}`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
