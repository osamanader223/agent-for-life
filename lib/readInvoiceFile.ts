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
}