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
  const token = localStorage.getItem('token');
  
  if (!loggedInStr || !token) {
    window.location.href = '/manager-login.html';
    return;
  }
  const managerUser = JSON.parse(loggedInStr);

  appState = { manager: managerUser, transactions: { history: [] }, stats: null, users: [] };

  try {
    const headers = { 'Authorization': `Bearer ${token}` };
    const [ledgersRes, statsRes, usersRes] = await Promise.all([
      fetch('http://localhost:3000/api/admin/ledgers', { headers }),
      fetch('http://localhost:3000/api/admin/stats', { headers }),
      fetch('http://localhost:3000/api/admin/users', { headers })
    ]);

    if (ledgersRes.ok) {
      const ledgers = await ledgersRes.json();
      appState.transactions.history = ledgers.map(l => ({
        title: l.description,
        category: l.app,
        type: l.type === 'CASH_WITHDRAWAL' || l.type === 'TRANSFER_OUT' || l.type === 'PAYMENT' ? 'debit' : 'credit',
        amount: l.amount,
        date: new Date(l.timestamp).toLocaleDateString()
      }));
    }
    
    if (statsRes.ok) appState.stats = await statsRes.json();
    if (usersRes.ok) appState.users = await usersRes.json();
    
    // Set bank vault real
    if (appState.stats) {
       bankVaultBalance = 1000000000 - (appState.stats.totalBalance || 0);
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

    <div class="main-area bg-[#f8fafc] w-full min-h-screen">
      <nav class="topnav sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-8 py-4 flex justify-between items-center">
        <div class="topnav-brand font-extrabold tracking-tight text-xl">
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Smart</span>Bank <span class="font-normal text-slate-400 ml-2">Manager Panel</span>
        </div>
        <div class="topnav-actions flex items-center gap-6">
          <div class="relative cursor-pointer hover:bg-slate-50 p-2 rounded-full transition-colors text-slate-500">
            ${ICONS.reports}
            <div class="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></div>
          </div>
          <div class="flex items-center gap-3 bg-white border border-slate-200 shadow-sm rounded-full pl-2 pr-4 py-1.5 cursor-pointer hover:shadow-md transition-shadow">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-inner">M</div>
            <div class="flex flex-col">
              <span class="text-sm font-bold text-slate-800 leading-tight">${appState?.manager?.name || 'Manager Ops'}</span>
              <span class="text-[10px] text-slate-500 font-medium">Operational Authority</span>
            </div>
          </div>
        </div>
      </nav>

      <div class="page-content p-8 max-w-7xl mx-auto" id="tab-content">
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

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      ${renderStatCard('Total Transaksi', appState?.stats?.totalTransactions?.toLocaleString() || '0', 'Realtime', ICONS.activity, 'blue')}
      ${renderStatCard('Global Bank Vault', formatIDR(bankVaultBalance), 'Safe', ICONS.vault, 'dark')}
      ${renderStatCard('Fee Bank (Pendapatan)', formatIDR(appState?.stats?.totalFeesCollected || 0), 'Profit', ICONS.bank, 'green')}
    </div>

    <div class="table-card bg-white shadow-xl shadow-slate-200/40 rounded-2xl overflow-hidden border border-slate-100">
      <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-white to-slate-50">
        <div>
          <h2 class="text-lg font-extrabold text-slate-900">Antrian Persetujuan Strategis</h2>
          <p class="text-xs text-slate-500 mt-0.5">Membutuhkan otorisasi manajerial untuk transaksi di atas Rp 500.000</p>
        </div>
        <button class="nav-to-tab px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-colors shadow-sm" data-tab="transactions">Lihat Semua Log</button>
      </div>
      <div class="p-2">
        ${renderApprovalTable()}
      </div>
    </div>`;
}

function renderStatCard(label, value, trend, icon, theme) {
  const isDark = theme === 'dark';
  return `
    <div class="stat-card shadow-lg p-6 rounded-2xl border border-slate-100/50 ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white' : 'bg-white text-slate-900'} relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
      <div class="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br from-white/5 to-white/0 group-hover:scale-150 transition-transform duration-500"></div>
      <div class="flex justify-between items-start mb-4 relative z-10">
        <div class="p-3 rounded-xl ${isDark ? 'bg-white/10 text-white shadow-inner' : 'bg-blue-50/80 text-blue-600 border border-blue-100/50'}">${icon}</div>
        <div class="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${trend === 'Realtime' ? 'bg-blue-100 text-blue-700' : trend === 'Safe' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'}">${trend}</div>
      </div>
      <div class="${isDark ? 'text-slate-400' : 'text-slate-500'} text-xs font-bold mb-1 uppercase tracking-widest relative z-10">${label}</div>
      <div class="text-3xl font-black tracking-tight relative z-10 ${isDark ? 'text-white' : 'bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700'}">${value}</div>
    </div>`;
}

function renderApprovalTable() {
  const bigTransactions = (appState?.transactions?.history || [])
    .filter(t => t.amount > 500000)
    .slice(0, 5);

  if (bigTransactions.length === 0) {
    return `
      <div class="p-12 flex flex-col items-center justify-center text-center">
        <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-inner">
          <span class="text-slate-300 opacity-50 transform scale-150">${ICONS.check}</span>
        </div>
        <h3 class="text-lg font-bold text-slate-800">Clear! Tidak Ada Antrian</h3>
        <p class="text-slate-400 text-sm mt-1 max-w-sm">Semua transaksi strategis telah diaudit atau belum ada transaksi besar yang memerlukan persetujuan manajer hari ini.</p>
      </div>`;
  }

  return `
    <div class="grid-table">
      <div class="grid grid-cols-[1.5fr_1fr_1fr_auto] border-b border-slate-100 p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
        <div>Deskripsi</div><div>Nominal</div><div>Kategori</div><div class="text-right pr-6">Keputusan</div>
      </div>
      ${bigTransactions.map(a => `
        <div class="grid grid-cols-[1.5fr_1fr_1fr_auto] items-center p-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600">${ICONS.activity}</div>
            <div class="flex flex-col"><span class="font-bold text-sm text-slate-900">${a.title}</span><span class="text-[10px] text-slate-500">${a.date}</span></div>
          </div>
          <div class="text-green-600 font-extrabold">${formatIDR(a.amount)}</div>
          <div class="text-slate-700 text-sm font-medium">${a.category}</div>
          <div class="flex gap-2">
            <button class="action-btn bg-green-600 text-white rounded-lg w-9 h-9 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform" data-action="approve" onclick="showToast('Transaksi diapprove!', 'success'); this.closest('.grid').remove();">${ICONS.check}</button>
            <button class="action-btn bg-red-600 text-white rounded-lg w-9 h-9 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform" data-action="reject" onclick="showToast('Transaksi ditolak.', 'error'); this.closest('.grid').remove();">${ICONS.x}</button>
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
  const users = appState?.users || [];
  const total = users.filter(u => u.role === 'user').length;
  const active = users.filter(u => u.role === 'user' && u.status === 'verified').length;
  const pending = users.filter(u => u.role === 'user' && u.status !== 'verified').length;

  return `
    <div class="mb-8">
      <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Monitor Nasabah</h1>
      <p class="text-slate-500 mt-1">Pantau identitas dan status akun.</p>
    </div>
    <div class="grid grid-cols-3 gap-6 mb-8">
      <div class="bg-white p-6 rounded-xl shadow border border-slate-100"><div class="text-xs font-bold text-slate-400 uppercase mb-1">Total Nasabah</div><div class="text-2xl font-black text-slate-900">${total}</div></div>
      <div class="bg-white p-6 rounded-xl shadow border border-slate-100"><div class="text-xs font-bold text-slate-400 uppercase mb-1">Nasabah Aktif</div><div class="text-2xl font-black text-green-600">${active}</div></div>
      <div class="bg-white p-6 rounded-xl shadow border border-slate-100"><div class="text-xs font-bold text-slate-400 uppercase mb-1">Pending KYC</div><div class="text-2xl font-black text-amber-600">${pending}</div></div>
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
