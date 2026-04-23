import { z } from "zod";

export const InvoiceItemSchema = z.object({
  name: z.string(),
  quantity: z.number(),
  price: z.number(),
  tax: z.number(),
});

export const InvoiceSchema = z.object({
  invoice_number: z.string(),
  company: z.string(),
  invoice_date: z.string(),
  due_date: z.string(),
  currency: z.string(),
  subtotal: z.number(),
  tax: z.number(),
  total: z.number(),
  items: z.array(InvoiceItemSchema),
});

export type InvoiceData = z.infer<typeof InvoiceSchema>;