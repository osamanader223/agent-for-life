"use client";

import { useState } from "react";

type InvoiceData = {
  company_name: string;
  invoice_date: string;
  total_amount: string;
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
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Invoice AI Assistant 📄🤖</h1>

        <div className="border border-gray-700 rounded-xl p-6 bg-zinc-900">
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mb-4 block w-full text-sm"
          />

          <button
            onClick={handleUpload}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded-lg"
          >
            {loading ? "Processing..." : "Upload Invoice"}
          </button>

          {file && (
            <p className="mt-3 text-sm text-gray-300">
              Selected file: {file.name}
            </p>
          )}

          {error && <p className="mt-4 text-red-400">{error}</p>}
        </div>

        {result && (
          <div className="mt-8 border border-gray-700 rounded-xl p-6 bg-zinc-900">
            <h2 className="text-xl font-semibold mb-4">
              Extracted Invoice Data
            </h2>

            <div className="space-y-2 text-sm">
              <p>
                <strong>Company Name:</strong> {result.company_name}
              </p>
              <p>
                <strong>Invoice Date:</strong> {result.invoice_date}
              </p>
              <p>
                <strong>Total Amount:</strong> {result.total_amount}
              </p>
            </div>
          </div>
        )}

        {rawText && (
          <div className="mt-8 border border-gray-700 rounded-xl p-6 bg-zinc-900">
            <h2 className="text-xl font-semibold mb-4">Raw Extracted Text</h2>
            <pre className="whitespace-pre-wrap text-sm text-gray-300">
              {rawText}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}