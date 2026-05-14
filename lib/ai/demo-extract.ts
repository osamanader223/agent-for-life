// [Person 1 - AI]
import OpenAI from 'openai';
import { INVOICE_EXTRACTION_PROMPT } from './prompts';
import type { ExtractionResult } from '@/types/demo';

// Lazy singleton — avoids instantiation before env vars are loaded
let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
}

export async function extractInvoice(
  fileBase64: string,
  mimeType: string
): Promise<ExtractionResult> {
  const startTime = Date.now();

  try {
    const imageDataUrl = mimeType.startsWith('image/')
      ? `data:${mimeType};base64,${fileBase64}`
      : await convertPdfToImage(fileBase64);

    // First pass — always high detail for receipt accuracy
    let result = await callVision(imageDataUrl, 'high', startTime);

    // Retry once if confidence is low
    if (result.ok && result.confidence < 0.6) {
      console.log(`[extract] low confidence (${result.confidence}), retrying`);
      result = await callVision(imageDataUrl, 'high', startTime, true);
    }

    return result;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Extraction failed';
    return { ok: false, error: message, processingTimeMs: Date.now() - startTime };
  }
}

async function callVision(
  imageDataUrl: string,
  detail: 'auto' | 'low' | 'high',
  startTime: number,
  isRetry = false
): Promise<ExtractionResult> {
  const userText = isRetry
    ? 'Re-examine this invoice carefully. Some fields may be small or partially obscured. Return the same JSON schema — do not skip any field.'
    : 'Extract this invoice data.';

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    temperature: 0,
    max_tokens: 2500,
    messages: [
      { role: 'system', content: INVOICE_EXTRACTION_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: userText },
          { type: 'image_url', image_url: { url: imageDataUrl, detail } },
        ],
      },
    ],
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('Empty response from AI');

  const parsed = JSON.parse(content);
  const confidence: number = typeof parsed.confidence === 'number' ? parsed.confidence : 0.5;

  console.log(`[extract] detail:${detail} confidence:${confidence} tokens:`, response.usage);

  return {
    ok: true,
    fields: {
      vendor_name: parsed.vendor_name ?? null,
      vendor_name_ar: parsed.vendor_name_ar ?? null,
      vendor_vat_number: parsed.vendor_vat_number ?? null,
      vendor_cr_number: parsed.vendor_cr_number ?? null,
      vendor_phone: parsed.vendor_phone ?? null,
      vendor_address: parsed.vendor_address ?? null,
      invoice_number: parsed.invoice_number ?? null,
      invoice_date: parsed.invoice_date ?? null,
      invoice_time: parsed.invoice_time ?? null,
      subtotal: typeof parsed.subtotal === 'number' ? parsed.subtotal : null,
      vat_rate: typeof parsed.vat_rate === 'number' ? parsed.vat_rate : 0.15,
      vat_amount: typeof parsed.vat_amount === 'number' ? parsed.vat_amount : null,
      discount: typeof parsed.discount === 'number' ? parsed.discount : null,
      total: typeof parsed.total === 'number' ? parsed.total : null,
      currency: parsed.currency ?? 'SAR',
      payment_method: parsed.payment_method ?? null,
      category: parsed.category ?? null,
    },
    confidence,
    language: parsed.language ?? 'en',
    needsReview: confidence < 0.85,
    processingTimeMs: Date.now() - startTime,
  };
}

async function loadPdfDoc(pdfBase64: string) {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  (pdfjsLib as any).GlobalWorkerOptions.workerSrc = '';
  const pdfData = Buffer.from(pdfBase64, 'base64');
  return (pdfjsLib as any).getDocument({
    data: new Uint8Array(pdfData),
    useSystemFonts: true,
    isEvalSupported: false,
    disableFontFace: true,
  }).promise;
}

async function renderPageToDataUrl(pdfDoc: any, pageNum: number): Promise<string> {
  const { createCanvas } = await import('@napi-rs/canvas');
  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale: 2.0 });
  const canvas = createCanvas(Math.round(viewport.width), Math.round(viewport.height));
  const ctx = canvas.getContext('2d');
  await page.render({ canvasContext: ctx as unknown as CanvasRenderingContext2D, viewport }).promise;
  page.cleanup();
  return `data:image/png;base64,${canvas.toBuffer('image/png').toString('base64')}`;
}

async function convertPdfToImage(pdfBase64: string): Promise<string> {
  const pdfDoc = await loadPdfDoc(pdfBase64);
  const dataUrl = await renderPageToDataUrl(pdfDoc, 1);
  await pdfDoc.destroy();
  return dataUrl;
}

/** Returns the number of pages in a PDF */
export async function getPdfPageCount(pdfBase64: string): Promise<number> {
  const pdfDoc = await loadPdfDoc(pdfBase64);
  const count: number = pdfDoc.numPages;
  await pdfDoc.destroy();
  return count;
}

/** Extracts a single page from a PDF as a base64 PNG data URL */
export async function extractPdfPage(pdfBase64: string, pageNum: number): Promise<string> {
  const pdfDoc = await loadPdfDoc(pdfBase64);
  const dataUrl = await renderPageToDataUrl(pdfDoc, pageNum);
  await pdfDoc.destroy();
  return dataUrl;
}
