import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function parseInvoice(text: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `
You are an expert accountant AI.

Extract invoice data into STRICT JSON.

Return ONLY JSON. No explanation.

Schema:
{
  "invoice_number": string,
  "company": string,
  "invoice_date": "YYYY-MM-DD",
  "due_date": "YYYY-MM-DD",
  "currency": string,
  "subtotal": number,
  "tax": number,
  "total": number,
  "items": [
    {
      "name": string,
      "quantity": number,
      "price": number,
      "tax": number
    }
  ]
}
        `,
      },
      {
        role: "user",
        content: text,
      },
    ],
  });

  return response.choices[0].message.content;
}