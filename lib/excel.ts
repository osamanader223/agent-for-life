import * as XLSX from "xlsx";

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
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Invoice");

  XLSX.writeFile(
    workbook,
    `${data.company || "invoice"}-${data.invoice_number || "file"}.xlsx`
  );
}
