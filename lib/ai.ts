import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type InvoiceData = {
  company_name: string;
  invoice_date: string;
  total_amount: string;
};

function safeParseJSON(content: string): InvoiceData {
  try {
    const parsed = JSON.parse(content);

    return {
      company_name: parsed.company_name ?? "",
      invoice_date: parsed.invoice_date ?? "",
      total_amount: parsed.total_amount ?? "",
    };
  } catch (error) {
    console.error("JSON parsing failed:", content);

    return {
      company_name: "",
      invoice_date: "",
      total_amount: "",
    };
  }
}

export async function extractInvoiceData(
  text: string
): Promise<InvoiceData> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing from .env.local");
  }

  const prompt = `
You are an invoice extraction assistant.

Extract these fields from the invoice text:
- company_name
- invoice_date
- total_amount

Rules:
- Return ONLY valid JSON
- No markdown
- If a field is missing, return empty string
- invoice_date format: YYYY-MM-DD if possible
- total_amount numeric string only

Return exactly:
{
  "company_name": "",
  "invoice_date": "",
  "total_amount": ""
}

Invoice text:
${text}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content:
          "You extract structured data from invoices and return JSON only.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0,
  });

  const content = response.choices[0]?.message?.content ?? "{}";

  return safeParseJSON(content);
}