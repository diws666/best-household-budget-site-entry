// Rumah Tangga — contoh keuangan rumah tangga Indonesia, November 2026.
// Semua angka dalam rupiah. Semua total yang ditampilkan dihitung dari data ini,
// tidak ada angka sampul, tidak ada lorem ipsum.

export const APP_NAME = 'Rumah Tangga';
export const MONTH = '2026-11';
export const MONTH_LABEL = 'November 2026';

export const CATEGORIES = [
  { key: 'makanan', label: 'Makanan & minuman', color: '#15803d' },
  { key: 'transportasi', label: 'Transportasi', color: '#0f766e' },
  { key: 'listrik_air', label: 'Listrik, air & gas', color: '#1d4ed8' },
  { key: 'pendidikan', label: 'Pendidikan', color: '#7c3aed' },
  { key: 'hiburan', label: 'Hiburan', color: '#d97706' },
];

export function categoryOf(key) {
  return CATEGORIES.find((c) => c.key === key) || CATEGORIES[0];
}

export function formatRupiah(amount) {
  return 'Rp ' + Number(amount || 0).toLocaleString('id-ID');
}

export function parseRupiah(text) {
  return Number(String(text || '').replace(/[^0-9,-]/g, '').replace(',', '.'));
}

export function fmtDate(input) {
  const d = new Date(String(input) + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function monthOf(date) {
  return String(date).slice(0, 7);
}

export function inMonth(date, month) {
  return monthOf(date) === month;
}

export const SEED = {
  income: [
    { id: 'i1', date: '2026-11-01', amount: 8500000, source: 'Gaji pokok' },
  ],
  expenses: [
    { id: 'e1', date: '2026-11-02', category: 'makanan', amount: 320000, note: 'Sembako ke pasar borong' },
    { id: 'e2', date: '2026-11-09', category: 'makanan', amount: 450000, note: 'Beras, minyak & gula' },
    { id: 'e3', date: '2026-11-16', category: 'makanan', amount: 280000, note: 'Sayuran & buah' },
    { id: 'e4', date: '2026-11-23', category: 'makanan', amount: 500000, note: 'Daging & ikan' },
    { id: 'e5', date: '2026-11-28', category: 'makanan', amount: 450000, note: 'Kebutuhan rumah tangga' },
    { id: 'e6', date: '2026-11-01', category: 'transportasi', amount: 200000, note: 'Isi ulang BBM motor' },
    { id: 'e7', date: '2026-11-08', category: 'transportasi', amount: 120000, note: 'Parkir & tol' },
    { id: 'e8', date: '2026-11-15', category: 'transportasi', amount: 200000, note: 'Isi ulang BBM motor' },
    { id: 'e9', date: '2026-11-22', category: 'transportasi', amount: 130000, note: 'Parkir & tol' },
    { id: 'e10', date: '2026-11-29', category: 'transportasi', amount: 100000, note: 'Isi ulang BBM motor' },
    { id: 'e11', date: '2026-11-05', category: 'listrik_air', amount: 450000, note: 'Tagihan listrik PLN' },
    { id: 'e12', date: '2026-11-10', category: 'listrik_air', amount: 150000, note: 'Tagihan air PDAM' },
    { id: 'e13', date: '2026-11-15', category: 'listrik_air', amount: 200000, note: 'Internet rumah' },
    { id: 'e14', date: '2026-11-25', category: 'listrik_air', amount: 100000, note: 'Pulsa & paket data' },
    { id: 'e15', date: '2026-11-30', category: 'listrik_air', amount: 300000, note: 'Tabung gas elpiji 3 kg' },
    { id: 'e16', date: '2026-11-03', category: 'pendidikan', amount: 350000, note: 'SPP bulanan' },
    { id: 'e17', date: '2026-11-10', category: 'pendidikan', amount: 150000, note: 'Buku & alat tulis' },
    { id: 'e18', date: '2026-11-17', category: 'pendidikan', amount: 100000, note: 'Les privat' },
    { id: 'e19', date: '2026-11-06', category: 'hiburan', amount: 250000, note: 'Makan luar bersama keluarga' },
    { id: 'e20', date: '2026-11-13', category: 'hiburan', amount: 120000, note: 'Tonton bioskop' },
    { id: 'e21', date: '2026-11-20', category: 'hiburan', amount: 80000, note: 'Langganan game online' },
  ],
  goals: [
    { id: 'g1', name: 'Dana darurat', target: 10000000, saved: 6250000 },
    { id: 'g2', name: 'Liburan keluarga', target: 5000000, saved: 1500000 },
    { id: 'g3', name: 'Pendidikan anak', target: 15000000, saved: 3000000 },
  ],
  bills: [
    { id: 'b1', name: 'Listrik PLN', due: '2026-11-05', amount: 450000, paid: true },
    { id: 'b2', name: 'Air PDAM', due: '2026-11-10', amount: 150000, paid: true },
    { id: 'b3', name: 'Internet rumah', due: '2026-11-15', amount: 200000, paid: true },
    { id: 'b4', name: 'Pulsa & paket data', due: '2026-11-25', amount: 100000, paid: true },
    { id: 'b5', name: 'Asuransi kesehatan', due: '2026-11-28', amount: 300000, paid: false },
    { id: 'b6', name: 'Tabung gas elpiji', due: '2026-11-30', amount: 300000, paid: false },
  ],
};

export const TREND = [
  { label: 'Jun 2026', income: 8200000, spending: 4800000 },
  { label: 'Jul 2026', income: 8300000, spending: 5100000 },
  { label: 'Agu 2026', income: 8100000, spending: 4900000 },
  { label: 'Sep 2026', income: 8400000, spending: 4700000 },
  { label: 'Okt 2026', income: 8600000, spending: 5300000 },
  { label: 'Nov 2026', income: 8500000, spending: 5000000 },
];
