import { NextResponse } from "next/server";
import { extractInvoiceData } from "@/lib/ai";

export async function POST(req: Request) {
  const body = await req.json();

  const result = await extractInvoiceData(body.text);

  return NextResponse.json({ result });
}