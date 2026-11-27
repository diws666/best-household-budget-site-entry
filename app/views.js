// HTML tiada halaman. Setiap fungsi mengembalikan string HTML yang sudah di-escape.

import { CATEGORIES, categoryOf, formatRupiah, parseRupiah, fmtDate, MONTH_LABEL, TREND, inMonth, monthOf } from './data.js';
import { drawDonut, drawBar } from './charts.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sum = (rows, key) => rows.reduce((t, r) => t + Number(r[key] || 0), 0);
const byCategory = (rows) => {
  const out = {};
  for (const r of rows) out[r.category] = (out[r.category] || 0) + Number(r.amount || 0);
  return out;
};

function nav(path) {
  const items = [
    ['/', 'Beranda'],
    ['/pengeluaran', 'Pengeluaran'],
    ['/pemasukan', 'Pemasukan'],
    ['/tabungan', 'Tabungan'],
    ['/tagihan', 'Tagihan'],
    ['/laporan', 'Laporan'],
  ];
  return `<nav><ul>${items.map(([p, label]) => `<li><a href="#${p}" class="${path === p ? 'active' : ''}">${esc(label)}</a></li>`).join('')}</ul></nav>`;
}

function monthSelect(state, label = 'Bulan') {
  const months = ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11'];
  const labels = ['Juni 2026', 'Juli 2026', 'Agustus 2026', 'September 2026', 'Oktober 2026', 'November 2026'];
  return `<label for="month">${esc(label)}</label><select id="month">${months.map((m, i) => `<option value="${m}" ${m === state.viewMonth ? 'selected' : ''}>${esc(labels[i])}</option>`).join('')}</select>`;
}

function statCard(keterangan, besar, kecil) {
  return `<div class="card stat"><p class="ket">${esc(keterangan)}</p><p class="big">${esc(besar)}</p>${kecil ? `<p class="small">${esc(kecil)}</p>` : ''}</div>`;
}

