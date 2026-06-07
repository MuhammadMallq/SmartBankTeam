import '../../styles/style.css';
import '../../styles/premium.css';
import './operator-dashboard.css';
import { ICONS, showToast, formatIDR } from '../../utils/ui-core.js';

/**
 * SMARTBANK OPERATOR DASHBOARD
 * Full-featured banking support portal with:
 * 1. Dashboard Overview
 * 2. Service Queue Management
 * 3. Customer Lookup & Verification
 * 4. Ticket Management
 * 5. Activity Log
 */

// ─── State ───────────────────────────────────────────────────────────────────
let appData = null;
let currentPage = 'dashboard';
let queueData = [];
let ticketData = [];
let activityLog = [];
let ticketFilter = 'all';

// ─── Dummy Data Generation ───────────────────────────────────────────────────
function generateQueueData() {
  const services = [
    { type: 'Pembukaan Rekening', category: 'Rekening' },
    { type: 'Pengajuan KPR', category: 'Kredit' },
    { type: 'Blokir Kartu ATM', category: 'Kartu' },
    { type: 'Reset Password e-Banking', category: 'Digital' },
    { type: 'Perubahan Data Nasabah', category: 'Administrasi' },
    { type: 'Aktivasi Mobile Banking', category: 'Digital' },
    { type: 'Klaim Asuransi', category: 'Asuransi' },
    { type: 'Pengajuan Kartu Kredit', category: 'Kartu' },
    { type: 'Komplain Transaksi', category: 'Komplain' },
    { type: 'Informasi Produk', category: 'Informasi' },
  ];

  const names = [
    { name: 'Budi Santoso', initial: 'B', color: '#0d9488' },
    { name: 'Siti Aminah', initial: 'S', color: '#8b5cf6' },
    { name: 'Ahmad Fauzi', initial: 'A', color: '#0891b2' },
    { name: 'Rina Wijaya', initial: 'R', color: '#d946ef' },
    { name: 'Dedi Kurniawan', initial: 'D', color: '#ea580c' },
    { name: 'Maya Putri', initial: 'M', color: '#059669' },
    { name: 'Rizky Pratama', initial: 'R', color: '#2563eb' },
    { name: 'Sari Indah', initial: 'S', color: '#e11d48' },
    { name: 'Hendra Gunawan', initial: 'H', color: '#7c3aed' },
    { name: 'Lina Marlina', initial: 'L', color: '#0284c7' },
  ];

  const priorities = ['high', 'medium', 'low'];
  const statuses = ['waiting', 'waiting', 'waiting', 'serving'];

  return names.map((n, i) => ({
    queueNo: `A${String(i + 1).padStart(3, '0')}`,
    ...n,
    id: `USR-${String(Math.floor(Math.random() * 999) + 1).padStart(5, '0')}`,
    service: services[i],
    priority: priorities[Math.floor(Math.random() * 3)],
    status: i === 0 ? 'serving' : statuses[Math.floor(Math.random() * 4)],
    waitTime: i === 0 ? 0 : Math.floor(Math.random() * 20) + 1,
    arrivedAt: new Date(Date.now() - (Math.floor(Math.random() * 60) + 5) * 60000),
  }));
}

function generateTicketData() {
  const tickets = [
    { id: 'TKT-2601', customer: 'Budi Santoso', customerId: 'USR-00142', category: 'Komplain', subject: 'Transfer gagal ke rekening BCA', status: 'open', priority: 'high', created: '2026-06-07T08:15:00', notes: 'Nasabah sudah melaporkan 2x via call center.' },
    { id: 'TKT-2602', customer: 'Siti Aminah', customerId: 'USR-00089', category: 'Informasi', subject: 'Pertanyaan produk deposito berjangka', status: 'progress', priority: 'low', created: '2026-06-07T09:30:00', notes: 'Nasabah tertarik deposito 12 bulan.' },
    { id: 'TKT-2603', customer: 'Ahmad Fauzi', customerId: 'USR-00023', category: 'Administrasi', subject: 'Perubahan nomor telepon rekening', status: 'open', priority: 'medium', created: '2026-06-07T10:05:00', notes: 'Perlu verifikasi KTP dan KK.' },
    { id: 'TKT-2604', customer: 'Rina Wijaya', customerId: 'USR-00089', category: 'Kartu', subject: 'Kartu ATM tertelan di mesin', status: 'resolved', priority: 'high', created: '2026-06-06T14:20:00', notes: 'Kartu sudah diambil dari mesin ATM cabang Dago.' },
    { id: 'TKT-2605', customer: 'Dedi Kurniawan', customerId: 'USR-00071', category: 'Digital', subject: 'Tidak bisa login mobile banking', status: 'progress', priority: 'medium', created: '2026-06-07T07:45:00', notes: 'Reset password sudah dilakukan, menunggu aktivasi.' },
    { id: 'TKT-2606', customer: 'Maya Putri', customerId: 'USR-00034', category: 'Komplain', subject: 'Potongan biaya admin tidak sesuai', status: 'open', priority: 'high', created: '2026-06-07T11:00:00', notes: 'Biaya admin Rp 25.000 bulan ini, seharusnya Rp 15.000.' },
    { id: 'TKT-2607', customer: 'Rizky Pratama', customerId: 'USR-00112', category: 'Rekening', subject: 'Pembukaan rekening tabungan bisnis', status: 'closed', priority: 'low', created: '2026-06-05T16:30:00', notes: 'Rekening sudah aktif, kartu ATM akan dikirim H+3.' },
    { id: 'TKT-2608', customer: 'Sari Indah', customerId: 'USR-00200', category: 'Kredit', subject: 'Status pengajuan KPR', status: 'progress', priority: 'medium', created: '2026-06-06T10:00:00', notes: 'Dokumen sudah lengkap, menunggu approval dari pusat.' },
  ];
  return tickets;
}

function generateActivityLog() {
  return [
    { type: 'login', title: 'Login ke Sistem', desc: 'Operator Support masuk ke portal', time: '07:30' },
    { type: 'serve', title: 'Melayani Budi Santoso', desc: 'Antrian A001 — Komplain Transaksi', time: '07:45' },
    { type: 'ticket', title: 'Buat Tiket TKT-2601', desc: 'Transfer gagal ke rekening BCA', time: '08:15' },
    { type: 'close', title: 'Selesai — Budi Santoso', desc: 'Masalah transfer berhasil dipandu', time: '08:35' },
    { type: 'serve', title: 'Melayani Siti Aminah', desc: 'Antrian A002 — Informasi Produk', time: '08:40' },
    { type: 'ticket', title: 'Buat Tiket TKT-2602', desc: 'Informasi deposito berjangka', time: '09:30' },
    { type: 'close', title: 'Selesai — Siti Aminah', desc: 'Nasabah akan konfirmasi via email', time: '09:50' },
    { type: 'serve', title: 'Melayani Ahmad Fauzi', desc: 'Antrian A003 — Perubahan Data', time: '10:00' },
    { type: 'ticket', title: 'Buat Tiket TKT-2603', desc: 'Perubahan nomor telepon', time: '10:05' },
    { type: 'escalate', title: 'Eskalasi TKT-2606', desc: 'Potongan biaya admin — diteruskan ke Manager', time: '11:15' },
    { type: 'serve', title: 'Melayani Dedi Kurniawan', desc: 'Antrian A005 — Reset Mobile Banking', time: '11:30' },
    { type: 'close', title: 'Tutup Tiket TKT-2604', desc: 'Kartu ATM Rina — sudah diterima', time: '12:00' },
  ];
}

