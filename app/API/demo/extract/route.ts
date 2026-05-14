import { extractInvoice } from "@/lib/ai/demo-extract";
import type { ExtractionResult } from "@/types/demo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  food_cost: "مواد غذائية",
  utilities: "مرافق",
  supplies: "مستلزمات",
  maintenance: "صيانة",
  salaries: "رواتب",
  rent: "إيجار",
  misc: "متنوع",
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "لم يتم رفع أي ملف" }, { status: 400 });
    }

    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      return Response.json(
        { error: "حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت" },
        { status: 400 }
      );
    }

    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";

    if (!isImage && !isPdf) {
      return Response.json(
        { error: "نوع الملف غير مدعوم. الرجاء رفع صورة أو PDF" },
        { status: 400 }
      );
    }

    // Dev fallback when no API key
    if (!process.env.OPENAI_API_KEY) {
      await new Promise((r) => setTimeout(r, 2500));
      return Response.json({
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

    if (isPdf) {
      const { extractText } = await import("unpdf");
      const pdfData = new Uint8Array(await file.arrayBuffer());
      const { text: rawText } = await extractText(pdfData, { mergePages: true });

      if (!rawText || rawText.trim().length < 10) {
        return Response.json(
          {
            error:
              "ملف PDF لا يحتوي على نص قابل للقراءة. جرّب رفع صورة بدلاً منه.",
          },
          { status: 400 }
        );
      }

      const OpenAILib = (await import("openai")).default;
      const openai = new OpenAILib({ apiKey: process.env.OPENAI_API_KEY });

      const aiResp = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0,
        response_format: { type: "json_object" },
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
      return Response.json({
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
          categoryName: f.category
            ? (CATEGORY_LABELS[f.category] ?? f.category)
            : "",
          confidence:
            typeof f.confidence === "number" ? f.confidence : 0.8,
        },
      });
    }

    // Image: GPT-4o vision
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const result = await extractInvoice(base64, file.type);

    if (result.ok === false) {
      const { error } = result as Extract<ExtractionResult, { ok: false }>;
      return Response.json({ error }, { status: 422 });
    }

    const okResult = result as Extract<ExtractionResult, { ok: true }>;
    const { fields, confidence } = okResult;
    return Response.json({
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
        categoryName: fields.category
          ? (CATEGORY_LABELS[fields.category] ?? fields.category)
          : "",
        confidence,
      },
    });
  } catch (error) {
    console.error("Demo extract error:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "فشل في معالجة الفاتورة",
      },
      { status: 500 }
    );
  }
}
