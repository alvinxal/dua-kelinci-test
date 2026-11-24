import type { Insights } from './analyze'
import type { Lang } from './i18n'

export const idr = (n: number, l: Lang) => {
  const a = Math.abs(n)
  const f = (v: number, u: string) => `Rp${v.toLocaleString(l === 'id' ? 'id-ID' : 'en-US', { maximumFractionDigits: 1 })} ${u}`
  return a >= 1e9 ? f(n / 1e9, l === 'id' ? 'miliar' : 'bn') : f(n / 1e6, l === 'id' ? 'juta' : 'mn')
}
const pct = (x: number) => `${(x * 100).toFixed(0)}%`

// One paragraph, plain text, short enough for a Telegram message.
export function telegramSummary(i: Insights, l: Lang): string {
  const r = i.byRegion[0], b = i.byBrand[0], b2 = i.byBrand[1], rLast = i.byRegion[i.byRegion.length - 1]
  const w = i.weakest.map(o => o.name).join(', ')
  const stopped = i.weakest.filter(o => o.note === 'stopped').length
  if (l === 'id') {
    const mom = i.momPct == null ? '' : ` Penjualan ${i.momPct >= 0 ? 'naik' : 'turun'} ${pct(Math.abs(i.momPct))} dari bulan sebelumnya.`
    return `📊 Penjualan ${i.months[0]} s/d ${i.months[1]}: ${idr(i.total, l)} dari ${i.invoices.toLocaleString('id-ID')} invoice di ${i.outlets} outlet.${mom} ${r.name} memimpin dengan ${pct(r.share)} dari total, sedangkan ${rLast.name} terkecil (${pct(rLast.share)}). Brand teratas ${b.name} (${pct(b.share)}) disusul ${b2.name} (${pct(b2.share)}). ${i.weakest.length} outlet terlemah: ${w}${stopped ? ` — ${stopped} di antaranya tidak order lagi di bulan terakhir, prioritaskan kunjungan` : ''}.`
  }
  const mom = i.momPct == null ? '' : ` Sales ${i.momPct >= 0 ? 'rose' : 'fell'} ${pct(Math.abs(i.momPct))} vs the prior month.`
  return `📊 Sales ${i.months[0]} to ${i.months[1]}: ${idr(i.total, l)} from ${i.invoices.toLocaleString('en-US')} invoices across ${i.outlets} outlets.${mom} ${r.name} leads with ${pct(r.share)} of the total while ${rLast.name} is smallest (${pct(rLast.share)}). Top brand is ${b.name} (${pct(b.share)}), then ${b2.name} (${pct(b2.share)}). The ${i.weakest.length} weakest outlets: ${w}${stopped ? ` — ${stopped} stopped ordering in the latest month, worth a visit` : ''}.`
}
