import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { analyze, loadRows, normRegion, parseCsv } from './analyze'
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
test('summary fits Telegram', () => { expect(telegramSummary(ins, 'id').length).toBeLessThan(1200); console.log(telegramSummary(ins, 'id')); console.log(ins.weakest.map(o => [o.name, o.total, o.invoices, o.note])) })
