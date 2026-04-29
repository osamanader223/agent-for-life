<<<<<<< HEAD
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

// 🔑 إعداد OpenAI
=======
import { parseInvoice } from "@/lib/parseInvoice";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

// 🔑 إعداد
>>>>>>> 778fad778cc1bf14f88329dc3465d21bdd0d7498
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

<<<<<<< HEAD
// 🗄️ إعداد Supabase
=======
>>>>>>> 778fad778cc1bf14f88329dc3465d21bdd0d7498
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
<<<<<<< HEAD
    // 1️⃣ نستقبل النص
    const { invoiceText } = await req.json();

    if (!invoiceText) {
      return Response.json(
        { error: "Missing invoice text" },
        { status: 400 }
      );
    }

    // 2️⃣ نجيب الفئات من الداتابيس
=======
    const { rawText } = await req.json();

    if (!rawText) {
      return Response.json({ error: "Missing rawText" }, { status: 400 });
    }

    // 🧠 STEP 1: parse
    const parsed = await parseInvoice(rawText);

    const invoiceText = rawText;
    const vendor = invoiceText.split(" ")[0];

    // 🧠 STEP 2: RULES CHECK
    const { data: rule } = await supabase
      .from("rules")
      .select("*, categories(*)")
      .ilike("keyword", `%${vendor}%`)
      .maybeSingle();

    if (rule) {
      return Response.json({
        parsed,
        category: {
          category: rule.categories.name,
          confidence: 0.95,
          source: "rule"
        }
      });
    }

    // 🧠 STEP 3: LOAD CATEGORIES
>>>>>>> 778fad778cc1bf14f88329dc3465d21bdd0d7498
    const { data: categories, error } = await supabase
      .from("categories")
      .select("*");

    if (error || !categories) {
<<<<<<< HEAD
      return Response.json(
        { error: "Failed to load categories" },
        { status: 500 }
      );
    }

    // 3️⃣ نبني prompt بشكل احترافي
    const prompt = `
You are a professional accountant.

Return ONLY valid JSON in this exact format:
=======
      return Response.json({ error: "Failed to load categories" }, { status: 500 });
    }

    // 🧠 STEP 4: AI
    const prompt = `
You are a professional accountant.

Return ONLY valid JSON:
>>>>>>> 778fad778cc1bf14f88329dc3465d21bdd0d7498
{
  "category": "...",
  "confidence": 0-1
}

<<<<<<< HEAD
Choose ONLY from these categories:
=======
Categories:
>>>>>>> 778fad778cc1bf14f88329dc3465d21bdd0d7498
${categories.map(c => c.name).join(", ")}

Invoice:
${invoiceText}
`;

<<<<<<< HEAD
    // 4️⃣ نرسل للـ AI
=======
>>>>>>> 778fad778cc1bf14f88329dc3465d21bdd0d7498
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
<<<<<<< HEAD
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
=======
      response_format: { type: "json_object" }
    });

    const content = res.choices[0].message.content;

    if (!content) {
      return Response.json({ error: "AI empty response" }, { status: 500 });
    }

    let parsedAI;
    try {
      parsedAI = JSON.parse(content);
    } catch {
      parsedAI = { category: null, confidence: 0 };
    }

    return Response.json({
      parsed,
      category: parsedAI
    });

  } catch (error) {
    console.error(error);
    return Response.json({ error: "Server error" }, { status: 500 });
>>>>>>> 778fad778cc1bf14f88329dc3465d21bdd0d7498
  }
}