// ─── SVG Icons (Extended) ────────────────────────────────────────────────────
const OP_ICONS = {
  queue: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  ticket: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 5v2"/><path d="M15 11v2"/><path d="M15 17v2"/><path d="M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z"/></svg>`,
  clock: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  check_circle: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  alert: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  plus: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  arrow_up: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>`,
  eye: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  play: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  skip: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>`,
  escalate: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 11 12 6 7 11"/><polyline points="17 18 12 13 7 18"/></svg>`,
  history: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>`,
  home: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  verified: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`,
};

// ─── Bootstrap ───────────────────────────────────────────────────────────────
async function bootstrap() {
  try {
    const res = await fetch('/dummy_data.json');
    appData = await res.json();
  } catch (e) {
    console.error('Failed to load data, using defaults', e);
    appData = { contacts: [], ledger: [], operator: { name: 'Operator Support', id: 'OPR-01' } };
  }

  queueData = generateQueueData();
  ticketData = generateTicketData();
  activityLog = generateActivityLog();

  renderApp();
}

// ─── Main Render ─────────────────────────────────────────────────────────────
function renderApp() {
  const app = document.querySelector('#app');
  app.innerHTML = `
  <div class="dashboard-layout operator-bg fade-in">
    <aside class="sidebar">
      <div class="sidebar-logo" style="background: rgba(45,212,191,0.15); color: #2dd4bf;">${ICONS.bank}</div>
      <nav class="sidebar-menu" id="sidebarMenu">
        <a href="#" class="menu-item ${currentPage === 'dashboard' ? 'active' : ''}" data-page="dashboard" title="Dashboard">
          ${OP_ICONS.home}
        </a>
        <a href="#" class="menu-item ${currentPage === 'queue' ? 'active' : ''}" data-page="queue" title="Antrian Layanan">
          ${OP_ICONS.queue}
        </a>
        <a href="#" class="menu-item ${currentPage === 'customers' ? 'active' : ''}" data-page="customers" title="Cari Nasabah">
          ${ICONS.search}
        </a>
        <a href="#" class="menu-item ${currentPage === 'tickets' ? 'active' : ''}" data-page="tickets" title="Tiket Layanan">
          ${OP_ICONS.ticket}
        </a>
        <a href="#" class="menu-item ${currentPage === 'activity' ? 'active' : ''}" data-page="activity" title="Riwayat Aktivitas">
          ${OP_ICONS.history}
        </a>
      </nav>
      <div class="sidebar-bottom">
        <a href="/operator-login.html" id="logoutBtn" class="menu-item" style="color: #f87171;" title="Keluar">${ICONS.logout}</a>
        <div class="sidebar-user-avatar" style="background: rgba(45,212,191,0.15); color: #2dd4bf;">O</div>
      </div>
    </aside>

    <div class="main-area">
      <nav class="topnav">
        <div class="topnav-brand">
          <span style="color:#2dd4bf">${ICONS.bank}</span>
          SmartBank <span style="font-weight:400; opacity:0.5; margin-left:8px;">Operator Portal</span>
        </div>
        <div class="topnav-search" style="max-width: 360px;">
          ${ICONS.search}
          <input type="text" id="globalSearch" placeholder="Cari nasabah, tiket, atau ID..." />
        </div>
        <div class="topnav-actions">
          <div class="topnav-icon-btn" style="position:relative;">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <div class="notif-dot" style="background:#2dd4bf; border-color: rgba(5,46,42,0.6);"></div>
          </div>
          <div class="topnav-user">
            <div class="topnav-user-avatar" style="background: rgba(45,212,191,0.2); color: #2dd4bf;">O</div>
            <span class="topnav-user-name">${appData?.operator?.name || 'Operator Support'}</span>
          </div>
        </div>
      </nav>

      <div class="page-content" id="pageContent">
        <!-- Dynamic content -->
      </div>
    </div>
  </div>`;

  renderPage();
  attachGlobalEvents();
}

// ─── Page Router ─────────────────────────────────────────────────────────────
function renderPage() {
  const container = document.getElementById('pageContent');
  switch (currentPage) {
    case 'dashboard':  container.innerHTML = renderDashboard(); break;
    case 'queue':      container.innerHTML = renderQueue(); break;
    case 'customers':  container.innerHTML = renderCustomers(); break;
    case 'tickets':    container.innerHTML = renderTickets(); break;
    case 'activity':   container.innerHTML = renderActivity(); break;
  }
  attachPageEvents();
}

