// ─── Ledger Transaksi Page ────────────────────────────────────────────────────
import { formatRp, formatDate, formatTime, ic } from './helpers.js';

let ledgerSearch = '';
let ledgerTypeFilter = 'ALL';
let ledgerPage = 1;
const LEDGER_PER_PAGE = 8;

export function renderLedgerPage(appState) {
  const ledger = appState.ledger || [];

  // Filter
  let filtered = ledger.filter(e => {
    const matchType = ledgerTypeFilter === 'ALL' || e.type === ledgerTypeFilter;
    const matchSearch = !ledgerSearch || e.description.toLowerCase().includes(ledgerSearch.toLowerCase()) || e.id.toLowerCase().includes(ledgerSearch.toLowerCase()) || e.app.toLowerCase().includes(ledgerSearch.toLowerCase());
    return matchType && matchSearch;
  });

  // Sort by timestamp desc
  filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Summary calculations
  const totalTx = filtered.length;
  const totalVolume = filtered.reduce((s, e) => s + e.amount, 0);
  const totalFee = filtered.reduce((s, e) => s + e.fee_bank, 0);
  const totalTax = filtered.reduce((s, e) => s + e.fee_pajak, 0);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / LEDGER_PER_PAGE));
  if (ledgerPage > totalPages) ledgerPage = totalPages;
  const start = (ledgerPage - 1) * LEDGER_PER_PAGE;
  const paged = filtered.slice(start, start + LEDGER_PER_PAGE);

  // Type labels
  const typeLabels = {
    'PAYMENT': 'Pembayaran', 'TRANSFER_IN': 'Transfer Masuk', 'TRANSFER_OUT': 'Transfer Keluar',
    'LOAN_DISBURSEMENT': 'Pinjaman', 'LOAN_REPAYMENT': 'Cicilan', 'STIMULUS': 'Stimulus'
  };

  const typeClass = (t) => {
    if (t === 'TRANSFER_IN' || t === 'STIMULUS' || t === 'LOAN_DISBURSEMENT') return 'credit';
    return 'debit';
  };

  const statusBadge = (s) => {
    if (s === 'SUCCESS') return '<span class="ldg-badge success">Sukses</span>';
    if (s === 'FAILED') return '<span class="ldg-badge failed">Gagal</span>';
    return '<span class="ldg-badge pending">Pending</span>';
  };

  // Unique types for filter
  const types = [...new Set(ledger.map(e => e.type))];

  return `
    <div class="page-heading">Ledger Transaksi</div>
    <p class="page-subtitle">Catatan seluruh transaksi sebagai <strong>Single Source of Truth</strong></p>

    <!-- Summary Cards -->
    <div class="ldg-summary-row">
      <div class="ldg-summary-card">
        <div class="ldg-summary-icon blue">${ic.ledger}</div>
        <div class="ldg-summary-info">
          <div class="ldg-summary-label">Total Transaksi</div>
          <div class="ldg-summary-value">${totalTx}</div>
        </div>
      </div>
      <div class="ldg-summary-card">
        <div class="ldg-summary-icon slate">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        </div>
        <div class="ldg-summary-info">
          <div class="ldg-summary-label">Total Volume</div>
          <div class="ldg-summary-value">${formatRp(totalVolume)}</div>
        </div>
      </div>
      <div class="ldg-summary-card">
        <div class="ldg-summary-icon amber">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
        </div>
        <div class="ldg-summary-info">
          <div class="ldg-summary-label">Fee Bank (1%)</div>
          <div class="ldg-summary-value">${formatRp(totalFee)}</div>
        </div>
      </div>
      <div class="ldg-summary-card">
        <div class="ldg-summary-icon red">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        </div>
        <div class="ldg-summary-info">
          <div class="ldg-summary-label">Pajak Sistem (2%)</div>
          <div class="ldg-summary-value">${formatRp(totalTax)}</div>
        </div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="ldg-filter-bar">
      <div class="ldg-search-wrap">
        ${ic.search}
        <input type="text" id="ldg-search" placeholder="Cari ID, deskripsi, aplikasi..." value="${ledgerSearch}" />
      </div>
      <div class="ldg-filter-chips">
        <button class="ldg-chip ${ledgerTypeFilter === 'ALL' ? 'active' : ''}" data-type="ALL">Semua</button>
        ${types.map(t => `<button class="ldg-chip ${ledgerTypeFilter === t ? 'active' : ''}" data-type="${t}">${typeLabels[t] || t}</button>`).join('')}
      </div>
      <button class="btn-secondary ldg-export-btn" id="ldg-export">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        Export CSV
      </button>
    </div>

    <!-- Ledger Table -->
    <div class="ldg-table-card">
      <div class="ldg-table-wrap">
        <table class="ldg-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Waktu</th>
              <th>Tipe</th>
              <th>Deskripsi</th>
              <th>Aplikasi</th>
              <th>Jumlah</th>
              <th>Fee</th>
              <th>Pajak</th>
              <th>Saldo Setelah</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${paged.length === 0 ? `<tr><td colspan="11" class="ldg-empty">Tidak ada data yang cocok</td></tr>` :
      paged.map(e => `
              <tr class="ldg-row" data-id="${e.id}">
                <td class="ldg-cell-id">${e.id}</td>
                <td class="ldg-cell-time">
                  <div>${formatDate(e.timestamp)}</div>
                  <div class="ldg-time-sub">${formatTime(e.timestamp)}</div>
                </td>
                <td><span class="ldg-type-badge ${typeClass(e.type)}">${typeLabels[e.type] || e.type}</span></td>
                <td class="ldg-cell-desc">${e.description}</td>
                <td class="ldg-cell-app">${e.app}</td>
                <td class="ldg-cell-amount ${typeClass(e.type)}">${typeClass(e.type) === 'credit' ? '+' : '-'}${formatRp(e.amount)}</td>
                <td class="ldg-cell-fee">${e.fee_bank > 0 ? formatRp(e.fee_bank) : '-'}</td>
                <td class="ldg-cell-fee">${e.fee_pajak > 0 ? formatRp(e.fee_pajak) : '-'}</td>
                <td class="ldg-cell-balance">${formatRp(e.balance_after)}</td>
                <td>${statusBadge(e.status)}</td>
                <td><button class="ldg-detail-btn" data-id="${e.id}" title="Detail">···</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="ldg-pagination">
        <div class="ldg-pagination-info">Menampilkan ${start + 1}–${Math.min(start + LEDGER_PER_PAGE, filtered.length)} dari ${filtered.length} data</div>
        <div class="ldg-pages">
          <button class="tx-page-btn" data-page="prev" ${ledgerPage <= 1 ? 'disabled' : ''}>‹</button>
          ${Array.from({ length: totalPages }, (_, i) => `
            <button class="tx-page-btn ${ledgerPage === i + 1 ? 'active' : ''}" data-page="${i + 1}">${i + 1}</button>
          `).join('')}
          <button class="tx-page-btn" data-page="next" ${ledgerPage >= totalPages ? 'disabled' : ''}>›</button>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div id="modal-ledger-detail" class="modal-overlay">
      <div class="modal-content" style="max-width:520px;">
        <div id="ldg-detail-content"></div>
      </div>
    </div>
  `;
}

export function bindLedgerEvents(appState, rerenderPage, openModal, closeModal) {
  // Search
  const searchEl = document.getElementById('ldg-search');
  if (searchEl) {
    searchEl.addEventListener('input', (e) => {
      ledgerSearch = e.target.value;
      ledgerPage = 1;
      rerenderPage();
    });
  }

  // Filter chips
  document.querySelectorAll('.ldg-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      ledgerTypeFilter = chip.getAttribute('data-type');
      ledgerPage = 1;
      rerenderPage();
    });
  });

  // Pagination
  document.querySelectorAll('.ldg-pages .tx-page-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.getAttribute('data-page');
      if (page === 'prev') ledgerPage = Math.max(1, ledgerPage - 1);
      else if (page === 'next') ledgerPage++;
      else ledgerPage = parseInt(page);
      rerenderPage();
    });
  });

  // Export CSV
  const exportBtn = document.getElementById('ldg-export');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => exportLedgerCSV(appState));
  }

  // Detail buttons
  document.querySelectorAll('.ldg-detail-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      showLedgerDetail(appState, id);
      openModal('modal-ledger-detail');
    });
  });

  // Close modal
  const modalOverlay = document.getElementById('modal-ledger-detail');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal('modal-ledger-detail');
    });
  }
}

function showLedgerDetail(appState, id) {
  const entry = appState.ledger.find(e => e.id === id);
  if (!entry) return;

  const typeLabels = {
    'PAYMENT': 'Pembayaran', 'TRANSFER_IN': 'Transfer Masuk', 'TRANSFER_OUT': 'Transfer Keluar',
    'LOAN_DISBURSEMENT': 'Pencairan Pinjaman', 'LOAN_REPAYMENT': 'Cicilan Pinjaman', 'STIMULUS': 'Stimulus'
  };

  const container = document.getElementById('ldg-detail-content');
  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
      <div>
        <h2 style="font-size:18px;font-weight:700;color:var(--slate-900);margin:0 0 2px;">Detail Transaksi</h2>
        <p style="font-size:13px;color:var(--slate-400);margin:0;">${entry.id}</p>
      </div>
      <button class="ldg-modal-close" onclick="document.getElementById('modal-ledger-detail').classList.remove('active')" style="background:none;border:none;cursor:pointer;color:var(--slate-400);padding:4px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>

    <div class="ldg-detail-grid">
      <div class="ldg-detail-row">
        <span class="ldg-detail-label">Tipe</span>
        <span class="ldg-detail-value">${typeLabels[entry.type] || entry.type}</span>
      </div>
      <div class="ldg-detail-row">
        <span class="ldg-detail-label">Deskripsi</span>
        <span class="ldg-detail-value">${entry.description}</span>
      </div>
      <div class="ldg-detail-row">
        <span class="ldg-detail-label">Waktu</span>
        <span class="ldg-detail-value">${formatDate(entry.timestamp)} • ${formatTime(entry.timestamp)}</span>
      </div>
      <div class="ldg-detail-row">
        <span class="ldg-detail-label">Aplikasi</span>
        <span class="ldg-detail-value">${entry.app}</span>
      </div>
      <div class="ldg-detail-divider"></div>
      <div class="ldg-detail-row">
        <span class="ldg-detail-label">Dari</span>
        <span class="ldg-detail-value ldg-mono">${entry.from_user}</span>
      </div>
      <div class="ldg-detail-row">
        <span class="ldg-detail-label">Ke</span>
        <span class="ldg-detail-value ldg-mono">${entry.to_user}</span>
      </div>
      <div class="ldg-detail-divider"></div>
      <div class="ldg-detail-row">
        <span class="ldg-detail-label">Nominal Transaksi</span>
        <span class="ldg-detail-value" style="font-weight:700;color:var(--slate-900);">${formatRp(entry.amount)}</span>
      </div>
      <div class="ldg-detail-row">
        <span class="ldg-detail-label">Fee Bank (1%)</span>
        <span class="ldg-detail-value" style="color:var(--amber-700);">${entry.fee_bank > 0 ? formatRp(entry.fee_bank) : '-'}</span>
      </div>
      <div class="ldg-detail-row">
        <span class="ldg-detail-label">Pajak Sistem (2%)</span>
        <span class="ldg-detail-value" style="color:var(--red-600);">${entry.fee_pajak > 0 ? formatRp(entry.fee_pajak) : '-'}</span>
      </div>
      <div class="ldg-detail-row" style="background:var(--slate-50);margin:0 -20px;padding:10px 20px;border-radius:8px;">
        <span class="ldg-detail-label" style="font-weight:700;color:var(--slate-800);">Total Debit</span>
        <span class="ldg-detail-value" style="font-weight:700;color:var(--blue-700);font-size:16px;">${formatRp(entry.total_deduction)}</span>
      </div>
      <div class="ldg-detail-divider"></div>
      <div class="ldg-detail-row">
        <span class="ldg-detail-label">Saldo Sebelum</span>
        <span class="ldg-detail-value">${formatRp(entry.balance_before)}</span>
      </div>
      <div class="ldg-detail-row">
        <span class="ldg-detail-label">Saldo Setelah</span>
        <span class="ldg-detail-value" style="font-weight:700;">${formatRp(entry.balance_after)}</span>
      </div>
      <div class="ldg-detail-row">
        <span class="ldg-detail-label">Status</span>
        <span class="ldg-badge success" style="display:inline-block;">Sukses</span>
      </div>
    </div>
  `;
}

function exportLedgerCSV(appState) {
  const ledger = appState.ledger || [];
  const headers = ['ID', 'Timestamp', 'Tipe', 'Deskripsi', 'Aplikasi', 'Dari', 'Ke', 'Jumlah', 'Fee Bank', 'Pajak', 'Total Debit', 'Saldo Sebelum', 'Saldo Setelah', 'Status'];
  const rows = ledger.map(e => [
    e.id, e.timestamp, e.type, `"${e.description}"`, e.app, e.from_user, e.to_user,
    e.amount, e.fee_bank, e.fee_pajak, e.total_deduction, e.balance_before, e.balance_after, e.status
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `ledger_smartbank_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}
