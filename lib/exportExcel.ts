import * as XLSX from "xlsx";

<<<<<<< HEAD
type InvoiceItem = {
  name: string;
  quantity: number;
  price: number;
  tax: number;
};

type InvoiceData = {
  invoice_number: string;
  company: string;
  invoice_date: string;
  due_date: string;
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  items: InvoiceItem[];
};

export function exportToExcel(data: InvoiceData) {
  const rows = data.items.map((item) => ({
    Company: data.company,
    "Invoice Number": data.invoice_number,
    "Invoice Date": data.invoice_date,
    "Due Date": data.due_date,
    Currency: data.currency,
    Subtotal: data.subtotal,
    "Tax Total": data.tax,
    Total: data.total,
    "Item Name": item.name,
    Quantity: item.quantity,
    Price: item.price,
    "Item Tax": item.tax,
=======
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
>>>>>>> 71ee61182afb7dffdb16c78820cef620a34814dc
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();

<<<<<<< HEAD
  XLSX.utils.book_append_sheet(workbook, worksheet, "Invoice");

  XLSX.writeFile(
    workbook,
    `${data.company || "invoice"}-${data.invoice_number || "file"}.xlsx`
  );
=======
  XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");

  return XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });
>>>>>>> 71ee61182afb7dffdb16c78820cef620a34814dc
}
