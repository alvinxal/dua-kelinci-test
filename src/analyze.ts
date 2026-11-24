export type Row = {
  date: string; invoice: string; region: string; branch: string
  outletId: string; outletName: string; outletType: string
  salesman: string; brand: string; sku: string; qty: number; net: number; gross: number; discount: number
}

export type Cleaning = { rows: number; duplicates: number; regionsMerged: number; namesTrimmed: number; blankSalesman: number; returns: number }

// Split CSV honoring quoted fields.
export function parseCsv(text: string): string[][] {
  const out: string[][] = []
  let row: string[] = [], cur = '', q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++ } else q = false } else cur += c
    } else if (c === '"') q = true
    else if (c === ',') { row.push(cur); cur = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(cur); cur = ''
      if (row.some(v => v !== '')) out.push(row)
      row = []
    } else cur += c
  }
  row.push(cur)
  if (row.some(v => v !== '')) out.push(row)
  return out
}

// Canonical region names: the file mixes "JAWA BARAT", "Jabar", "Jawa Barat", etc.
const REGION_ALIAS: Record<string, string> = { jabar: 'Jawa Barat', jatim: 'Jawa Timur', jateng: 'Jawa Tengah' }
function titleCase(s: string) { return s.toLowerCase().replace(/\b\p{L}/gu, m => m.toUpperCase()) }
export function normRegion(s: string) {
  const k = s.trim().replace(/\s+/g, ' ').toLowerCase()
  return REGION_ALIAS[k] ?? titleCase(k)
}

export function loadRows(csv: string): { rows: Row[]; cleaning: Cleaning } {
  const [head, ...body] = parseCsv(csv)
  const idx = Object.fromEntries(head.map((h, i) => [h.trim(), i]))
  const need = ['date', 'invoice_no', 'region', 'outlet_id', 'outlet_name', 'brand', 'net_sales_idr']
  const missing = need.filter(n => !(n in idx))
  if (missing.length) throw new Error(`Kolom tidak ada / missing columns: ${missing.join(', ')}`)
  const g = (r: string[], k: string) => (r[idx[k]] ?? '').trim()
  const n = (r: string[], k: string) => Number(g(r, k)) || 0

  const cleaning: Cleaning = { rows: 0, duplicates: 0, regionsMerged: 0, namesTrimmed: 0, blankSalesman: 0, returns: 0 }
  const seen = new Set<string>()
  const rows: Row[] = []
  // Outlet id is the key; the first-seen clean name wins.
  const names = new Map<string, string>()
  for (const r of body) {
    const key = r.join('\u0001')
    if (seen.has(key)) { cleaning.duplicates++; continue }
    seen.add(key)
    const rawRegion = g(r, 'region')
    const region = normRegion(rawRegion)
    if (region !== rawRegion) cleaning.regionsMerged++
    const rawName = r[idx.outlet_name] ?? ''
    if (rawName !== rawName.trim()) cleaning.namesTrimmed++
    const outletId = g(r, 'outlet_id')
    if (!names.has(outletId)) names.set(outletId, rawName.trim())
    const salesman = g(r, 'salesman')
    if (!salesman) cleaning.blankSalesman++
    const net = n(r, 'net_sales_idr')
    if (net < 0) cleaning.returns++
    rows.push({
      date: g(r, 'date'), invoice: g(r, 'invoice_no'), region, branch: g(r, 'branch'),
      outletId, outletName: '', outletType: g(r, 'outlet_type'), salesman: salesman || '(tanpa salesman)',
      brand: g(r, 'brand'), sku: g(r, 'sku'), qty: n(r, 'qty_carton'), net, gross: n(r, 'gross_sales_idr'), discount: n(r, 'discount_idr'),
    })
  }
  for (const r of rows) r.outletName = names.get(r.outletId) ?? r.outletId
  cleaning.rows = rows.length
  return { rows, cleaning }
}

export type Slice = { name: string; net: number; share: number }
function groupSum(rows: Row[], by: (r: Row) => string): Slice[] {
  const m = new Map<string, number>()
  for (const r of rows) m.set(by(r), (m.get(by(r)) ?? 0) + r.net)
  const total = [...m.values()].reduce((a, b) => a + b, 0) || 1
  return [...m].map(([name, net]) => ({ name, net, share: net / total })).sort((a, b) => b.net - a.net)
}

export type Outlet = {
  id: string; name: string; region: string; branch: string; type: string
  total: number; prev: number; last: number; invoices: number; note: 'stopped' | 'new' | 'down' | 'up' | 'flat'
}

export type Insights = {
  months: [string, string]; total: number; invoices: number; outlets: number
  byRegion: Slice[]; byBrand: Slice[]; weakest: Outlet[]; momPct: number | null
}

export function analyze(rows: Row[]): Insights {
  const months = [...new Set(rows.map(r => r.date.slice(0, 7)))].sort()
  const m: [string, string] = [months[months.length - 2] ?? months[0] ?? '', months[months.length - 1] ?? '']
  const o = new Map<string, Outlet & { inv: Set<string> }>()
  for (const r of rows) {
    let x = o.get(r.outletId)
    if (!x) { x = { id: r.outletId, name: r.outletName, region: r.region, branch: r.branch, type: r.outletType, total: 0, prev: 0, last: 0, invoices: 0, note: 'flat', inv: new Set() }; o.set(r.outletId, x) }
    x.total += r.net
    if (r.date.startsWith(m[0]) && m[0] !== m[1]) x.prev += r.net
    if (r.date.startsWith(m[1])) x.last += r.net
    x.inv.add(r.invoice)
  }
  const outlets: Outlet[] = [...o.values()].map(({ inv, ...x }) => ({
    ...x, invoices: inv.size,
    note: x.last === 0 ? 'stopped' : x.prev === 0 ? 'new' : x.last < x.prev * 0.9 ? 'down' : x.last > x.prev * 1.1 ? 'up' : 'flat',
  }))
  // "Weakest" = lowest total net sales over the whole period; ties broken by fewer invoices.
  const weakest = [...outlets].sort((a, b) => a.total - b.total || a.invoices - b.invoices).slice(0, 5)
  const prevTotal = rows.filter(r => r.date.startsWith(m[0])).reduce((a, r) => a + r.net, 0)
  const lastTotal = rows.filter(r => r.date.startsWith(m[1])).reduce((a, r) => a + r.net, 0)
  return {
    months: m, total: rows.reduce((a, r) => a + r.net, 0), invoices: new Set(rows.map(r => r.invoice)).size, outlets: outlets.length,
    byRegion: groupSum(rows, r => r.region), byBrand: groupSum(rows, r => r.brand), weakest,
    momPct: m[0] !== m[1] && prevTotal ? (lastTotal - prevTotal) / prevTotal : null,
  }
}