export function home(state) {
  const expenses = state.expenses.filter((e) => inMonth(e.date, state.viewMonth));
  const income = state.income.filter((i) => inMonth(i.date, state.viewMonth));
  const totalIncome = sum(income, 'amount');
  const totalSpending = sum(expenses, 'amount');
  const remaining = totalIncome - totalSpending;
  const byCat = byCategory(expenses);
  const segments = CATEGORIES.map((c) => ({ label: c.label, value: byCat[c.key] || 0, color: c.color })).filter((s) => s.value > 0);
  const recent = [...expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const rows = recent.map((e) => `<tr><td>${fmtDate(e.date)}</td><td>${esc(categoryOf(e.category).label)}</td><td class="num">${formatRupiah(e.amount)}</td><td>${esc(e.note)}</td></tr>`).join('');
  return `
<header><div class="brand"><a href="#/">Rumah Tangga</a></div><div class="month">${monthSelect(state)}</div></header>
${nav('/')}
<section class="grid grid-stats">
  ${statCard('Pemasukan ' + MONTH_LABEL, formatRupiah(totalIncome), '1 sumber')}
  ${statCard('Pengeluaran ' + MONTH_LABEL, formatRupiah(totalSpending), expenses.length + ' transaksi')}
  ${statCard('Sisa anggaran', formatRupiah(remaining), remaining >= 0 ? 'aman' : 'lebih dari budget')}
</section>
<div class="grid grid-main">
  <div class="card chart" style="grid-column:1 / -1">
    <h2>Pengeluaran per kategori — ${MONTH_LABEL}</h2>
    <div class="chart-wrap">${drawDonut(segments, 340, 300)}</div>
  </div>
  <div class="card">
    <h2>Pengeluaran terbaru</h2>
    <table class="tabel"><thead><tr><th>Tanggal</th><th>Kategori</th><th class="num">Jumlah</th><th>Keterangan</th></tr></thead><tbody>${rows || '<tr><td colspan="4">Belum ada transaksi.</td></tr>'}</tbody></table>
    <p class="hint"><a href="#/pengeluaran">Kelola semua pengeluaran &rarr;</a></p>
  </div>
</div>`;
}

export function expenses(state, ui) {
  const catFilter = ui.category || '';
  const query = (ui.query || '').toLowerCase();
  const sort = ui.sort || 'date';
  let rows = state.expenses.filter((e) => (!catFilter || e.category === catFilter) && (!query || e.note.toLowerCase().includes(query) || e.category.toLowerCase().includes(query)));
  rows = rows.slice().sort((a, b) => {
    if (sort === 'amount') return Number(b.amount) - Number(a.amount);
    return b.date.localeCompare(a.date);
  });
  const chips = CATEGORIES.map((c) => `<button class="chip ${c.key === catFilter ? 'active' : ''}" data-cat="${esc(c.key)}">${esc(c.label)}</button>`).join('');
  const body = rows.map((e) => `
    <tr>
      <td>${fmtDate(e.date)}</td><td><span class="cat" style="color:${categoryOf(e.category).color}">${esc(categoryOf(e.category).label)}</span></td>
      <td class="num">${formatRupiah(e.amount)}</td><td>${esc(e.note)}</td>
      <td class="acts"><button data-action="edit-expense" data-id="${esc(e.id)}">Ubah</button> <button data-action="delete-expense" data-id="${esc(e.id)}">Hapus</button></td>
    </tr>`).join('');
  const edit = ui.editing && ui.editing.type === 'expense' ? expenseForm(state, ui.editing.item) : expenseForm(state);
  return `
<header><div class="brand"><a href="#/">&larr; Kembali</a></div><div class="month">${monthSelect(state)}</div></header>
${nav('/pengeluaran')}
<h1>Pengeluaran — ${MONTH_LABEL}</h1>
<div class="card">
  <form id="form-filter" class="filterbar">
    ${chips}
    <input type="search" id="f-q" placeholder="Cari keterangan atau kategori" value="${esc(ui.query || '')}">
    <select id="f-sort"><option value="date" ${sort === 'date' ? 'selected' : ''}>Urutkan: terbaru dulu</option><option value="amount" ${sort === 'amount' ? 'selected' : ''}>Jumlah terbesar dulu</option></select>
  </form>
  <div class="card-inner"><table class="tabel"><thead><tr><th>Tanggal</th><th>Kategori</th><th class="num">Jumlah</th><th>Keterangan</th><th>Aksi</th></tr></thead><tbody>${body || '<tr><td colspan="5">Tidak ada transaksi yang cocok.</td></tr>'}</tbody></table></div>
  <p class="total">Total ditampilkan: <b>${formatRupiah(sum(rows, 'amount'))}</b></p>
</div>
<div class="card">${edit}</div>`;
}

function expenseForm(state, item) {
  const e = item || { date: '', category: 'makanan', amount: '', note: '' };
  const isEdit = !!item;
  return `
  <form id="form-expense" class="form">
    <h2>${isEdit ? 'Ubah pengeluaran' : 'Tambah pengeluaran'}</h2>
    <input type="hidden" id="expense-id" value="${esc(item ? item.id : '')}">
    <div class="row2"><label>Tanggal</label><input type="date" id="expense-date" value="${esc(e.date)}" required></div>
    <div class="row2"><label>Kategori</label><select id="expense-category">${CATEGORIES.map((c) => `<option value="${esc(c.key)}" ${e.category === c.key ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}</select></div>
    <div class="row2"><label>Jumlah (rupiah)</label><input type="text" id="expense-amount" value="${esc(e.amount === '' ? '' : formatRupiah(e.amount))}" placeholder="Contoh: 250.000" required></div>
    <div class="row2"><label>Keterangan</label><input type="text" id="expense-note" value="${esc(e.note)}" placeholder="Misalnya: Sembako minggu ini" required></div>
    <div class="row2" style="grid-column:1 / -1"><button type="submit">${isEdit ? 'Simpan perubahan' : 'Simpan pengeluaran'}</button> <a href="#/pengeluaran" class="ghost" onclick="document.getElementById('form-expense').reset(); window.location.hash='#/pengeluaran'; return false;">Batal</a></div>
  </form>`;
}

export function income(state, ui) {
  const rows = state.income.slice().sort((a, b) => b.date.localeCompare(a.date));
  const total = sum(state.income, 'amount');
  const edit = ui.editing && ui.editing.type === 'income' ? incomeForm(state, ui.editing.item) : incomeForm(state);
  return `
<header><div class="brand"><a href="#/">&larr; Kembali</a></div></header>
${nav('/pemasukan')}
<h1>Pemasukan — ${MONTH_LABEL}</h1>
<div class="card">
  <p class="total">Total pemasukan: <b>${formatRupiah(total)}</b> (${state.income.length} entri)</p>
  <table class="tabel"><thead><tr><th>Tanggal</th><th>Sumber</th><th class="num">Jumlah</th><th>Aksi</th></tr></thead><tbody>
    ${rows.map((i) => `<tr><td>${fmtDate(i.date)}</td><td>${esc(i.source)}</td><td class="num">${formatRupiah(i.amount)}</td><td class="acts"><button data-action="edit-income" data-id="${esc(i.id)}">Ubah</button> <button data-action="delete-income" data-id="${esc(i.id)}">Hapus</button></td></tr>`).join('') || '<tr><td colspan="4">Belum ada pemasukan.</td></tr>'}
  </tbody></table>
</div>
<div class="card">${edit}</div>`;
}

function incomeForm(state, item) {
  const i = item || { date: '', source: '', amount: '' };
  const isEdit = !!item;
  return `<form id="form-income" class="form"><h2>${isEdit ? 'Ubah pemasukan' : 'Tambah pemasukan'}</h2>
    <input type="hidden" id="income-id" value="${esc(item ? item.id : '')}">
    <div class="row2"><label>Tanggal</label><input type="date" id="income-date" value="${esc(i.date)}" required></div>
    <div class="row2"><label>Sumber</label><input type="text" id="income-source" value="${esc(i.source)}" placeholder="Misalnya: Gaji pokok" required></div>
    <div class="row2"><label>Jumlah (rupiah)</label><input type="text" id="income-amount" value="${esc(i.amount === '' ? '' : formatRupiah(i.amount))}" placeholder="Contoh: 8.500.000" required></div>
    <div class="row2" style="grid-column:1 / -1"><button type="submit">${isEdit ? 'Simpan perubahan' : 'Simpan pemasukan'}</button> <a href="#/pemasukan" class="ghost" onclick="document.getElementById('form-income').reset(); window.location.hash='#/pemasukan'; return false;">Batal</a></div></form>`;
}

export function savings(state, ui) {
  const edit = ui.editing && ui.editing.type === 'goal' ? goalForm(state, ui.editing.item) : goalForm(state);
  const totalTarget = sum(state.goals, 'target');
  const totalSaved = sum(state.goals, 'saved');
  return `
<header><div class="brand"><a href="#/">&larr; Kembali</a></div></header>
${nav('/tabungan')}
<h1>Tabungan &amp; tujuan</h1>
<div class="card"><p class="total">Target keseluruhan: <b>${formatRupiah(totalTarget)}</b> &bull; Tersimpan: <b>${formatRupiah(totalSaved)}</b> &bull; Sisa: <b>${formatRupiah(totalTarget - totalSaved)}</b></p></div>
${state.goals.map((g) => {
  const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
  return `<div class="card goal"><div class="goal-head"><span>${esc(g.name)}</span><span class="num">${formatRupiah(g.saved)} / ${formatRupiah(g.target)}</span></div>
    <div class="progress"><div class="bar" style="width:${pct}%"></div></div>
    <div class="goal-foot">${pct}% tercapai &bull; <a href="#" onclick="app.editGoal('${esc(g.id)}'); return false;">Ubah</a> <a href="#" onclick="app.deleteGoal('${esc(g.id)}'); return false;">Hapus</a></div></div>`;
}).join('')}
<div class="card">${edit}</div>`;
}

function goalForm(state, item) {
  const g = item || { name: '', target: '', saved: '' };
  const isEdit = !!item;
  return `<form id="form-goal" class="form"><h2>${isEdit ? 'Ubah tujuan' : 'Tambah tujuan tabungan'}</h2>
    <input type="hidden" id="goal-id" value="${esc(item ? item.id : '')}">
    <div class="row2"><label>Nama tujuan</label><input type="text" id="goal-name" value="${esc(g.name)}" placeholder="Misalnya: Dana darurat" required></div>
    <div class="row2"><label>Target (rupiah)</label><input type="text" id="goal-target" value="${esc(g.target === '' ? '' : formatRupiah(g.target))}" required></div>
    <div class="row2"><label>Tersimpan sekarang (rupiah)</label><input type="text" id="goal-saved" value="${esc(g.saved === '' ? '' : formatRupiah(g.saved))}" required></div>
    <div class="row2" style="grid-column:1 / -1"><button type="submit">${isEdit ? 'Simpan perubahan' : 'Simpan tujuan'}</button> <a href="#/tabungan" class="ghost" onclick="document.getElementById('form-goal').reset(); window.location.hash='#/tabungan'; return false;">Batal</a></div></form>`;
}

export function bills(state, ui) {
  const rows = state.bills.slice().sort((a, b) => a.due.localeCompare(b.due));
  const total = sum(state.bills, 'amount');
  const paidTotal = sum(state.bills.filter((b) => b.paid), 'amount');
  const unpaid = state.bills.filter((b) => !b.paid);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdue = unpaid.filter((b) => new Date(b.due + 'T00:00:00') < today);
  return `
<header><div class="brand"><a href="#/">&larr; Kembali</a></div></header>
${nav('/tagihan')}
<h1>Tagihan &amp; pengingat</h1>
<div class="grid grid-stats">
  ${statCard('Total tagihan bulan ini', formatRupiah(total), state.bills.length + ' tagihan')}
  ${statCard('Sudah dibayar', formatRupiah(paidTotal))}
  ${statCard('Belum dibayar', formatRupiah(sum(unpaid, 'amount')), overdue.length > 0 ? overdue.length + ' terlambat' : '')}
</div>
<div class="card">
  <table class="tabel"><thead><tr><th>Tagihan</th><th>Tanggal jatuh tempo</th><th class="num">Jumlah</th><th>Status</th><th>Aksi</th></tr></thead><tbody>
    ${rows.map((b) => {
      const due = new Date(b.due + 'T00:00:00');
      let status = b.paid ? 'Dibayar' : (due < today ? 'Terlambat' : 'Belum dibayar');
      let cls = b.paid ? 'paid' : (due < today ? 'overdue' : 'pending');
      return `<tr><td>${esc(b.name)}</td><td>${fmtDate(b.due)}</td><td class="num">${formatRupiah(b.amount)}</td><td><span class="status ${cls}">${status}</span></td><td class="acts"><button data-action="toggle-bill" data-id="${esc(b.id)}">${b.paid ? 'Tandai belum bayar' : 'Tandai sudah bayar'}</button> <button data-action="delete-bill" data-id="${esc(b.id)}">Hapus</button></td></tr>`;
    }).join('') || '<tr><td colspan="5">Belum ada tagihan.</td></tr>'}
  </tbody></table>
</div>
<div class="card">${billForm(state)}</div>`;
}

function billForm(state) {
  return `<form id="form-bill" class="form"><h2>Tambah tagihan</h2>
    <div class="row2"><label>Nama tagihan</label><input type="text" id="bill-name" placeholder="Misalnya: Listrik PLN" required></div>
    <div class="row2"><label>Jatuh tempo</label><input type="date" id="bill-due" required></div>
    <div class="row2"><label>Jumlah (rupiah)</label><input type="text" id="bill-amount" placeholder="Contoh: 450.000" required></div>
    <div class="row2" style="grid-column:1 / -1"><button type="submit">Simpan tagihan</button> <a href="#/tagihan" class="ghost" onclick="document.getElementById('form-bill').reset(); return false;">Batal</a></div></form>`;
}

export function report(state) {
  const trend = TREND;
  const expenses = state.expenses.filter((e) => inMonth(e.date, state.viewMonth));
  const income = state.income.filter((i) => inMonth(i.date, state.viewMonth));
  const totalIncome = sum(income, 'amount');
  const totalSpending = sum(expenses, 'amount');
  const byCat = byCategory(expenses);
  const segments = CATEGORIES.map((c) => ({ label: c.label, value: byCat[c.key] || 0, color: c.color })).filter((s) => s.value > 0);
  return `
<header><div class="brand"><a href="#/">&larr; Kembali</a></div><div class="month">${monthSelect(state, 'Lihat bulan')}</div></header>
${nav('/laporan')}
<h1>Laporan bulanan — ${MONTH_LABEL}</h1>
<p class="total">Pemasukan <b>${formatRupiah(totalIncome)}</b> &bull; Pengeluaran <b>${formatRupiah(totalSpending)}</b> &bull; Sisa <b>${formatRupiah(totalIncome - totalSpending)}</b></p>
<div class="grid grid-main">
  <div class="card chart" style="grid-column:1 / -1">${drawBar(trend, 700, 200)}</div>
  <div class="card chart"><h2>Split pengeluaran per kategori — ${MONTH_LABEL}</h2>${drawDonut(segments, 320, 200)}</div>
  <div class="card"><h2>Progres tujuan tabungan</h2>
    ${state.goals.map((g) => {
      const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
      return `<div class="goal-row"><span>${esc(g.name)}</span><span class="num">${formatRupiah(g.saved)} / ${formatRupiah(g.target)}</span><div class="progress thin"><div class="bar" style="width:${pct}%"></div></div><span class="pct">${pct}%</span></div>`;
    }).join('')}
  </div>
</div>`;
}
