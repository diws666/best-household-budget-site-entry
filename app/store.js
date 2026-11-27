// Simpanan di perangkat melalui localStorage. Tidak ada cookie, tidak ada service worker,
// tidak ada permintaan jaringan sama sekali.

import { SEED } from './data.js';

const STORAGE_KEY = 'rumah-tangga-v1';

export function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw);
    if (state && state.version === 1 && Array.isArray(state.expenses)) return state;
  } catch {}
  return null;
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function seedState() {
  return {
    version: 1,
    viewMonth: '2026-11',
    income: SEED.income.map((x) => ({ ...x })),
    expenses: SEED.expenses.map((x) => ({ ...x })),
    goals: SEED.goals.map((x) => ({ ...x })),
    bills: SEED.bills.map((x) => ({ ...x })),
  };
}

export function ensureState() {
  let state = loadState();
  if (!state) {
    state = seedState();
    saveState(state);
  }
  if (!state.viewMonth) state.viewMonth = '2026-11';
  return state;
}
