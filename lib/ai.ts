import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function parseInvoice(text: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
You are an accountant AI.

Extract invoice data into clean JSON.

Return ONLY JSON (no text).

Fields:
- invoice_number
- company
- invoice_date (YYYY-MM-DD)
- due_date
- currency
- subtotal
- tax
- total
- items (array with name, quantity, price, tax)
`
      },
      {
        role: "user",
        content: text
      }
    ]
  })

  return response.choices[0].message.content
}