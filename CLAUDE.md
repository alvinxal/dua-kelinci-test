# Dua Kelinci – AI Builder Build Test

Context from the job posting "AI Builder (Vibe Coder)" at PT Dua Kelinci / ITB
(https://claude.ai/artifact/HtDdrH7zogASeTemY4oJfr#data). This project is the build test.

## Task (max 48 hours, AI tools encouraged)
Using `sales.csv` (Sep–Oct 2026, 1,891 invoice lines, 15 columns), build a small web app that:
1. Shows sales by **region** and **brand**.
2. Flags the **5 weakest outlets**.
3. Writes a **one-paragraph summary** a sales manager could read in Telegram.

Submit: repo link or zip with a **README**. Shortlisted candidates get a 60-minute live build session.

## Data (`sales.csv`)
Columns: date, invoice_no, region, branch, outlet_id, outlet_name, outlet_type, salesman,
brand, sku, qty_carton, price_per_carton_idr, gross_sales_idr, discount_idr, net_sales_idr.
Currency is IDR. Use `net_sales_idr` as the main sales measure unless stated otherwise.
Treat data as messy (ERP export): validate, dedupe and handle odd values.

## Role background (for tone and priorities)
- Audience: sales managers / Commercial Director; Bahasa Indonesia is the natural language for the summary (English fine for code/README).
- Company use cases: daily/weekly digests via Teams, live dashboards from Excel/QAD exports, internal apps.
- Valued: working deployed result, clear README, honest notes on AI-generated bugs and how they were fixed.

## Notes
- Define "weakest outlets" explicitly in the README (e.g. lowest net sales, or decline Sep→Oct) and justify it.
- Keep the summary short, plain text, Telegram-friendly (no heavy markdown).
