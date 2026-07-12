// ─── Pinjaman (Loan) Page ─────────────────────────────────────────────────────
import { formatRp, formatDate, formatTime, ic } from '../utils/helpers.js';

let loanTab = 'active'; // 'active' | 'history' | 'simulate'

function getLoanData(appState) {
  if (appState.loans) return appState.loans;

  const loans = {
    activeLoan: {
      id: '-',
      amount: 0,
      remaining: 0,
      paid: 0,
      interestRate: 0,
      tenor: 0,
      monthlyPayment: 0,
      startDate: '-',
      dueDate: '-',
      nextPayment: '-',
      status: 'NONE',
      installments: []
    },
    history: []
  };
  appState.loans = loans;
  return loans;
}

/* ─── Render ───────────────────────────────────────────────────────────────── */

export function renderPinjamanPage(appState) {
  const data = getLoanData(appState);
  const active = data.activeLoan;
  const progressPct = Math.round((active.paid / active.amount) * 100);

  return `
    <div class="page-heading">Pinjaman</div>
    <p class="page-subtitle">Kelola pinjaman Anda dengan mudah, pantau cicilan, dan simulasi pinjaman baru</p>

    <!-- Summary Cards -->
    <div class="ldg-summary-row">
      <div class="ldg-summary-card">
        <div class="ldg-summary-icon blue">${ic.loan}</div>
        <div class="ldg-summary-info">
          <div class="ldg-summary-label">Pinjaman Aktif</div>
          <div class="ldg-summary-value">${formatRp(active.amount)}</div>
        </div>
      </div>
      <div class="ldg-summary-card">
        <div class="ldg-summary-icon slate">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div class="ldg-summary-info">
          <div class="ldg-summary-label">Sudah Dibayar</div>
          <div class="ldg-summary-value">${formatRp(active.paid)}</div>
        </div>
      </div>
      <div class="ldg-summary-card">
        <div class="ldg-summary-icon amber">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        <div class="ldg-summary-info">
          <div class="ldg-summary-label">Sisa Pinjaman</div>
          <div class="ldg-summary-value">${formatRp(active.remaining)}</div>
        </div>
      </div>
      <div class="ldg-summary-card">
        <div class="ldg-summary-icon red">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        </div>
        <div class="ldg-summary-info">
          <div class="ldg-summary-label">Cicilan Berikut</div>
          <div class="ldg-summary-value">${formatDate(active.nextPayment)}</div>
        </div>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="loan-tabs">
      <button class="loan-tab ${loanTab === 'active' ? 'active' : ''}" data-loantab="active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
        Pinjaman Aktif
      </button>
      <button class="loan-tab ${loanTab === 'history' ? 'active' : ''}" data-loantab="history">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        Riwayat Pinjaman
      </button>
      <button class="loan-tab ${loanTab === 'simulate' ? 'active' : ''}" data-loantab="simulate">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
        Simulasi Pinjaman
      </button>
    </div>

    <!-- Tab Content -->
    <div class="loan-tab-content">
      ${loanTab === 'active' ? renderActiveLoan(active, progressPct) : ''}
      ${loanTab === 'history' ? renderLoanHistory(data.history) : ''}
      ${loanTab === 'simulate' ? renderLoanSimulator() : ''}
    </div>
  `;
}

