// ─── Pembayaran (Payment) Page ────────────────────────────────────────────────
import { formatRp, formatDate, formatTime, ic } from '../utils/helpers.js';

let paySearch = '';
let payCategory = 'ALL';
let payPage = 1;
const PAY_PER_PAGE = 6;

/* ─── Dummy payment categories & billers ─────────────────────────────────── */
const payCategories = [
  { id: 'listrik', label: 'Listrik', icon: '⚡', color: '#f59e0b' },
  { id: 'air', label: 'Air / PDAM', icon: '💧', color: '#0ea5e9' },
  { id: 'internet', label: 'Internet', icon: '🌐', color: '#8b5cf6' },
  { id: 'telepon', label: 'Telepon', icon: '📱', color: '#10b981' },
  { id: 'bpjs', label: 'BPJS', icon: '🏥', color: '#ef4444' },
  { id: 'pajak', label: 'Pajak', icon: '🏛️', color: '#6366f1' },
  { id: 'tv', label: 'TV Kabel', icon: '📺', color: '#ec4899' },
  { id: 'asuransi', label: 'Asuransi', icon: '🛡️', color: '#14b8a6' },
];

function getPaymentData(appState) {
  if (appState.payments) return appState.payments;

  // Generate simulation data from ledger payments
  const payments = [
    { id: 'PAY-001', category: 'listrik', biller: 'PLN Prepaid', customer_id: '5482 7193 0012', amount: 150000, status: 'SUCCESS', timestamp: '2026-05-08T09:00:00+07:00', period: 'Mei 2026' },
    { id: 'PAY-002', category: 'air', biller: 'PDAM Kota Bandung', customer_id: '0012-3847-291', amount: 85000, status: 'SUCCESS', timestamp: '2026-05-07T14:30:00+07:00', period: 'Mei 2026' },
    { id: 'PAY-003', category: 'internet', biller: 'IndiHome Fiber', customer_id: '1221-0088-4455', amount: 350000, status: 'SUCCESS', timestamp: '2026-05-05T10:15:00+07:00', period: 'Mei 2026' },
    { id: 'PAY-004', category: 'telepon', biller: 'Telkomsel Pascabayar', customer_id: '0812-9876-5432', amount: 120000, status: 'SUCCESS', timestamp: '2026-05-04T16:45:00+07:00', period: 'Mei 2026' },
    { id: 'PAY-005', category: 'bpjs', biller: 'BPJS Kesehatan', customer_id: '0001-2345-6789', amount: 150000, status: 'SUCCESS', timestamp: '2026-05-03T08:20:00+07:00', period: 'Mei 2026' },
    { id: 'PAY-006', category: 'pajak', biller: 'PBB Kota Bandung', customer_id: 'NOP-321654987', amount: 500000, status: 'PENDING', timestamp: '2026-05-02T11:00:00+07:00', period: '2026' },
    { id: 'PAY-007', category: 'tv', biller: 'Transvision', customer_id: 'TV-00998877', amount: 175000, status: 'SUCCESS', timestamp: '2026-04-28T09:10:00+07:00', period: 'Apr 2026' },
    { id: 'PAY-008', category: 'asuransi', biller: 'Prudential Life', customer_id: 'POL-2026-0011', amount: 500000, status: 'SUCCESS', timestamp: '2026-04-25T13:40:00+07:00', period: 'Apr 2026' },
    { id: 'PAY-009', category: 'listrik', biller: 'PLN Prepaid', customer_id: '5482 7193 0012', amount: 175000, status: 'SUCCESS', timestamp: '2026-04-10T09:00:00+07:00', period: 'Apr 2026' },
    { id: 'PAY-010', category: 'internet', biller: 'IndiHome Fiber', customer_id: '1221-0088-4455', amount: 350000, status: 'FAILED', timestamp: '2026-04-05T10:15:00+07:00', period: 'Apr 2026' },
    { id: 'PAY-011', category: 'bpjs', biller: 'BPJS Kesehatan', customer_id: '0001-2345-6789', amount: 150000, status: 'SUCCESS', timestamp: '2026-04-03T08:20:00+07:00', period: 'Apr 2026' },
    { id: 'PAY-012', category: 'air', biller: 'PDAM Kota Bandung', customer_id: '0012-3847-291', amount: 78000, status: 'SUCCESS', timestamp: '2026-04-02T14:30:00+07:00', period: 'Apr 2026' },
  ];
  appState.payments = payments;
  return payments;
}

