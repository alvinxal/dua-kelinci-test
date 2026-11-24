export type Lang = 'id' | 'en'
export const T = {
  id: {
    title: 'Sales Insights', kicker: 'Build test · AI Builder', lede: 'Penjualan per region & brand, outlet terlemah, dan ringkasan siap kirim ke Telegram.',
    net: 'Net sales', invoices: 'Invoice', outlets: 'Outlet', region: 'Penjualan per region', brand: 'Penjualan per brand',
    weak: 'Outlet terlemah', weakNote: 'Urutan bisa kamu ubah di filter. Bawaan: total net sales terendah selama periode; invoice sedikit jadi pembeda.',
    outlet: 'Outlet', type: 'Tipe', area: 'Wilayah', total: 'Total', status: 'Status', tg: 'Ringkasan Telegram', copy: 'Salin', copied: 'Tersalin',
    clean: 'Pembersihan data', upload: 'Pakai CSV lain', err: 'CSV tidak bisa dibaca',
    note: { stopped: 'Berhenti order', new: 'Baru di bulan terakhir', down: 'Turun', up: 'Naik', flat: 'Stabil' },
    tabDash: 'Dashboard', tabData: 'Data', search: 'Cari invoice, outlet, brand…', addRow: 'Tambah baris', date: 'Tanggal', invoice: 'Invoice', price: 'Harga/karton', discount: 'Diskon', del: 'Hapus baris',
    rowsCount: (a: number, b: number) => `${a.toLocaleString('id-ID')} dari ${b.toLocaleString('id-ID')} baris. Ubah langsung di tabel, dashboard ikut berubah dan tersimpan di browser ini.`,
    fMonth: 'Bulan', fRegion: 'Region', fBrand: 'Brand', fType: 'Tipe outlet', all: 'Semua', top: 'Jumlah outlet', metric: 'Urutkan berdasarkan',
    mTotal: 'Total net sales terendah', mLast: 'Net sales bulan terakhir terendah', mDrop: 'Penurunan terbesar (bulan lalu → terakhir)',
    reset: 'Reset ke data asli', export: 'Ekspor CSV', edited: 'Data sudah diubah', noData: 'Tidak ada data untuk filter ini.', resetConfirm: 'Kembalikan semua data ke versi asli? Perubahanmu akan hilang.', clearFilters: 'Hapus filter',
    cleanLine: (c: { rows: number; duplicates: number; regionsMerged: number; namesTrimmed: number; blankSalesman: number; returns: number }) =>
      `${c.rows.toLocaleString('id-ID')} baris dipakai. ${c.duplicates} baris duplikat dibuang, ${c.regionsMerged} penulisan region diseragamkan (mis. "Jabar" = "Jawa Barat"), ${c.namesTrimmed} nama outlet dirapikan spasinya, ${c.blankSalesman} baris tanpa salesman tetap dihitung, ${c.returns} retur (nilai negatif) dikurangkan dari penjualan.`,
  },
  en: {
    title: 'Sales Insights', kicker: 'Build test · AI Builder', lede: 'Sales by region and brand, the weakest outlets, and a summary ready for Telegram.',
    net: 'Net sales', invoices: 'Invoices', outlets: 'Outlets', region: 'Sales by region', brand: 'Sales by brand',
    weak: 'Weakest outlets', weakNote: 'Change the ranking in the filters. Default: lowest total net sales over the period; fewer invoices breaks ties.',
    outlet: 'Outlet', type: 'Type', area: 'Area', total: 'Total', status: 'Status', tg: 'Telegram summary', copy: 'Copy', copied: 'Copied',
    clean: 'Data cleaning', upload: 'Use another CSV', err: 'Could not read the CSV',
    note: { stopped: 'Stopped ordering', new: 'New in latest month', down: 'Down', up: 'Up', flat: 'Steady' },
    tabDash: 'Dashboard', tabData: 'Data', search: 'Search invoice, outlet, brand…', addRow: 'Add row', date: 'Date', invoice: 'Invoice', price: 'Price/carton', discount: 'Discount', del: 'Delete row',
    rowsCount: (a: number, b: number) => `${a.toLocaleString('en-US')} of ${b.toLocaleString('en-US')} rows. Edit in place; the dashboard updates and your changes are saved in this browser.`,
    fMonth: 'Month', fRegion: 'Region', fBrand: 'Brand', fType: 'Outlet type', all: 'All', top: 'Outlets shown', metric: 'Rank by',
    mTotal: 'Lowest total net sales', mLast: 'Lowest net sales in latest month', mDrop: 'Biggest drop (prior → latest month)',
    reset: 'Reset to original data', export: 'Export CSV', edited: 'Data edited', noData: 'No data for this filter.', resetConfirm: 'Restore all data to the original? Your changes will be lost.', clearFilters: 'Clear filters',
    cleanLine: (c: { rows: number; duplicates: number; regionsMerged: number; namesTrimmed: number; blankSalesman: number; returns: number }) =>
      `${c.rows.toLocaleString('en-US')} rows used. ${c.duplicates} duplicate rows dropped, ${c.regionsMerged} region spellings unified (e.g. "Jabar" = "Jawa Barat"), ${c.namesTrimmed} outlet names trimmed, ${c.blankSalesman} rows with no salesman kept, ${c.returns} return (negative) lines netted off.`,
  },
}
