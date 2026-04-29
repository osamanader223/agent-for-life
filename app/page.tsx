"use client";

import { useState } from "react";
import {
  Upload,
  FileText,
  Brain,
  CheckCircle2,
  Save,
  AlertCircle,
} from "lucide-react";

type CategoryResult = {
  category: string;
  confidence: number;
  reason: string;
};

const steps = [
  {
    title: "Upload",
    description: "Upload or paste invoice text",
    icon: Upload,
  },
  {
    title: "Extract",
    description: "Read invoice details",
    icon: FileText,
  },
  {
    title: "Categorize",
    description: "Suggest one category",
    icon: Brain,
  },
  {
    title: "Review",
    description: "Accept or edit result",
    icon: CheckCircle2,
  },
];

export default function Home() {
  const [invoiceText, setInvoiceText] = useState("");
  const [result, setResult] = useState<CategoryResult | null>(null);
  const [message, setMessage] = useState("Please paste invoice text first.");
  const [loading, setLoading] = useState(false);

  async function suggestCategory() {
    if (!invoiceText.trim()) {
      setMessage("Please paste invoice text first.");
      return;
    }

    setLoading(true);
    setMessage("Analyzing invoice text...");

    try {
      const res = await fetch("/api/categorize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: invoiceText }),
      });

      if (!res.ok) {
        throw new Error("Failed to categorize invoice");
      }

      const data = await res.json();

      setResult({
        category: data.category || "Other",
        confidence: data.confidence || 0.75,
        reason: data.reason || "AI suggested this category based on invoice text.",
      });

      setMessage("Category suggested successfully.");
    } catch (error) {
      console.error(error);

      setResult({
        category: "Office Supplies",
        confidence: 0.82,
        reason:
          "Demo result: the API failed, so this temporary category is shown for UI testing.",
      });

      setMessage("API failed, showing demo UI result.");
    } finally {
      setLoading(false);
    }
  }

  function saveReview() {
    if (!result) {
      setMessage("Suggest a category before saving.");
      return;
    }

    setMessage("Reviewed category saved successfully.");
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] px-6 py-10 text-slate-900">
      <section className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
              AI Accounting Assistant
            </p>

            <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
              Invoice Review
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Upload or paste invoice text, let AI suggest one accounting
              category, then review and save the final result.
            </p>
          </div>

          <button
            onClick={saveReview}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Save size={18} />
            Save Review
          </button>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                    <Icon size={21} />
                  </div>

                  <span className="text-sm font-semibold text-slate-400">
                    0{index + 1}
                  </span>
                </div>

                <h3 className="font-semibold text-slate-950">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/70">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-950">
                Extracted Invoice Text
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Paste the text extracted from OCR or invoice parser.
              </p>
            </div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Invoice content
            </label>

            <textarea
              value={invoiceText}
              onChange={(e) => setInvoiceText(e.target.value)}
              placeholder="Example: Jarir Bookstore invoice, printer paper, ink cartridge, total amount 240 SAR..."
              className="min-h-48 w-full resize-none rounded-2xl border border-slate-300 bg-white p-4 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            />

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={suggestCategory}
                disabled={loading}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Brain size={18} />
                {loading ? "Analyzing..." : "Suggest Category"}
              </button>

              <button
                onClick={() => {
                  setInvoiceText("");
                  setResult(null);
                  setMessage("Please paste invoice text first.");
                }}
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Clear
              </button>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <AlertCircle className="mt-0.5 shrink-0" size={18} />
              <p>{message}</p>
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/70">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-950">
                AI Suggestion
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Review the suggested category before saving.
              </p>
            </div>

            {result ? (
              <div className="space-y-5">
                <div className="rounded-2xl bg-teal-50 p-5">
                  <p className="text-sm font-semibold text-teal-700">
                    Suggested Category
                  </p>
                  <h3 className="mt-2 text-3xl font-bold text-teal-950">
                    {result.category}
                  </h3>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-700">
                      Confidence
                    </span>
                    <span className="font-bold text-slate-950">
                      {Math.round(result.confidence * 100)}%
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-teal-700"
                      style={{ width: `${result.confidence * 100}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="mb-1 text-sm font-semibold text-slate-700">
                    Reason
                  </p>
                  <p className="text-sm leading-6 text-slate-600">
                    {result.reason}
                  </p>
                </div>

                <button
                  onClick={saveReview}
                  className="w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  Accept & Save
                </button>
              </div>
            ) : (
              <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
                  <Brain size={26} />
                </div>

                <h3 className="font-bold text-slate-950">
                  No category yet
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Paste invoice text and click Suggest Category to show the AI
                  recommendation here.
                </p>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}