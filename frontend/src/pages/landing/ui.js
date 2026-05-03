import { ic, formatRp } from '../../utils/helpers.js';

/* ─── Shared Components ────────────────────────────────────────────────────── */

export function renderSidebar(currentPage, userName) {
  return `
    <aside class="sidebar">
      <div class="sidebar-logo">${ic.bank}</div>
      <nav class="sidebar-menu">
        <a href="#" class="menu-item nav-link ${currentPage === 'dashboard' ? 'active' : ''}" data-page="dashboard" title="Dashboard">${ic.home}</a>
        <a href="#" class="menu-item action-transfer" title="Transfer">${ic.transfer}</a>
        <a href="#" class="menu-item" title="Pembayaran">${ic.payment}</a>
        <a href="#" class="menu-item" title="Pinjaman">${ic.loan}</a>
        <a href="#" class="menu-item nav-link ${currentPage === 'ledger' ? 'active' : ''}" data-page="ledger" title="Ledger">${ic.ledger}</a>
        <a href="#" class="menu-item nav-link ${currentPage === 'biaya' ? 'active' : ''}" data-page="biaya" title="Biaya Layanan">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        </a>
        <a href="#" class="menu-item" title="Pengaturan">${ic.settings}</a>
      </nav>
      <div class="sidebar-bottom">
        <a href="#" id="logoutBtn" class="menu-item" title="Keluar" style="color: var(--red-500);">${ic.logout}</a>
        <div class="sidebar-user-avatar" title="${userName}">${userName.charAt(0)}</div>
      </div>
    </aside>`;
}

export function renderTopnav(userName) {
  return `
    <nav class="topnav">
      <div class="topnav-brand">${ic.bank} SmartBank</div>
      <div class="topnav-search">${ic.search}<input type="text" placeholder="Cari transaksi, fitur..." /></div>
      <div class="topnav-actions">
        <div class="topnav-icon-btn" title="Notifikasi">${ic.bell}<div class="notif-dot"></div></div>
        <div class="topnav-user">
          <div class="topnav-user-avatar">${userName.charAt(0)}</div>
          <span class="topnav-user-name">${userName}</span>
        </div>
      </div>
    </nav>`;
}

export function renderLogoutModal() {
  return `
  <div id="modal-logout" class="modal-overlay">
    <div class="modal-content" style="max-width:400px;text-align:center;">
      <div class="modal-header">
        <div style="background:var(--red-50);color:var(--red-600);width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px auto;">${ic.logout}</div>
        <h2 style="font-size:19px;color:var(--slate-900);margin:0 0 4px;">Konfirmasi Keluar</h2>
        <p style="color:var(--slate-500);font-size:13px;margin:0 0 24px;">Apakah Anda yakin ingin mengakhiri sesi?</p>
      </div>
      <div style="display:flex;gap:12px;">
        <button type="button" class="btn-secondary" id="cancel-logout" style="flex:1;justify-content:center;">Kembali</button>
        <button type="button" class="btn-primary" id="confirm-logout" style="flex:1;justify-content:center;background:var(--red-600);">Keluar Sistem</button>
      </div>
    </div>
  </div>`;
}

/* ─── Dashboard Components ─────────────────────────────────────────────────── */

export function renderDashboardUI(appState) {
  const data = appState;
  const dateOptions = { timeZone: 'Asia/Jakarta', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateStr = new Intl.DateTimeFormat('id-ID', dateOptions).format(new Date());

  const incomeData  = [30, 42, 38, 55, 48, 60, 52, 67, 58, 72, 65, 78];
  const expenseData = [45, 38, 50, 35, 42, 30, 48, 36, 44, 32, 40, 28];
  const donut = renderDonut();

  return `
  <div class="dashboard-layout fade-in">
    ${renderSidebar('dashboard', data.user.name)}
    <div class="main-area">
      ${renderTopnav(data.user.name)}
      <div class="page-content">
        <div class="page-heading">Dashboard</div>

        <!-- ROW 1: Stats -->
        <div class="stats-row">
          ${renderBalanceCard(data)}
          ${renderStatCard('Pemasukan', formatRp(data.dashboard.activeLoan.amount), '+2,4%', incomeData, 'green')}
          ${renderStatCard('Pengeluaran', formatRp(data.dashboard.monthlyFee.amount), '-1,2%', expenseData, 'red')}
        </div>

        <!-- ROW 2: Charts -->
        <div class="mid-row">
          ${renderTransactionChart()}
          ${renderDonutCard(donut)}
        </div>

        <!-- ROW 3: Transactions + Rate -->
        <div class="bottom-row">
          ${renderRecentTransactions(data)}
          ${renderExchangeRateCard(dateStr)}
        </div>

      </div>
    </div>
  </div>
  ${renderTransferModal(data)}
  ${renderLogoutModal()}
  `;
}

function renderBalanceCard(data) {
  return `
    <div class="balance-card">
      <div>
        <div class="balance-label">Saldo Saya</div>
        <div class="balance-amount">${formatRp(data.dashboard.balance)}</div>
      </div>
      <div class="balance-card-number">•••• •••• •••• ${data.user.id.replace('USR-', '')}</div>
      <div class="balance-card-meta">
        <div class="balance-meta-item">
          <label>Pemilik</label>
          <span>${data.user.name}</span>
        </div>
        <div class="balance-meta-item">
          <label>No. Rekening</label>
          <span>${data.user.id}</span>
        </div>
      </div>
    </div>`;
}

function renderStatCard(label, value, change, data, type) {
  const isUp = change.startsWith('+');
  const icon = type === 'green' 
    ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`
    : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>`;
  
  const sparkColor = type === 'green' ? '#16a34a' : '#dc2626';
  const sparkFill = type === 'green' ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.06)';

  return `
    <div class="stat-card">
      <div class="stat-card-top">
        <div class="stat-card-icon ${type}">${icon}</div>
        <div class="stat-card-change ${isUp ? 'up' : 'down'}">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="${isUp ? '18 15 12 9 6 15' : '6 9 12 15 18 9'}"></polyline></svg>
          ${change}
        </div>
      </div>
      <div class="stat-card-label">${label}</div>
      <div class="stat-card-value">${value}</div>
      <div class="sparkline-area">${sparklinePath(data, sparkColor, sparkFill)}</div>
    </div>`;
}