// ─── 1. DASHBOARD OVERVIEW ──────────────────────────────────────────────────
function renderDashboard() {
  const openTickets = ticketData.filter(t => t.status === 'open').length;
  const inProgress = ticketData.filter(t => t.status === 'progress').length;
  const resolvedToday = ticketData.filter(t => t.status === 'resolved' || t.status === 'closed').length;
  const waitingQueue = queueData.filter(q => q.status === 'waiting').length;

  return `
  <div class="op-fade-in">
    <div class="op-page-header">
      <div>
        <h1>Dashboard Overview</h1>
        <p class="op-page-subtitle">Selamat datang kembali, ${appData?.operator?.name || 'Operator'}. Berikut ringkasan hari ini.</p>
      </div>
      <div style="text-align:right;">
        <div style="font-size:12px; color:rgba(255,255,255,0.35); text-transform:uppercase; letter-spacing:1px;">Hari Ini</div>
        <div style="font-size:15px; font-weight:700; color:rgba(255,255,255,0.8);">${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="op-stat-grid">
      <div class="op-stat-card teal">
        <div class="op-stat-icon teal">${OP_ICONS.queue}</div>
        <div class="op-stat-label">Nasabah Menunggu</div>
        <div class="op-stat-value">${waitingQueue}</div>
        <div class="op-stat-sub"><span class="up">↑ 3</span> dari jam lalu</div>
      </div>
      <div class="op-stat-card amber">
        <div class="op-stat-icon amber">${OP_ICONS.ticket}</div>
        <div class="op-stat-label">Tiket Terbuka</div>
        <div class="op-stat-value">${openTickets}</div>
        <div class="op-stat-sub">${inProgress} sedang diproses</div>
      </div>
      <div class="op-stat-card cyan">
        <div class="op-stat-icon cyan">${OP_ICONS.clock}</div>
        <div class="op-stat-label">Rata-rata Waktu Respon</div>
        <div class="op-stat-value">3.2<span style="font-size:14px; font-weight:400; opacity:0.5;"> mnt</span></div>
        <div class="op-stat-sub"><span class="up">↓ 0.5</span> lebih cepat</div>
      </div>
      <div class="op-stat-card emerald">
        <div class="op-stat-icon emerald">${OP_ICONS.check_circle}</div>
        <div class="op-stat-label">Selesai Hari Ini</div>
        <div class="op-stat-value">${resolvedToday + 12}</div>
        <div class="op-stat-sub">Target: 20 tiket</div>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="op-grid-main" style="margin-bottom: 24px;">
      <!-- Live Queue Preview -->
      <div class="op-panel">
        <div class="op-panel-header">
          <div class="op-panel-header-left">
            <div class="op-panel-icon">${OP_ICONS.queue}</div>
            <div class="op-panel-title">Antrian Layanan Aktif</div>
          </div>
          <span class="op-panel-badge">${waitingQueue} Menunggu</span>
        </div>
        <div style="padding: 0;">
          <table class="op-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Nasabah</th>
                <th>Layanan</th>
                <th>Prioritas</th>
                <th>Tunggu</th>
                <th style="text-align:right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${queueData.slice(0, 5).map(q => `
              <tr>
                <td><span class="queue-number">${q.queueNo}</span></td>
                <td>
                  <div class="op-customer-cell">
                    <div class="op-avatar" style="background:${q.color}20; color:${q.color}">${q.initial}</div>
                    <div>
                      <div class="op-customer-name">${q.name}</div>
                      <div class="op-customer-id">${q.id}</div>
                    </div>
                  </div>
                </td>
                <td><span style="font-size:12px; color:rgba(255,255,255,0.6);">${q.service.type}</span></td>
                <td><span class="priority-dot ${q.priority}"></span></td>
                <td style="font-size:12px; color:rgba(255,255,255,0.5);">${q.status === 'serving' ? '<span class="op-badge serving">Dilayani</span>' : q.waitTime + ' mnt'}</td>
                <td style="text-align:right">
                  ${q.status === 'serving' 
                    ? '<button class="op-btn success" style="font-size:11px;">Sedang Dilayani</button>' 
                    : `<button class="op-btn primary btn-serve-dash" data-queue="${q.queueNo}" style="font-size:11px;">${OP_ICONS.play} Layani</button>`}
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div style="padding: 12px 24px; border-top: 1px solid rgba(255,255,255,0.04); text-align: center;">
          <button class="op-btn ghost" data-goto="queue" style="width:100%;">Lihat Semua Antrian →</button>
        </div>
      </div>

      <!-- Recent Tickets + Quick Stats -->
      <div style="display:flex; flex-direction:column; gap:24px;">
        <!-- Tiket Terbaru -->
        <div class="op-panel" style="flex:1;">
          <div class="op-panel-header">
            <div class="op-panel-header-left">
              <div class="op-panel-icon" style="background:rgba(245,158,11,0.12); color:#fbbf24;">${OP_ICONS.ticket}</div>
              <div class="op-panel-title">Tiket Terbaru</div>
            </div>
          </div>
          <div class="op-panel-body" style="padding: 0;">
            ${ticketData.filter(t => t.status !== 'closed').slice(0, 4).map(t => `
            <div style="padding: 14px 24px; border-bottom: 1px solid rgba(255,255,255,0.04); display:flex; align-items:center; justify-content:space-between;">
              <div style="flex:1; min-width:0;">
                <div style="font-size:13px; font-weight:600; color:white; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${t.subject}</div>
                <div style="font-size:11px; color:rgba(255,255,255,0.35); margin-top:2px;">${t.id} • ${t.customer}</div>
              </div>
              <span class="op-badge ${t.status}">${t.status === 'open' ? 'Baru' : t.status === 'progress' ? 'Proses' : 'Selesai'}</span>
            </div>`).join('')}
          </div>
          <div style="padding: 12px 24px; border-top: 1px solid rgba(255,255,255,0.04); text-align: center;">
            <button class="op-btn ghost" data-goto="tickets" style="width:100%;">Kelola Tiket →</button>
          </div>
        </div>

        <!-- Performa Singkat -->
        <div class="op-panel">
          <div class="op-panel-body" style="padding: 20px 24px;">
            <div style="font-size:12px; font-weight:700; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:1px; margin-bottom:16px;">Performa Hari Ini</div>
            ${renderMiniBar('Nasabah Dilayani', 14, 20)}
            ${renderMiniBar('Tiket Ditutup', resolvedToday + 12, 20)}
            ${renderMiniBar('Rata-rata Rating', 4.7, 5)}
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="op-panel">
      <div class="op-panel-header">
        <div class="op-panel-header-left">
          <div class="op-panel-icon" style="background:rgba(192,132,252,0.12); color:#c084fc;">${OP_ICONS.history}</div>
          <div class="op-panel-title">Aktivitas Terakhir</div>
        </div>
        <button class="op-btn ghost" data-goto="activity">Lihat Semua →</button>
      </div>
      <div class="op-panel-body" style="padding: 8px 24px;">
        ${activityLog.slice(-5).reverse().map(a => `
        <div class="op-activity-item">
          <div class="op-activity-dot ${a.type}"></div>
          <div class="op-activity-content">
            <div class="op-activity-title">${a.title}</div>
            <div class="op-activity-desc">${a.desc}</div>
          </div>
          <div class="op-activity-time">${a.time}</div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}

function renderMiniBar(label, value, max) {
  const pct = Math.min((value / max) * 100, 100);
  return `
  <div style="margin-bottom: 14px;">
    <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
      <span style="font-size:12px; color:rgba(255,255,255,0.55);">${label}</span>
      <span style="font-size:12px; font-weight:700; color:white;">${value}/${max}</span>
    </div>
    <div style="height:6px; background:rgba(255,255,255,0.06); border-radius:3px; overflow:hidden;">
      <div style="height:100%; width:${pct}%; background: linear-gradient(90deg, #0d9488, #2dd4bf); border-radius:3px; transition: width 0.5s ease;"></div>
    </div>
  </div>`;
}

// ─── 2. SERVICE QUEUE ────────────────────────────────────────────────────────
function renderQueue() {
  const waiting = queueData.filter(q => q.status === 'waiting');
  const serving = queueData.filter(q => q.status === 'serving');

  return `
  <div class="op-fade-in">
    <div class="op-page-header">
      <div>
        <h1>Manajemen Antrian Layanan</h1>
        <p class="op-page-subtitle">Kelola nasabah dalam antrian pelayanan cabang.</p>
      </div>
      <div class="op-btn-group">
        <button class="op-btn primary" id="btnCallNext">${OP_ICONS.play} Panggil Berikutnya</button>
      </div>
    </div>

    <!-- Queue Stats -->
    <div class="op-stat-grid" style="grid-template-columns: repeat(3, 1fr);">
      <div class="op-stat-card teal">
        <div class="op-stat-icon teal">${OP_ICONS.queue}</div>
        <div class="op-stat-label">Total Dalam Antrian</div>
        <div class="op-stat-value">${queueData.length}</div>
        <div class="op-stat-sub">${serving.length} sedang dilayani</div>
      </div>
      <div class="op-stat-card amber">
        <div class="op-stat-icon amber">${OP_ICONS.clock}</div>
        <div class="op-stat-label">Waktu Tunggu Rata-rata</div>
        <div class="op-stat-value">${Math.round(waiting.reduce((s, q) => s + q.waitTime, 0) / (waiting.length || 1))}<span style="font-size:14px; font-weight:400; opacity:0.5;"> mnt</span></div>
        <div class="op-stat-sub">Maks: ${Math.max(...waiting.map(q => q.waitTime), 0)} menit</div>
      </div>
      <div class="op-stat-card emerald">
        <div class="op-stat-icon emerald">${OP_ICONS.check_circle}</div>
        <div class="op-stat-label">Selesai Dilayani</div>
        <div class="op-stat-value">14</div>
        <div class="op-stat-sub">Hari ini sejak buka</div>
      </div>
    </div>

    <!-- Queue Table -->
    <div class="op-panel">
      <div class="op-panel-header">
        <div class="op-panel-header-left">
          <div class="op-panel-icon">${OP_ICONS.queue}</div>
          <div class="op-panel-title">Daftar Antrian</div>
        </div>
        <div class="op-tabs">
          <button class="op-tab active" data-filter="all">Semua</button>
          <button class="op-tab" data-filter="waiting">Menunggu</button>
          <button class="op-tab" data-filter="serving">Dilayani</button>
        </div>
      </div>
      <div style="padding: 0; overflow-x: auto;">
        <table class="op-table" id="queueTable">
          <thead>
            <tr>
              <th>No. Antrian</th>
              <th>Nasabah</th>
              <th>Jenis Layanan</th>
              <th>Kategori</th>
              <th>Prioritas</th>
              <th>Waktu Tunggu</th>
              <th>Status</th>
              <th style="text-align:right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${queueData.map(q => renderQueueRow(q)).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function renderQueueRow(q) {
  return `
  <tr data-queue-id="${q.queueNo}">
    <td><span class="queue-number">${q.queueNo}</span></td>
    <td>
      <div class="op-customer-cell">
        <div class="op-avatar" style="background:${q.color}20; color:${q.color}">${q.initial}</div>
        <div>
          <div class="op-customer-name">${q.name}</div>
          <div class="op-customer-id">${q.id}</div>
        </div>
      </div>
    </td>
    <td style="font-size:13px;">${q.service.type}</td>
    <td><span class="op-badge normal" style="font-size:10px;">${q.service.category}</span></td>
    <td>
      <span style="display:flex; align-items:center; gap:6px;">
        <span class="priority-dot ${q.priority}"></span>
        <span style="font-size:12px; color:rgba(255,255,255,0.6); text-transform:capitalize;">${q.priority === 'high' ? 'Tinggi' : q.priority === 'medium' ? 'Sedang' : 'Rendah'}</span>
      </span>
    </td>
    <td style="font-size:13px; color:rgba(255,255,255,0.5);">${q.status === 'serving' ? '-' : q.waitTime + ' mnt'}</td>
    <td><span class="op-badge ${q.status}">${q.status === 'waiting' ? 'Menunggu' : 'Dilayani'}</span></td>
    <td style="text-align:right">
      <div class="op-btn-group" style="justify-content: flex-end;">
        ${q.status === 'serving' 
          ? `<button class="op-btn success btn-complete" data-queue="${q.queueNo}" style="font-size:11px;">${ICONS.check} Selesai</button>`
          : `<button class="op-btn primary btn-serve" data-queue="${q.queueNo}" style="font-size:11px;">${OP_ICONS.play} Layani</button>
             <button class="op-btn warning btn-skip" data-queue="${q.queueNo}" style="font-size:11px;" title="Lewati">${OP_ICONS.skip}</button>
             <button class="op-btn danger btn-escalate" data-queue="${q.queueNo}" style="font-size:11px;" title="Eskalasi">${OP_ICONS.escalate}</button>`}
      </div>
    </td>
  </tr>`;
}

// ─── 3. CUSTOMER LOOKUP ──────────────────────────────────────────────────────
function renderCustomers() {
  return `
  <div class="op-fade-in">
    <div class="op-page-header">
      <div>
        <h1>Pencarian & Verifikasi Nasabah</h1>
        <p class="op-page-subtitle">Cari data nasabah berdasarkan nama atau ID untuk verifikasi identitas.</p>
      </div>
    </div>

    <!-- Search Box -->
    <div class="op-panel" style="margin-bottom: 24px;">
      <div class="op-panel-body" style="padding: 24px;">
        <div style="display:flex; gap:12px; align-items:center;">
          <div style="flex:1; position:relative;">
            <div style="position:absolute; left:14px; top:50%; transform:translateY(-50%); color:rgba(255,255,255,0.3);">${ICONS.search}</div>
            <input type="text" id="customerSearch" class="op-input" placeholder="Masukkan nama nasabah atau ID (contoh: Rina Wijaya atau USR-00089)..." style="padding-left:44px; font-size:15px;" />
          </div>
          <button class="op-btn primary" id="btnSearchCustomer" style="padding: 12px 24px;">Cari Nasabah</button>
        </div>
      </div>
    </div>

    <!-- Search Results -->
    <div id="customerResults">
      ${renderCustomerList()}
    </div>
  </div>`;
}

function renderCustomerList(filter = '') {
  const contacts = appData?.contacts || [];
  const filtered = filter 
    ? contacts.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()) || c.id.toLowerCase().includes(filter.toLowerCase()))
    : contacts;

  if (filtered.length === 0 && filter) {
    return `
    <div class="op-panel">
      <div class="op-empty">
        ${ICONS.search}
        <div class="op-empty-title">Nasabah Tidak Ditemukan</div>
        <div class="op-empty-desc">Tidak ada nasabah dengan pencarian "${filter}"</div>
      </div>
    </div>`;
  }

  return `
  <div class="op-panel">
    <div class="op-panel-header">
      <div class="op-panel-header-left">
        <div class="op-panel-icon">${ICONS.users}</div>
        <div class="op-panel-title">${filter ? 'Hasil Pencarian' : 'Daftar Nasabah'}</div>
      </div>
      <span class="op-panel-badge">${filtered.length} Nasabah</span>
    </div>
    <div style="padding:0;">
      <table class="op-table">
        <thead>
          <tr>
            <th>Nasabah</th>
            <th>ID Rekening</th>
            <th>Email</th>
            <th>Status</th>
            <th style="text-align:right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(c => `
          <tr>
            <td>
              <div class="op-customer-cell">
                <div class="op-avatar" style="background:${c.color}20; color:${c.color}">${c.initial}</div>
                <div class="op-customer-name">${c.name}</div>
              </div>
            </td>
            <td style="font-family:monospace; font-size:12px; color:rgba(255,255,255,0.5);">${c.id}</td>
            <td style="font-size:12px; color:rgba(255,255,255,0.5);">${c.email}</td>
            <td><span class="op-badge resolved" style="font-size:10px;">${OP_ICONS.verified} Aktif</span></td>
            <td style="text-align:right">
              <button class="op-btn primary btn-view-customer" data-customer-id="${c.id}" style="font-size:11px;">${OP_ICONS.eye} Detail</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Customer Detail -->
  <div id="customerDetail" style="margin-top:24px;"></div>`;
}

function renderCustomerDetail(customerId) {
  const contact = (appData?.contacts || []).find(c => c.id === customerId);
  if (!contact) return '';

  // Find transactions for this customer
  const transactions = (appData?.ledger || []).filter(l => l.from_user === customerId || l.to_user === customerId).slice(0, 5);

  return `
  <div class="op-panel op-fade-in">
    <div class="op-panel-header">
      <div class="op-panel-header-left">
        <div class="op-panel-icon" style="background:rgba(45,212,191,0.12); color:#2dd4bf;">${OP_ICONS.verified}</div>
        <div class="op-panel-title">Detail & Verifikasi Nasabah</div>
      </div>
      <button class="op-btn ghost" id="btnCloseDetail">${ICONS.x} Tutup</button>
    </div>
    <div class="op-customer-detail">
      <div class="op-customer-profile">
        <div class="op-avatar" style="background:${contact.color}20; color:${contact.color}; width:64px; height:64px; font-size:24px;">${contact.initial}</div>
        <div class="op-customer-profile-name">${contact.name}</div>
        <div class="op-customer-profile-id">${contact.id}</div>
        <span class="op-badge resolved" style="margin-top:4px;">${OP_ICONS.verified} Terverifikasi</span>
      </div>
      <div class="op-customer-info-grid">
        <div class="op-info-item">
          <div class="op-info-label">Email</div>
          <div class="op-info-value" style="font-size:13px;">${contact.email}</div>
        </div>
        <div class="op-info-item">
          <div class="op-info-label">Tipe Rekening</div>
          <div class="op-info-value">Tabungan</div>
        </div>
        <div class="op-info-item">
          <div class="op-info-label">Tanggal Buka Rekening</div>
          <div class="op-info-value">15 Jan 2024</div>
        </div>
        <div class="op-info-item">
          <div class="op-info-label">Cabang</div>
          <div class="op-info-value">KCP Bandung Dago</div>
        </div>
      </div>
    </div>

    ${transactions.length > 0 ? `
    <div style="padding: 0 24px 24px;">
      <div style="font-size:12px; font-weight:700; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:1px; margin-bottom:12px;">Transaksi Terakhir</div>
      <div style="background:rgba(0,0,0,0.1); border-radius:12px; border:1px solid rgba(255,255,255,0.05); overflow:hidden;">
        <table class="op-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Deskripsi</th>
              <th>Tipe</th>
              <th style="text-align:right">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map(tx => `
            <tr>
              <td style="font-family:monospace; font-size:11px; color:rgba(255,255,255,0.4);">${tx.id}</td>
              <td style="font-size:12px;">${tx.description}</td>
              <td><span class="op-badge ${tx.type.includes('IN') || tx.type.includes('STIMULUS') || tx.type.includes('DISBURSEMENT') ? 'resolved' : 'urgent'}" style="font-size:10px;">${tx.type.replace(/_/g, ' ')}</span></td>
              <td style="text-align:right; font-weight:700; font-family:monospace; font-size:13px; color:${tx.to_user === customerId ? '#34d399' : '#f87171'};">${tx.to_user === customerId ? '+' : '-'} ${formatIDR(tx.amount)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>` : ''}
  </div>`;
}

// ─── 4. TICKET MANAGEMENT ────────────────────────────────────────────────────
function renderTickets() {
  const filtered = ticketFilter === 'all' ? ticketData : ticketData.filter(t => t.status === ticketFilter);

  const counts = {
    all: ticketData.length,
    open: ticketData.filter(t => t.status === 'open').length,
    progress: ticketData.filter(t => t.status === 'progress').length,
    resolved: ticketData.filter(t => t.status === 'resolved').length,
    closed: ticketData.filter(t => t.status === 'closed').length,
  };

  return `
  <div class="op-fade-in">
    <div class="op-page-header">
      <div>
        <h1>Pengelolaan Tiket Layanan</h1>
        <p class="op-page-subtitle">Buat, kelola, dan tutup tiket layanan nasabah.</p>
      </div>
      <button class="op-btn primary" id="btnNewTicket">${OP_ICONS.plus} Buat Tiket Baru</button>
    </div>

    <!-- Ticket Stats Mini -->
    <div class="op-stat-grid" style="grid-template-columns: repeat(5, 1fr); margin-bottom: 24px;">
      <div class="op-stat-card teal" style="padding:16px; cursor:pointer;" data-ticket-filter="all">
        <div class="op-stat-label" style="font-size:10px;">Semua</div>
        <div class="op-stat-value" style="font-size:22px;">${counts.all}</div>
      </div>
      <div class="op-stat-card amber" style="padding:16px; cursor:pointer;" data-ticket-filter="open">
        <div class="op-stat-label" style="font-size:10px;">Baru</div>
        <div class="op-stat-value" style="font-size:22px;">${counts.open}</div>
      </div>
      <div class="op-stat-card blue" style="padding:16px; cursor:pointer;" data-ticket-filter="progress">
        <div class="op-stat-label" style="font-size:10px;">Proses</div>
        <div class="op-stat-value" style="font-size:22px;">${counts.progress}</div>
      </div>
      <div class="op-stat-card emerald" style="padding:16px; cursor:pointer;" data-ticket-filter="resolved">
        <div class="op-stat-label" style="font-size:10px;">Selesai</div>
        <div class="op-stat-value" style="font-size:22px;">${counts.resolved}</div>
      </div>
      <div class="op-stat-card rose" style="padding:16px; cursor:pointer;" data-ticket-filter="closed">
        <div class="op-stat-label" style="font-size:10px;">Ditutup</div>
        <div class="op-stat-value" style="font-size:22px;">${counts.closed}</div>
      </div>
    </div>

    <!-- Ticket Table -->
    <div class="op-panel">
      <div class="op-panel-header">
        <div class="op-panel-header-left">
          <div class="op-panel-icon" style="background:rgba(245,158,11,0.12); color:#fbbf24;">${OP_ICONS.ticket}</div>
          <div class="op-panel-title">Daftar Tiket</div>
        </div>
        <div class="op-tabs" id="ticketTabs">
          <button class="op-tab ${ticketFilter === 'all' ? 'active' : ''}" data-filter="all">Semua</button>
          <button class="op-tab ${ticketFilter === 'open' ? 'active' : ''}" data-filter="open">Baru</button>
          <button class="op-tab ${ticketFilter === 'progress' ? 'active' : ''}" data-filter="progress">Proses</button>
          <button class="op-tab ${ticketFilter === 'resolved' ? 'active' : ''}" data-filter="resolved">Selesai</button>
          <button class="op-tab ${ticketFilter === 'closed' ? 'active' : ''}" data-filter="closed">Ditutup</button>
        </div>
      </div>
      <div style="padding:0; overflow-x:auto;">
        <table class="op-table" id="ticketTable">
          <thead>
            <tr>
              <th>ID Tiket</th>
              <th>Nasabah</th>
              <th>Kategori</th>
              <th>Subjek</th>
              <th>Prioritas</th>
              <th>Status</th>
              <th>Dibuat</th>
              <th style="text-align:right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(t => `
            <tr>
              <td style="font-family:monospace; font-size:12px; font-weight:700; color:#2dd4bf;">${t.id}</td>
              <td>
                <div>
                  <div style="font-size:13px; font-weight:600; color:white;">${t.customer}</div>
                  <div style="font-size:11px; color:rgba(255,255,255,0.35); font-family:monospace;">${t.customerId}</div>
                </div>
              </td>
              <td><span class="op-badge normal" style="font-size:10px;">${t.category}</span></td>
              <td style="font-size:12px; max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:rgba(255,255,255,0.7);">${t.subject}</td>
              <td>
                <span style="display:flex; align-items:center; gap:5px;">
                  <span class="priority-dot ${t.priority}"></span>
                  <span style="font-size:11px; color:rgba(255,255,255,0.5); text-transform:capitalize;">${t.priority === 'high' ? 'Tinggi' : t.priority === 'medium' ? 'Sedang' : 'Rendah'}</span>
                </span>
              </td>
              <td><span class="op-badge ${t.status}">${t.status === 'open' ? 'Baru' : t.status === 'progress' ? 'Proses' : t.status === 'resolved' ? 'Selesai' : 'Ditutup'}</span></td>
              <td style="font-size:12px; color:rgba(255,255,255,0.4); white-space:nowrap;">${formatTicketDate(t.created)}</td>
              <td style="text-align:right">
                <div class="op-btn-group" style="justify-content:flex-end;">
                  <button class="op-btn ghost btn-view-ticket" data-ticket-id="${t.id}" style="font-size:11px;">${OP_ICONS.eye} Lihat</button>
                  ${t.status === 'open' ? `<button class="op-btn primary btn-process-ticket" data-ticket-id="${t.id}" style="font-size:11px;">Proses</button>` : ''}
                  ${t.status === 'progress' ? `<button class="op-btn success btn-resolve-ticket" data-ticket-id="${t.id}" style="font-size:11px;">${ICONS.check} Selesai</button>` : ''}
                </div>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function formatTicketDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function renderNewTicketModal() {
  return `
  <div class="op-modal-overlay" id="ticketModal">
    <div class="op-modal">
      <div class="op-modal-header">
        <div class="op-modal-title">Buat Tiket Layanan Baru</div>
        <button class="op-modal-close" id="btnCloseModal">${ICONS.x}</button>
      </div>
      <div class="op-modal-body">
        <form id="newTicketForm">
          <div class="op-form-row">
            <div>
              <label class="op-label">Nama Nasabah</label>
              <input type="text" class="op-input" name="customer" placeholder="Nama lengkap nasabah" required />
            </div>
            <div>
              <label class="op-label">ID Nasabah</label>
              <input type="text" class="op-input" name="customerId" placeholder="USR-XXXXX" required />
            </div>
          </div>
          <div class="op-form-row">
            <div>
              <label class="op-label">Kategori</label>
              <select class="op-select" name="category" required>
                <option value="">Pilih kategori...</option>
                <option value="Komplain">Komplain</option>
                <option value="Informasi">Informasi</option>
                <option value="Administrasi">Administrasi</option>
                <option value="Kartu">Kartu (ATM/Kredit)</option>
                <option value="Digital">Digital Banking</option>
                <option value="Kredit">Kredit/Pinjaman</option>
                <option value="Rekening">Rekening</option>
              </select>
            </div>
            <div>
              <label class="op-label">Prioritas</label>
              <select class="op-select" name="priority" required>
                <option value="low">Rendah</option>
                <option value="medium" selected>Sedang</option>
                <option value="high">Tinggi</option>
              </select>
            </div>
          </div>
          <div class="op-form-group">
            <label class="op-label">Subjek / Perihal</label>
            <input type="text" class="op-input" name="subject" placeholder="Ringkasan masalah nasabah" required />
          </div>
          <div class="op-form-group">
            <label class="op-label">Catatan Operator</label>
            <textarea class="op-textarea" name="notes" placeholder="Detail masalah, langkah yang sudah dilakukan, dll..."></textarea>
          </div>
        </form>
      </div>
      <div class="op-modal-footer">
        <button class="op-btn ghost" id="btnCancelTicket">Batal</button>
        <button class="op-btn primary" id="btnSubmitTicket">${OP_ICONS.plus} Buat Tiket</button>
      </div>
    </div>
  </div>`;
}

function renderTicketDetailModal(ticketId) {
  const ticket = ticketData.find(t => t.id === ticketId);
  if (!ticket) return '';

  return `
  <div class="op-modal-overlay" id="ticketDetailModal">
    <div class="op-modal">
      <div class="op-modal-header">
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-family:monospace; font-size:14px; color:#2dd4bf; font-weight:700;">${ticket.id}</span>
          <span class="op-badge ${ticket.status}">${ticket.status === 'open' ? 'Baru' : ticket.status === 'progress' ? 'Proses' : ticket.status === 'resolved' ? 'Selesai' : 'Ditutup'}</span>
        </div>
        <button class="op-modal-close" id="btnCloseDetailModal">${ICONS.x}</button>
      </div>
      <div class="op-modal-body">
        <div style="margin-bottom:20px;">
          <div class="op-label">Subjek</div>
          <div style="font-size:16px; font-weight:700; color:white;">${ticket.subject}</div>
        </div>
        <div class="op-form-row" style="margin-bottom:20px;">
          <div>
            <div class="op-label">Nasabah</div>
            <div style="font-size:14px; font-weight:600; color:white;">${ticket.customer}</div>
            <div style="font-size:11px; color:rgba(255,255,255,0.35); font-family:monospace;">${ticket.customerId}</div>
          </div>
          <div>
            <div class="op-label">Kategori</div>
            <span class="op-badge normal">${ticket.category}</span>
          </div>
        </div>
        <div class="op-form-row" style="margin-bottom:20px;">
          <div>
            <div class="op-label">Prioritas</div>
            <span style="display:flex; align-items:center; gap:6px;">
              <span class="priority-dot ${ticket.priority}"></span>
              <span style="font-size:13px; color:rgba(255,255,255,0.7); text-transform:capitalize;">${ticket.priority === 'high' ? 'Tinggi' : ticket.priority === 'medium' ? 'Sedang' : 'Rendah'}</span>
            </span>
          </div>
          <div>
            <div class="op-label">Dibuat</div>
            <div style="font-size:13px; color:rgba(255,255,255,0.7);">${new Date(ticket.created).toLocaleString('id-ID')}</div>
          </div>
        </div>
        <div>
          <div class="op-label">Catatan Operator</div>
          <div style="background:rgba(0,0,0,0.15); border-radius:10px; padding:14px 16px; border:1px solid rgba(255,255,255,0.05); font-size:13px; color:rgba(255,255,255,0.65); line-height:1.7;">
            ${ticket.notes || '<em style="opacity:0.5;">Belum ada catatan</em>'}
          </div>
        </div>
      </div>
      <div class="op-modal-footer">
        <button class="op-btn ghost" id="btnCloseDetailModal2">Tutup</button>
        ${ticket.status === 'open' ? `<button class="op-btn primary btn-process-ticket" data-ticket-id="${ticket.id}">Mulai Proses</button>` : ''}
        ${ticket.status === 'progress' ? `<button class="op-btn success btn-resolve-ticket" data-ticket-id="${ticket.id}">${ICONS.check} Tandai Selesai</button>` : ''}
        ${ticket.status === 'resolved' ? `<button class="op-btn ghost btn-close-ticket" data-ticket-id="${ticket.id}">Tutup Tiket</button>` : ''}
      </div>
    </div>
  </div>`;
}

// ─── 5. ACTIVITY LOG ─────────────────────────────────────────────────────────
function renderActivity() {
  return `
  <div class="op-fade-in">
    <div class="op-page-header">
      <div>
        <h1>Riwayat Aktivitas Operator</h1>
        <p class="op-page-subtitle">Log lengkap aktivitas pelayanan hari ini.</p>
      </div>
      <div style="text-align:right;">
        <div style="font-size:12px; color:rgba(255,255,255,0.35); text-transform:uppercase; letter-spacing:1px;">Total Aktivitas</div>
        <div style="font-size:24px; font-weight:800; color:white;">${activityLog.length}</div>
      </div>
    </div>

    <!-- Activity Stats -->
    <div class="op-stat-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 28px;">
      <div class="op-stat-card teal" style="padding:18px;">
        <div class="op-stat-icon teal" style="width:32px; height:32px; margin-bottom:10px;">${OP_ICONS.play}</div>
        <div class="op-stat-label" style="font-size:10px;">Nasabah Dilayani</div>
        <div class="op-stat-value" style="font-size:24px;">${activityLog.filter(a => a.type === 'serve').length}</div>
      </div>
      <div class="op-stat-card emerald" style="padding:18px;">
        <div class="op-stat-icon emerald" style="width:32px; height:32px; margin-bottom:10px;">${OP_ICONS.check_circle}</div>
        <div class="op-stat-label" style="font-size:10px;">Layanan Selesai</div>
        <div class="op-stat-value" style="font-size:24px;">${activityLog.filter(a => a.type === 'close').length}</div>
      </div>
      <div class="op-stat-card blue" style="padding:18px;">
        <div class="op-stat-icon blue" style="width:32px; height:32px; margin-bottom:10px;">${OP_ICONS.ticket}</div>
        <div class="op-stat-label" style="font-size:10px;">Tiket Dibuat</div>
        <div class="op-stat-value" style="font-size:24px;">${activityLog.filter(a => a.type === 'ticket').length}</div>
      </div>
      <div class="op-stat-card amber" style="padding:18px;">
        <div class="op-stat-icon amber" style="width:32px; height:32px; margin-bottom:10px;">${OP_ICONS.escalate}</div>
        <div class="op-stat-label" style="font-size:10px;">Eskalasi</div>
        <div class="op-stat-value" style="font-size:24px;">${activityLog.filter(a => a.type === 'escalate').length}</div>
      </div>
    </div>

    <!-- Activity Timeline -->
    <div class="op-panel">
      <div class="op-panel-header">
        <div class="op-panel-header-left">
          <div class="op-panel-icon" style="background:rgba(192,132,252,0.12); color:#c084fc;">${OP_ICONS.history}</div>
          <div class="op-panel-title">Timeline Aktivitas</div>
        </div>
        <span class="op-panel-badge">${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
      </div>
      <div class="op-panel-body" style="padding: 12px 24px;">
        ${activityLog.map((a, i) => `
        <div class="op-activity-item" style="animation-delay: ${i * 0.05}s;">
          <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
            <div class="op-activity-dot ${a.type}"></div>
            ${i < activityLog.length - 1 ? '<div style="width:2px; flex:1; min-height:20px; background:rgba(255,255,255,0.06);"></div>' : ''}
          </div>
          <div class="op-activity-content" style="flex:1;">
            <div class="op-activity-title">${a.title}</div>
            <div class="op-activity-desc">${a.desc}</div>
          </div>
          <div class="op-activity-time">${a.time} WIB</div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}

// ─── Event Handlers ──────────────────────────────────────────────────────────
function attachGlobalEvents() {
  // Sidebar Navigation
  document.querySelectorAll('#sidebarMenu .menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      if (page && page !== currentPage) {
        currentPage = page;
        renderApp();
      }
    });
  });

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Logging out...', 'info');
    setTimeout(() => { window.location.href = '/operator-login.html'; }, 1000);
  });

  // Navigation shortcuts (goto buttons)
  document.querySelectorAll('[data-goto]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = btn.dataset.goto;
      renderApp();
    });
  });
}

