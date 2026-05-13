// [Person 2 - UI]
"use client";

import { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ExtractionResultProps {
  result: Record<string, unknown>;
  processingTime: number;
  onReset: () => void;
}

export function ExtractionResult({
  result,
  processingTime,
  onReset,
}: ExtractionResultProps) {
  const [saved, setSaved] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const parsed = (result?.parsed as Record<string, unknown>) ?? result;
  const suggestion = result?.suggestion as Record<string, unknown> | undefined;

  const [fields, setFields] = useState({
    vendor: String(parsed?.vendor ?? ""),
    invoiceDate: String(parsed?.invoiceDate ?? ""),
    total: String(parsed?.total ?? ""),
    category: String(
      suggestion?.categoryName ?? result?.category ?? ""
    ),
  });

  const confidence =
    (suggestion?.confidence as number) ??
    (result?.confidence as number) ??
    0.85;
  const confidencePct = Math.round(confidence * 100);

  const confidenceVariant =
    confidencePct >= 85
      ? "success"
      : confidencePct >= 70
      ? "warning"
      : "destructive";

  const ConfidenceIcon =
    confidencePct >= 85
      ? CheckCircle2
      : confidencePct >= 70
      ? AlertTriangle
      : XCircle;

  const handleSave = async () => {
    if (!email.trim()) {
      setEmailError("الرجاء إدخال البريد الإلكتروني");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("بريد إلكتروني غير صالح");
      return;
    }
    setEmailError("");
    setSaved(true);
  };

  return (
    <div className="space-y-5">
      {/* Confidence + time header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant={confidenceVariant}
            className={cn("gap-1.5 px-3 py-1 text-sm")}
          >
            <ConfidenceIcon className="h-3.5 w-3.5" />
            {confidencePct}% دقة
          </Badge>
          <div className="flex items-center gap-1.5 text-sm text-[#6b7280]">
            <Clock className="h-3.5 w-3.5" />
            تم في {processingTime.toFixed(1)} ثانية
          </div>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-brand transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          فاتورة جديدة
        </button>
      </div>

      {/* Confidence bar */}
      <Progress value={confidencePct} />

      {/* Time comparison */}
      <div className="rounded-xl bg-brand/5 border border-brand/10 p-3 text-center text-sm">
        <span className="text-[#6b7280]">بدوننا: </span>
        <span className="font-semibold text-[#6b7280] line-through">
          ~5 دقائق يدوي
        </span>
        <span className="mx-2 text-[#d1cbbf]">•</span>
        <span className="text-brand font-semibold">معنا: </span>
        <span className="font-bold text-brand">
          {processingTime.toFixed(1)} ثانية
        </span>
      </div>

      {/* Editable extracted fields */}
      <div className="rounded-2xl border border-cream-dark bg-white p-5 space-y-4">
        <p className="text-sm font-semibold text-[#6b7280]">
          راجع النتائج وعدّلها إن احتجت
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="vendor">المورد</Label>
            <Input
              id="vendor"
              value={fields.vendor}
              onChange={(e) =>
                setFields((f) => ({ ...f, vendor: e.target.value }))
              }
              placeholder="اسم المورد"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inv-date">التاريخ</Label>
            <Input
              id="inv-date"
              value={fields.invoiceDate}
              onChange={(e) =>
                setFields((f) => ({ ...f, invoiceDate: e.target.value }))
              }
              placeholder="YYYY-MM-DD"
              dir="ltr"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="total">الإجمالي (ريال)</Label>
            <Input
              id="total"
              value={fields.total}
              onChange={(e) =>
                setFields((f) => ({ ...f, total: e.target.value }))
              }
              placeholder="0.00"
              dir="ltr"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="category">الفئة</Label>
            <Input
              id="category"
              value={fields.category}
              onChange={(e) =>
                setFields((f) => ({ ...f, category: e.target.value }))
              }
              placeholder="المواد الغذائية"
            />
          </div>
        </div>
      </div>

      {/* Lead capture / save */}
      {!saved ? (
        <div className="rounded-2xl border border-gold/40 bg-gold/5 p-5 space-y-3">
          <p className="font-bold text-[#1a1a1a]">
            احفظ النتيجة وابدأ تجربتك المجانية
          </p>
          <p className="text-sm text-[#6b7280]">
            سنرسل لك تقرير الفاتورة + رابط التجربة المجانية
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex-1 space-y-1">
              <Input
                type="email"
                placeholder="بريدك الإلكتروني"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                dir="ltr"
                className={cn(emailError && "border-red-400")}
              />
              {emailError && (
                <p className="text-xs text-red-600">{emailError}</p>
              )}
            </div>
            <Button onClick={handleSave} className="shrink-0">
              حفظ النتيجة
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p className="font-semibold">تم الحفظ! سنتواصل معك قريباً</p>
        </div>
      )}
    </div>
  );
}
