"use client";
<<<<<<< HEAD

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
=======
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: any) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
  const res = await fetch("/api/upload", {
    method: "POST",
    body: JSON.stringify({
      text: "Invoice from ABC company, date 2024, total $500",
    }),
  });

  const data = await res.json();

  console.log(data);
};

  return (
    <main className="min-h-screen bg-[#0b0f14] flex items-center justify-center p-6">
      
      <div className="w-full max-w-2xl bg-[#121823] rounded-3xl shadow-2xl p-8 border border-[#1f2a3a]">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            مساعد الفواتير بالذكاء الاصطناعي
          </h1>
          <p className="text-gray-400 mt-2">
            ارفع الفاتورة وخلي الذكاء الاصطناعي يقرأها
          </p>
        </div>

        <div className="border border-dashed border-[#2a3b52] rounded-2xl p-6 text-center bg-[#0f1622]">

          <input 
            type="file" 
            onChange={handleFileChange}
            className="mx-auto mb-4 block text-sm text-gray-300"
          />

          <p className="text-gray-500 text-sm">
            ارفع الفاتورة (PDF, JPG, PNG)
          </p>

        </div>

  <button onClick={handleUpload}>
  Analyze Invoice
</button>
    

      </div>    
>>>>>>> ad6c2a544ca68d50fe4fdbf57adf908553c6aef8
    </main>
  );
}