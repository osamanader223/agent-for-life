import { z } from "zod";

export const InvoiceItemSchema = z.object({
  name: z.string(),
  description: z.string().nullable(), // ✅ fixed
  quantity: z.number(),
  price: z.number(),
  tax: z.number(),
});

export const InvoiceSchema = z.object({
  invoice_number: z.string(),
  company: z.string().nullable(),       // ✅ fixed
  invoice_date: z.string().nullable(),
  due_date: z.string().nullable(),
  currency: z.string().nullable(),
  subtotal: z.number().nullable(),
  tax: z.number().nullable(),
  total: z.number(),
  items: z.array(InvoiceItemSchema).nullable(), // ✅ fixed
});

export type InvoiceData = z.infer<typeof InvoiceSchema>;