export type Lang = 'id' | 'en'
export const T = {
  id: {
    title: 'Sales Insights', kicker: 'Build test · AI Builder', lede: 'Penjualan per region & brand, 5 outlet terlemah, dan ringkasan siap kirim ke Telegram.',
    net: 'Net sales', invoices: 'Invoice', outlets: 'Outlet', region: 'Penjualan per region', brand: 'Penjualan per brand',
    weak: '5 outlet terlemah', weakNote: 'Dihitung dari total net sales terendah selama periode; invoice sedikit jadi pembeda.',
    outlet: 'Outlet', type: 'Tipe', area: 'Wilayah', total: 'Total', status: 'Status', tg: 'Ringkasan Telegram', copy: 'Salin', copied: 'Tersalin',
    clean: 'Pembersihan data', upload: 'Pakai CSV lain', err: 'CSV tidak bisa dibaca',
    note: { stopped: 'Berhenti order', new: 'Baru di bulan terakhir', down: 'Turun', up: 'Naik', flat: 'Stabil' },
    cleanLine: (c: { rows: number; duplicates: number; regionsMerged: number; namesTrimmed: number; blankSalesman: number; returns: number }) =>
      `${c.rows.toLocaleString('id-ID')} baris dipakai. ${c.duplicates} baris duplikat dibuang, ${c.regionsMerged} penulisan region diseragamkan (mis. "Jabar" = "Jawa Barat"), ${c.namesTrimmed} nama outlet dirapikan spasinya, ${c.blankSalesman} baris tanpa salesman tetap dihitung, ${c.returns} retur (nilai negatif) dikurangkan dari penjualan.`,
  },
  en: {
    title: 'Sales Insights', kicker: 'Build test · AI Builder', lede: 'Sales by region and brand, the 5 weakest outlets, and a summary ready for Telegram.',
    net: 'Net sales', invoices: 'Invoices', outlets: 'Outlets', region: 'Sales by region', brand: 'Sales by brand',
    weak: '5 weakest outlets', weakNote: 'Ranked by lowest total net sales over the period; fewer invoices breaks ties.',
    outlet: 'Outlet', type: 'Type', area: 'Area', total: 'Total', status: 'Status', tg: 'Telegram summary', copy: 'Copy', copied: 'Copied',
    clean: 'Data cleaning', upload: 'Use another CSV', err: 'Could not read the CSV',
    note: { stopped: 'Stopped ordering', new: 'New in latest month', down: 'Down', up: 'Up', flat: 'Steady' },
    cleanLine: (c: { rows: number; duplicates: number; regionsMerged: number; namesTrimmed: number; blankSalesman: number; returns: number }) =>
      `${c.rows.toLocaleString('en-US')} rows used. ${c.duplicates} duplicate rows dropped, ${c.regionsMerged} region spellings unified (e.g. "Jabar" = "Jawa Barat"), ${c.namesTrimmed} outlet names trimmed, ${c.blankSalesman} rows with no salesman kept, ${c.returns} return (negative) lines netted off.`,
  },
}
