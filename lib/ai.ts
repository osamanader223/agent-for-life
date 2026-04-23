import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { InvoiceSchema, type InvoiceData } from "@/lib/schema";

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
        content:
          "You are an expert invoice extraction engine. Extract structured invoice data only. Normalize dates to YYYY-MM-DD. Convert amounts to numbers without currency symbols. Return valid structured data only.",
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