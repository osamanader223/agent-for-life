"use client";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: any) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
  const res = await fetch("/api/upload", {
    method: "POST",
    body: JSON.stringify({
      text: "Invoice from ABC company, date 2024, total $500",
    }),
  });

  const data = await res.json();

  console.log(data);
};

  return (
    <main className="min-h-screen bg-[#0b0f14] flex items-center justify-center p-6">
      
      <div className="w-full max-w-2xl bg-[#121823] rounded-3xl shadow-2xl p-8 border border-[#1f2a3a]">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            مساعد الفواتير بالذكاء الاصطناعي
          </h1>
          <p className="text-gray-400 mt-2">
            ارفع الفاتورة وخلي الذكاء الاصطناعي يقرأها
          </p>
        </div>

        <div className="border border-dashed border-[#2a3b52] rounded-2xl p-6 text-center bg-[#0f1622]">

          <input 
            type="file" 
            onChange={handleFileChange}
            className="mx-auto mb-4 block text-sm text-gray-300"
          />

          <p className="text-gray-500 text-sm">
            ارفع الفاتورة (PDF, JPG, PNG)
          </p>

        </div>

  <button onClick={handleUpload}>
  Analyze Invoice
</button>
    

      </div>    
    </main>
  );
}