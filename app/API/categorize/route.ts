import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      return Response.json(
        { error: "Failed to load categories" },
        { status: 500 }
      );
    }

    return Response.json({
      categories: data || [],
    });
  } catch (error) {
    console.error("Categories error:", error);

    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
