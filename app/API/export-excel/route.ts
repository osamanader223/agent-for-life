import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createInvoiceWorkbook } from "@/lib/exportExcel";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return Response.json(
        { error: "Failed to load invoices" },
        { status: 500 }
      );
    }

    const buffer = createInvoiceWorkbook(data || []);

    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="invoices.xlsx"',
      },
    });
  } catch (error) {
    console.error("Export error:", error);

    return Response.json(
      { error: "Export failed" },
      { status: 500 }
    );
  }
}
