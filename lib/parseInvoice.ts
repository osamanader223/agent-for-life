export type ParsedInvoice = {
  vendor: string | null;
  invoiceDate: string | null;
  total: number | null;
  rawText: string;
};

function extractTotal(text: string): number | null {
  const totalRegexes = [
    /total\s*[:\-]?\s*\$?\s*([0-9]+(?:\.[0-9]{1,2})?)/i,
    /amount\s*due\s*[:\-]?\s*\$?\s*([0-9]+(?:\.[0-9]{1,2})?)/i,
    /\$\s*([0-9]+(?:\.[0-9]{1,2})?)/
  ];

  for (const regex of totalRegexes) {
    const match = text.match(regex);
    if (match?.[1]) {
      return Number(match[1]);
    }
  }

  return null;
}

function extractDate(text: string): string | null {
  const dateRegexes = [
    /\b\d{4}-\d{2}-\d{2}\b/,
    /\b\d{2}\/\d{2}\/\d{4}\b/,
    /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/
  ];

  for (const regex of dateRegexes) {
    const match = text.match(regex);
    if (match?.[0]) {
      return match[0];
    }
  }

  return null;
}

function extractVendor(text: string): string | null {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines[0] || null;
}

export function parseInvoice(rawText: string): ParsedInvoice {
  return {
    vendor: extractVendor(rawText),
    invoiceDate: extractDate(rawText),
    total: extractTotal(rawText),
    rawText,
  };
}
