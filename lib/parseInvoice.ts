import OpenAI from "openai";
import * as dotenv from "dotenv";
import * as path from "path";
import { zodResponseFormat } from "openai/helpers/zod";
import { InvoiceSchema, type InvoiceData } from "./schema";

// 🔥 Load environment variables (for tsx testing)
dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function parseInvoice(rawText: string): Promise<InvoiceData> {
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
- Convert amounts to numbers (no currency symbols)
- Extract as much as possible
- If field missing → leave empty or null
- Return ONLY valid structured data
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