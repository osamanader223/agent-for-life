import { NextResponse } from "next/server";
import { readInvoiceFile } from "@/lib/readInvoiceFile";
import { extractInvoiceData } from "@/lib/ai";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "No file uploaded",
        },
        { status: 400 }
      );
    }

    const rawText = await readInvoiceFile(file);

    if (!rawText || rawText.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No text could be extracted from the file",
        },
        { status: 400 }
      );
    }

    const invoiceData = await extractInvoiceData(rawText);

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const filePath = `invoices/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("invoices")
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        {
          success: false,
          error: `Storage upload failed: ${uploadError.message}`,
        },
        { status: 500 }
      );
    }

    const { error: insertError } = await supabase.from("invoices").insert([
      {
        file_name: file.name,
        file_path: filePath,
        company_name: invoiceData.company_name,
        invoice_date: invoiceData.invoice_date,
        total_amount: invoiceData.total_amount,
        raw_text: rawText,
      },
    ]);

    if (insertError) {
      return NextResponse.json(
        {
          success: false,
          error: `Database insert failed: ${insertError.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      invoiceData,
      rawText,
      fileName: file.name,
      filePath,
    });
  } catch (error) {
    console.error("Upload route error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unexpected server error",
      },
      { status: 500 }
    );
  }
}