/* ─── Render ───────────────────────────────────────────────────────────────── */

export function renderPembayaranPage(appState) {
  const payments = getPaymentData(appState);

  // Filter
  let filtered = payments.filter(p => {
    const matchCat = payCategory === 'ALL' || p.category === payCategory;
    const matchSearch = !paySearch || 
      p.biller.toLowerCase().includes(paySearch.toLowerCase()) || 
      p.id.toLowerCase().includes(paySearch.toLowerCase()) ||
      p.customer_id.toLowerCase().includes(paySearch.toLowerCase());
    return matchCat && matchSearch;
  });

  filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Summary
  const totalPaid = payments.filter(p => p.status === 'SUCCESS').reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0);
  const totalCount = payments.filter(p => p.status === 'SUCCESS').length;
  const totalFailed = payments.filter(p => p.status === 'FAILED').length;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAY_PER_PAGE));
  if (payPage > totalPages) payPage = totalPages;
  const start = (payPage - 1) * PAY_PER_PAGE;
  const paged = filtered.slice(start, start + PAY_PER_PAGE);

  const catLabelMap = {};
  payCategories.forEach(c => { catLabelMap[c.id] = c; });

  const statusBadge = (s) => {
    if (s === 'SUCCESS') return '<span class="ldg-badge success">Sukses</span>';
    if (s === 'FAILED') return '<span class="ldg-badge failed">Gagal</span>';
    return '<span class="ldg-badge pending">Menunggu</span>';
  };

  return `
    <div class="page-heading">Pembayaran</div>
    <p class="page-subtitle">Bayar tagihan rutin Anda dengan cepat dan aman melalui SmartBank</p>

    <!-- Summary Cards -->
    <div class="ldg-summary-row">
      <div class="ldg-summary-card">
        <div class="ldg-summary-icon blue">${ic.payment}</div>
        <div class="ldg-summary-info">
          <div class="ldg-summary-label">Total Dibayar</div>
          <div class="ldg-summary-value">${formatRp(totalPaid)}</div>
        </div>
      </div>
      <div class="ldg-summary-card">
        <div class="ldg-summary-icon amber">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        <div class="ldg-summary-info">
          <div class="ldg-summary-label">Menunggu Bayar</div>
          <div class="ldg-summary-value">${formatRp(totalPending)}</div>
        </div>
      </div>
      <div class="ldg-summary-card">
        <div class="ldg-summary-icon slate">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div class="ldg-summary-info">
          <div class="ldg-summary-label">Transaksi Sukses</div>
          <div class="ldg-summary-value">${totalCount}</div>
        </div>
      </div>
      <div class="ldg-summary-card">
        <div class="ldg-summary-icon red">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
        </div>
        <div class="ldg-summary-info">
          <div class="ldg-summary-label">Gagal</div>
          <div class="ldg-summary-value">${totalFailed}</div>
        </div>
      </div>
    </div>

    <!-- Category Grid -->
    <div class="pay-categories-card">
      <div class="chart-card-title">Pilih Kategori Pembayaran</div>
      <div class="pay-cat-grid">
        ${payCategories.map(c => `
          <button class="pay-cat-btn ${payCategory === c.id ? 'active' : ''}" data-cat="${c.id}">
            <div class="pay-cat-icon" style="background:${c.color}15;color:${c.color};">
              <span style="font-size:22px;line-height:1;">${c.icon}</span>
            </div>
            <span class="pay-cat-label">${c.label}</span>
          </button>
        `).join('')}
      </div>
    </div>

    <!-- Payment History Table -->
    <div class="ldg-table-card">
      <div class="ldg-filter-bar" style="margin-bottom:0;padding:0 0 16px 0;border:none;">
        <div class="ldg-search-wrap">
          ${ic.search}
          <input type="text" id="pay-search" placeholder="Cari pembayaran..." value="${paySearch}" />
        </div>
        <div class="ldg-filter-chips">
          <button class="ldg-chip ${payCategory === 'ALL' ? 'active' : ''}" data-paycat="ALL">Semua</button>
          ${payCategories.map(c => `<button class="ldg-chip ${payCategory === c.id ? 'active' : ''}" data-paycat="${c.id}">${c.label}</button>`).join('')}
        </div>
      </div>
      <div class="ldg-table-wrap">
        <table class="ldg-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Waktu</th>
              <th>Kategori</th>
              <th>Penyedia Layanan</th>
              <th>No. Pelanggan</th>
              <th>Periode</th>
              <th>Jumlah</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${paged.length === 0 ? `<tr><td colspan="8" class="ldg-empty">Tidak ada data pembayaran</td></tr>` :
              paged.map(p => {
                const cat = catLabelMap[p.category] || { label: p.category, icon: '📄', color: '#64748b' };
                return `
                <tr class="ldg-row">
                  <td class="ldg-cell-id">${p.id}</td>
                  <td class="ldg-cell-time">
                    <div>${formatDate(p.timestamp)}</div>
                    <div class="ldg-time-sub">${formatTime(p.timestamp)}</div>
                  </td>
                  <td>
                    <div style="display:flex;align-items:center;gap:8px;">
                      <span style="font-size:16px;">${cat.icon}</span>
                      <span class="ldg-type-badge debit" style="background:${cat.color}12;color:${cat.color};border:1px solid ${cat.color}30;">${cat.label}</span>
                    </div>
                  </td>
                  <td class="ldg-cell-desc">${p.biller}</td>
                  <td class="ldg-cell-app" style="font-family:monospace;font-size:12px;">${p.customer_id}</td>
                  <td style="font-size:13px;color:var(--slate-500);">${p.period}</td>
                  <td class="ldg-cell-amount debit" style="font-weight:700;">-${formatRp(p.amount)}</td>
                  <td>${statusBadge(p.status)}</td>
                </tr>`;
              }).join('')}
          </tbody>
        </table>
      </div>

      <div class="ldg-pagination">
        <div class="ldg-pagination-info">Menampilkan ${start + 1}–${Math.min(start + PAY_PER_PAGE, filtered.length)} dari ${filtered.length} data</div>
        <div class="ldg-pages">
          <button class="tx-page-btn" data-paypage="prev" ${payPage <= 1 ? 'disabled' : ''}>‹</button>
          ${Array.from({length: totalPages}, (_, i) => `
            <button class="tx-page-btn ${payPage === i + 1 ? 'active' : ''}" data-paypage="${i + 1}">${i + 1}</button>
          `).join('')}
          <button class="tx-page-btn" data-paypage="next" ${payPage >= totalPages ? 'disabled' : ''}>›</button>
        </div>
      </div>
    </div>
  `;
}

/* ─── Bind Events ──────────────────────────────────────────────────────────── */

export function bindPembayaranEvents(appState, rerenderPage) {
  // Search
  const searchEl = document.getElementById('pay-search');
  if (searchEl) {
    searchEl.addEventListener('input', (e) => {
      paySearch = e.target.value;
      payPage = 1;
      rerenderPage();
    });
  }

  // Category buttons (grid)
  document.querySelectorAll('.pay-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-cat');
      payCategory = payCategory === cat ? 'ALL' : cat;
      payPage = 1;
      rerenderPage();
    });
  });

  // Filter chips
  document.querySelectorAll('[data-paycat]').forEach(chip => {
    chip.addEventListener('click', () => {
      payCategory = chip.getAttribute('data-paycat');
      payPage = 1;
      rerenderPage();
    });
  });

  // Pagination
  document.querySelectorAll('[data-paypage]').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.getAttribute('data-paypage');
      if (page === 'prev') payPage = Math.max(1, payPage - 1);
      else if (page === 'next') payPage++;
      else payPage = parseInt(page);
      rerenderPage();
    });
  });
}
