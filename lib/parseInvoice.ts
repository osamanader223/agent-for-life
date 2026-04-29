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
  }

  return parsed;
}