function attachPageEvents() {
  // ── Dashboard page events
  document.querySelectorAll('.btn-serve-dash').forEach(btn => {
    btn.addEventListener('click', () => {
      const queueNo = btn.dataset.queue;
      const q = queueData.find(q => q.queueNo === queueNo);
      if (q) {
        q.status = 'serving';
        showToast(`Memanggil ${q.name} — Antrian ${queueNo}`, 'success');
        activityLog.push({ type: 'serve', title: `Melayani ${q.name}`, desc: `Antrian ${queueNo} — ${q.service.type}`, time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) });
        renderPage();
      }
    });
  });

  // ── Queue page events
  document.querySelectorAll('.btn-serve').forEach(btn => {
    btn.addEventListener('click', () => {
      const queueNo = btn.dataset.queue;
      const q = queueData.find(q => q.queueNo === queueNo);
      if (q) {
        q.status = 'serving';
        showToast(`Memanggil antrian ${queueNo} — ${q.name}`, 'success');
        activityLog.push({ type: 'serve', title: `Melayani ${q.name}`, desc: `Antrian ${queueNo} — ${q.service.type}`, time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) });
        renderPage();
      }
    });
  });

  document.querySelectorAll('.btn-complete').forEach(btn => {
    btn.addEventListener('click', () => {
      const queueNo = btn.dataset.queue;
      const q = queueData.find(q => q.queueNo === queueNo);
      if (q) {
        queueData = queueData.filter(item => item.queueNo !== queueNo);
        showToast(`Layanan selesai untuk ${q.name}`, 'success');
        activityLog.push({ type: 'close', title: `Selesai — ${q.name}`, desc: `Antrian ${queueNo} — ${q.service.type}`, time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) });
        renderPage();
      }
    });
  });

  document.querySelectorAll('.btn-skip').forEach(btn => {
    btn.addEventListener('click', () => {
      const queueNo = btn.dataset.queue;
      const q = queueData.find(q => q.queueNo === queueNo);
      if (q) {
        // Move to end
        queueData = queueData.filter(item => item.queueNo !== queueNo);
        q.waitTime = 0;
        queueData.push(q);
        showToast(`Antrian ${queueNo} dilewati`, 'info');
        renderPage();
      }
    });
  });

  document.querySelectorAll('.btn-escalate').forEach(btn => {
    btn.addEventListener('click', () => {
      const queueNo = btn.dataset.queue;
      const q = queueData.find(q => q.queueNo === queueNo);
      if (q) {
        queueData = queueData.filter(item => item.queueNo !== queueNo);
        showToast(`Antrian ${queueNo} dieskalasi ke Manager`, 'info');
        activityLog.push({ type: 'escalate', title: `Eskalasi ${queueNo}`, desc: `${q.name} — ${q.service.type} diteruskan ke Manager`, time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) });
        renderPage();
      }
    });
  });

  // Call next
  document.getElementById('btnCallNext')?.addEventListener('click', () => {
    const next = queueData.find(q => q.status === 'waiting');
    if (next) {
      next.status = 'serving';
      showToast(`Memanggil antrian ${next.queueNo} — ${next.name}`, 'success');
      activityLog.push({ type: 'serve', title: `Melayani ${next.name}`, desc: `Antrian ${next.queueNo} — ${next.service.type}`, time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) });
      renderPage();
    } else {
      showToast('Tidak ada nasabah dalam antrian', 'info');
    }
  });

  // Queue tabs
  document.querySelectorAll('.op-tab[data-filter]').forEach(tab => {
    tab.addEventListener('click', () => {
      const filter = tab.dataset.filter;
      if (currentPage === 'queue') {
        const tbody = document.querySelector('#queueTable tbody');
        if (tbody) {
          const filtered = filter === 'all' ? queueData : queueData.filter(q => q.status === filter);
          tbody.innerHTML = filtered.map(q => renderQueueRow(q)).join('');
          document.querySelectorAll('.op-tab[data-filter]').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          attachPageEvents();
        }
      }
    });
  });

  // ── Customer page events
  document.getElementById('btnSearchCustomer')?.addEventListener('click', () => {
    const val = document.getElementById('customerSearch')?.value || '';
    const results = document.getElementById('customerResults');
    if (results) {
      results.innerHTML = renderCustomerList(val);
      attachPageEvents();
    }
  });

  document.getElementById('customerSearch')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('btnSearchCustomer')?.click();
    }
  });

  document.querySelectorAll('.btn-view-customer').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.customerId;
      const detail = document.getElementById('customerDetail');
      if (detail) {
        detail.innerHTML = renderCustomerDetail(id);
        detail.scrollIntoView({ behavior: 'smooth' });
        // Attach close button
        document.getElementById('btnCloseDetail')?.addEventListener('click', () => {
          detail.innerHTML = '';
        });
      }
    });
  });

  // ── Ticket page events
  // Ticket filter tabs
  document.querySelectorAll('#ticketTabs .op-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      ticketFilter = tab.dataset.filter;
      renderPage();
    });
  });

  // Ticket stat card filters
  document.querySelectorAll('[data-ticket-filter]').forEach(card => {
    card.addEventListener('click', () => {
      ticketFilter = card.dataset.ticketFilter;
      renderPage();
    });
  });

  // New ticket
  document.getElementById('btnNewTicket')?.addEventListener('click', () => {
    document.body.insertAdjacentHTML('beforeend', renderNewTicketModal());
    attachModalEvents();
  });

  // View ticket
  document.querySelectorAll('.btn-view-ticket').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.ticketId;
      document.body.insertAdjacentHTML('beforeend', renderTicketDetailModal(id));
      attachTicketDetailModalEvents();
    });
  });

  // Process ticket
  document.querySelectorAll('.btn-process-ticket').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.ticketId;
      const ticket = ticketData.find(t => t.id === id);
      if (ticket) {
        ticket.status = 'progress';
        showToast(`Tiket ${id} mulai diproses`, 'success');
        activityLog.push({ type: 'ticket', title: `Proses Tiket ${id}`, desc: ticket.subject, time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) });
        closeModals();
        renderPage();
      }
    });
  });

  // Resolve ticket
  document.querySelectorAll('.btn-resolve-ticket').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.ticketId;
      const ticket = ticketData.find(t => t.id === id);
      if (ticket) {
        ticket.status = 'resolved';
        showToast(`Tiket ${id} ditandai selesai`, 'success');
        activityLog.push({ type: 'close', title: `Selesaikan Tiket ${id}`, desc: ticket.subject, time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) });
        closeModals();
        renderPage();
      }
    });
  });

  // Close ticket
  document.querySelectorAll('.btn-close-ticket').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.ticketId;
      const ticket = ticketData.find(t => t.id === id);
      if (ticket) {
        ticket.status = 'closed';
        showToast(`Tiket ${id} ditutup`, 'info');
        closeModals();
        renderPage();
      }
    });
  });
}

