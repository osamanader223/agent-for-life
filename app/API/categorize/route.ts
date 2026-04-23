import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

// 🔑 إعداد OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// 🗄️ إعداد Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // 1️⃣ نستقبل النص
    const { invoiceText } = await req.json();

    if (!invoiceText) {
      return Response.json(
        { error: "Missing invoice text" },
        { status: 400 }
      );
    }

    // 2️⃣ نجيب الفئات من الداتابيس
    const { data: categories, error } = await supabase
      .from("categories")
      .select("*");

    if (error || !categories) {
      return Response.json(
        { error: "Failed to load categories" },
        { status: 500 }
      );
    }

    // 3️⃣ نبني prompt بشكل احترافي
    const prompt = `
You are a professional accountant.

Return ONLY valid JSON in this exact format:
{
  "category": "...",
  "confidence": 0-1
}

Choose ONLY from these categories:
${categories.map(c => c.name).join(", ")}

Invoice:
${invoiceText}
`;

    // 4️⃣ نرسل للـ AI
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      response_format: { type: "json_object" } // 🔥 مهم جدًا
    });

    // 5️⃣ نقرأ الرد
    const content = res.choices[0].message.content;

    if (!content) {
      return Response.json(
        { error: "AI returned empty response" },
        { status: 500 }
      );
    }

    // 6️⃣ نحول JSON بأمان
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { category: null, confidence: 0 };
    }

    // 7️⃣ نرجع النتيجة
    return Response.json(parsed);

  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}