import OpenAI from "openai";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { InvoiceData } from "@/lib/schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type CategorySuggestion = {
  categoryId: number | null;
  categoryName: string;
  confidence: number;
  source: "rule" | "ai" | "fallback";
};

type Category = {
  id: number;
  name: string;
  type: string;
};

function normalize(text: string) {
  return text.toLowerCase().trim();
}

export async function categorizeInvoice(
  parsed: InvoiceData,
  rawText: string
): Promise<CategorySuggestion> {
  const vendor = parsed.vendor || "";

  const { data: categories, error: categoriesError } = await supabaseAdmin
    .from("categories")
    .select("*")
    .order("name");

  if (categoriesError || !categories || categories.length === 0) {
    return {
      categoryId: null,
      categoryName: "Other",
      confidence: 0.2,
      source: "fallback",
    };
  }

  // 1. Rules first
  if (vendor) {
    const { data: rule } = await supabaseAdmin
      .from("rules")
      .select("*, categories(*)")
      .ilike("keyword", `%${vendor}%`)
      .maybeSingle();

    if (rule?.categories) {
      return {
        categoryId: rule.categories.id,
        categoryName: rule.categories.name,
        confidence: 0.95,
        source: "rule",
      };
    }
  }

  // 2. AI fallback
  const prompt = `
You are a professional accountant for small businesses.

Choose ONE best accounting category for this invoice.

Return ONLY valid JSON:
{
  "category": "one category name from the list",
  "confidence": number between 0 and 1
}

Available categories:
${categories.map((c: Category) => `- ${c.name}`).join("\n")}

Invoice data:
Vendor: ${parsed.vendor || "Unknown"}
Invoice Date: ${parsed.invoiceDate || "Unknown"}
Total: ${parsed.total ?? "Unknown"}
Currency: ${parsed.currency || "Unknown"}

Raw invoice text:
${rawText}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.choices[0].message.content;

  if (!content) {
    return {
      categoryId: null,
      categoryName: "Other",
      confidence: 0.2,
      source: "fallback",
    };
  }

  let aiResult: {
    category?: string;
    confidence?: number;
  };

  try {
    aiResult = JSON.parse(content);
  } catch {
    return {
      categoryId: null,
      categoryName: "Other",
      confidence: 0.2,
      source: "fallback",
    };
  }

  const matchedCategory = categories.find(
    (category: Category) =>
      normalize(category.name) === normalize(aiResult.category || "")
  );

  if (!matchedCategory) {
    return {
      categoryId: null,
      categoryName: "Other",
      confidence: 0.35,
      source: "fallback",
    };
  }

  return {
    categoryId: matchedCategory.id,
    categoryName: matchedCategory.name,
    confidence: Number(aiResult.confidence ?? 0.6),
    source: "ai",
  };
}