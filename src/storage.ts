import type { Row } from './analyze'
const KEY = 'sales-insights:rows:v1'
export function loadSaved(): Row[] | null {
  try { const v = localStorage.getItem(KEY); return v ? (JSON.parse(v) as Row[]) : null } catch { return null }
}
export function save(rows: Row[]) { try { localStorage.setItem(KEY, JSON.stringify(rows)) } catch { /* storage full or blocked: edits stay in memory */ } }
export function clearSaved() { try { localStorage.removeItem(KEY) } catch { /* ignore */ } }

const COLS = ['date', 'invoice_no', 'region', 'branch', 'outlet_id', 'outlet_name', 'outlet_type', 'salesman', 'brand', 'sku', 'qty_carton', 'price_per_carton_idr', 'gross_sales_idr', 'discount_idr', 'net_sales_idr']
const q = (v: string | number) => { const s = String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s }
export function toCsv(rows: Row[]): string {
  return [COLS.join(','), ...rows.map(r => [r.date, r.invoice, r.region, r.branch, r.outletId, r.outletName, r.outletType, r.salesman, r.brand, r.sku, r.qty, r.price, r.gross, r.discount, r.net].map(q).join(','))].join('\n')
}
