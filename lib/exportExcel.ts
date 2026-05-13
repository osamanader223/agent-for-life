import * as XLSX from "xlsx";

type InvoiceRow = {
  id: number;
  vendor: string | null;
  invoice_date: string | null;
  total: number | null;
  category_name: string | null;
  confidence: number | null;
  source: string | null;
  created_at: string;
};

export function createInvoiceWorkbook(invoices: InvoiceRow[]) {
  const rows = invoices.map((invoice) => ({
    ID: invoice.id,
    Vendor: invoice.vendor || "",
    Date: invoice.invoice_date || "",
    Total: invoice.total || "",
    Category: invoice.category_name || "",
    Confidence: invoice.confidence || "",
    Source: invoice.source || "",
    CreatedAt: invoice.created_at,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");

  return XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });
}
