// [Person 1 - AI]
import OpenAI from 'openai';
import { INVOICE_EXTRACTION_PROMPT } from './prompts';
import type { ExtractionResult } from '@/types/demo';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function extractInvoice(
  fileBase64: string,
  mimeType: string
): Promise<ExtractionResult> {
  const startTime = Date.now();

  try {
    const imageDataUrl = mimeType.startsWith('image/')
      ? `data:${mimeType};base64,${fileBase64}`
      : await convertPdfToImage(fileBase64);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      temperature: 0,
      max_tokens: 1000,
      messages: [
        { role: 'system', content: INVOICE_EXTRACTION_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract this invoice data.' },
            { type: 'image_url', image_url: { url: imageDataUrl, detail: 'high' } },
          ],
        },
      ],
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('Empty response from AI');

    const parsed = JSON.parse(content);
    const confidence = parsed.confidence ?? 0.5;

    console.log('[extract] tokens:', response.usage);

    return {
      ok: true,
      fields: {
        vendor_name: parsed.vendor_name ?? null,
        vendor_name_ar: parsed.vendor_name_ar ?? null,
        vendor_vat_number: parsed.vendor_vat_number ?? null,
        invoice_number: parsed.invoice_number ?? null,
        invoice_date: parsed.invoice_date ?? null,
        subtotal: parsed.subtotal ?? null,
        vat_amount: parsed.vat_amount ?? null,
        total: parsed.total ?? null,
        currency: parsed.currency ?? 'SAR',
        payment_method: parsed.payment_method ?? null,
        category: parsed.category ?? null,
      },
      confidence,
      language: parsed.language ?? 'en',
      needsReview: confidence < 0.85,
      processingTimeMs: Date.now() - startTime,
    };
  } catch (err: any) {
    return {
      ok: false,
      error: err.message ?? 'Extraction failed',
      processingTimeMs: Date.now() - startTime,
    };
  }
}

async function convertPdfToImage(_pdfBase64: string): Promise<string> {
  throw new Error('PDF support coming soon — please upload as image');
}
