import { useEffect, useMemo, useState } from 'react'
import raw from './data/sales.csv?raw'
import DataEditor from './DataEditor'
import { analyze, applyFilters, loadRows, NO_FILTER, type Filters, type Metric, type Row, type Slice } from './analyze'
import { T, type Lang } from './i18n'
import { clearSaved, loadSaved, save, toCsv } from './storage'
import { telegramSummary } from './summary'

const original = loadRows(raw)
const fmt = (n: number, l: Lang) => 'Rp' + Math.round(n).toLocaleString(l === 'id' ? 'id-ID' : 'en-US')
const mn = (n: number, l: Lang) => (n >= 1e9 ? (n / 1e9).toFixed(2) + (l === 'id' ? ' M' : ' bn') : (n / 1e6).toFixed(1) + (l === 'id' ? ' jt' : ' mn'))

function Bars({ data, l }: { data: Slice[]; l: Lang }) {
  const max = Math.max(...data.map(d => d.net), 1)
  return (
    <ul className="bars">
      {data.map((d, i) => (
        <li key={d.name}>
          <div className="bar-head"><span>{d.name}</span><b>{mn(d.net, l)} · {(d.share * 100).toFixed(0)}%</b></div>
          <div className="track"><div className={'fill c' + (i % 3)} style={{ width: `${(Math.max(d.net, 0) / max) * 100}%` }} /></div>
        </li>
      ))}
    </ul>
  )
}

function Select({ label, value, onChange, options, all }: { label: string; value: string; onChange: (v: string) => void; options: string[]; all: string }) {
  return (
    <label className="field"><span>{label}</span>
      <select className="in" value={value} onChange={e => onChange(e.target.value)}>
        <option value="">{all}</option>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </label>
  )
}

