<<<<<<< HEAD
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { InvoiceSchema, type InvoiceData } from "@/lib/schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function parseInvoice(rawText: string): Promise<InvoiceData> {
  if (!rawText || rawText.trim().length === 0) {
    throw new Error("Missing raw invoice text.");
  }

  const completion = await openai.chat.completions.parse({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `
You are an expert invoice extraction engine.

Extract structured invoice data.

Rules:
- Normalize dates to YYYY-MM-DD
- Convert amounts to numbers. Do not include currency symbols.
- Extract vendor, invoice date, invoice number, subtotal, tax, total, and line items if available.
- If a field is missing, return null or an empty array where appropriate.
- Return only valid structured data.
        `,
      },
      {
        role: "user",
        content: rawText,
      },
    ],
    response_format: zodResponseFormat(InvoiceSchema, "invoice"),
  });

  const parsed = completion.choices[0].message.parsed;

  if (!parsed) {
    throw new Error("AI parsing failed.");
=======
import { ParsedInvoice } from "@/types/invoice";

function extractTotal(text: string): number | null {
  const totalRegexes = [
    /total\s*[:\-]?\s*\$?\s*([0-9]+(?:\.[0-9]{1,2})?)/i,
    /amount\s*due\s*[:\-]?\s*\$?\s*([0-9]+(?:\.[0-9]{1,2})?)/i,
    /\$\s*([0-9]+(?:\.[0-9]{1,2})?)/
  ];

  for (const regex of totalRegexes) {
    const match = text.match(regex);
    if (match?.[1]) {
      return Number(match[1]);
    }
>>>>>>> main
  }

  return null;
}

function extractDate(text: string): string | null {
  const dateRegexes = [
    /\b\d{4}-\d{2}-\d{2}\b/,
    /\b\d{2}\/\d{2}\/\d{4}\b/,
    /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/
  ];

  for (const regex of dateRegexes) {
    const match = text.match(regex);
    if (match?.[0]) {
      return match[0];
    }
  }

  return null;
}

function extractVendor(text: string): string | null {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines[0] || null;
}

export function parseInvoice(rawText: string): ParsedInvoice {
  return {
    vendor: extractVendor(rawText),
    invoiceDate: extractDate(rawText),
    total: extractTotal(rawText),
    rawText,
  };
}