function renderTransactionChart() {
  return `
    <div class="chart-card">
      <div class="chart-card-header">
        <div class="chart-card-title">Ringkasan Transaksi</div>
        <div style="display:flex;align-items:center;gap:14px;">
          <div class="chart-legend">
            <span><span class="chart-legend-dot" style="background:var(--blue-600);"></span>Minggu Ini</span>
            <span><span class="chart-legend-dot" style="background:var(--blue-100);"></span>Minggu Lalu</span>
          </div>
          <div class="week-selector">Minggu ▾</div>
        </div>
      </div>
      <div class="bar-chart-wrap">${renderBarChart()}</div>
    </div>`;
}

function renderDonutCard(donut) {
  return `
    <div class="donut-card">
      <div class="chart-card-title">Kategori Pengeluaran</div>
      <div class="donut-wrap">
        <div class="donut-svg-wrap">
          <svg width="130" height="130" viewBox="0 0 130 130">${donut.segments}</svg>
          <div class="donut-center-label"><strong>100%</strong><span>Total</span></div>
        </div>
        <div class="donut-legend">
          <div class="donut-legend-title">Legenda</div>
          ${donut.legend}
        </div>
      </div>
    </div>`;
}

function renderRecentTransactions(data) {
  const txStatusClass = (s) => s === 'Sukses' ? 'sukses' : s === 'Gagal' ? 'gagal' : 'pending';
  return `
    <div class="table-card">
      <div class="table-card-header">
        <div class="table-card-title">Transaksi Terakhir</div>
        <span style="font-size:13px;color:var(--blue-600);cursor:pointer;font-weight:600;">Lihat Semua</span>
      </div>
      <div class="tx-list">
        ${data.dashboard.history.map(row => {
          const isDebit = row.amount < 0;
          const avatar = isDebit
            ? `<div class="tx-avatar debit"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="17" y1="7" x2="7" y2="17"></line><polyline points="17 17 7 17 7 7"></polyline></svg></div>`
            : `<div class="tx-avatar credit"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg></div>`;
          return `<div class="tx-item">
            ${avatar}
            <div><div class="tx-info-title">${row.title}</div><div class="tx-info-sub">${row.app}</div></div>
            <div class="tx-amount ${isDebit ? 'debit' : 'credit'}">${isDebit ? '-' : '+'}${formatRp(Math.abs(row.amount))}</div>
            <div class="tx-date">${row.time}</div>
            <span class="tx-status ${txStatusClass(row.status)}">${row.status}</span>
            <div class="tx-more">···</div>
          </div>`;
        }).join('')}
      </div>
      <div class="tx-pagination">
        <div class="tx-pagination-info">Menampilkan 1–${data.dashboard.history.length} data</div>
        <div class="tx-pages">
          <button class="tx-page-btn">‹</button>
          <button class="tx-page-btn active">1</button>
          <button class="tx-page-btn">2</button>
          <button class="tx-page-btn">›</button>
        </div>
      </div>
    </div>`;
}

