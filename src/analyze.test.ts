import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { analyze, applyFilters, loadRows, NO_FILTER, normRegion, parseCsv, recalc } from './analyze'
import { telegramSummary } from './summary'

const csv = readFileSync('src/data/sales.csv', 'utf8')
const { rows, cleaning } = loadRows(csv)
const ins = analyze(rows)

test('region spellings collapse to 5 canonical regions', () => {
  expect(normRegion('JAWA BARAT')).toBe('Jawa Barat')
  expect(normRegion('Jabar')).toBe('Jawa Barat')
  expect(ins.byRegion.map(r => r.name).sort()).toEqual(['Jabodetabek', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Kalimantan', 'Sumatera'])
})
test('duplicates dropped, outlets merged by id', () => {
  expect(cleaning.duplicates).toBe(3)
  expect(rows).toHaveLength(1888)
  expect(ins.outlets).toBe(52)
})
test('shares sum to 1 and net matches the file', () => {
  expect(ins.byBrand.reduce((a, b) => a + b.share, 0)).toBeCloseTo(1)
  expect(ins.byRegion.reduce((a, b) => a + b.net, 0)).toBe(ins.total)
})
test('5 weakest, ascending', () => {
  expect(ins.weakest).toHaveLength(5)
  expect(ins.weakest[0].total).toBeLessThanOrEqual(ins.weakest[4].total)
})
test('quoted csv fields', () => { expect(parseCsv('a,b\n"x,1",2')).toEqual([['a', 'b'], ['x,1', '2']]) })
test('summary fits Telegram', () => { expect(telegramSummary(ins, 'id').length).toBeLessThan(1200) })
test('editing qty/price/discount recomputes gross and net', () => {
  const r = recalc({ ...rows[0], qty: 10, price: 100000, discount: 50000 })
  expect(r.gross).toBe(1000000)
  expect(r.net).toBe(950000)
})
test('filters narrow the data and the ranking size/metric are adjustable', () => {
  const jb = applyFilters(rows, { ...NO_FILTER, region: 'Jawa Barat' })
  expect(jb.length).toBeGreaterThan(0)
  expect(jb.every(r => r.region === 'Jawa Barat')).toBe(true)
  expect(analyze(rows, 10).weakest).toHaveLength(10)
  const drop = analyze(rows, 5, 'drop').weakest
  expect(drop[0].last - drop[0].prev).toBeLessThanOrEqual(drop[4].last - drop[4].prev)
  expect(analyze(applyFilters(rows, { ...NO_FILTER, month: '2026-10' })).momPct).toBeNull()
})
test('adding a row changes the totals', () => {
  const extra = recalc({ ...rows[0], id: 99999, invoice: 'NEW-1', qty: 1, price: 1000000, discount: 0 })
  expect(analyze([...rows, extra]).total).toBe(ins.total + 1000000)
})

import { answer, QUESTIONS } from './chat'
test('chat answers every template question from the data', () => {
  const ctx = { ins, rows, lang: 'id' as const, filtered: false, cleaning }
  for (const q of QUESTIONS) expect(answer(q.id, ctx).length).toBeGreaterThan(10)
  expect(answer('weak', ctx)).toContain(ins.weakest[0].name)
  expect(answer('region', ctx)).toContain(ins.byRegion[0].name)
  expect(answer('clean', ctx)).toContain('3 baris duplikat')
  expect(answer('trend', { ...ctx, lang: 'en' })).toContain('2026-10')
  expect(answer('total', { ...ctx, rows: [], ins: analyze([]) })).toContain('Belum ada data')
})
