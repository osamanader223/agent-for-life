import { extractText, getDocumentProxy } from "unpdf";
import { createWorker } from "tesseract.js";

function cleanText(text: string): string {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function readInvoiceFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  // PDF
  if (file.type === "application/pdf") {
    const pdf = await getDocumentProxy(uint8Array);
    const { text } = await extractText(pdf, {
      mergePages: true,
    });

    return cleanText(text);
  }

  // Images OCR
  if (
    file.type.startsWith("image/") &&
    ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.type)
  ) {
    const worker = await createWorker("eng");

    try {
      const result = await worker.recognize(uint8Array);
      return cleanText(result.data.text);
    } finally {
      await worker.terminate();
    }
  }

  throw new Error("Unsupported file type. Upload PDF or image.");
}