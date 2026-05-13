// [Person 3 - Backend]
// Stub for Person 1's real AI extraction. Returns realistic mock data so the
// frontend can be developed and tested independently.
import type { ExtractionResult } from '@/types/demo';

const MOCK_VENDORS = [
  { en: 'Al Watania Poultry', ar: 'الوطنية للدواجن', vat: '300012345600003' },
  { en: 'Almarai Company', ar: 'شركة المراعي', vat: '300000547800003' },
  { en: 'Sadafco', ar: 'سدافكو', vat: '300001234500003' },
  { en: 'Savola Foods', ar: 'مجموعة سافولا', vat: '300000987600003' },
  { en: 'NUPCO', ar: 'الشركة الوطنية للتوريد', vat: '300009876500003' },
] as const;

const PAYMENT_METHODS = ['cash', 'card', 'bank_transfer', 'credit'] as const;

export async function extractInvoice(
  _base64: string,
  _mimeType: string
): Promise<ExtractionResult> {
  const start = Date.now();

  const vendor = MOCK_VENDORS[Math.floor(Math.random() * MOCK_VENDORS.length)];
  const subtotal = parseFloat((Math.random() * 2000 + 200).toFixed(2));
  const vatAmount = parseFloat((subtotal * 0.15).toFixed(2));
  const total = parseFloat((subtotal + vatAmount).toFixed(2));
  const invoiceNum = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

  return {
    ok: true,
    fields: {
      vendor_name: vendor.en,
      vendor_name_ar: vendor.ar,
      vendor_vat_number: vendor.vat,
      invoice_number: invoiceNum,
      invoice_date: new Date().toISOString().split('T')[0],
      subtotal,
      vat_amount: vatAmount,
      total,
      currency: 'SAR',
      payment_method: PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)],
      category: 'food_cost',
    },
    confidence: parseFloat((0.85 + Math.random() * 0.12).toFixed(2)),
    language: 'ar',
    needsReview: false,
    processingTimeMs: Date.now() - start,
  };
}
