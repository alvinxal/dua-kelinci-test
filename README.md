# Sales Insights – AI Builder build test

Web app (React + TypeScript + Vite, installable as a PWA) that reads the sample sales CSV (Sep–Oct 2026, ~1,900 invoice lines) and shows:

1. **Sales by region** and **by brand** (net sales, share of total).
2. **The 5 weakest outlets**, with area, invoice count and a status (stopped ordering / new / down / up / steady).
3. **A one-paragraph summary** for Telegram (ID/EN), with a copy button.

**Interactive:** the *Data* tab edits rows in place (date, invoice, outlet, brand/SKU, qty, price, discount; net is recomputed), adds and deletes rows, imports/exports CSV and resets to the original. The *Dashboard* tab filters by month, region, brand and outlet type, and lets you change how many weak outlets to show and how they are ranked (lowest total, lowest latest month, biggest drop). Edits persist in the browser (`localStorage`).

Everything runs in the browser, so there is no backend or API key. The CSV is bundled, so the app also works offline once installed. "Use another CSV" loads a different file with the same columns.

```bash
npm install
npm run dev     # local
npm test        # data-cleaning + aggregation tests
npm run build   # production build with service worker
```

## Decisions

**Data cleaning** (the file is deliberately messy; the app reports these counts on screen):
- Regions came in as `Jabodetabek`/`JABODETABEK`, `Jawa Barat`/`JAWA BARAT`/`Jabar`, etc. They are unified, so 10 spellings become 6 regions.
- Outlet names had trailing spaces, and one outlet ID could appear with several spellings. Outlets are keyed by `outlet_id`, otherwise one outlet is split into fragments and wrongly looks tiny.
- 3 exact duplicate rows are dropped.
- 5 rows have no salesman; they stay in the totals because the sale is real.
- The return invoice (`RTR900001`, negative qty/amount) is netted off, not dropped.

**"Weakest outlet"** is ambiguous, so the choice is explicit: lowest **total net sales over the period**, with fewer invoices as the tie-breaker. The status badge adds the trend (Sep → Oct) so a one-off buyer reads differently from an outlet that stopped ordering. A fairer version would compare each outlet against the median of its own type (a warung vs a wholesaler); I left that out to keep the rule easy to explain.

**Summary** is a deterministic template, not an LLM call: it is reproducible, free, and cannot invent numbers. An LLM pass could polish the wording later, but the figures should keep coming from code.

## Structure

- `src/analyze.ts` – CSV parsing, cleaning, aggregation
- `src/summary.ts` – Telegram text
- Theme: light by default, night mode via the toggle (saved in the browser). Icons: Font Awesome 5 Free (SVG).
- `src/App.tsx`, `src/DataEditor.tsx`, `src/storage.ts`, `src/styles.css` – UI, row editor, persistence/CSV export
- `src/analyze.test.ts` – tests
