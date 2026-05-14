import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      parsed,
      selectedCategoryId,
      selectedCategoryName,
      confidence,
      source,
      createRule,
    } = body;

    if (!parsed?.rawText) {
      return Response.json(
        { error: "Missing parsed invoice" },
        { status: 400 }
      );
    }

    if (!selectedCategoryId || !selectedCategoryName) {
      return Response.json(
        { error: "Missing selected category" },
        { status: 400 }
      );
    }

    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from("invoices")
      .insert({
        vendor: parsed.vendor,
        invoice_date: parsed.invoiceDate,
        total: parsed.total,
        raw_text: parsed.rawText,
        extracted_data: parsed,
        category_id: selectedCategoryId,
        category_name: selectedCategoryName,
        confidence,
        source,
        status: "reviewed",
      })
      .select()
      .single();

    if (invoiceError) {
      console.error(invoiceError);
      return Response.json(
        { error: "Failed to save invoice" },
        { status: 500 }
      );
    }

    // Optional learning rule
    if (createRule && parsed.vendor) {
      await supabaseAdmin.from("rules").insert({
        keyword: parsed.vendor,
        category_id: selectedCategoryId,
      });
    }

    return Response.json({
      success: true,
      invoice,
    });
  } catch (error) {
    console.error("Save invoice error:", error);

    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
