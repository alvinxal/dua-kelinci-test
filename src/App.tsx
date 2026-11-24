import { useMemo, useState } from 'react'
import raw from './data/sales.csv?raw'
import { analyze, loadRows, type Slice } from './analyze'
import { T, type Lang } from './i18n'
import { telegramSummary } from './summary'

const fmt = (n: number, l: Lang) => 'Rp' + Math.round(n).toLocaleString(l === 'id' ? 'id-ID' : 'en-US')
const mn = (n: number, l: Lang) => (n >= 1e9 ? (n / 1e9).toFixed(2) + (l === 'id' ? ' M' : ' bn') : (n / 1e6).toFixed(1) + (l === 'id' ? ' jt' : ' mn'))

function Bars({ data, l }: { data: Slice[]; l: Lang }) {
  const max = data[0]?.net || 1
  return (
    <ul className="bars">
      {data.map((d, i) => (
        <li key={d.name}>
          <div className="bar-head"><span>{d.name}</span><b>{mn(d.net, l)} · {(d.share * 100).toFixed(0)}%</b></div>
          <div className="track"><div className={'fill c' + (i % 3)} style={{ width: `${(d.net / max) * 100}%` }} /></div>
        </li>
      ))}
    </ul>
  )
}

export default function App() {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('lang') as Lang) || 'id')
  const [csv, setCsv] = useState(raw)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const t = T[lang]

  const data = useMemo(() => {
    try { const { rows, cleaning } = loadRows(csv); return { cleaning, ins: analyze(rows) } } catch { return null }
  }, [csv])

  const pick = lang === 'id' ? 'id' : 'en'
  const setL = (l: Lang) => { setLang(l); document.documentElement.lang = l; localStorage.setItem('lang', l) }

  async function onFile(f?: File) {
    if (!f) return
    const text = await f.text()
    try { loadRows(text); setCsv(text); setError('') } catch (e) { setError(`${t.err}: ${(e as Error).message}`) }
  }

  if (!data) return <p className="wrap">{t.err}</p>
  const { ins, cleaning } = data
  const summary = telegramSummary(ins, pick)

  return (
    <>
      <header className="hero">
        <div className="wrap">
          <div className="top">
            <p className="kicker">{t.kicker}</p>
            <div className="langs" role="group" aria-label="Language">
              {(['id', 'en'] as const).map(l => <button key={l} aria-pressed={lang === l} onClick={() => setL(l)}>{l.toUpperCase()}</button>)}
            </div>
          </div>
          <h1>{t.title}</h1>
          <p className="lede">{t.lede}</p>
          <ul className="pills"><li>{ins.months[0]} → {ins.months[1]}</li></ul>
        </div>
      </header>
      <div className="stripe" />
      <main className="wrap">
        <section className="stats" aria-label="Totals">
          <div className="stat"><b>{mn(ins.total, pick)}</b><span>{t.net}</span></div>
          <div className="stat"><b>{ins.invoices.toLocaleString(pick === 'id' ? 'id-ID' : 'en-US')}</b><span>{t.invoices}</span></div>
          <div className="stat"><b>{ins.outlets}</b><span>{t.outlets}</span></div>
        </section>

        <section><h2>{t.region}</h2><Bars data={ins.byRegion} l={pick} /></section>
        <section><h2>{t.brand}</h2><Bars data={ins.byBrand} l={pick} /></section>

        <section>
          <h2>{t.weak}</h2>
          <p className="muted">{t.weakNote}</p>
          <div className="tablebox">
            <table>
              <thead><tr><th>{t.outlet}</th><th>{t.area}</th><th className="num">{t.total}</th><th>{t.status}</th></tr></thead>
              <tbody>
                {ins.weakest.map(o => (
                  <tr key={o.id}>
                    <td>{o.name}<small>{o.id} · {o.type}</small></td>
                    <td>{o.branch}<small>{o.region}</small></td>
                    <td className="num">{fmt(o.total, pick)}<small>{o.invoices} invoice</small></td>
                    <td><span className={'tag ' + o.note}>{t.note[o.note]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="test">
          <p className="tag-h">{t.tg}</p>
          <p className="msg" lang={pick}>{summary}</p>
          <button className="dl" onClick={async () => { await navigator.clipboard.writeText(summary); setCopied(true); setTimeout(() => setCopied(false), 1800) }}>
            {copied ? t.copied : t.copy}
          </button>
        </section>

        <section>
          <h3>{t.clean}</h3>
          <p className="muted">{t.cleanLine(cleaning)}</p>
          <label className="dl ghost">
            {t.upload}
            <input type="file" accept=".csv,text/csv" hidden onChange={e => onFile(e.target.files?.[0])} />
          </label>
          {error && <p role="alert" className="err">{error}</p>}
        </section>
      </main>
    </>
  )
}
