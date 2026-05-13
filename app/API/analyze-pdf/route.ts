import { PDFParse } from "pdf-parse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    console.log("✅ /api/analyze-pdf called");

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json(
        { error: "No PDF file uploaded" },
        { status: 400 }
      );
    }

    console.log("File received:", file.name, file.type, file.size);

    if (file.type !== "application/pdf") {
      return Response.json(
        { error: "Uploaded file is not a PDF" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();

    const rawText = result.text?.trim() || "";

    console.log("Extracted text length:", rawText.length);
    console.log("Extracted preview:", rawText.slice(0, 300));

    if (!rawText || rawText.length < 10) {
      return Response.json(
        {
          error:
            "PDF has no readable text. It may be a scanned/image PDF and needs OCR.",
        },
        { status: 400 }
      );
    }

    return Response.json({
      rawText,
    });
  } catch (error) {
    console.error("PDF extraction real error:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to extract PDF",
      },
      { status: 500 }
    );
  }
}