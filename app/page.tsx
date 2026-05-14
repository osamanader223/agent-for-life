"use client";

import { useRef, useState } from "react";
import {
  ScanText,
  Timer,
  FileCheck,
  ChevronDown,
  Check,
  Star,
  Phone,
  Mail,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UploadZone } from "@/components/demo/upload-zone";
import { FadeIn } from "@/components/ui/fade-in";

/* ─── Feature cards ──────────────────────────────────────────────────── */
const features = [
  {
    icon: ScanText,
    title: "استخراج تلقائي",
    subtitle: "Auto Extraction",
    description:
      "ارفع الفاتورة والذكاء الاصطناعي يقرأ كل شيء: المورد، التاريخ، المبالغ، والضريبة.",
  },
  {
    icon: Timer,
    title: "توفير الوقت",
    subtitle: "Time Savings",
    description:
      "من ساعتين عمل يدوي في اليوم إلى 5 دقائق. وفّر أكثر من 40 ساعة شهرياً.",
  },
  {
    icon: FileCheck,
    title: "تقارير ضريبية",
    subtitle: "VAT Reports",
    description:
      "تقارير جاهزة لمتطلبات ZATCA. صادّر ملف Excel بضغطة واحدة.",
  },
];

/* ─── Testimonials ───────────────────────────────────────────────────── */
const testimonials = [
  {
    name: "أحمد الغامدي",
    role: "صاحب مطعم برغر — الرياض",
    text: "كنا نصرف ساعتين يومياً على إدخال الفواتير يدوياً. الحين يتم كل شيء بثوانٍ والأخطاء راحت تقريباً.",
  },
  {
    name: "خالد الشمري",
    role: "مدير سلسلة مقاهي — جدة",
    text: "أحسن استثمار عملناه في النظام المحاسبي. التقارير الضريبية اللي كانت تاخذ يومين صارت جاهزة بضغطة.",
  },
  {
    name: "نورة السالم",
    role: "صاحبة مطعم إيطالي — الدمام",
    text: "سهّل علينا العمل كثير. الفواتير بالعربي والإنجليزي يفهمها النظام بدون مشاكل.",
  },
];

/* ─── Pricing plans ──────────────────────────────────────────────────── */
const plans = [
  {
    name: "Starter",
    nameAr: "المبدئي",
    price: 199,
    invoices: "100 فاتورة / شهر",
    popular: false,
    features: [
      "استخراج بالذكاء الاصطناعي",
      "تصنيف تلقائي",
      "تصدير Excel",
      "دعم عبر البريد",
    ],
  },
  {
    name: "Pro",
    nameAr: "الاحترافي",
    price: 399,
    invoices: "500 فاتورة / شهر",
    popular: true,
    features: [
      "كل مزايا المبدئي",
      "تقارير ZATCA",
      "مستخدمان",
      "دعم ذو أولوية",
      "API access",
    ],
  },
  {
    name: "Business",
    nameAr: "الأعمال",
    price: 799,
    invoices: "غير محدود",
    popular: false,
    features: [
      "كل مزايا الاحترافي",
      "فواتير غير محدودة",
      "5 مستخدمين",
      "تكاملات مخصصة",
      "مدير حساب مخصص",
    ],
  },
];

/* ─── Sample invoices ────────────────────────────────────────────────── */
const samples = [
  { label: "فاتورة بقالة", file: "/samples/sample-1.jpg" },
  { label: "فاتورة مطعم", file: "/samples/sample-2.jpg" },
  { label: "فاتورة PDF", file: "/samples/sample-3.pdf" },
];

