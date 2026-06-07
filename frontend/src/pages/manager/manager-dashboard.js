import '../../styles/style.css';
import { ICONS, showToast, formatIDR } from '../../utils/ui-core.js';

/**
 * SMARTBANK MANAGER DASHBOARD
 * Operational authority for vault management and transaction auditing.
 */

let appState = null;
let currentTab = 'overview';
let bankVaultBalance = 1000000000;

/**
 * Initialize Manager System
 */
async function bootstrap() {
  const loggedInStr = localStorage.getItem('managerUser');
  if (!loggedInStr) {
    window.location.href = '/manager-login.html';
    return;
  }
  const managerUser = JSON.parse(loggedInStr);

  appState = { manager: managerUser, transactions: { history: [] } };

  try {
    const res = await fetch('http://localhost:3000/api/admin/ledgers');
    if (res.ok) {
      const ledgers = await res.json();
      appState.transactions.history = ledgers.map(l => ({
        title: l.description,
        category: l.app,
        type: 'credit',
        amount: l.amount,
        date: new Date(l.timestamp).toLocaleDateString()
      }));
    }
    renderMainLayout();
  } catch (e) {
    document.querySelector('#app').innerHTML = '<div class="error-msg">SYSTEM_ERR: Failed to load manager data.</div>';
    console.error(e);
  }
}

/**
 * Render the base application skeleton
 */
function renderMainLayout() {
  document.querySelector('#app').innerHTML = `
  <div class="dashboard-layout fade-in">
    <aside class="sidebar bg-slate-900 border-r border-slate-800">
      <div class="sidebar-logo bg-blue-600 mb-10">${ICONS.bank}</div>
      <nav class="sidebar-menu">
        <a href="#" class="menu-item ${currentTab === 'overview' ? 'active' : ''}" data-tab="overview" title="Ringkasan">${ICONS.reports}</a>
        <a href="#" class="menu-item ${currentTab === 'transactions' ? 'active' : ''}" data-tab="transactions" title="Transaksi">${ICONS.activity}</a>
        <a href="#" class="menu-item ${currentTab === 'users' ? 'active' : ''}" data-tab="users" title="Nasabah">${ICONS.users}</a>
        <a href="#" class="menu-item ${currentTab === 'vault' ? 'active' : ''}" data-tab="vault" title="Vault">${ICONS.vault}</a>
      </nav>
      <div class="sidebar-bottom">
        <a href="/manager-login.html" id="logoutBtn" class="menu-item text-red-400 bg-red-400/10" title="Logout">${ICONS.logout}</a>
        <div class="sidebar-user-avatar border-2 border-blue-500 p-0.5">
          <div class="w-full h-full bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">M</div>
        </div>
      </div>
    </aside>

    <div class="main-area bg-slate-50">
      <nav class="topnav shadow-sm bg-white">
        <div class="topnav-brand font-extrabold tracking-tight">
          <span class="text-blue-600">Smart</span>Bank <span class="font-normal text-slate-500 ml-2">Manager Panel</span>
        </div>
        <div class="topnav-actions flex items-center gap-4">
          <div class="topnav-icon-btn border border-slate-200 relative">${ICONS.reports}<div class="notif-dot bg-red-500 border-2 border-white"></div></div>
          <div class="topnav-user border border-slate-200 rounded-xl px-3 py-1 flex items-center gap-3">
            <div class="topnav-user-avatar bg-blue-600 text-white">M</div>
            <div class="flex flex-col">
              <span class="text-sm font-bold">${appState?.manager?.name || 'Manager Ops'}</span>
              <span class="text-[10px] text-slate-500">Operational Authority</span>
            </div>
          </div>
        </div>
      </nav>

      <div class="page-content p-8" id="tab-content">
        ${renderTabContent()}
      </div>
    </div>
  </div>`;
  
  attachEvents();
}

/**
 * Switch content based on currentTab
 */
function renderTabContent() {
  switch(currentTab) {
    case 'overview': return renderOverview();
    case 'transactions': return renderTransactions();
    case 'users': return renderUsers();
    case 'vault': return renderVault();
    default: return '';
  }
}

