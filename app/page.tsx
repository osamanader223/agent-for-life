"use client";

<<<<<<< HEAD
import { useState } from "react";
import { exportToExcel } from "@/lib/excel";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const upload = async () => {
    setLoading(true);

    const form = new FormData();
    form.append("file", file!);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    const json = await res.json();
    setData(json.invoiceData);
    setLoading(false);
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl mb-4">Invoice AI</h1>

      <input type="file" onChange={(e) => setFile(e.target.files![0])} />

      <button onClick={upload}>
        {loading ? "Processing..." : "Upload"}
      </button>

      {data && (
        <div>
          <h2>{data.company}</h2>
          <p>Total: {data.total}</p>

          <button onClick={() => exportToExcel(data)}>
            Download Excel
          </button>
        </div>
      )}
    </div>
=======
import { useEffect, useState } from "react";

type ParsedInvoice = {
  vendor: string | null;
  invoiceDate: string | null;
  total: number | null;
  rawText: string;
};

type Suggestion = {
  categoryId: number | null;
  categoryName: string;
  confidence: number;
  source: "rule" | "ai" | "fallback";
};

type Category = {
  id: number;
  name: string;
  type: string;
};

export default function Home() {
  const [rawText, setRawText] = useState("");
  const [parsed, setParsed] = useState<ParsedInvoice | null>(null);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [createRule, setCreateRule] = useState(true);

  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadCategories() {
      const res = await fetch("/api/categories");
      const data = await res.json();

      if (data.categories) {
        setCategories(data.categories);
      }
    }

    loadCategories();
  }, []);

  const handleAnalyze = async () => {
    if (!rawText.trim()) {
      setMessage("Please paste invoice text first.");
      return;
    }

    setAnalyzing(true);
    setMessage("");

    try {
      const res = await fetch("/api/analyze-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rawText }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Analyze failed.");
        return;
      }

      setParsed(data.parsed);
      setSuggestion(data.suggestion);

      setSelectedCategoryId(data.suggestion.categoryId || "");
      setSelectedCategoryName(data.suggestion.categoryName || "");
    } catch (error) {
      console.error(error);
      setMessage("Analyze request failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCategoryChange = (value: string) => {
    const id = Number(value);
    const category = categories.find((c) => c.id === id);

    setSelectedCategoryId(id);
    setSelectedCategoryName(category?.name || "");
  };

  const handleSave = async () => {
    if (!parsed) {
      setMessage("Analyze invoice first.");
      return;
    }

    if (!selectedCategoryId || !selectedCategoryName) {
      setMessage("Please select a category.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/save-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parsed,
          selectedCategoryId,
          selectedCategoryName,
          confidence: suggestion?.confidence || 0,
          source: suggestion?.source || "fallback",
          createRule,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Save failed.");
        return;
      }

      setMessage("Invoice saved successfully ✅");
    } catch (error) {
      console.error(error);
      setMessage("Save request failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Invoice Review</h1>
          <p className="text-gray-500 mt-1">
            Upload/extract invoice text, suggest one category, review, then save.
          </p>
        </div>

        <div>
          <label className="block font-semibold mb-2">
            Extracted Invoice Text
          </label>

          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste extracted invoice text here..."
            className="w-full h-40 border rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:bg-blue-300"
        >
          {analyzing ? "Analyzing..." : "Suggest Category"}
        </button>

        {parsed && suggestion && (
          <div className="border rounded-xl p-5 bg-gray-50 space-y-4">
            <h2 className="text-xl font-bold">Review Result</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Vendor</p>
                <p className="font-semibold">{parsed.vendor || "Unknown"}</p>
              </div>

              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-semibold">{parsed.invoiceDate || "Unknown"}</p>
              </div>

              <div>
                <p className="text-gray-500">Total</p>
                <p className="font-semibold">
                  {parsed.total !== null ? `$${parsed.total}` : "Unknown"}
                </p>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-4">
              <p className="text-gray-500 text-sm">AI Suggested Category</p>
              <p className="text-lg font-bold">{suggestion.categoryName}</p>
              <p className="text-sm text-gray-600">
                Confidence: {(suggestion.confidence * 100).toFixed(0)}% · Source:{" "}
                {suggestion.source}
              </p>
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Accept or Change Category
              </label>

              <select
                value={selectedCategoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full border rounded-xl p-3 bg-white"
              >
                <option value="">Select category</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={createRule}
                onChange={(e) => setCreateRule(e.target.checked)}
              />
              Remember this vendor/category as a rule
            </label>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold disabled:bg-green-300"
            >
              {saving ? "Saving..." : "Save Invoice"}
            </button>
          </div>
        )}

        {message && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-xl">
            {message}
          </div>
        )}
      </div>
    </main>
>>>>>>> main
  );
}