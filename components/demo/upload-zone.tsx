"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Camera, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExtractionResult } from "./extraction-result";

interface UploadZoneProps {
  onComplete?: (result: Record<string, unknown>) => void;
}

const LOADING_PHASES = [
  { until: 2, message: "جاري الرفع..." },
  { until: 15, message: "الذكاء الاصطناعي يقرأ الفاتورة..." },
  { until: 17, message: "تجهيز النتائج..." },
];

function getPhaseMessage(elapsed: number): string {
  for (const phase of LOADING_PHASES) {
    if (elapsed < phase.until) return phase.message;
  }
  return "انتهينا تقريباً...";
}

export function UploadZone({ onComplete }: UploadZoneProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [processingTime, setProcessingTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (!loading) {
      setElapsed(0);
      return;
    }
    startRef.current = Date.now();
    const interval = setInterval(() => {
      setElapsed((Date.now() - startRef.current) / 1000);
    }, 200);
    return () => clearInterval(interval);
  }, [loading]);

  const processFile = useCallback(
    async (file: File) => {
      setLoading(true);
      setError(null);
      const start = Date.now();

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/demo/extract", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            (data as { error?: string }).error || "فشل في معالجة الفاتورة"
          );
        }

        const elapsed = (Date.now() - start) / 1000;
        setProcessingTime(elapsed);
        setResult(data as Record<string, unknown>);
        onComplete?.(data as Record<string, unknown>);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "حدث خطأ غير متوقع";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [onComplete]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) processFile(acceptedFiles[0]);
    },
    [processFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [], "application/pdf": [] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    onDropRejected: (rejections) => {
      const code = rejections[0]?.errors[0]?.code;
      if (code === "file-too-large") {
        setError("حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت");
      } else {
        setError("نوع الملف غير مدعوم. الرجاء رفع صورة أو PDF");
      }
    },
  });

  if (result) {
    return (
      <ExtractionResult
        result={result}
        processingTime={processingTime}
        onReset={() => {
          setResult(null);
          setError(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Drag-drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          "relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200",
          isDragActive
            ? "border-brand bg-brand/5 scale-[1.01]"
            : "border-cream-dark bg-white hover:border-brand hover:bg-brand/5",
          loading && "pointer-events-none opacity-70"
        )}
      >
        <input {...getInputProps()} />

        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-12 w-12 animate-spin text-brand" />
            <p className="text-lg font-bold text-brand">
              {getPhaseMessage(elapsed)}
            </p>
            <div className="w-48 h-1.5 rounded-full bg-brand/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-brand/50 transition-all duration-300 ease-out"
                style={{ width: `${Math.min((elapsed / 17) * 100, 95)}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 transition-colors group-hover:bg-brand/15">
              <Upload className="h-8 w-8 text-brand" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#1a1a1a]">
                {isDragActive ? "أفلت الملف هنا" : "اسحب وأفلت الفاتورة هنا"}
              </p>
              <p className="mt-1 text-sm text-[#6b7280]">
                أو{" "}
                <span className="font-semibold text-brand">اضغط للاختيار</span>
              </p>
            </div>
            <p className="text-xs text-[#9ca3af]">
              صور JPG / PNG أو PDF • حتى 10 ميجابايت
            </p>
          </div>
        )}
      </div>

      {/* Camera option — mobile only */}
      <label
        htmlFor="camera-capture"
        className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-cream-dark bg-white py-3 text-sm font-semibold text-[#6b7280] transition-colors hover:border-brand hover:text-brand active:scale-[0.98] md:hidden"
      >
        <Camera className="h-4 w-4" />
        التقط صورة بالكاميرا
        <input
          id="camera-capture"
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processFile(file);
          }}
        />
      </label>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
