// [Person 3 - Backend]
export type InvoiceFields = {
  vendor_name: string | null;
  vendor_name_ar: string | null;
  vendor_vat_number: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  subtotal: number | null;
  vat_amount: number | null;
  total: number | null;
  currency: string;
  payment_method: 'cash' | 'card' | 'bank_transfer' | 'credit' | null;
  category: string | null;
};

export type ExtractionResult = {
  ok: boolean;
  fields?: InvoiceFields;
  confidence?: number;
  language?: 'ar' | 'en' | 'mixed';
  needsReview?: boolean;
  processingTimeMs?: number;
  error?: string;
};
