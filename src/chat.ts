import type { Insights, Row } from './analyze'
import type { Lang } from './i18n'
import { idr } from './summary'

export type QId = 'total' | 'region' | 'brand' | 'weak' | 'stopped' | 'trend' | 'salesman' | 'clean'
export const QUESTIONS: { id: QId; id_: string; en: string }[] = [
  { id: 'total', id_: 'Berapa total penjualan?', en: 'What are total sales?' },
  { id: 'region', id_: 'Region mana yang paling kuat?', en: 'Which region is strongest?' },
  { id: 'brand', id_: 'Brand apa yang paling laris?', en: 'Which brand sells best?' },
  { id: 'weak', id_: 'Siapa saja outlet terlemah?', en: 'Who are the weakest outlets?' },
  { id: 'stopped', id_: 'Outlet mana yang berhenti order?', en: 'Which outlets stopped ordering?' },
  { id: 'trend', id_: 'Bagaimana tren September ke Oktober?', en: 'How did September compare to October?' },
  { id: 'salesman', id_: 'Salesman terbaik siapa?', en: 'Who is the top salesman?' },
  { id: 'clean', id_: 'Data apa yang dibersihkan?', en: 'What data was cleaned?' },
]

type Ctx = { ins: Insights; rows: Row[]; lang: Lang; filtered: boolean; cleaning: { duplicates: number; regionsMerged: number; namesTrimmed: number; blankSalesman: number; returns: number } }
const pct = (x: number) => `${(x * 100).toFixed(0)}%`

function sum(rows: Row[], key: (r: Row) => string) {
  const m = new Map<string, number>()
  for (const r of rows) m.set(key(r), (m.get(key(r)) ?? 0) + r.net)
  return [...m].sort((a, b) => b[1] - a[1])
}

// Rule-based answers computed from the data currently on screen (no LLM, so figures cannot be invented).
export function answer(q: QId, c: Ctx): string {
  const id = c.lang === 'id'
  const { ins, rows } = c
  const scope = c.filtered ? (id ? ' (sesuai filter yang aktif)' : ' (for the active filters)') : ''
  if (!rows.length) return id ? 'Belum ada data untuk filter ini.' : 'There is no data for this filter.'
  switch (q) {
    case 'total':
      return id
        ? `Total net sales ${idr(ins.total, 'id')} dari ${ins.invoices.toLocaleString('id-ID')} invoice di ${ins.outlets} outlet${scope}.`
        : `Total net sales are ${idr(ins.total, 'en')} from ${ins.invoices.toLocaleString('en-US')} invoices across ${ins.outlets} outlets${scope}.`
    case 'region': {
      const [a, b] = ins.byRegion, z = ins.byRegion[ins.byRegion.length - 1]
      return id
        ? `${a.name} terkuat: ${idr(a.net, 'id')} (${pct(a.share)}), disusul ${b?.name ?? '-'}. Terkecil ${z.name} (${pct(z.share)})${scope}.`
        : `${a.name} is strongest: ${idr(a.net, 'en')} (${pct(a.share)}), then ${b?.name ?? '-'}. Smallest is ${z.name} (${pct(z.share)})${scope}.`
    }
    case 'brand': {
      const top = ins.byBrand.slice(0, 3).map(b => `${b.name} ${pct(b.share)}`).join(', ')
      return id ? `Tiga brand teratas: ${top}${scope}.` : `Top three brands: ${top}${scope}.`
    }
    case 'weak': {
      const l = ins.weakest.map((o, i) => `${i + 1}. ${o.name} (${o.branch}) – ${idr(o.total, c.lang)}`).join('\n')
      return id ? `${ins.weakest.length} outlet terlemah menurut urutan di dashboard${scope}:\n${l}` : `The ${ins.weakest.length} weakest outlets per the dashboard ranking${scope}:\n${l}`
    }
    case 'stopped': {
      const s = ins.all.filter(o => o.note === 'stopped').sort((a, b) => b.prev - a.prev)
      if (!s.length) return id ? 'Tidak ada outlet yang berhenti order di bulan terakhir.' : 'No outlet stopped ordering in the latest month.'
      const l = s.slice(0, 5).map(o => `• ${o.name} (${o.branch}) – ${idr(o.prev, c.lang)} bulan sebelumnya`).join('\n')
      return id ? `${s.length} outlet tidak order di ${ins.months[1]}. Terbesar:\n${l}` : `${s.length} outlets did not order in ${ins.months[1]}. Largest:\n${l}`
    }
    case 'trend': {
      const months = sum(rows, r => r.date.slice(0, 7)).sort((a, b) => a[0].localeCompare(b[0]))
      const days = sum(rows, r => r.date)
      const line = months.map(([m, v]) => `${m}: ${idr(v, c.lang)}`).join(' · ')
      const mom = ins.momPct == null ? '' : id ? ` Perubahan ${ins.momPct >= 0 ? '+' : '−'}${pct(Math.abs(ins.momPct))}.` : ` Change ${ins.momPct >= 0 ? '+' : '−'}${pct(Math.abs(ins.momPct))}.`
      return id ? `${line}.${mom} Hari tertinggi ${days[0][0]} (${idr(days[0][1], 'id')}).` : `${line}.${mom} Best day ${days[0][0]} (${idr(days[0][1], 'en')}).`
    }
    case 'salesman': {
      const s = sum(rows, r => r.salesman).filter(([n]) => !n.startsWith('('))
      if (!s.length) return id ? 'Data salesman tidak tersedia.' : 'No salesman data.'
      const l = s.slice(0, 3).map(([n, v], i) => `${i + 1}. ${n} – ${idr(v, c.lang)}`).join('\n')
      return id ? `Salesman teratas${scope}:\n${l}` : `Top salesmen${scope}:\n${l}`
    }
    case 'clean': {
      const k = c.cleaning
      return id
        ? `${k.duplicates} baris duplikat dibuang, ${k.regionsMerged} penulisan region diseragamkan, ${k.namesTrimmed} nama outlet dirapikan, ${k.blankSalesman} baris tanpa salesman tetap dihitung, ${k.returns} retur dikurangkan dari penjualan.`
        : `${k.duplicates} duplicate rows dropped, ${k.regionsMerged} region spellings unified, ${k.namesTrimmed} outlet names trimmed, ${k.blankSalesman} rows with no salesman kept, ${k.returns} return line netted off.`
    }
  }
}
