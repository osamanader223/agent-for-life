export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, businessName, extractedData } = body;

    if (!email || typeof email !== "string") {
      return Response.json(
        { error: "البريد الإلكتروني مطلوب" },
        { status: 400 }
      );
    }

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      try {
        const { supabaseAdmin } = await import("@/lib/supabaseAdmin");
        await supabaseAdmin.from("demo_leads").insert({
          email: email.trim().toLowerCase(),
          business_name: businessName?.trim() || null,
          extracted_data: extractedData ?? null,
          created_at: new Date().toISOString(),
        });
      } catch (dbErr) {
        console.error("[demo/save] DB insert failed:", dbErr);
      }
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("[demo/save] error:", error);
    return Response.json({ error: "فشل في الحفظ" }, { status: 500 });
  }
}
