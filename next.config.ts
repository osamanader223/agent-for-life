import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "pdf-parse",
    "@napi-rs/canvas",
    "pdfjs-dist",
    "unpdf",
    "tesseract.js",
    "@google-cloud/vision",
  ],
};

export default nextConfig;