function renderOverview() {
  return `
    <div class="flex justify-between items-end mb-8">
      <div>
        <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Operasional</h1>
        <p class="text-slate-500 mt-1">Status performa ekosistem per hari ini.</p>
      </div>
      <div class="bg-white px-4 py-2 rounded-lg border border-slate-200 flex items-center gap-2 text-sm font-semibold text-slate-900">
        <div class="w-2 h-2 bg-green-500 rounded-full"></div> System Online
      </div>
    </div>

    <div class="stats-row flex gap-6 mb-8">
      ${renderStatCard('Total Transaksi', '1,452', '+12.5%', ICONS.activity, 'blue')}
      ${renderStatCard('Global Bank Vault', formatIDR(bankVaultBalance), 'Safe', ICONS.vault, 'dark')}
      ${renderStatCard('Volume Harian', 'Rp 1.2M', '-0.8%', ICONS.bank, 'green')}
    </div>

    <div class="table-card bg-white shadow-lg rounded-xl overflow-hidden">
      <div class="p-6 border-b border-slate-100 flex justify-between items-center">
        <h2 class="text-lg font-extrabold text-slate-900">Antrian Persetujuan Strategis</h2>
        <button class="nav-to-tab px-3 py-1.5 bg-slate-100 text-blue-600 text-xs font-bold rounded-lg" data-tab="transactions">Lihat Semua</button>
      </div>
      <div class="px-3">
        ${renderApprovalTable()}
      </div>
    </div>`;
}

function renderStatCard(label, value, trend, icon, theme) {
  const isDark = theme === 'dark';
  return `
    <div class="stat-card flex-1 shadow-md p-6 rounded-xl ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}">
      <div class="flex justify-between items-start mb-4">
        <div class="p-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-blue-50 text-blue-600'}">${icon}</div>
        <div class="px-2 py-1 rounded-full text-[10px] font-bold ${trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}">${trend}</div>
      </div>
      <div class="${isDark ? 'text-slate-400' : 'text-slate-500'} text-xs font-bold mb-1 uppercase">${label}</div>
      <div class="text-2xl font-black">${value}</div>
    </div>`;
}

function renderApprovalTable() {
  const approvals = [
    { name: 'Budi Santoso', id: 'USR-00142', amount: 25000000, target: 'Bank Mandiri', time: '5m ago' },
    { name: 'Siti Aminah', id: 'USR-00089', amount: 10000000, target: 'Bank BCA', time: '12m ago' }
  ];

  return `
    <div class="grid-table">
      <div class="grid grid-cols-[1.5fr_1fr_1fr_auto] border-b border-slate-100 p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
        <div>Pengirim</div><div>Nominal</div><div>Tujuan</div><div class="text-right pr-6">Keputusan</div>
      </div>
      ${approvals.map(a => `
        <div class="grid grid-cols-[1.5fr_1fr_1fr_auto] items-center p-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold">${a.name.charAt(0)}</div>
            <div class="flex flex-col"><span class="font-bold text-sm text-slate-900">${a.name}</span><span class="text-[10px] text-slate-500">${a.id} • ${a.time}</span></div>
          </div>
          <div class="text-green-600 font-extrabold">${formatIDR(a.amount)}</div>
          <div class="text-slate-700 text-sm font-medium">${a.target}</div>
          <div class="flex gap-2">
            <button class="action-btn bg-green-600 text-white rounded-lg w-9 h-9 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform" data-action="approve">${ICONS.check}</button>
            <button class="action-btn bg-red-600 text-white rounded-lg w-9 h-9 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform" data-action="reject">${ICONS.x}</button>
          </div>
        </div>
      `).join('')}
    </div>`;
}

function renderVault() {
  return `
    <div class="mb-8">
      <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Manajemen Vault Global</h1>
      <p class="text-slate-500 mt-1">Alokasi modal strategis dan cadangan utama.</p>
    </div>
    <div class="grid grid-cols-2 gap-6">
      <div class="bg-white p-8 rounded-xl shadow-lg border border-slate-100 text-center">
        <div class="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">${ICONS.vault}</div>
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Cadangan</h3>
        <div class="text-4xl font-black text-slate-900 mt-2">${formatIDR(bankVaultBalance)}</div>
        <div class="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left">
          <label class="block text-xs font-bold text-slate-900 mb-2 uppercase">Tambah Deposit Vault</label>
          <input type="number" id="vault-amount" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Masukkan Nominal...">
          <button id="do-vault-deposit" class="w-full mt-4 bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-colors">Proses Deposit</button>
        </div>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
        <h3 class="text-base font-bold text-slate-900 mb-4">Riwayat Alokasi</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center p-4 border-b border-slate-50">
            <div><div class="font-bold text-slate-900">Initial Allocation</div><div class="text-[10px] text-slate-400">27 Apr 2026 • SYSTEM</div></div>
            <div class="font-black text-green-600">+Rp 1M</div>
          </div>
        </div>
      </div>
    </div>`;
}

