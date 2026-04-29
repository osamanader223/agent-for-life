import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import type { InvoiceData } from "@/lib/schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🧠 Define output schema
const CategorySchema = z.object({
  category: z.string(),
  confidence: z.number().min(0).max(1),
});

export async function categorizeInvoice(
  invoice: InvoiceData,
  categories: string[]
) {
  const completion = await openai.chat.completions.parse({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `
You are a professional accountant.

Your job is to categorize invoices.

Rules:
- Choose ONLY from provided categories
- Use vendor, items, and description
- If unsure → lower confidence
- Never invent categories
        `,
      },
      {
        role: "user",
        content: `
Invoice Data:
Vendor: ${invoice.vendor}
Amount: ${invoice.total}
Date: ${invoice.date}
Items: ${invoice.items?.map(i => i.description).join(", ")}

Available Categories:
${categories.join(", ")}
        `,
      },
    ],
    response_format: zodResponseFormat(CategorySchema, "category"),
  });

  const parsed = completion.choices[0].message.parsed;

  if (!parsed) {
    throw new Error("Categorization failed.");
  }

  return parsed;
}