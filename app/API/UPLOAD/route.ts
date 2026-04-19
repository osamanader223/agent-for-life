import { NextResponse } from "next/server";
import { readInvoiceFile } from "@/lib/readInvoiceFile";
import { parseInvoice } from "@/lib/ai";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    // OCR
    const rawText = await readInvoiceFile(file);

    // AI
    const aiResult = await parseInvoice(rawText);

    const invoiceData = JSON.parse(aiResult!);

    // Upload file
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = `invoices/${Date.now()}-${file.name}`;

    await supabase.storage.from("invoices").upload(filePath, buffer);

    // Save DB
    await supabase.from("invoices").insert([
      {
        file_name: file.name,
        file_path: filePath,
        ...invoiceData,
        raw_text: rawText,
      },
    ]);

    return NextResponse.json({
      success: true,
      invoiceData,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}