function renderActiveLoan(active, progressPct) {
  return `
    <!-- Active Loan Detail -->
    <div class="loan-detail-row">
      <!-- Loan Card -->
      <div class="loan-active-card">
        <div class="loan-card-header">
          <div>
            <div class="loan-card-id">${active.id}</div>
            <div class="loan-card-status"><span class="ldg-badge success">Aktif</span></div>
          </div>
          <div class="loan-card-rate">${active.interestRate}% <span>p.a.</span></div>
        </div>
        <div class="loan-card-amount">${formatRp(active.amount)}</div>
        <div class="loan-progress-section">
          <div class="loan-progress-header">
            <span>Progres Pembayaran</span>
            <span class="loan-progress-pct">${progressPct}%</span>
          </div>
          <div class="loan-progress-bar">
            <div class="loan-progress-fill" style="width:${progressPct}%;"></div>
          </div>
          <div class="loan-progress-labels">
            <span>Dibayar: ${formatRp(active.paid)}</span>
            <span>Sisa: ${formatRp(active.remaining)}</span>
          </div>
        </div>
        <div class="loan-card-meta">
          <div class="loan-meta-item">
            <label>Tenor</label>
            <span>${active.tenor} Bulan</span>
          </div>
          <div class="loan-meta-item">
            <label>Cicilan/Bulan</label>
            <span>${formatRp(active.monthlyPayment)}</span>
          </div>
          <div class="loan-meta-item">
            <label>Mulai</label>
            <span>${formatDate(active.startDate)}</span>
          </div>
          <div class="loan-meta-item">
            <label>Jatuh Tempo</label>
            <span>${formatDate(active.dueDate)}</span>
          </div>
        </div>
      </div>

      <!-- Installment Schedule -->
      <div class="loan-schedule-card">
        <div class="chart-card-title">Jadwal Cicilan</div>
        <div class="loan-schedule-list">
          ${active.installments.map(inst => {
            const isPaid = inst.status === 'PAID';
            const isUpcoming = inst.status === 'UPCOMING';
            return `
            <div class="loan-inst-item ${isPaid ? 'paid' : 'upcoming'}">
              <div class="loan-inst-marker">
                <div class="loan-inst-dot ${isPaid ? 'done' : 'pending'}">
                  ${isPaid ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" width="12" height="12"><polyline points="20 6 9 17 4 12"></polyline></svg>' : `<span>${inst.no}</span>`}
                </div>
                ${inst.no < active.installments.length ? '<div class="loan-inst-line"></div>' : ''}
              </div>
              <div class="loan-inst-info">
                <div class="loan-inst-top">
                  <span class="loan-inst-label">Cicilan ke-${inst.no}</span>
                  <div style="display:flex;gap:8px;align-items:center;">
                    <span class="ldg-badge ${isPaid ? 'success' : 'pending'}">${isPaid ? 'Lunas' : 'Belum'}</span>
                    ${isUpcoming ? `<button class="btn-primary btn-pay-inst" data-instid="${inst.id}" style="padding:4px 8px;font-size:11px;min-height:unset;">Bayar</button>` : ''}
                  </div>
                </div>
                <div class="loan-inst-details">
                  <span>${formatDate(inst.date)}</span>
                  <span style="font-weight:700;color:var(--slate-900);">${formatRp(inst.total)}</span>
                </div>
                <div class="loan-inst-breakdown">
                  Pokok: ${formatRp(inst.principal)} • Bunga: ${formatRp(inst.interest)}
                </div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderLoanHistory(history) {
  return `
    <div class="ldg-table-card">
      <div class="ldg-table-wrap">
        <table class="ldg-table">
          <thead>
            <tr>
              <th>ID Pinjaman</th>
              <th>Jumlah Pinjaman</th>
              <th>Tenor</th>
              <th>Bunga</th>
              <th>Mulai</th>
              <th>Selesai</th>
              <th>Total Dibayar</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${history.map(h => `
              <tr class="ldg-row">
                <td class="ldg-cell-id">${h.id}</td>
                <td class="ldg-cell-amount" style="font-weight:700;">${formatRp(h.amount)}</td>
                <td style="font-size:13px;">${h.tenor} Bulan</td>
                <td style="font-size:13px;">${h.interestRate}%</td>
                <td class="ldg-cell-time"><div>${formatDate(h.startDate)}</div></td>
                <td class="ldg-cell-time"><div>${formatDate(h.endDate)}</div></td>
                <td class="ldg-cell-balance" style="font-weight:700;color:var(--green-700);">${formatRp(h.totalPaid)}</td>
                <td><span class="ldg-badge success">Lunas</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderLoanSimulator() {
  return `
    <div class="loan-sim-container">
      <div class="loan-sim-form-card">
        <div class="chart-card-title">Simulasi Pinjaman Baru</div>
        <p class="fee-sim-sub">Hitung estimasi cicilan bulanan untuk rencana pinjaman Anda</p>
        
        <div class="loan-sim-fields">
          <div class="loan-sim-field">
            <label>Jumlah Pinjaman</label>
            <input type="number" id="loan-sim-amount" placeholder="Contoh: 50000000" min="1000000" step="1000000" />
          </div>
          <div class="loan-sim-field">
            <label>Tenor (Bulan)</label>
            <input type="number" id="loan-sim-tenor" placeholder="Contoh: 12" min="1" max="60" />
          </div>
          <div class="loan-sim-field">
            <label>Suku Bunga (%/tahun)</label>
            <input type="number" id="loan-sim-rate" placeholder="Contoh: 10" min="1" max="30" step="0.5" />
          </div>
        </div>

        <div class="loan-sim-presets">
          <span style="font-size:12px;color:var(--slate-400);font-weight:600;">Preset:</span>
          <button class="preset-pill" data-loanpreset='{"amount":10000000,"tenor":6,"rate":8}'>Rp 10Jt • 6 Bln</button>
          <button class="preset-pill" data-loanpreset='{"amount":25000000,"tenor":12,"rate":10}'>Rp 25Jt • 12 Bln</button>
          <button class="preset-pill" data-loanpreset='{"amount":50000000,"tenor":24,"rate":12}'>Rp 50Jt • 24 Bln</button>
        </div>
      </div>

      <div class="loan-sim-result-card">
        <div class="chart-card-title">Hasil Simulasi</div>
        <div class="loan-sim-results" id="loan-sim-results">
          <div class="loan-sim-big-number">
            <div class="loan-sim-big-label">Cicilan per Bulan</div>
            <div class="loan-sim-big-value" id="loan-sim-monthly">Rp 0</div>
          </div>
          <div class="fee-sim-divider"></div>
          <div class="fee-sim-row">
            <span>Total Pokok</span>
            <span id="loan-sim-principal" class="fee-sim-val">Rp 0</span>
          </div>
          <div class="fee-sim-row">
            <span>Total Bunga</span>
            <span id="loan-sim-interest" class="fee-sim-val" style="color:var(--amber-700);">Rp 0</span>
          </div>
          <div class="fee-sim-divider"></div>
          <div class="fee-sim-row total">
            <span>Total Bayar</span>
            <span id="loan-sim-total" class="fee-sim-val" style="color:var(--blue-700);">Rp 0</span>
          </div>
          <div class="fee-sim-row">
            <span>Fee Admin (1%)</span>
            <span id="loan-sim-admin" class="fee-sim-val" style="color:var(--red-600);">Rp 0</span>
          </div>
          
          <div style="margin-top:20px;">
            <button class="btn-primary" id="btn-apply-loan" style="width:100%;justify-content:center;">Ajukan Pinjaman Ini</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ─── Bind Events ──────────────────────────────────────────────────────────── */

export function bindPinjamanEvents(appState, rerenderPage) {
  // Tab switching
  document.querySelectorAll('[data-loantab]').forEach(tab => {
    tab.addEventListener('click', () => {
      loanTab = tab.getAttribute('data-loantab');
      rerenderPage();
    });
  });

  // Simulator inputs
  const amountEl = document.getElementById('loan-sim-amount');
  const tenorEl = document.getElementById('loan-sim-tenor');
  const rateEl = document.getElementById('loan-sim-rate');

  const updateSim = () => {
    const amount = parseFloat(amountEl?.value) || 0;
    const tenor = parseInt(tenorEl?.value) || 0;
    const rate = parseFloat(rateEl?.value) || 0;

    if (amount > 0 && tenor > 0 && rate > 0) {
      const monthlyRate = rate / 100 / 12;
      const monthly = amount * (monthlyRate * Math.pow(1 + monthlyRate, tenor)) / (Math.pow(1 + monthlyRate, tenor) - 1);
      const totalPay = monthly * tenor;
      const totalInterest = totalPay - amount;
      const adminFee = amount * 0.01;

      document.getElementById('loan-sim-monthly').textContent = formatRp(Math.round(monthly));
      document.getElementById('loan-sim-principal').textContent = formatRp(amount);
      document.getElementById('loan-sim-interest').textContent = formatRp(Math.round(totalInterest));
      document.getElementById('loan-sim-total').textContent = formatRp(Math.round(totalPay));
      document.getElementById('loan-sim-admin').textContent = formatRp(Math.round(adminFee));
    } else {
      document.getElementById('loan-sim-monthly').textContent = 'Rp 0';
      document.getElementById('loan-sim-principal').textContent = 'Rp 0';
      document.getElementById('loan-sim-interest').textContent = 'Rp 0';
      document.getElementById('loan-sim-total').textContent = 'Rp 0';
      document.getElementById('loan-sim-admin').textContent = 'Rp 0';
    }
  };

  if (amountEl) amountEl.addEventListener('input', updateSim);
  if (tenorEl) tenorEl.addEventListener('input', updateSim);
  if (rateEl) rateEl.addEventListener('input', updateSim);

  // Presets
  document.querySelectorAll('[data-loanpreset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = JSON.parse(btn.getAttribute('data-loanpreset'));
      if (amountEl) amountEl.value = preset.amount;
      if (tenorEl) tenorEl.value = preset.tenor;
      if (rateEl) rateEl.value = preset.rate;
      updateSim();
    });
  });

  // Apply loan action
  document.getElementById('btn-apply-loan')?.addEventListener('click', async () => {
    const amount = parseFloat(amountEl?.value) || 0;
    const tenor = parseInt(tenorEl?.value) || 0;
    const rate = parseFloat(rateEl?.value) || 0;

    if (amount <= 0 || tenor <= 0 || rate <= 0) {
      alert('Mohon isi simulasi pinjaman dengan benar.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount, tenor, interestRate: rate })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengajukan pinjaman');
      
      alert('Pinjaman berhasil diajukan!');
      // Force reload to get updated dashboard/loans data
      window.location.reload();
    } catch (e) {
      alert(e.message);
    }
  });

  // Pay installment action
  document.querySelectorAll('.btn-pay-inst').forEach(btn => {
    btn.addEventListener('click', async () => {
      const instId = btn.getAttribute('data-instid');
      if (!confirm('Bayar cicilan ini?')) return;
      
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/loans/pay', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ installmentId: instId })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal membayar cicilan');
        
        alert('Cicilan berhasil dibayar!');
        window.location.reload();
      } catch (e) {
        alert(e.message);
      }
    });
  });
}
