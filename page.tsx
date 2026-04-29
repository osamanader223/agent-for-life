"use client";

import { useState } from "react";
import { exportToExcel } from "@/lib/excel";

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

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<InvoiceData | null>(null);
  const [rawText, setRawText] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const upload = async () => {
    if (!file) {
      setError("Please choose a file first.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    setData(null);
    setRawText("");

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/invoices", {
        method: "POST",
        body: form,
      });

      const text = await res.text();

      let json: any;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(`Server did not return JSON. Response was: ${text.slice(0, 200)}`);
      }

      if (!res.ok) {
        throw new Error(json.error || "Upload failed");
      }

      setMessage(json.message || "Invoice processed successfully.");
      setData(json.invoiceData || null);
      setRawText(json.rawText || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0b0f14] text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-[#121823] border border-[#1f2a3a] rounded-3xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold mb-2">Invoice AI 📄🤖</h1>
          <p className="text-gray-400 mb-8">
            Upload invoice → read text → parse data → export Excel
          </p>

          <div className="bg-[#0f1622] border border-dashed border-[#2a3b52] rounded-2xl p-6">
            <input
              type="file"
              accept=".pdf,image/png,image/jpeg,image/jpg"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block mb-4 text-sm text-gray-300"
            />

            {file && (
              <p className="text-sm text-gray-400 mb-4">
                Selected file: {file.name}
              </p>
            )}

            <button
              onClick={upload}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-5 py-2 rounded-lg font-medium"
            >
              {loading ? "Processing..." : "Upload Invoice"}
            </button>

            {message && <p className="mt-4 text-green-400">{message}</p>}
            {error && <p className="mt-4 text-red-400">{error}</p>}
          </div>

          {data && (
            <div className="mt-8 bg-zinc-900 border border-gray-700 rounded-2xl p-6">
              <h2 className="text-2xl font-semibold mb-4">
                Extracted Invoice Data ✅
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <p><strong>Company:</strong> {data.company}</p>
                <p><strong>Invoice Number:</strong> {data.invoice_number}</p>
                <p><strong>Invoice Date:</strong> {data.invoice_date}</p>
                <p><strong>Due Date:</strong> {data.due_date}</p>
                <p><strong>Currency:</strong> {data.currency}</p>
                <p><strong>Subtotal:</strong> {data.subtotal}</p>
                <p><strong>Tax:</strong> {data.tax}</p>
                <p><strong>Total:</strong> {data.total}</p>
              </div>

              {data.items?.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Items 📦</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-gray-700 text-left">
                          <th className="py-2">Name</th>
                          <th className="py-2">Qty</th>
                          <th className="py-2">Price</th>
                          <th className="py-2">Tax</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.items.map((item, index) => (
                          <tr key={index} className="border-b border-gray-800">
                            <td className="py-2">{item.name}</td>
                            <td className="py-2">{item.quantity}</td>
                            <td className="py-2">{item.price}</td>
                            <td className="py-2">{item.tax}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <button
                onClick={() => exportToExcel(data)}
                className="mt-6 bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg font-medium"
              >
                Download Excel
              </button>
            </div>
          )}

          {rawText && (
            <div className="mt-8 bg-zinc-900 border border-gray-700 rounded-2xl p-6">
              <h2 className="text-2xl font-semibold mb-4">Raw Extracted Text 📄</h2>
              <pre className="whitespace-pre-wrap text-sm text-gray-300">
                {rawText}
              </pre>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}