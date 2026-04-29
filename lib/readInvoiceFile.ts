<<<<<<< HEAD
import vision from "@google-cloud/vision";
import fs from "fs";
import path from "path";

const client = new vision.ImageAnnotatorClient({
  keyFilename: "google-key.json",
});

export async function readInvoiceFile(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const tempPath = path.join(process.cwd(), "tmp", file.name);

  fs.writeFileSync(tempPath, buffer);

  const [result] = await client.textDetection(tempPath);

  fs.unlinkSync(tempPath);

  return result.fullTextAnnotation?.text || "";
=======
import { PDFParse } from "pdf-parse";

export async function readInvoiceFile(file: File): Promise<string> {
  if (file.type !== "application/pdf") {
    throw new Error("Only PDF files are supported now.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const parser = new PDFParse({ data: buffer });

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
>>>>>>> main
}