function renderExchangeRateCard(dateStr) {
  const rates = [
    { flag: '🇺🇸', code: 'USD', name: 'Dolar Amerika',  buy: '16.285', sell: '16.450', trend: 'up'   },
    { flag: '🇪🇺', code: 'EUR', name: 'Euro',            buy: '17.802', sell: '17.960', trend: 'up'   },
    { flag: '🇹🇷', code: 'TRY', name: 'Lira Turki',      buy: '478',    sell: '481',    trend: 'down'  },
    { flag: '🇷🇺', code: 'RUB', name: 'Rubel Rusia',     buy: '178',    sell: '181',    trend: 'down'  },
    { flag: '🇦🇺', code: 'AUD', name: 'Dolar Australia', buy: '10.285', sell: '10.450', trend: 'up'   },
  ];
  return `
    <div class="rate-card">
      <div class="rate-card-title">Kurs Valas</div>
      <div class="rate-card-sub">Real-time • ${dateStr}</div>
      <div class="rate-table-header">
        <span style="grid-column:1/3;">Mata Uang</span>
        <span>Beli</span>
        <span>Jual</span>
      </div>
      ${rates.map(r => `
        <div class="rate-row">
          <span class="rate-flag">${r.flag}</span>
          <div><div class="rate-currency-code">${r.code}</div><div class="rate-currency-name">${r.name}</div></div>
          <div class="rate-value">${r.buy} <span class="rate-${r.trend}">${r.trend === 'up' ? '▲' : '▼'}</span></div>
          <div class="rate-value">${r.sell}</div>
        </div>`).join('')}
      <div class="converter-divider"></div>
      <div class="converter-row">
        <div class="converter-label">Saya Punya</div>
        <div class="converter-input-row">
          <div class="converter-currency">USD ▾</div>
          <div class="converter-amount">1.000,00</div>
        </div>
        <div class="converter-rate-note">1 USD = 16.285 IDR</div>
      </div>
      <div class="converter-row">
        <div class="converter-label">Saya Dapat</div>
        <div class="converter-input-row">
          <div class="converter-currency">IDR ▾</div>
          <div class="converter-amount" style="color:var(--blue-600);">16.285.000</div>
        </div>
        <div class="converter-rate-note">1 IDR = 0,000061 USD</div>
      </div>
    </div>`;
}

/* ─── Layout Shell ─────────────────────────────────────────────────────────── */

export function renderShellPage(appState, currentPage, pageContent) {
  const data = appState;
  return `
  <div class="dashboard-layout fade-in">
    ${renderSidebar(currentPage, data.user.name)}
    <div class="main-area">
      ${renderTopnav(data.user.name)}
      <div class="page-content">${pageContent}</div>
    </div>
  </div>
  ${renderLogoutModal()}
  `;
}

/* ─── Modals ───────────────────────────────────────────────────────────────── */

export function renderTransferModal(data) {
  const contacts = data.contacts || [];
  return `
  <div id="modal-transfer" class="modal-overlay">
    <div class="modal-content" style="max-width:500px;">
      <!-- Step 1: Pilih Penerima -->
      <div id="trf-step1">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
          <div>
            <h2 style="font-size:18px;font-weight:700;color:var(--slate-900);margin-bottom:2px;">Transfer Dana</h2>
            <p style="font-size:13px;color:var(--slate-400);">Pilih penerima dari kontak Anda</p>
          </div>
          <button id="close-modal-trf" style="background:none;border:none;cursor:pointer;color:var(--slate-400);padding:4px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div style="background:var(--blue-50);border-radius:10px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">
          <span style="font-size:13px;color:var(--blue-700);font-weight:500;">Saldo Tersedia</span>
          <strong style="font-size:16px;color:var(--blue-700);">${formatRp(data.dashboard.balance)}</strong>
        </div>
        <div style="font-size:11px;font-weight:600;color:var(--slate-400);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">Kontak Favorit</div>
        <div class="contact-grid">
          ${contacts.map(c => `
            <div class="contact-chip" data-id="${c.id}" data-action="select-contact">
              <div class="contact-chip-avatar" style="background:${c.color}20;color:${c.color};">${c.initial}</div>
              <div class="contact-chip-name">${c.name.split(' ')[0]}</div>
              <div class="contact-chip-id">${c.id}</div>
            </div>
          `).join('')}
        </div>
        <button id="trf-step1-next" class="btn-primary" disabled
          style="width:100%;justify-content:center;margin-top:20px;">
          Lanjutkan →
        </button>
      </div>

      <!-- Step 2: Isi Nominal -->
      <div id="trf-step2" style="display:none;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
          <button id="trf-back-step1" style="background:none;border:none;cursor:pointer;color:var(--slate-500);padding:4px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <div>
            <h2 style="font-size:18px;font-weight:700;color:var(--slate-900);margin-bottom:2px;">Isi Nominal</h2>
            <p style="font-size:13px;color:var(--slate-400);">Transfer ke penerima yang dipilih</p>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:14px;background:var(--slate-50);border:1px solid var(--slate-200);border-radius:12px;padding:14px 16px;margin-bottom:20px;">
          <div id="trf-selected-initial" style="width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;color:white;flex-shrink:0;">?</div>
          <div>
            <div id="trf-selected-name" style="font-weight:700;font-size:15px;color:var(--slate-900);">-</div>
            <div id="trf-selected-id" style="font-size:12px;color:var(--slate-400);">-</div>
          </div>
          <div style="margin-left:auto;padding:4px 10px;background:var(--green-50);color:var(--green-700);border-radius:6px;font-size:12px;font-weight:600;">SmartBank</div>
        </div>
        <form id="form-trf">
          <div style="text-align:center;margin-bottom:8px;">
            <div style="font-size:12px;color:var(--slate-400);font-weight:600;margin-bottom:6px;letter-spacing:0.5px;">NOMINAL TRANSFER</div>
            <input type="number" id="trf_amount" class="trf-huge-amount" required placeholder="0" min="1000" />
          </div>
          <div class="preset-pills" style="margin:12px 0;">
            <div class="preset-pill" data-amount="50000">Rp 50Rb</div>
            <div class="preset-pill" data-amount="100000">Rp 100Rb</div>
            <div class="preset-pill" data-amount="250000">Rp 250Rb</div>
            <div class="preset-pill" data-amount="500000">Rp 500Rb</div>
          </div>
          <div style="background:var(--slate-50);border-radius:10px;padding:14px 16px;margin-bottom:16px;display:flex;flex-direction:column;gap:8px;font-size:13px;">
            <div style="display:flex;justify-content:space-between;color:var(--slate-500);">
              <span>Biaya Layanan (1%) + Pajak (2%)</span>
              <span id="trf_fee_info" style="font-weight:600;color:var(--amber-700);">Rp 0</span>
            </div>
            <div style="height:1px;background:var(--slate-200);"></div>
            <div style="display:flex;justify-content:space-between;font-weight:700;color:var(--slate-900);">
              <span>Total Debit</span>
              <span id="trf_total_info" style="color:var(--blue-700);">Rp 0</span>
            </div>
          </div>
          <button type="submit" class="btn-primary" style="width:100%;justify-content:center;">
            ${ic.send} Kirim Sekarang
          </button>
        </form>
      </div>
    </div>
  </div>`;
}

