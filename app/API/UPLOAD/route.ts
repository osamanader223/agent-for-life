import { NextResponse } from "next/server";
import { readInvoiceFile } from "@/lib/readInvoiceFile";
import { parseInvoice } from "@/lib/ai";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

type InvoiceItem = {
  name: string;
  quantity: number;
  price: number;
  tax: number;
};

type InvoiceData = {
  invoice_number: string;
  company: string;
  invoice_date: string;
  due_date: string;
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  items: InvoiceItem[];
};

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

    // 1️⃣ Extract text from invoice
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

    // 2️⃣ Send extracted text to AI
    const parsedResult = await parseInvoice(rawText);

    let invoiceData: InvoiceData;

    try {
      invoiceData =
        typeof parsedResult === "string"
          ? JSON.parse(parsedResult)
          : parsedResult;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "AI returned invalid JSON",
          rawAiResponse: parsedResult,
        },
        { status: 500 }
      );
    }

    // 3️⃣ Upload file to Supabase Storage
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

    // 4️⃣ Save invoice data in database
    const { error: insertError } = await supabase.from("invoices").insert([
      {
        file_name: file.name,
        file_path: filePath,
        invoice_number: invoiceData.invoice_number,
        company: invoiceData.company,
        invoice_date: invoiceData.invoice_date,
        due_date: invoiceData.due_date,
        currency: invoiceData.currency,
        subtotal: invoiceData.subtotal,
        tax: invoiceData.tax,
        total: invoiceData.total,
        items: invoiceData.items,
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

    // 5️⃣ Return result to frontend
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
          error instanceof Error
            ? error.message
            : "Unexpected server error",
      },
      { status: 500 }
    );
  }
}