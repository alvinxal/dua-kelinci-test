import { useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons'
import { recalc, type Row } from './analyze'
import type { Lang } from './i18n'
import { T } from './i18n'

const PAGE = 15

export default function DataEditor({ rows, setRows, lang }: { rows: Row[]; setRows: (f: (r: Row[]) => Row[]) => void; lang: Lang }) {
  const t = T[lang]
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)

  const outlets = useMemo(() => {
    const m = new Map<string, Row>()
    for (const r of rows) if (!m.has(r.outletId)) m.set(r.outletId, r)
    return [...m.values()].sort((a, b) => a.outletId.localeCompare(b.outletId))
  }, [rows])
  const brands = useMemo(() => [...new Set(rows.map(r => r.brand))].sort(), [rows])
  const skuOf = useMemo(() => {
    const m = new Map<string, string[]>()
    for (const r of rows) { const l = m.get(r.brand) ?? []; if (!l.includes(r.sku)) l.push(r.sku); m.set(r.brand, l) }
    return m
  }, [rows])

  const shown = useMemo(() => {
    const s = query.trim().toLowerCase()
    const list = s ? rows.filter(r => [r.invoice, r.outletName, r.outletId, r.brand, r.sku, r.salesman, r.date].some(v => v.toLowerCase().includes(s))) : rows
    return list
  }, [rows, query])
  const pages = Math.max(1, Math.ceil(shown.length / PAGE))
  const cur = Math.min(page, pages - 1)
  const slice = shown.slice(cur * PAGE, cur * PAGE + PAGE)

  const patch = (id: number, p: Partial<Row>) => setRows(rs => rs.map(r => (r.id === id ? recalc({ ...r, ...p }) : r)))
  const num = (v: string) => Math.max(0, Number(v) || 0)

  function add() {
    const base = rows[rows.length - 1] ?? outlets[0]
    const id = rows.reduce((m, r) => Math.max(m, r.id), -1) + 1
    const row = recalc({ ...base, id, invoice: `NEW-${id}`, qty: 1, discount: 0, net: 0, gross: 0, date: rows.reduce((m, r) => (r.date > m ? r.date : m), '') || base.date })
    setRows(rs => [row, ...rs])
    setQuery(''); setPage(0)
  }

  return (
    <section>
      <div className="toolbar">
        <input type="search" className="in grow" placeholder={t.search} value={query} onChange={e => { setQuery(e.target.value); setPage(0) }} aria-label={t.search} />
        <button className="dl solid" onClick={add}><FontAwesomeIcon icon={faPlus} /> {t.addRow}</button>
      </div>
      <p className="muted">{t.rowsCount(shown.length, rows.length)}</p>
      <div className="tablebox databox">
        <table className="data">
          <thead><tr><th>{t.date}</th><th>{t.invoice}</th><th>{t.outlet}</th><th>Brand</th><th>SKU</th><th className="num">Qty</th><th className="num">{t.price}</th><th className="num">{t.discount}</th><th className="num">Net</th><th /></tr></thead>
          <tbody>
            {slice.map(r => (
              <tr key={r.id}>
                <td><input className="in" type="date" value={r.date} onChange={e => patch(r.id, { date: e.target.value })} aria-label={t.date} /></td>
                <td><input className="in w90" value={r.invoice} onChange={e => patch(r.id, { invoice: e.target.value })} aria-label={t.invoice} /></td>
                <td>
                  <select className="in" value={r.outletId} aria-label={t.outlet} onChange={e => {
                    const o = outlets.find(x => x.outletId === e.target.value)!
                    patch(r.id, { outletId: o.outletId, outletName: o.outletName, region: o.region, branch: o.branch, outletType: o.outletType })
                  }}>
                    {outlets.map(o => <option key={o.outletId} value={o.outletId}>{o.outletId} · {o.outletName}</option>)}
                  </select>
                </td>
                <td>
                  <select className="in" value={r.brand} aria-label="Brand" onChange={e => patch(r.id, { brand: e.target.value, sku: skuOf.get(e.target.value)?.[0] ?? '' })}>
                    {brands.map(b => <option key={b}>{b}</option>)}
                  </select>
                </td>
                <td>
                  <select className="in" value={r.sku} aria-label="SKU" onChange={e => patch(r.id, { sku: e.target.value })}>
                    {(skuOf.get(r.brand) ?? [r.sku]).map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td><input className="in num w70" type="number" value={r.qty} onChange={e => patch(r.id, { qty: e.target.value === '' ? 0 : Number(e.target.value) })} aria-label="Qty" /></td>
                <td><input className="in num w90" type="number" min="0" value={r.price} onChange={e => patch(r.id, { price: num(e.target.value) })} aria-label={t.price} /></td>
                <td><input className="in num w90" type="number" min="0" value={r.discount} onChange={e => patch(r.id, { discount: num(e.target.value) })} aria-label={t.discount} /></td>
                <td className="num"><b className={r.net < 0 ? 'neg' : ''}>{r.net.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')}</b></td>
                <td><button className="icon" onClick={() => setRows(rs => rs.filter(x => x.id !== r.id))} aria-label={t.del} title={t.del}><FontAwesomeIcon icon={faTimes} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pager">
        <button className="dl ghost" disabled={cur === 0} onClick={() => setPage(cur - 1)}>‹</button>
        <span>{cur + 1} / {pages}</span>
        <button className="dl ghost" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)}>›</button>
      </div>
    </section>
  )
}
