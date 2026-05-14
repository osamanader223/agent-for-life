# Invoice Extraction Accuracy Log

## Day 2 — 2026-05-14

### Blockers (must resolve before Day 3 testing)

| # | Blocker | Action needed |
|---|---------|---------------|
| 1 | **OpenAI API key revoked** | Key `sk-proj-...utIA` in `.env.local` was committed to a **public** GitHub repo. GitHub secret scanning + OpenAI auto-revoked it. Generate a new key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys), store ONLY in `.env.local` (never commit), and add to Vercel env vars via `vercel env add`. |
| 2 | **No real invoice samples** | `public/samples/sample-{1,2}.jpg` and `sample-3.pdf` are 16-byte placeholder stubs. Drop 10 real Saudi invoices (jpg/png/pdf) into a local folder — do NOT commit them to git. Run `npx tsx lib/ai/__tests__/batch-test.ts <your-folder>`. |

---

### Code improvements shipped (Day 2)

| Change | File | Details |
|--------|------|---------|
| Lazy OpenAI client | `demo-extract.ts` | Fixes `Missing credentials` crash when env loads after module init |
| PDF → image | `demo-extract.ts` | `convertPdfToImage()` implemented with `pdfjs-dist` + `@napi-rs/canvas`; renders page 1 at 2× scale |
| Retry logic | `demo-extract.ts` | First pass uses `detail:auto`; if `confidence < 0.5` retries with `detail:high` |
| Prompt v2 | `prompts.ts` | Added 10+ Saudi vendor patterns, ZATCA layout section, arithmetic derivation rules, tightened confidence calibration |
| `.env.local` loading | `__tests__/extract-manual-test.ts` | Changed `import 'dotenv/config'` → `config({ path: '.env.local' })` |
| Batch runner | `__tests__/batch-test.ts` | New script: runs all files in a directory, prints summary table with VAT arithmetic check |

---

### Target accuracy (Day 3 gate)

| Metric | Target |
|--------|--------|
| Overall extraction success | ≥ 85% of invoices |
| vendor_name or vendor_name_ar present | ≥ 90% |
| invoice_date correct | ≥ 85% |
| total correct (within 1 SAR) | ≥ 90% |
| VAT arithmetic consistent | ≥ 80% |
| Average confidence score | ≥ 0.75 |
| Needs-review rate | ≤ 30% |

---

### Results table (fill in after running batch-test.ts)

| # | File | vendor ✓ | date ✓ | subtotal ✓ | vat ✓ | total ✓ | category ✓ | Confidence | Notes |
|---|------|----------|--------|------------|-------|---------|------------|------------|-------|
| 1 | — | — | — | — | — | — | — | — | Awaiting real invoices |
| 2 | — | — | — | — | — | — | — | — | |
| 3 | — | — | — | — | — | — | — | — | |
| 4 | — | — | — | — | — | — | — | — | |
| 5 | — | — | — | — | — | — | — | — | |
| 6 | — | — | — | — | — | — | — | — | |
| 7 | — | — | — | — | — | — | — | — | |
| 8 | — | — | — | — | — | — | — | — | |
| 9 | — | — | — | — | — | — | — | — | |
| 10 | — | — | — | — | — | — | — | — | |

**Run command:** `npx tsx lib/ai/__tests__/batch-test.ts <path-to-invoices-folder>`

---

### Hardest fields (hypothesis — update after real runs)

Based on prompt design and Saudi invoice patterns:

1. **vendor_vat_number** — often printed small, partially cut off in thermal receipts
2. **category** — ambiguous for multi-category suppliers (e.g. Goody sells both food_cost and supplies items)
3. **invoice_date** — Hijri dates need conversion; some receipts omit year
4. **subtotal** — informal receipts often show only the total
5. **payment_method** — rarely printed on supplier invoices (vs. customer receipts)
