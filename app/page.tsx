"use client";

import { useState } from "react";

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

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InvoiceData | null>(null);
  const [rawText, setRawText] = useState("");
  const [error, setError] = useState("");

  async function handleUpload() {
    if (!file) {
      setError("Please choose a file first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setRawText("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setResult(data.invoiceData || null);
      setRawText(data.rawText || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0b0f14] text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="w-full bg-[#121823] rounded-3xl shadow-2xl p-8 border border-[#1f2a3a]">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">
              مساعد الفواتير بالذكاء الاصطناعي 📄🤖
            </h1>
            <p className="text-gray-400 mt-2">
              ارفع الفاتورة وخلي الذكاء الاصطناعي يقرأها ويستخرج البيانات
            </p>
          </div>

          <div className="border border-dashed border-[#2a3b52] rounded-2xl p-6 text-center bg-[#0f1622]">
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mx-auto mb-4 block text-sm text-gray-300"
            />

            <p className="text-gray-500 text-sm">
              ارفع الفاتورة (PDF, JPG, PNG)
            </p>

            {file && (
              <p className="mt-3 text-sm text-gray-300">
                Selected file: {file.name}
              </p>
            )}

            <button
              onClick={handleUpload}
              disabled={loading}
              className="mt-5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-5 py-2 rounded-lg font-medium transition"
            >
              {loading ? "Processing..." : "Analyze Invoice"}
            </button>

            {error && <p className="mt-4 text-red-400">{error}</p>}
          </div>

          {result && (
            <div className="mt-8 space-y-6">
              <div className="border border-gray-700 rounded-xl p-6 bg-zinc-900">
                <h2 className="text-xl font-semibold mb-4">
                  Extracted Invoice Data ✅
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <p>
                    <strong>Company:</strong> {result.company}
                  </p>
                  <p>
                    <strong>Invoice Number:</strong> {result.invoice_number}
                  </p>
                  <p>
                    <strong>Invoice Date:</strong> {result.invoice_date}
                  </p>
                  <p>
                    <strong>Due Date:</strong> {result.due_date}
                  </p>
                  <p>
                    <strong>Currency:</strong> {result.currency}
                  </p>
                  <p>
                    <strong>Subtotal:</strong> {result.subtotal}
                  </p>
                  <p>
                    <strong>Tax:</strong> {result.tax}
                  </p>
                  <p>
                    <strong>Total:</strong> {result.total}
                  </p>
                </div>
              </div>

              <div className="border border-gray-700 rounded-xl p-6 bg-zinc-900">
                <h2 className="text-xl font-semibold mb-4">Invoice Items 📦</h2>

                {result.items && result.items.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-gray-700 text-left">
                          <th className="py-2">Item Name</th>
                          <th className="py-2">Quantity</th>
                          <th className="py-2">Price</th>
                          <th className="py-2">Tax</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.items.map((item, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-800 text-gray-300"
                          >
                            <td className="py-2">{item.name}</td>
                            <td className="py-2">{item.quantity}</td>
                            <td className="py-2">{item.price}</td>
                            <td className="py-2">{item.tax}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-400">No items found.</p>
                )}
              </div>

              <div className="border border-gray-700 rounded-xl p-6 bg-zinc-900">
                <h2 className="text-xl font-semibold mb-4">Raw Extracted Text</h2>
                <pre className="whitespace-pre-wrap text-sm text-gray-300">
                  {rawText}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}