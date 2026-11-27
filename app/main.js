// Aplikasi Rumah Tangga: router, simpanan lokal, dan semua interaksi.
// Nol permintaan jaringan: setiap skrip, gaya, dan gambar ada di app/.

import { ensureState, saveState, newId } from './store.js';
import { CATEGORIES, categoryOf, formatRupiah, parseRupiah, fmtDate, MONTH, MONTH_LABEL, TREND, inMonth, SEED } from './data.js';
import * as views from './views.js';

const app = document.getElementById('app');
const navLinks = document.querySelectorAll('nav a');

let state = ensureState();
let ui = { category: '', query: '', sort: 'date' };
let editing = null; // { type: 'expense'|'income'|'goal', id, item }

window.app = {
  editGoal(id) { editing = { type: 'goal', id, item: state.goals.find((g) => g.id === id) }; render(); },
  deleteGoal(id) {
    if (!confirm('Hapus tujuan tabungan ini?')) return;
    state.goals = state.goals.filter((g) => g.id !== id);
    saveState(state);
    render();
  },
};

function setActive(path) {
  navLinks.forEach((a) => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + path);
  });
}

function save() {
  saveState(state);
  render();
}

function render() {
  const hash = location.hash.replace(/^#\//, '/') || '/';
  const path = hash.replace(/^\//, '');
  setActive(path);
  document.title = (path === '' ? 'Beranda' : path) + ' — Rumah Tangga';
  window.__shotReady = false;
  let html;
  switch (path) {
    case '':
      html = views.home(state);
      break;
    case 'pengeluaran':
      html = views.expenses(state, { ...ui, editing });
      break;
    case 'pemasukan':
      html = views.income(state, { editing });
      break;
    case 'tabungan':
      html = views.savings(state, { editing });
      break;
    case 'tagihan':
      html = views.bills(state);
      break;
    case 'laporan':
      html = views.report(state);
      break;
    default:
      html = `<div class="card"><h1>Halaman tidak ditemukan</h1><p><a href="#/">Kembali ke beranda</a></p></div>`;
  }
  app.innerHTML = html;
  window.scrollTo(0, 0);
  bind();
  window.__shotReady = true;
}

function bind() {
  app.addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-action]');
    if (!btn) return;
    ev.preventDefault();
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    switch (action) {
      case 'edit-expense': {
        const item = state.expenses.find((e) => e.id === id);
        editing = { type: 'expense', id, item };
        render();
        break;
      }
      case 'delete-expense': {
        if (!confirm('Hapus transaksi ini?')) return;
        state.expenses = state.expenses.filter((e) => e.id !== id);
        editing = null;
        save();
        break;
      }
      case 'edit-income': {
        const item = state.income.find((i) => i.id === id);
        editing = { type: 'income', id, item };
        render();
        break;
      }
      case 'delete-income': {
        if (!confirm('Hapus pemasukan ini?')) return;
        state.income = state.income.filter((i) => i.id !== id);
        editing = null;
        save();
        break;
      }
      case 'toggle-bill': {
        const bill = state.bills.find((b) => b.id === id);
        bill.paid = !bill.paid;
        save();
        break;
      }
      case 'delete-bill': {
        if (!confirm('Hapus tagihan ini?')) return;
        state.bills = state.bills.filter((b) => b.id !== id);
        save();
        break;
      }
    }
  });

  app.addEventListener('submit', (ev) => {
    const form = ev.target.closest('form');
    if (!form) return;
    ev.preventDefault();
    const id = form.id;
    const fd = new FormData(form);
    const get = (name) => fd.get(name);
    switch (id) {
      case 'form-filter': {
        ui.category = form.querySelector('[data-cat].active')?.dataset.cat || '';
        ui.query = get('f-q') || '';
        ui.sort = get('f-sort') || 'date';
        render();
        break;
      }
      case 'form-expense': {
        const editId = get('expense-id') || '';
        const entry = {
          id: editId || newId(),
          date: get('expense-date'),
          category: get('expense-category'),
          amount: parseRupiah(get('expense-amount')),
          note: get('expense-note'),
        };
        if (editId) {
          state.expenses = state.expenses.map((e) => (e.id === editId ? entry : e));
        } else {
          state.expenses.push(entry);
        }
        editing = null;
        save();
        break;
      }
      case 'form-income': {
        const editId = get('income-id') || '';
        const entry = { id: editId || newId(), date: get('income-date'), source: get('income-source'), amount: parseRupiah(get('income-amount')) };
        if (editId) state.income = state.income.map((i) => (i.id === editId ? entry : i));
        else state.income.push(entry);
        editing = null;
        save();
        break;
      }
      case 'form-goal': {
        const editId = get('goal-id') || '';
        const entry = { id: editId || newId(), name: get('goal-name'), target: parseRupiah(get('goal-target')), saved: parseRupiah(get('goal-saved')) };
        if (editId) state.goals = state.goals.map((g) => (g.id === editId ? entry : g));
        else state.goals.push(entry);
        editing = null;
        save();
        break;
      }
      case 'form-bill': {
        state.bills.push({ id: newId(), name: get('bill-name'), due: get('bill-due'), amount: parseRupiah(get('bill-amount')), paid: false });
        save();
        break;
      }
    }
  });

  app.addEventListener('change', (ev) => {
    if (ev.target.id === 'month') {
      state.viewMonth = ev.target.value;
      save();
    }
  });

  app.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-cat]');
    if (!chip) return;
    ev.preventDefault();
    ui.category = chip.dataset.cat;
    app.querySelectorAll('[data-cat]').forEach((c) => c.classList.toggle('active', c === chip));
    render();
  });
}

window.addEventListener('hashchange', render);
render();
