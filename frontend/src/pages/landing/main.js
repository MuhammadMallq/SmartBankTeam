import '../../styles/style.css';

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const ic = {
  bank:     `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="20" width="20" height="2"></rect><path d="M12 2L2 8h20L12 2z"></path><rect x="4" y="10" width="4" height="8"></rect><rect x="16" y="10" width="4" height="8"></rect><rect x="10" y="10" width="4" height="8"></rect></svg>`,
  home:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
  transfer: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>`,
  payment:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>`,
  loan:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>`,
  ledger:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
  search:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
  bell:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
  logout:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`,
  send:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatRp = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(n).replace(',00', '');
const formatRpDynamic = formatRp;

let appState = null;
let isCooldown = false;
let selectedContact = null;

// ─── Bootstrap ────────────────────────────────────────────────────────────────
async function bootstrap() {
  try {
    const res = await fetch('/dummy_data.json');
    appState = await res.json();
    renderDashboardUI();
  } catch (e) {
    document.querySelector('#app').innerHTML = '<h2 style="padding:40px">Gagal memuat data.</h2>';
    console.error(e);
  }
}

// ─── Transfer Logic ───────────────────────────────────────────────────────────
function processTransfer(event) {
  event.preventDefault();
  if (isCooldown) {
    showToastModal('Cooldown aktif. Harap tunggu 10 detik sebelum transfer berikutnya.', 'warning');
    return;
  }
  if (!selectedContact) {
    showToastModal('Pilih penerima terlebih dahulu.', 'error');
    return;
  }
  const amount = parseFloat(document.getElementById('trf_amount').value);
  if (!amount || amount < 1000) {
    showToastModal('Nominal transfer minimal Rp 1.000.', 'error');
    return;
  }
  const totalFee = amount * 0.03;
  const totalDeduction = amount + totalFee;
  if (totalDeduction > appState.dashboard.balance) {
    showToastModal('Saldo tidak mencukupi untuk melakukan transfer ini.', 'error');
    return;
  }
  if (appState.dashboard.dailyTransactions.used >= appState.dashboard.dailyTransactions.max) {
    showToastModal('Batas transaksi harian (10x) telah tercapai!', 'error');
    return;
  }
  // Execute
  appState.dashboard.balance -= totalDeduction;
  appState.dashboard.dailyTransactions.used += 1;
  appState.dashboard.dailyTransactions.remaining -= 1;
  appState.dashboard.monthlyFee.amount += totalFee;
  appState.dashboard.history.unshift({
    id: 'TRF-' + Math.floor(1000 + Math.random() * 9000),
    title: 'Transfer ke ' + selectedContact.name,
    app: 'SmartBank',
    time: 'Baru Saja',
    status: 'Sukses',
    amount: -totalDeduction
  });
  isCooldown = true;
  setTimeout(() => { isCooldown = false; }, 10000);
  const sentName = selectedContact.name;
  closeModal('modal-transfer');
  selectedContact = null;
  renderDashboardUI();
  showPageToast(`✓ Transfer ke ${sentName} berhasil!`);
}

function selectContact(id) {
  selectedContact = appState.contacts.find(c => c.id === id);
  if (!selectedContact) return;
  document.querySelectorAll('.contact-chip').forEach(el => el.classList.remove('selected'));
  document.querySelector(`.contact-chip[data-id="${id}"]`)?.classList.add('selected');
  document.getElementById('trf-step1-next').disabled = false;
}

function goToStep(step) {
  document.getElementById('trf-step1').style.display = step === 1 ? 'block' : 'none';
  document.getElementById('trf-step2').style.display = step === 2 ? 'block' : 'none';
  if (step === 2 && selectedContact) {
    document.getElementById('trf-selected-name').textContent    = selectedContact.name;
    document.getElementById('trf-selected-id').textContent      = selectedContact.id;
    document.getElementById('trf-selected-initial').textContent = selectedContact.initial;
    document.getElementById('trf-selected-initial').style.background = selectedContact.color;
    document.getElementById('trf_amount').value = '';
    document.getElementById('trf_fee_info').textContent   = formatRp(0);
    document.getElementById('trf_total_info').textContent = formatRp(0);
  }
}

function updateFeeInfo() {
  const amount = parseFloat(document.getElementById('trf_amount')?.value || 0);
  const fee = amount * 0.03;
  document.getElementById('trf_fee_info').textContent   = formatRp(fee);
  document.getElementById('trf_total_info').textContent = formatRp(amount + fee);
}

function showToastModal(msg, type = 'info') {
  const existing = document.getElementById('modal-toast');
  if (existing) existing.remove();
  const colors = { error: '#dc2626', warning: '#b45309', info: '#2563eb' };
  const el = document.createElement('div');
  el.id = 'modal-toast';
  el.style.cssText = `background:${colors[type]}15;border:1px solid ${colors[type]}40;color:${colors[type]};padding:10px 14px;border-radius:8px;font-size:13px;font-weight:500;margin-bottom:12px;`;
  el.textContent = msg;
  const form = document.getElementById('form-trf');
  if (form) form.prepend(el);
  setTimeout(() => el.remove(), 3000);
}

function showPageToast(msg) {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;bottom:28px;right:28px;background:#0f172a;color:white;padding:14px 20px;border-radius:12px;font-size:14px;font-weight:500;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.2);animation:slideUp 0.3s ease;';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) {
  document.getElementById(id).classList.remove('active');
  if (id === 'modal-transfer') {
    goToStep(1);
    selectedContact = null;
    document.querySelectorAll('.contact-chip').forEach(el => el.classList.remove('selected'));
    const next = document.getElementById('trf-step1-next');
    if (next) next.disabled = true;
  }
}

// ─── Sparkline SVG Generator ──────────────────────────────────────────────────
function sparklinePath(data, color = '#2563eb', fill = 'rgba(37,99,235,0.1)') {
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

// ─── Bar Chart ────────────────────────────────────────────────────────────────
function renderBarChart() {
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

// ─── Donut Chart ──────────────────────────────────────────────────────────────
function renderDonut() {
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

// ─── Exchange Rate ────────────────────────────────────────────────────────────
const rates = [
  { flag: '🇺🇸', code: 'USD', name: 'Dolar Amerika',  buy: '16.285', sell: '16.450', trend: 'up'   },
  { flag: '🇪🇺', code: 'EUR', name: 'Euro',            buy: '17.802', sell: '17.960', trend: 'up'   },
  { flag: '🇹🇷', code: 'TRY', name: 'Lira Turki',      buy: '478',    sell: '481',    trend: 'down'  },
  { flag: '🇷🇺', code: 'RUB', name: 'Rubel Rusia',     buy: '178',    sell: '181',    trend: 'down'  },
  { flag: '🇦🇺', code: 'AUD', name: 'Dolar Australia', buy: '10.285', sell: '10.450', trend: 'up'   },
];

// ─── MAIN RENDER ──────────────────────────────────────────────────────────────
function renderDashboardUI() {
  const data = appState;
  const dateOptions = { timeZone: 'Asia/Jakarta', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateStr = new Intl.DateTimeFormat('id-ID', dateOptions).format(new Date());

  const incomeData  = [30, 42, 38, 55, 48, 60, 52, 67, 58, 72, 65, 78];
  const expenseData = [45, 38, 50, 35, 42, 30, 48, 36, 44, 32, 40, 28];
  const donut = renderDonut();
  const contacts = appState.contacts || [];

  const txStatusClass = (s) => s === 'Sukses' ? 'sukses' : s === 'Gagal' ? 'gagal' : 'pending';

  document.querySelector('#app').innerHTML = `
  <div class="dashboard-layout fade-in">

    <!-- ═══ SIDEBAR (Icon-Only) ═══ -->
    <aside class="sidebar">
      <div class="sidebar-logo">${ic.bank}</div>
      <nav class="sidebar-menu">
        <a href="#" class="menu-item active" title="Dashboard">${ic.home}</a>
        <a href="#" class="menu-item action-transfer" title="Transfer">${ic.transfer}</a>
        <a href="#" class="menu-item" title="Pembayaran">${ic.payment}</a>
        <a href="#" class="menu-item" title="Pinjaman">${ic.loan}</a>
        <a href="#" class="menu-item" title="Ledger">${ic.ledger}</a>
        <a href="#" class="menu-item" title="Pengaturan">${ic.settings}</a>
      </nav>
      <div class="sidebar-bottom">
        <a href="#" id="logoutBtn" class="menu-item" title="Keluar" style="color: var(--red-500);">${ic.logout}</a>
        <div class="sidebar-user-avatar" title="${data.user.name}">${data.user.name.charAt(0)}</div>
      </div>
    </aside>

    <!-- ═══ MAIN AREA ═══ -->
    <div class="main-area">

      <!-- Top Nav -->
      <nav class="topnav">
        <div class="topnav-brand">${ic.bank} SmartBank</div>
        <div class="topnav-search">
          ${ic.search}
          <input type="text" placeholder="Cari transaksi, fitur..." />
        </div>
        <div class="topnav-actions">
          <div class="topnav-icon-btn" title="Notifikasi">
            ${ic.bell}
            <div class="notif-dot"></div>
          </div>
          <div class="topnav-user">
            <div class="topnav-user-avatar">${data.user.name.charAt(0)}</div>
            <span class="topnav-user-name">${data.user.name}</span>
          </div>
        </div>
      </nav>

      <!-- Page Content -->
      <div class="page-content">
        <div class="page-heading">Dashboard</div>

        <!-- ROW 1: Stats -->
        <div class="stats-row">
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
          </div>

          <div class="stat-card">
            <div class="stat-card-top">
              <div class="stat-card-icon green">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
              </div>
              <div class="stat-card-change up">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                +2,4%
              </div>
            </div>
            <div class="stat-card-label">Pemasukan</div>
            <div class="stat-card-value">${formatRp(data.dashboard.activeLoan.amount)}</div>
            <div class="sparkline-area">${sparklinePath(incomeData, '#16a34a', 'rgba(22,163,74,0.08)')}</div>
          </div>

          <div class="stat-card">
            <div class="stat-card-top">
              <div class="stat-card-icon red">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
              </div>
              <div class="stat-card-change down">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                -1,2%
              </div>
            </div>
            <div class="stat-card-label">Pengeluaran</div>
            <div class="stat-card-value">${formatRp(data.dashboard.monthlyFee.amount)}</div>
            <div class="sparkline-area">${sparklinePath(expenseData, '#dc2626', 'rgba(220,38,38,0.06)')}</div>
          </div>
        </div>

        <!-- ROW 2: Charts -->
        <div class="mid-row">
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
          </div>

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
          </div>
        </div>

        <!-- ROW 3: Transactions + Rate -->
        <div class="bottom-row">
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
          </div>

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
          </div>
        </div>

      </div><!-- /page-content -->
    </div><!-- /main-area -->
  </div><!-- /dashboard-layout -->

  <!-- ═══ Modal Transfer (2-step) ═══ -->
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
            <div class="contact-chip" data-id="${c.id}" onclick="selectContact('${c.id}')">
              <div class="contact-chip-avatar" style="background:${c.color}20;color:${c.color};">${c.initial}</div>
              <div class="contact-chip-name">${c.name.split(' ')[0]}</div>
              <div class="contact-chip-id">${c.id}</div>
            </div>
          `).join('')}
        </div>
        <button id="trf-step1-next" class="btn-primary" disabled
          style="width:100%;justify-content:center;margin-top:20px;"
          onclick="goToStep(2)">
          Lanjutkan →
        </button>
      </div>

      <!-- Step 2: Isi Nominal -->
      <div id="trf-step2" style="display:none;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
          <button onclick="goToStep(1)" style="background:none;border:none;cursor:pointer;color:var(--slate-500);padding:4px;">
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
  </div>

  <!-- ═══ Modal Logout ═══ -->
  <div id="modal-logout" class="modal-overlay">
    <div class="modal-content" style="max-width:400px;text-align:center;">
      <div class="modal-header">
        <div style="background:var(--red-50);color:var(--red-600);width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px auto;">
          ${ic.logout}
        </div>
        <h2 style="font-size:19px;color:var(--slate-900);margin:0 0 4px;">Konfirmasi Keluar</h2>
        <p style="color:var(--slate-500);font-size:13px;margin:0 0 24px;">Apakah Anda yakin ingin mengakhiri sesi perbankan saat ini?</p>
      </div>
      <div style="display:flex;gap:12px;">
        <button type="button" class="btn-secondary" id="cancel-logout" style="flex:1;justify-content:center;">Kembali</button>
        <button type="button" class="btn-primary" id="confirm-logout" style="flex:1;justify-content:center;background:var(--red-600);">Keluar Sistem</button>
      </div>
    </div>
  </div>
  `;

  // ─── Event Listeners ───────────────────────────────────────────────────────
  document.getElementById('logoutBtn').addEventListener('click', (e) => { e.preventDefault(); openModal('modal-logout'); });
  document.getElementById('cancel-logout').addEventListener('click', () => closeModal('modal-logout'));
  document.getElementById('confirm-logout').addEventListener('click', (e) => {
    e.target.textContent = 'Memutus koneksi...';
    e.target.style.opacity = '0.7';
    setTimeout(() => { window.location.href = '/'; }, 800);
  });

  document.querySelectorAll('.action-transfer').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      selectedContact = null;
      goToStep(1);
      openModal('modal-transfer');
    });
  });

  document.getElementById('close-modal-trf').addEventListener('click', () => closeModal('modal-transfer'));
  document.getElementById('form-trf').addEventListener('submit', processTransfer);
  document.getElementById('trf_amount').addEventListener('input', updateFeeInfo);

  document.querySelectorAll('.preset-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const amtEl = document.getElementById('trf_amount');
      if (amtEl) { amtEl.value = pill.getAttribute('data-amount'); updateFeeInfo(); }
    });
  });
}

bootstrap();