/* ─── Chart Helpers ────────────────────────────────────────────────────────── */

export function sparklinePath(data, color = '#2563eb', fill = 'rgba(37,99,235,0.1)') {
  const max = Math.max(...data), min = Math.min(...data);
  const w = 200, h = 50;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 8) - 4;
    return `${x},${y}`;
  });
  const linePts = pts.join(' L ');
  const fillPts = `0,${h} L ${pts.join(' L ')} L ${w},${h}`;
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M ${fillPts} Z" fill="${fill}" />
    <path d="M ${linePts}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>`;
}

export function renderBarChart() {
  const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const thisWeek = [65, 45, 80, 35, 72, 55, 60];
  const lastWeek = [40, 60, 45, 70, 50, 65, 35];
  const maxVal = Math.max(...thisWeek, ...lastWeek);
  return days.map((d, i) => {
    const hThis = Math.round((thisWeek[i] / maxVal) * 140);
    const hLast = Math.round((lastWeek[i] / maxVal) * 140);
    return `
      <div class="bar-group">
        <div class="bar-pair">
          <div class="bar current" style="height:${hThis}px;"></div>
          <div class="bar previous" style="height:${hLast}px;"></div>
        </div>
        <div class="bar-label">${d}</div>
      </div>`;
  }).join('');
}

export function renderDonut() {
  const cats = [
    { label: 'Kebutuhan Bulanan (27%)', pct: 27, color: '#16a34a', val: 763 },
    { label: 'Belanja (11%)',           pct: 11, color: '#0f172a', val: 321 },
    { label: 'Langganan (22%)',         pct: 22, color: '#38bdf8', val: 69  },
    { label: 'Pajak (15%)',             pct: 15, color: '#fbbf24', val: 154 },
    { label: 'Lainnya (25%)',           pct: 25, color: '#bbf7d0', val: 696 },
  ];
  const r = 55, cx = 65, cy = 65, strokeW = 18;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const segments = cats.map(c => {
    const dash = (c.pct / 100) * circ;
    const gap  = circ - dash;
    const seg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c.color}" stroke-width="${strokeW}" stroke-dasharray="${dash} ${gap}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})" />`;
    offset += dash;
    return seg;
  });
  const legend = cats.map(c => `
    <div class="donut-legend-item">
      <div class="donut-legend-left">
        <div class="donut-dot" style="background:${c.color};"></div>
        <span class="donut-legend-label">${c.label}</span>
      </div>
      <span class="donut-legend-value">${c.val}</span>
    </div>`).join('');
  return { segments: segments.join(''), legend };
}