export default function App() {
  const [lang, setLang] = useState<Lang>(() => { try { return (localStorage.getItem('lang') as Lang) || 'id' } catch { return 'id' } })
  const [rows, setRowsState] = useState<Row[]>(() => loadSaved() ?? original.rows)
  const [edited, setEdited] = useState(() => loadSaved() !== null)
  const [tab, setTab] = useState<'dash' | 'data'>('dash')
  const [filters, setFilters] = useState<Filters>(NO_FILTER)
  const [n, setN] = useState(5)
  const [metric, setMetric] = useState<Metric>('total')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const t = T[lang]

  useEffect(() => { document.documentElement.lang = lang }, [lang])
  const setL = (l: Lang) => { setLang(l); try { localStorage.setItem('lang', l) } catch { /* ignore */ } }

  const setRows = (f: (r: Row[]) => Row[]) => setRowsState(prev => { const next = f(prev); save(next); setEdited(true); return next })

  const opt = useMemo(() => {
    const u = (f: (r: Row) => string) => [...new Set(rows.map(f))].sort()
    return { months: u(r => r.date.slice(0, 7)), regions: u(r => r.region), brands: u(r => r.brand), types: u(r => r.outletType) }
  }, [rows])

  const ins = useMemo(() => analyze(applyFilters(rows, filters), n, metric), [rows, filters, n, metric])
  const summary = ins.total || ins.outlets ? telegramSummary(ins, lang) : ''
  const filtered = Object.values(filters).some(Boolean)
  const setF = (k: keyof Filters) => (v: string) => setFilters(f => ({ ...f, [k]: v }))

  async function onFile(f?: File) {
    if (!f) return
    try {
      const { rows: r } = loadRows(await f.text())
      if (!r.length) throw new Error('0 rows')
      setRows(() => r); setFilters(NO_FILTER); setError('')
    } catch (e) { setError(`${t.err}: ${(e as Error).message}`) }
  }
  function download() {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([toCsv(rows)], { type: 'text/csv' }))
    a.download = 'sales-edited.csv'; a.click(); URL.revokeObjectURL(a.href)
  }
  function reset() {
    if (!window.confirm(t.resetConfirm)) return
    clearSaved(); setRowsState(original.rows); setEdited(false); setFilters(NO_FILTER); setError('')
  }

  return (
    <>
      <header className="hero">
        <div className="wrap">
          <div className="top">
            <img className="logo" src="/logo-white.png" alt="Dua Kelinci" width="132" height="80" />
            <div className="langs" role="group" aria-label="Language">
              {(['id', 'en'] as const).map(l => <button key={l} aria-pressed={lang === l} onClick={() => setL(l)}>{l.toUpperCase()}</button>)}
            </div>
          </div>
          <p className="kicker dept">{t.kicker}</p>
          <h1>{t.title}</h1>
          <p className="lede">{t.lede}</p>
          <ul className="pills"><li>{opt.months[0]} → {opt.months[opt.months.length - 1]}</li>{edited && <li>{t.edited}</li>}</ul>
        </div>
      </header>
      <div className="stripe" />

      <nav className="tabs wrap" aria-label="Views">
        <button aria-pressed={tab === 'dash'} onClick={() => setTab('dash')}>{t.tabDash}</button>
        <button aria-pressed={tab === 'data'} onClick={() => setTab('data')}>{t.tabData}</button>
      </nav>

      <main className="wrap">
        {tab === 'data' ? (
          <>
            <DataEditor rows={rows} setRows={setRows} lang={lang} />
            <div className="toolbar">
              <button className="dl ghost" onClick={download}>{t.export}</button>
              <label className="dl ghost">{t.upload}<input type="file" accept=".csv,text/csv" hidden onChange={e => { onFile(e.target.files?.[0]); e.target.value = '' }} /></label>
              {edited && <button className="dl ghost danger" onClick={reset}>{t.reset}</button>}
            </div>
            {error && <p role="alert" className="err">{error}</p>}
            <h3>{t.clean}</h3>
            <p className="muted">{t.cleanLine(original.cleaning)}</p>
          </>
        ) : (
          <>
            <section className="filters" aria-label="Filters">
              <Select label={t.fMonth} value={filters.month} onChange={setF('month')} options={opt.months} all={t.all} />
              <Select label={t.fRegion} value={filters.region} onChange={setF('region')} options={opt.regions} all={t.all} />
              <Select label={t.fBrand} value={filters.brand} onChange={setF('brand')} options={opt.brands} all={t.all} />
              <Select label={t.fType} value={filters.type} onChange={setF('type')} options={opt.types} all={t.all} />
              {filtered && <button className="dl ghost" onClick={() => setFilters(NO_FILTER)}>{t.clearFilters}</button>}
            </section>

            {!ins.outlets ? <p className="muted">{t.noData}</p> : (
              <>
                <section className="stats" aria-label="Totals">
                  <div className="stat"><b>{mn(ins.total, lang)}</b><span>{t.net}</span></div>
                  <div className="stat"><b>{ins.invoices.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')}</b><span>{t.invoices}</span></div>
                  <div className="stat"><b>{ins.outlets}</b><span>{t.outlets}</span></div>
                </section>

                <section><h2>{t.region}</h2><Bars data={ins.byRegion} l={lang} /></section>
                <section><h2>{t.brand}</h2><Bars data={ins.byBrand} l={lang} /></section>

                <section>
                  <h2>{ins.weakest.length} {t.weak.toLowerCase()}</h2>
                  <div className="controls">
                    <label className="field"><span>{t.top}: <b>{n}</b></span>
                      <input type="range" min="3" max="15" value={n} onChange={e => setN(Number(e.target.value))} />
                    </label>
                    <label className="field"><span>{t.metric}</span>
                      <select className="in" value={metric} onChange={e => setMetric(e.target.value as Metric)}>
                        <option value="total">{t.mTotal}</option><option value="last">{t.mLast}</option><option value="drop">{t.mDrop}</option>
                      </select>
                    </label>
                  </div>
                  <p className="muted">{t.weakNote}</p>
                  <div className="tablebox">
                    <table>
                      <thead><tr><th>{t.outlet}</th><th>{t.area}</th><th className="num">{t.total}</th><th>{t.status}</th></tr></thead>
                      <tbody>
                        {ins.weakest.map(o => (
                          <tr key={o.id}>
                            <td>{o.name}<small>{o.id} · {o.type}</small></td>
                            <td>{o.branch}<small>{o.region}</small></td>
                            <td className="num">{fmt(o.total, lang)}<small>{o.invoices} invoice</small></td>
                            <td><span className={'tag ' + o.note}>{t.note[o.note]}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="test">
                  <p className="tag-h">{t.tg}</p>
                  <p className="msg" lang={lang}>{summary}</p>
                  <button className="dl" onClick={async () => { try { await navigator.clipboard.writeText(summary); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { /* clipboard blocked */ } }}>
                    {copied ? t.copied : t.copy}
                  </button>
                </section>
              </>
            )}
          </>
        )}
      </main>
      <footer className="wrap foot"><img src="/logo-red.png" alt="Dua Kelinci" width="96" height="58" /></footer>
    </>
  )
}
