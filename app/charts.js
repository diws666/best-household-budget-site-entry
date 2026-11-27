// Grafik SVG buatan sendiri: donut (split kategori) dan batang (trend bulanan).
// Tidak ada perpustakaan eksternal.

import { formatRupiah } from './data.js';

export function drawDonut(segments, width = 340, height = 300) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (total <= 0) {
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-size="14" fill="#6b7280">Belum ada data</text></svg>`;
  }
  const cx = width / 2;
  const cy = height / 2 - 10;
  const r = Math.min(width, height) * 0.34;
  const ir = r * 0.52;
  let start = -0.5 * Math.PI;
  const parts = [];
  const legend = [];
  for (const seg of segments) {
    const sweep = (seg.value / total) * 2 * Math.PI;
    const end = start + sweep;
    const big = sweep > Math.PI ? 1 : 0;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const lx = cx + (r + 22) * Math.cos((start + end) / 2);
    const ly = cy + (r + 22) * Math.sin((start + end) / 2);
    parts.push(
      `<path d="M ${x1} ${y1} A ${r} ${r} 0 ${big} 1 ${x2} ${y2} L ${cx + ir * Math.cos(end)} ${cy + ir * Math.sin(end)} A ${ir} ${ir} 0 ${big} 0 ${cx + ir * Math.cos(start)} ${cy + ir * Math.sin(start)} Z" fill="${seg.color}" />`
    );
    legend.push(`<li style="margin:2px 0"><span style="display:inline-block;width:10px;height:10px;background:${seg.color};border-radius:2px;margin-right:6px"></span>${escapeHtml(seg.label)} <b>${formatRupiah(seg.value)}</b> (${Math.round((seg.value / total) * 100)}%)</li>`);
    start = end;
  }
  const share = Math.round(((segments[0]?.value ?? 0) / total) * 100);
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${parts.join('')}
    <circle cx="${cx}" cy="${cy}" r="${ir}" fill="#ffffff" />
    <text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="15" font-weight="700" fill="#111827">${formatRupiah(total)}</text>
    <text x="${cx}" y="${cy + 10}" text-anchor="middle" font-size="12" fill="#6b7280">total kategori</text>
  </svg>
  <ul class="donut-legend">${legend.join('')}</ul>`;
}

export function drawBar(months, width = 640, height = 300) {
  if (!months.length) {
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-size="14" fill="#6b7280">Belum ada data</text></svg>`;
  }
  const max = Math.max(...months.flatMap((m) => [m.income, m.spending]));
  const top = 30;
  const bottom = height - 56;
  const left = 56;
  const right = width - 24;
  const step = (right - left) / months.length;
  const bw = step * 0.42;
  const yMax = Math.ceil(max / 500000) * 500000;
  const lines = [];
  for (let t = 0; t <= yMax; t += yMax / 4) {
    const y = bottom - (t / yMax) * (bottom - top);
    lines.push(`<line x1="${left}" y1="${y}" x2="${right}" y2="${y}" stroke="#e5e7eb" stroke-width="1" />`);
    lines.push(`<text x="${left - 6}" y="${y + 4}" text-anchor="end" font-size="11" fill="#6b7280">${formatRupiahAxis(t)}</text>`);
  }
  const bars = [];
  months.forEach((m, i) => {
    const x = left + step * i + step * 0.14;
    const yi = bottom - (m.income / yMax) * (bottom - top);
    const ys = bottom - (m.spending / yMax) * (bottom - top);
    bars.push(`<rect x="${x}" y="${yi}" width="${bw}" height="${bottom - yi}" fill="#15803d" />`);
    bars.push(`<rect x="${x + bw + step * 0.06}" y="${ys}" width="${bw}" height="${bottom - ys}" fill="#d97706" />`);
    const lx = left + step * i + step / 2;
    lines.push(`<text x="${lx}" y="${bottom + 14}" text-anchor="middle" font-size="11" fill="#374151">${m.label}</text>`);
  });
  lines.push(`<text x="${left}" y="${top - 8}" text-anchor="start" font-size="12" font-weight="700" fill="#111827">Pemasukan vs pengeluaran per bulan</text>`);
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${lines.join('')}${bars.join('')}
    <rect x="${left - 28}" y="${bottom + 26}" width="${bw}" height="${bw}" fill="#15803d" />
    <text x="${left - 28 + bw + 6}" y="${bottom + 40}" font-size="11" fill="#111827">Pemasukan</text>
    <rect x="${left + 100}" y="${bottom + 26}" width="${bw}" height="${bw}" fill="#d97706" />
    <text x="${left + 100 + bw + 6}" y="${bottom + 40}" font-size="11" fill="#111827">Pengeluaran</text>
  </svg>`;
}

function formatRupiahAxis(n) {
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
