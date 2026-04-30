import { getData, CanvasFactory } from "pdf-parse/worker";
import { PDFParse } from "pdf-parse";

PDFParse.setWorker(getData());

export async function readInvoiceFile(file: File): Promise<string> {
  if (file.type !== "application/pdf") {
    throw new Error("Only PDF files are supported now.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const parser = new PDFParse({
    data: buffer,
    CanvasFactory,
  });

  try {
    const result = await parser.getText();
    const text = (result.text || "").trim();

    if (!text) {
      throw new Error("No text found in PDF.");
    }

    return text;
  } finally {
    await parser.destroy();
  }
}