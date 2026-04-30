import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
});

import { parseInvoice } from "./lib/parseInvoice";
import { categorizeInvoice } from "./lib/categorizeInvoice";

console.log("API KEY:", process.env.OPENAI_API_KEY);

async function test() {
  console.log("TEST STARTED");

  const raw = `
Amazon
Printer paper
Total: $45
`;

  // STEP 1: Parse
  const parsed = await parseInvoice(raw);

  console.log("PARSED DATA:");
  console.log(parsed);

  // STEP 2: Categorize
  const categories = [
    "Office Supplies",
    "Marketing",
    "Software",
    "Travel"
  ];

  const result = await categorizeInvoice(parsed, categories);

  console.log("CATEGORY RESULT:");
  console.log(result);
}

// ⚠️ THIS LINE IS CRITICAL
test();