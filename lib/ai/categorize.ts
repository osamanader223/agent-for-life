// [Person 1] expense categorization — rules-first, AI fallback
import OpenAI from "openai";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { ParsedInvoice, CategorySuggestion } from "@/types/invoice";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Category = {
  id: number;
  name: string;
  type: string;
};

function normalize(value: string) {
  return value.toLowerCase().trim();
}

export async function categorizeInvoice(
  parsedInvoice: ParsedInvoice
): Promise<CategorySuggestion> {
  const vendor = parsedInvoice.vendor || "";
  const invoiceText = parsedInvoice.rawText;

  const { data: categories, error: categoryError } = await supabaseAdmin
    .from("categories")
    .select("*")
    .order("name");

  if (categoryError || !categories || categories.length === 0) {
    return {
      categoryId: null,
      categoryName: "Other",
      confidence: 0.3,
      source: "fallback",
    };
  }

  // Rules first — vendor keyword match
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

  // AI fallback
  const prompt = `
You are a professional accountant for small businesses.

Choose ONE best accounting category for this invoice.

Return ONLY valid JSON:
{
  "category": "category name from list only",
  "confidence": number between 0 and 1
}

Available categories:
${categories.map((c: Category) => `- ${c.name}`).join("\n")}

Invoice vendor: ${vendor || "Unknown"}
Invoice total: ${parsedInvoice.total ?? "Unknown"}
Invoice text:
${invoiceText}
`;

  const aiResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: prompt }],
  });

  const content = aiResponse.choices[0].message.content;

  if (!content) {
    return { categoryId: null, categoryName: "Other", confidence: 0.2, source: "fallback" };
  }

  let parsedAI: { category?: string; confidence?: number };

  try {
    parsedAI = JSON.parse(content);
  } catch {
    return { categoryId: null, categoryName: "Other", confidence: 0.2, source: "fallback" };
  }

  const matchedCategory = categories.find(
    (c: Category) => normalize(c.name) === normalize(parsedAI.category || "")
  );

  if (!matchedCategory) {
    return { categoryId: null, categoryName: "Other", confidence: 0.35, source: "fallback" };
  }

  return {
    categoryId: matchedCategory.id,
    categoryName: matchedCategory.name,
    confidence: Number(parsedAI.confidence ?? 0.6),
    source: "ai",
  };
}
