export type ParsedInvoice = {
  vendor: string | null;
  invoiceDate: string | null;
  total: number | null;
  rawText: string;
};

export type CategorySuggestion = {
  categoryId: number | null;
  categoryName: string;
  confidence: number;
  source: "rule" | "ai" | "fallback";
};
