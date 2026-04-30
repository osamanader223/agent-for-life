import { parseInvoice } from "@/lib/parseInvoice";
import { categorizeInvoice } from "@/lib/categorizeInvoice";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawText = body.rawText;

    if (!rawText || typeof rawText !== "string") {
      return Response.json(
        { error: "Missing rawText" },
        { status: 400 }
      );
    }

    const parsed = parseInvoice(rawText);
    const suggestion = await categorizeInvoice(parsed);

    return Response.json({
      parsed,
      suggestion,
    });
  } catch (error) {
    console.error("Analyze invoice error:", error);

    return Response.json(
      { error: "Failed to analyze invoice" },
      { status: 500 }
    );
  }
}
