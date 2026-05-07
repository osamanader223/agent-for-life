"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!file) {
      alert("Please choose a PDF first");
      return;
    }

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // STEP 1: Extract text from PDF
      const extractRes = await fetch("/api/analyze-pdf", {
        method: "POST",
        body: formData,
      });

      const extractData = await extractRes.json();

      if (!extractRes.ok) {
        console.error("PDF extract error:", extractData);
        alert(extractData.error || "Failed to extract PDF");
        return;
      }

      console.log("Extracted PDF text:", extractData.rawText);

      // STEP 2: Send extracted text to categorization API
      const analyzeRes = await fetch("/api/analyze-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rawText: extractData.rawText,
        }),
      });

      const analyzeData = await analyzeRes.json();

      if (!analyzeRes.ok) {
        console.error("Analyze error:", analyzeData);
        alert(analyzeData.error || "Failed to categorize invoice");
        return;
      }

      setResult(analyzeData);
    } catch (error) {
      console.error("Frontend analyze error:", error);
      alert("Unexpected error. Check terminal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Invoice Review</h1>
          <p className="text-gray-500 mt-1">
            Upload a PDF invoice, extract text, then suggest one category.
          </p>
        </div>

        <div>
          <label className="block font-semibold mb-2">Upload Invoice PDF</label>

          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0] || null;
              setFile(selectedFile);
              setResult(null);
            }}
            className="w-full border rounded-xl p-3 bg-white"
          />

          {file && (
            <p className="text-sm text-gray-500 mt-2">
              Selected file: {file.name}
            </p>
          )}
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:bg-blue-300"
        >
          {loading ? "Analyzing..." : "Analyze PDF"}
        </button>

        {result && (
          <div className="border rounded-xl p-5 bg-gray-50 space-y-3">
            <h2 className="text-xl font-bold">Result</h2>

            <p>
              <span className="font-semibold">Vendor:</span>{" "}
              {result.parsed?.vendor || "Unknown"}
            </p>

            <p>
              <span className="font-semibold">Date:</span>{" "}
              {result.parsed?.invoiceDate || "Unknown"}
            </p>

            <p>
              <span className="font-semibold">Total:</span>{" "}
              {result.parsed?.total !== null && result.parsed?.total !== undefined
                ? `$${result.parsed.total}`
                : "Unknown"}
            </p>

            <p>
              <span className="font-semibold">Category:</span>{" "}
              {result.suggestion?.categoryName || "Unknown"}
            </p>

            <p>
              <span className="font-semibold">Confidence:</span>{" "}
              {result.suggestion?.confidence !== undefined
                ? `${Math.round(result.suggestion.confidence * 100)}%`
                : "Unknown"}
            </p>

            <p>
              <span className="font-semibold">Source:</span>{" "}
              {result.suggestion?.source || "Unknown"}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}