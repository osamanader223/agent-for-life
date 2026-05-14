// Discriminated union — TypeScript narrows based on `ok`

export type InvoiceFields = {
  vendor_name: string | null;
  vendor_name_ar: string | null;
  vendor_vat_number: string | null;
  vendor_cr_number: string | null;
  vendor_phone: string | null;
  vendor_address: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  invoice_time: string | null;
  subtotal: number | null;
  vat_rate: number;
  vat_amount: number | null;
  discount: number | null;
  total: number | null;
  currency: string;
  payment_method: "cash" | "card" | "bank_transfer" | "credit" | null;
  category: string | null;
};

export type InvoiceLanguage = "ar" | "en" | "mixed";

export type ExtractionSuccess = {
  ok: true;
  fields: InvoiceFields;
  confidence: number;
  language: InvoiceLanguage;
  needsReview: boolean;
  processingTimeMs: number;
};

export type ExtractionFailure = {
  ok: false;
  error: string;
  processingTimeMs: number;
};

export type ExtractionResult = ExtractionSuccess | ExtractionFailure;