/* ═══════════════════════════════════════════════════════════════════════ */
export default function Home() {
  const demoRef = useRef<HTMLElement>(null);

  /* ROI calculator state */
  const [invoices, setInvoices] = useState(200);
  const [rate, setRate] = useState(80);
  const [minutes, setMinutes] = useState(5);

  const currentHours = (invoices * minutes) / 60;
  const currentCost = Math.round(currentHours * rate);
  const ourCost = invoices * 1;
  const savings = currentCost - ourCost;

  const scrollToDemo = () => {
    demoRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /* Sample invoice click → trigger upload */
  const loadSample = async (filePath: string) => {
    try {
      const res = await fetch(filePath);
      const blob = await res.blob();
      const ext = filePath.split(".").pop() ?? "jpg";
      const type = ext === "pdf" ? "application/pdf" : `image/${ext}`;
      const file = new File([blob], `sample.${ext}`, { type });

      const dt = new DataTransfer();
      dt.items.add(file);

      const input = document.getElementById(
        "demo-upload-input"
      ) as HTMLInputElement | null;
      if (input) {
        Object.defineProperty(input, "files", { value: dt.files });
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
    } catch {
      // sample files are placeholders — silently ignore
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-cream-dark bg-cream/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand" />
            <span className="text-lg font-extrabold text-brand">
              Agent for Life
            </span>
          </div>
          <Button
            size="sm"
            onClick={scrollToDemo}
            className="transition-transform hover:scale-105 active:scale-95"
          >
            جرّب مجاناً
          </Button>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-cream px-4 py-20 text-center md:py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl animate-fade-in">
          <Badge variant="gold" className="mb-6 px-4 py-1.5 text-sm">
            مصمم خصيصاً للمطاعم والمقاهي في السعودية
          </Badge>

          <h1 className="text-4xl font-extrabold leading-tight text-brand sm:text-5xl md:text-7xl">
            محاسبة مطعمك
            <br />
            في 5 دقائق
            <br />
            <span className="text-gold">بدل ساعتين</span>
          </h1>

          <p
            className="mx-auto mt-6 max-w-xl text-lg text-[#6b7280] md:text-xl"
            dir="ltr"
          >
            AI accounting for restaurants.{" "}
            <span className="font-bold text-brand">50×</span> faster than Excel.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={scrollToDemo}
              className="w-full transition-transform hover:scale-105 active:scale-95 sm:w-auto"
            >
              جرّب الآن مجاناً
              <ChevronDown className="h-4 w-4" />
            </Button>
            <a href="mailto:osamanader223@gmail.com" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full transition-transform hover:scale-105 active:scale-95">
                تواصل معنا
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-extrabold text-brand md:text-4xl">
                لماذا Agent for Life؟
              </h2>
              <p className="mt-2 text-[#6b7280]">
                كل ما تحتاجه لإدارة فواتير مطعمك بذكاء
              </p>
            </div>
          </FadeIn>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <FadeIn key={f.title} delay={i * 100}>
                  <Card className="group h-full transition-shadow hover:shadow-md">
                    <CardHeader>
                      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 transition-colors group-hover:bg-brand/15">
                        <Icon className="h-7 w-7 text-brand" />
                      </div>
                      <CardTitle>{f.title}</CardTitle>
                      <CardDescription className="text-xs font-semibold uppercase tracking-wide text-gold">
                        {f.subtitle}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-7 text-[#6b7280]">
                        {f.description}
                      </p>
                    </CardContent>
                  </Card>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────────── */}
      <section className="bg-cream px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-extrabold text-brand md:text-4xl">
                ماذا يقول عملاؤنا؟
              </h2>
              <p className="mt-2 text-[#6b7280]">
                تجارب حقيقية من أصحاب مطاعم ومقاهي
              </p>
            </div>
          </FadeIn>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <FadeIn key={t.name} delay={i * 100}>
                <div className="flex h-full flex-col rounded-3xl border border-cream-dark bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                  <Quote className="mb-3 h-8 w-8 text-brand/20" />
                  <p className="flex-1 text-sm leading-7 text-[#374151]">
                    {t.text}
                  </p>
                  <div className="mt-5 border-t border-cream-dark pt-4">
                    <p className="font-bold text-brand">{t.name}</p>
                    <p className="text-xs text-[#6b7280]">{t.role}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Demo (WOW) ─────────────────────────────────────────────────── */}
      <section id="demo" ref={demoRef} className="bg-white px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <FadeIn>
            <div className="mb-8 text-center">
              <Badge variant="default" className="mb-4">
                تجربة مجانية
              </Badge>
              <h2 className="text-3xl font-extrabold text-brand md:text-4xl">
                جرّب الآن — ارفع فاتورة حقيقية
              </h2>
              <p className="mt-3 text-[#6b7280]">
                الذكاء الاصطناعي يستخرج جميع البيانات خلال ثوانٍ
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="rounded-3xl border border-cream-dark bg-cream p-6 shadow-lg md:p-8">
              <UploadZone />

              {/* Sample invoices */}
              <div className="mt-6 border-t border-cream-dark pt-6">
                <p className="mb-3 text-center text-sm font-semibold text-[#6b7280]">
                  أو اختر فاتورة تجريبية
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {samples.map((s) => (
                    <button
                      key={s.file}
                      onClick={() => loadSample(s.file)}
                      className="flex min-h-[44px] flex-col items-center gap-2 rounded-xl border border-cream-dark bg-white p-3 text-xs font-semibold text-[#6b7280] transition-colors hover:border-brand hover:text-brand active:scale-[0.97]"
                    >
                      <div className="flex h-16 w-full items-center justify-center rounded-lg bg-brand/10">
                        <FileCheck className="h-8 w-8 text-brand/50" />
                      </div>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── ROI Calculator ─────────────────────────────────────────────── */}
      <section className="bg-brand px-4 py-16 text-cream">
        <div className="mx-auto max-w-3xl">
          <FadeIn>
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-extrabold md:text-4xl">
                احسب توفيرك الشهري
              </h2>
              <p className="mt-2 text-cream/70">حرّك الأشرطة لترى كم ستوفّر</p>
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="rounded-3xl bg-white/10 p-6 backdrop-blur-sm md:p-8">
              <div className="space-y-6">
                {/* Slider: invoices per month */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-cream">
                      عدد الفواتير شهرياً
                    </label>
                    <span className="font-bold text-gold">{invoices}</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={1000}
                    step={10}
                    value={invoices}
                    onChange={(e) => setInvoices(Number(e.target.value))}
                    className="w-full cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-cream/50">
                    <span>50</span>
                    <span>1000</span>
                  </div>
                </div>

                {/* Input: accountant rate */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-cream">
                    تكلفة المحاسب بالساعة (ريال)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={20}
                      max={500}
                      value={rate}
                      onChange={(e) =>
                        setRate(Math.max(20, Number(e.target.value)))
                      }
                      className="w-full rounded-xl border border-white/20 bg-white/20 px-4 py-2.5 text-cream placeholder:text-cream/50 focus:outline-none focus:ring-2 focus:ring-gold/50"
                      dir="ltr"
                    />
                    <span className="absolute start-3 top-1/2 -translate-y-1/2 text-sm text-cream/60">
                      ريال
                    </span>
                  </div>
                </div>

                {/* Slider: time per invoice */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-cream">
                      الوقت الحالي للفاتورة (دقائق)
                    </label>
                    <span className="font-bold text-gold">{minutes} دق</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={30}
                    step={1}
                    value={minutes}
                    onChange={(e) => setMinutes(Number(e.target.value))}
                    className="w-full cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-cream/50">
                    <span>1 دق</span>
                    <span>30 دق</span>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="mt-8 rounded-2xl bg-white/15 p-5">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-xs font-semibold text-cream/70">
                      الوقت الحالي شهرياً
                    </p>
                    <p className="mt-1 text-2xl font-bold text-cream">
                      {currentHours.toFixed(1)}{" "}
                      <span className="text-sm font-normal">ساعة</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-cream/70">
                      التكلفة الحالية
                    </p>
                    <p className="mt-1 text-2xl font-bold text-cream">
                      {currentCost.toLocaleString("en")}{" "}
                      <span className="text-sm font-normal">ريال</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-cream/70">
                      تكلفتنا الشهرية
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gold">
                      {ourCost.toLocaleString("en")}{" "}
                      <span className="text-sm font-normal text-cream/70">
                        ريال
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-cream/70">
                      توفيرك الشهري
                    </p>
                    <p className="mt-1 text-3xl font-extrabold text-gold">
                      {savings > 0 ? savings.toLocaleString("en") : 0}{" "}
                      <span className="text-base font-normal text-cream/70">
                        ريال
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Button
                  variant="gold"
                  size="lg"
                  onClick={scrollToDemo}
                  className="w-full transition-transform hover:scale-105 active:scale-95 sm:w-auto"
                >
                  ابدأ تجربة مجانية 14 يوم
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────── */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-extrabold text-brand md:text-4xl">
                اختر الخطة المناسبة
              </h2>
              <p className="mt-2 text-[#6b7280]">بدون عقود. إلغاء في أي وقت.</p>
            </div>
          </FadeIn>

          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan, i) => (
              <FadeIn key={plan.name} delay={i * 100}>
                <div
                  className={`relative h-full rounded-3xl border p-6 transition-shadow hover:shadow-lg ${
                    plan.popular
                      ? "border-brand bg-brand text-cream shadow-2xl shadow-brand/30 md:scale-105"
                      : "border-cream-dark bg-white"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge
                        variant="gold"
                        className="px-4 py-1 text-xs shadow-md"
                      >
                        <Star className="h-3 w-3" />
                        الأكثر شعبية
                      </Badge>
                    </div>
                  )}

                  <div className="mb-5">
                    <p
                      className={`text-sm font-semibold ${
                        plan.popular ? "text-cream/70" : "text-[#6b7280]"
                      }`}
                    >
                      {plan.nameAr}
                    </p>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span
                        className={`text-4xl font-extrabold ${
                          plan.popular ? "text-cream" : "text-brand"
                        }`}
                      >
                        {plan.price.toLocaleString("en")}
                      </span>
                      <span
                        className={`text-sm ${
                          plan.popular ? "text-cream/60" : "text-[#6b7280]"
                        }`}
                      >
                        ريال / شهر
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-gold">
                      {plan.invoices}
                    </p>
                  </div>

                  <ul className="mb-6 space-y-2.5">
                    {plan.features.map((feat) => (
                      <li
                        key={feat}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Check
                          className={`h-4 w-4 shrink-0 ${
                            plan.popular ? "text-gold" : "text-brand"
                          }`}
                        />
                        <span
                          className={
                            plan.popular ? "text-cream/90" : "text-[#374151]"
                          }
                        >
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.popular ? "secondary" : "default"}
                    className="w-full transition-transform hover:scale-105 active:scale-95"
                    onClick={scrollToDemo}
                  >
                    اشترك الآن
                  </Button>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-cream-dark bg-cream px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-brand" />
              <span className="text-lg font-extrabold text-brand">
                Agent for Life
              </span>
            </div>

            <div className="flex flex-col items-center gap-3 text-sm text-[#6b7280] sm:flex-row sm:gap-6">
              <p className="font-semibold text-[#374151]">تواصل معنا</p>
              <a
                href="mailto:osamanader223@gmail.com"
                className="flex items-center gap-1.5 transition-colors hover:text-brand"
              >
                <Mail className="h-4 w-4" />
                osamanader223@gmail.com
              </a>
              <a
                href="tel:+966500000000"
                className="flex items-center gap-1.5 transition-colors hover:text-brand"
                dir="ltr"
              >
                <Phone className="h-4 w-4" />
                +966 50 000 0000
              </a>
            </div>
          </div>

          <div className="mt-8 border-t border-cream-dark pt-6 text-center text-xs text-[#9ca3af]">
            © 2026 Agent for Life. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
    </div>
  );
}