function renderTransactions() {
  const txs = appState?.transactions?.history || [];
  return `
    <div class="mb-8">
      <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Semua Transaksi</h1>
      <p class="text-slate-500 mt-1">Audit log aktivitas finansial ekosistem.</p>
    </div>
    <div class="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
      <div class="p-4 flex justify-between bg-slate-50/50">
        <input type="text" placeholder="Cari transaksi..." class="px-4 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-64">
      </div>
      <div class="px-3">
        <div class="grid grid-cols-[2fr_1fr_1fr_1fr_auto] p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
          <div>Deskripsi</div><div>Kategori</div><div>Nominal</div><div>Tanggal</div><div>Status</div>
        </div>
        ${txs.map(t => `
          <div class="grid grid-cols-[2fr_1fr_1fr_1fr_auto] p-4 border-b border-slate-50 items-center text-sm">
            <div class="font-bold text-slate-900">${t.title}</div>
            <div class="text-slate-500">${t.category}</div>
            <div class="font-black ${t.type === 'debit' ? 'text-slate-900' : 'text-green-600'}">${t.type === 'debit' ? '-' : '+'}${formatIDR(t.amount)}</div>
            <div class="text-xs text-slate-400">${t.date}</div>
            <div class="bg-green-100 text-green-700 text-[9px] font-black px-2 py-1 rounded">SUKSES</div>
          </div>
        `).join('')}
      </div>
    </div>`;
}

function renderUsers() {
  return `
    <div class="mb-8">
      <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Monitor Nasabah</h1>
      <p class="text-slate-500 mt-1">Pantau identitas dan status akun.</p>
    </div>
    <div class="grid grid-cols-3 gap-6 mb-8">
      <div class="bg-white p-6 rounded-xl shadow border border-slate-100"><div class="text-xs font-bold text-slate-400 uppercase mb-1">Total Nasabah</div><div class="text-2xl font-black text-slate-900">1,284</div></div>
      <div class="bg-white p-6 rounded-xl shadow border border-slate-100"><div class="text-xs font-bold text-slate-400 uppercase mb-1">Nasabah Aktif</div><div class="text-2xl font-black text-green-600">342</div></div>
      <div class="bg-white p-6 rounded-xl shadow border border-slate-100"><div class="text-xs font-bold text-slate-400 uppercase mb-1">Pending KYC</div><div class="text-2xl font-black text-amber-600">12</div></div>
    </div>
    <div class="bg-white rounded-xl shadow-md border border-slate-100 p-4">
       <p class="text-slate-400 text-sm text-center py-10 italic">Data nasabah terpusat di modul Identity Management.</p>
    </div>`;
}

function attachEvents() {
  // Tab Switching
  document.querySelectorAll('.menu-item[data-tab], .nav-to-tab').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      currentTab = el.getAttribute('data-tab');
      renderMainLayout();
    });
  });

  // Vault Actions
  document.getElementById('do-vault-deposit')?.addEventListener('click', () => {
    const input = document.getElementById('vault-amount');
    const amount = parseInt(input.value);
    if (amount > 0) {
      bankVaultBalance += amount;
      showToast(`Deposit ${formatIDR(amount)} Berhasil!`);
      renderMainLayout();
    } else {
      showToast('Masukkan nominal valid!', 'error');
    }
  });

  // Approval Actions
  document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const isApprove = btn.getAttribute('data-action') === 'approve';
      const row = btn.closest('.grid');
      row.style.transition = 'all 0.3s ease';
      row.style.opacity = '0';
      row.style.transform = 'translateX(20px)';
      setTimeout(() => {
        row.remove();
        showToast(isApprove ? 'Transaksi Disetujui' : 'Transaksi Ditolak', isApprove ? 'success' : 'error');
      }, 300);
    });
  });

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '/manager-login.html';
  });
}

bootstrap();
