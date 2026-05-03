// ─── Biaya Layanan Bank Page ──────────────────────────────────────────────────
import { formatRp, formatDate, formatTime, ic } from './helpers.js';

let feeSearch = '';
let feePage = 1;
const FEE_PER_PAGE = 8;

export function renderBiayaLayananPage(appState) {
  const fees = appState.bankFees || {};
  const entries = fees.entries || [];

  // Filter
  let filtered = entries.filter(e => {
    if (!feeSearch) return true;
    return e.description.toLowerCase().includes(feeSearch.toLowerCase()) ||
           e.id.toLowerCase().includes(feeSearch.toLowerCase()) ||
           e.type.toLowerCase().includes(feeSearch.toLowerCase());
  });

  filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / FEE_PER_PAGE));
  if (feePage > totalPages) feePage = totalPages;
  const start = (feePage - 1) * FEE_PER_PAGE;
  const paged = filtered.slice(start, start + FEE_PER_PAGE);

  const typeLabels = {
    'PAYMENT': 'Pembayaran', 'TRANSFER_OUT': 'Transfer', 'LOAN_DISBURSEMENT': 'Pinjaman', 'LOAN_REPAYMENT': 'Cicilan'
  };

  // Chart data — group by date
  const feeByDate = {};
  entries.forEach(e => {
    const date = formatDate(e.timestamp);
    if (!feeByDate[date]) feeByDate[date] = { fee: 0, tax: 0 };
    feeByDate[date].fee += e.fee_amount;
    feeByDate[date].tax += e.tax_amount;
  });
  const chartDates = Object.keys(feeByDate).reverse().slice(-7);
  const maxChart = Math.max(...chartDates.map(d => feeByDate[d].fee + feeByDate[d].tax), 1);

  return `
    <div class="page-heading">Biaya Layanan Bank</div>
    <p class="page-subtitle">Potongan biaya untuk setiap transaksi sebagai fee bank</p>

    <!-- Summary Cards -->
    <div class="ldg-summary-row">
      <div class="ldg-summary-card">
        <div class="ldg-summary-icon blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        </div>
        <div class="ldg-summary-info">
          <div class="ldg-summary-label">Total Terkumpul</div>
          <div class="ldg-summary-value">${formatRp(fees.totalCollected || 0)}</div>
        </div>
      </div>
      <div class="ldg-summary-card">
        <div class="ldg-summary-icon amber">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
        </div>
        <div class="ldg-summary-info">
          <div class="ldg-summary-label">Fee Bank (1%)</div>
          <div class="ldg-summary-value">${formatRp(fees.totalFeeCollected || 0)}</div>
        </div>
      </div>
      <div class="ldg-summary-card">
        <div class="ldg-summary-icon red">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        </div>
        <div class="ldg-summary-info">
          <div class="ldg-summary-label">Pajak Sistem (2%)</div>
          <div class="ldg-summary-value">${formatRp(fees.totalTaxCollected || 0)}</div>
        </div>
      </div>
      <div class="ldg-summary-card">
        <div class="ldg-summary-icon slate">${ic.ledger}</div>
        <div class="ldg-summary-info">
          <div class="ldg-summary-label">Transaksi Dikenai Fee</div>
          <div class="ldg-summary-value">${fees.transactionsCharged || 0}</div>
        </div>
      </div>
    </div>

    <!-- Two Column: Chart + Simulator -->
    <div class="fee-mid-row">
      <!-- Bar Chart -->
      <div class="fee-chart-card">
        <div class="chart-card-title">Grafik Biaya per Hari</div>
        <div class="fee-chart-legend">
          <span><span class="chart-legend-dot" style="background:var(--blue-600);"></span>Fee Bank</span>
          <span><span class="chart-legend-dot" style="background:var(--amber-500);"></span>Pajak</span>
        </div>
        <div class="fee-bar-chart">
          ${chartDates.map(d => {
            const hFee = Math.round((feeByDate[d].fee / maxChart) * 120);
            const hTax = Math.round((feeByDate[d].tax / maxChart) * 120);
            return `
              <div class="fee-bar-group">
                <div class="fee-bar-stack">
                  <div class="fee-bar tax" style="height:${hTax}px;" title="Pajak: ${formatRp(feeByDate[d].tax)}"></div>
                  <div class="fee-bar bank" style="height:${hFee}px;" title="Fee: ${formatRp(feeByDate[d].fee)}"></div>
                </div>
                <div class="bar-label">${d.split('/').slice(0,2).join('/')}</div>
              </div>`;
          }).join('')}
        </div>
      </div>

      <!-- Fee Simulator -->
      <div class="fee-sim-card">
        <div class="chart-card-title">Simulasi Biaya</div>
        <p class="fee-sim-sub">Masukkan nominal untuk melihat rincian biaya</p>
        <div class="fee-sim-input-wrap">
          <label>Nominal Transaksi</label>
          <input type="number" id="fee-sim-input" placeholder="Contoh: 100000" min="0" />
        </div>
        <div class="fee-sim-results" id="fee-sim-results">
          <div class="fee-sim-row">
            <span>Fee Bank (1%)</span>
            <span id="fee-sim-bank" class="fee-sim-val">Rp 0</span>
          </div>
          <div class="fee-sim-row">
            <span>Pajak Sistem (2%)</span>
            <span id="fee-sim-tax" class="fee-sim-val">Rp 0</span>
          </div>
          <div class="fee-sim-divider"></div>
          <div class="fee-sim-row total">
            <span>Total Potongan (3%)</span>
            <span id="fee-sim-total" class="fee-sim-val">Rp 0</span>
          </div>
          <div class="fee-sim-row">
            <span>Diterima Penerima</span>
            <span id="fee-sim-received" class="fee-sim-val" style="color:var(--green-700);font-weight:700;">Rp 0</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Fee Table -->
    <div class="ldg-table-card">
      <div class="ldg-filter-bar" style="margin-bottom:0;padding:0 0 16px 0;border:none;">
        <div class="ldg-search-wrap">
          ${ic.search}
          <input type="text" id="fee-search" placeholder="Cari transaksi..." value="${feeSearch}" />
        </div>
      </div>
      <div class="ldg-table-wrap">
        <table class="ldg-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Waktu</th>
              <th>Tipe</th>
              <th>Deskripsi</th>
              <th>Nominal</th>
              <th>Fee (1%)</th>
              <th>Pajak (2%)</th>
              <th>Total Potongan</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${paged.length === 0 ? `<tr><td colspan="9" class="ldg-empty">Tidak ada data</td></tr>` :
              paged.map(e => `
              <tr class="ldg-row">
                <td class="ldg-cell-id">${e.id}</td>
                <td class="ldg-cell-time">
                  <div>${formatDate(e.timestamp)}</div>
                  <div class="ldg-time-sub">${formatTime(e.timestamp)}</div>
                </td>
                <td><span class="ldg-type-badge debit">${typeLabels[e.type] || e.type}</span></td>
                <td class="ldg-cell-desc">${e.description}</td>
                <td class="ldg-cell-amount">${formatRp(e.transaction_amount)}</td>
                <td class="ldg-cell-fee" style="color:var(--amber-700);">${formatRp(e.fee_amount)}</td>
                <td class="ldg-cell-fee" style="color:var(--red-600);">${formatRp(e.tax_amount)}</td>
                <td class="ldg-cell-balance" style="font-weight:700;">${formatRp(e.total_charge)}</td>
                <td><span class="ldg-badge success">Terkumpul</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="ldg-pagination">
        <div class="ldg-pagination-info">Menampilkan ${start + 1}–${Math.min(start + FEE_PER_PAGE, filtered.length)} dari ${filtered.length} data</div>
        <div class="ldg-pages">
          <button class="tx-page-btn" data-fpage="prev" ${feePage <= 1 ? 'disabled' : ''}>‹</button>
          ${Array.from({length: totalPages}, (_, i) => `
            <button class="tx-page-btn ${feePage === i + 1 ? 'active' : ''}" data-fpage="${i + 1}">${i + 1}</button>
          `).join('')}
          <button class="tx-page-btn" data-fpage="next" ${feePage >= totalPages ? 'disabled' : ''}>›</button>
        </div>
      </div>
    </div>
  `;
}

export function bindBiayaLayananEvents(appState, rerenderPage) {
  // Search
  const searchEl = document.getElementById('fee-search');
  if (searchEl) {
    searchEl.addEventListener('input', (e) => {
      feeSearch = e.target.value;
      feePage = 1;
      rerenderPage();
    });
  }

  // Pagination
  document.querySelectorAll('[data-fpage]').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.getAttribute('data-fpage');
      if (page === 'prev') feePage = Math.max(1, feePage - 1);
      else if (page === 'next') feePage++;
      else feePage = parseInt(page);
      rerenderPage();
    });
  });

  // Fee simulator
  const simInput = document.getElementById('fee-sim-input');
  if (simInput) {
    simInput.addEventListener('input', () => {
      const amount = parseFloat(simInput.value) || 0;
      const fee = amount * 0.01;
      const tax = amount * 0.02;
      const total = fee + tax;
      const received = amount - total;
      document.getElementById('fee-sim-bank').textContent = formatRp(fee);
      document.getElementById('fee-sim-tax').textContent = formatRp(tax);
      document.getElementById('fee-sim-total').textContent = formatRp(total);
      document.getElementById('fee-sim-received').textContent = formatRp(Math.max(0, received));
    });
  }
}
