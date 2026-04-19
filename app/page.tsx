"use client";

import { useState } from "react";
import { exportToExcel } from "@/lib/excel";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const upload = async () => {
    setLoading(true);

    const form = new FormData();
    form.append("file", file!);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    const json = await res.json();
    setData(json.invoiceData);
    setLoading(false);
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl mb-4">Invoice AI</h1>

      <input type="file" onChange={(e) => setFile(e.target.files![0])} />

      <button onClick={upload}>
        {loading ? "Processing..." : "Upload"}
      </button>

      {data && (
        <div>
          <h2>{data.company}</h2>
          <p>Total: {data.total}</p>

          <button onClick={() => exportToExcel(data)}>
            Download Excel
          </button>
        </div>
      )}
    </div>
  );
}