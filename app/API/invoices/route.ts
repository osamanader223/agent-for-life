import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          invoices: [],
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      invoices: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch invoices",
        invoices: [],
      },
      { status: 500 }
    );
  }
}