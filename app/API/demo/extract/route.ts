// [Person 2 - UI]
import { parseInvoice } from "@/lib/parseInvoice";
import { categorizeInvoice } from "@/lib/ai/categorize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    let rawText = "";

    if (file.type === "application/pdf") {
      const { PDFParse } = await import("pdf-parse");
      const buffer = Buffer.from(await file.arrayBuffer());
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();
      rawText = result.text?.trim() ?? "";

      if (rawText.length < 10) {
        return Response.json(
          {
            error:
              "ملف PDF لا يحتوي على نص قابل للقراءة. جرّب رفع صورة بدلاً منه.",
          },
          { status: 400 }
        );
      }
    } else if (file.type.startsWith("image/")) {
      // For demo: return mock extraction since full OCR requires cloud setup
      const mockText = `
        فاتورة ضريبية
        المورد: شركة المطاعم السعودية
        التاريخ: ${new Date().toISOString().split("T")[0]}
        رقم الفاتورة: INV-${Math.floor(Math.random() * 10000)}
        المواد الغذائية: مكونات المطبخ
        الإجمالي قبل الضريبة: 1200 ريال
        ضريبة القيمة المضافة 15%: 180 ريال
        الإجمالي: 1380 ريال
      `;
      rawText = mockText;
    } else {
      return Response.json(
        { error: "نوع الملف غير مدعوم. الرجاء رفع صورة أو PDF" },
        { status: 400 }
      );
    }

    const parsed = parseInvoice(rawText);
    const suggestion = await categorizeInvoice(parsed);

    return Response.json({ parsed, suggestion });
  } catch (error) {
    console.error("Demo extract error:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "فشل في معالجة الفاتورة",
      },
      { status: 500 }
    );
  }
}
