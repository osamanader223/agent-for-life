import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function extractInvoiceData(text: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You extract invoice data and return JSON only.",
      },
      {
        role: "user",
        content: `
Extract:
- company_name
- invoice_date
- total_amount

Return JSON only.

Text:
${text}
        `,
      },
    ],
  });

  return response.choices[0].message.content;
}