function attachModalEvents() {
  const overlay = document.getElementById('ticketModal');
  if (!overlay) return;

  const closeModal = () => overlay.remove();

  document.getElementById('btnCloseModal')?.addEventListener('click', closeModal);
  document.getElementById('btnCancelTicket')?.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

  document.getElementById('btnSubmitTicket')?.addEventListener('click', () => {
    const form = document.getElementById('newTicketForm');
    const formData = new FormData(form);
    const customer = formData.get('customer');
    const customerId = formData.get('customerId');
    const category = formData.get('category');
    const priority = formData.get('priority');
    const subject = formData.get('subject');
    const notes = formData.get('notes');

    if (!customer || !customerId || !category || !subject) {
      showToast('Harap lengkapi semua field yang wajib diisi', 'error');
      return;
    }

    const newId = `TKT-${2609 + ticketData.length}`;
    ticketData.unshift({
      id: newId,
      customer, customerId, category, subject,
      status: 'open',
      priority,
      created: new Date().toISOString(),
      notes,
    });

    showToast(`Tiket ${newId} berhasil dibuat`, 'success');
    activityLog.push({ type: 'ticket', title: `Buat Tiket ${newId}`, desc: subject, time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) });
    closeModal();
    renderPage();
  });
}

function attachTicketDetailModalEvents() {
  const overlay = document.getElementById('ticketDetailModal');
  if (!overlay) return;

  const closeModal = () => overlay.remove();

  document.getElementById('btnCloseDetailModal')?.addEventListener('click', closeModal);
  document.getElementById('btnCloseDetailModal2')?.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

  // Re-attach action buttons inside modal
  overlay.querySelectorAll('.btn-process-ticket, .btn-resolve-ticket, .btn-close-ticket').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.ticketId;
      const ticket = ticketData.find(t => t.id === id);
      if (!ticket) return;

      if (btn.classList.contains('btn-process-ticket')) {
        ticket.status = 'progress';
        showToast(`Tiket ${id} mulai diproses`, 'success');
      } else if (btn.classList.contains('btn-resolve-ticket')) {
        ticket.status = 'resolved';
        showToast(`Tiket ${id} ditandai selesai`, 'success');
      } else if (btn.classList.contains('btn-close-ticket')) {
        ticket.status = 'closed';
        showToast(`Tiket ${id} ditutup`, 'info');
      }
      closeModal();
      renderPage();
    });
  });
}

function closeModals() {
  document.getElementById('ticketModal')?.remove();
  document.getElementById('ticketDetailModal')?.remove();
}

// ─── Launch ──────────────────────────────────────────────────────────────────
bootstrap();
