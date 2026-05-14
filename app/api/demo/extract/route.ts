import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { extractInvoice } from "@/lib/ai/demo-extract";
import type { ExtractionResult } from "@/types/demo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/* ── Rate limiting: 10 extractions per IP per hour (in-memory) ── */
const rateLimitMap = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000;

function checkRateLimit(ip: string): { allowed: boolean } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + RATE_WINDOW_MS });
    return { allowed: true };
  }
  if (entry.count >= RATE_LIMIT) return { allowed: false };
  entry.count++;
  return { allowed: true };
}

const CATEGORY_LABELS: Record<string, string> = {
  food_cost: "مواد غذائية",
  utilities: "مرافق",
  supplies: "مستلزمات",
  maintenance: "صيانة",
  salaries: "رواتب",
  rent: "إيجار",
  misc: "متنوع",
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];

export async function POST(request: Request) {
  try {
    /* ── Rate limit ── */
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headersList.get("x-real-ip") ??
      "unknown";

    if (!checkRateLimit(ip).allowed) {
      return NextResponse.json(
        { ok: false, error: "تجاوزت الحد المسموح (10 استخراجات في الساعة). حاول مجدداً لاحقاً." },
        { status: 429, headers: { "Retry-After": "3600" } }
      );
    }

    /* ── Validate request ── */
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { ok: false, error: "لم يتم رفع أي ملف" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { ok: false, error: "حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { ok: false, error: "نوع الملف غير مدعوم. استخدم JPG أو PNG أو PDF" },
        { status: 400 }
      );
    }

    /* ── API key guard ── */
    if (!process.env.OPENAI_API_KEY) {
      console.error("[extract] OPENAI_API_KEY is not set");
      // Dev fallback — return mock data so the demo still works without a key
      await new Promise((r) => setTimeout(r, 1500));
      return NextResponse.json({
        parsed: {
          vendor: "شركة المطاعم السعودية",
          invoiceDate: new Date().toISOString().split("T")[0],
          total: "1380",
          invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
          vat: "180",
          subtotal: "1200",
          currency: "SAR",
        },
        suggestion: { categoryName: "مواد غذائية", confidence: 0.92 },
      });
    }

    /* ── PDF: text extraction path ── */
    if (file.type === "application/pdf") {
      const { extractText } = await import("unpdf");
      const pdfData = new Uint8Array(await file.arrayBuffer());
      const { text: rawText } = await extractText(pdfData, { mergePages: true });

      if (!rawText || rawText.trim().length < 10) {
        return NextResponse.json(
          { ok: false, error: "ملف PDF لا يحتوي على نص قابل للقراءة. جرّب رفع صورة بدلاً منه." },
          { status: 400 }
        );
      }

      const OpenAILib = (await import("openai")).default;
      const openai = new OpenAILib({ apiKey: process.env.OPENAI_API_KEY });

      const aiResp = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0,
        response_format: { type: "json_object" },
        max_tokens: 2500,
        messages: [
          {
            role: "user",
            content: `Extract invoice data from this text and return JSON with these exact fields: vendor_name (string), vendor_name_ar (string or null), invoice_number (string or null), invoice_date (YYYY-MM-DD string or null), subtotal (number or null), vat_amount (number or null), total (number or null), currency (default "SAR"), category (one of: food_cost, utilities, supplies, maintenance, salaries, rent, misc), confidence (float 0-1).\n\nInvoice text:\n${rawText.slice(0, 3000)}`,
          },
        ],
      });

      const content = aiResp.choices[0].message.content;
      if (!content) throw new Error("Empty AI response");

      const f = JSON.parse(content);
      return NextResponse.json({
        parsed: {
          vendor: f.vendor_name_ar ?? f.vendor_name ?? "",
          invoiceDate: f.invoice_date ?? "",
          total: f.total?.toString() ?? "",
          invoiceNumber: f.invoice_number ?? "",
          vat: f.vat_amount?.toString() ?? "",
          subtotal: f.subtotal?.toString() ?? "",
          currency: f.currency ?? "SAR",
        },
        suggestion: {
          categoryName: f.category ? (CATEGORY_LABELS[f.category] ?? f.category) : "",
          confidence: typeof f.confidence === "number" ? f.confidence : 0.8,
        },
      });
    }

    /* ── Image: GPT-4o vision path ── */
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const result: ExtractionResult = await extractInvoice(base64, file.type);

    // Explicit discriminant check — TypeScript narrows to ExtractionFailure here
    if (result.ok === false) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 422 }
      );
    }

    // TypeScript knows result is ExtractionSuccess here
    const { fields, confidence } = result;
    return NextResponse.json({
      parsed: {
        vendor: fields.vendor_name_ar ?? fields.vendor_name ?? "",
        invoiceDate: fields.invoice_date ?? "",
        total: fields.total?.toString() ?? "",
        invoiceNumber: fields.invoice_number ?? "",
        vat: fields.vat_amount?.toString() ?? "",
        subtotal: fields.subtotal?.toString() ?? "",
        vatNumber: fields.vendor_vat_number ?? "",
        paymentMethod: fields.payment_method ?? "",
        currency: fields.currency ?? "SAR",
      },
      suggestion: {
        categoryName: fields.category ? (CATEGORY_LABELS[fields.category] ?? fields.category) : "",
        confidence,
      },
    });
  } catch (err: unknown) {
    console.error("[extract] Unhandled error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "خطأ غير متوقع في الخادم",
        ...(process.env.NODE_ENV === "development" && err instanceof Error
          ? { stack: err.stack }
          : {}),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "يجب استخدام POST" }, { status: 405 });
}
