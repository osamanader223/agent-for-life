// [Person 1 - AI]
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'credit';
export type InvoiceCategory =
  | 'food_cost'
  | 'utilities'
  | 'supplies'
  | 'maintenance'
  | 'salaries'
  | 'rent'
  | 'misc';
export type InvoiceLanguage = 'ar' | 'en' | 'mixed';

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
  payment_method: PaymentMethod | null;
  category: InvoiceCategory | null;
};

export type ExtractionResult =
  | {
      ok: true;
      fields: InvoiceFields;
      confidence: number;
      language: InvoiceLanguage;
      needsReview: boolean;
      processingTimeMs: number;
    }
  | {
      ok: false;
      error: string;
      processingTimeMs: number;
    };
