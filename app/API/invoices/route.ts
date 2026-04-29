import { NextResponse } from "next/server";
import { readInvoiceFile } from "@/lib/readInvoiceFile";
import { parseInvoice } from "@/lib/parseInvoice";

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
    const invoiceData = await parseInvoice(rawText);

    return NextResponse.json({
      success: true,
      message: "Invoice parsed successfully ✅",
      fileName: file.name,
      rawText,
      invoiceData,
    });
  } catch (error) {
    console.error("Invoice API error:", error);

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