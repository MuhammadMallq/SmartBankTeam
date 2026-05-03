import '../../styles/style.css';
import { ICONS, showToast, formatIDR } from '../../utils/ui-core.js';

/**
 * SMARTBANK TELLER DASHBOARD
 * Transaction desk for handling cash deposits and withdrawals.
 */

async function bootstrap() {
  renderTellerUI();
}

function renderTellerUI() {
  document.querySelector('#app').innerHTML = `
  <div class="dashboard-layout fade-in">
    <aside class="sidebar bg-indigo-700">
      <div class="sidebar-logo bg-indigo-900">${ICONS.bank}</div>
      <nav class="sidebar-menu">
        <a href="#" class="menu-item active text-white" title="Teller Desk">${ICONS.vault}</a>
        <a href="#" class="menu-item text-white/70" title="Transaction Journal">${ICONS.activity}</a>
      </nav>
      <div class="sidebar-bottom">
        <a href="/teller-login.html" id="logoutBtn" class="menu-item text-rose-300" title="Logout">${ICONS.logout}</a>
        <div class="sidebar-user-avatar bg-indigo-900 text-white">T</div>
      </div>
    </aside>

    <div class="main-area bg-indigo-50/50">
      <nav class="topnav bg-white border-b border-slate-100">
        <div class="topnav-brand text-indigo-600 font-black">SmartBank <span class="font-normal text-slate-500 ml-2">Teller Dashboard</span></div>
        <div class="topnav-actions flex items-center gap-4">
          <div class="topnav-user flex items-center gap-2">
            <div class="topnav-user-avatar bg-indigo-600 text-white">T</div>
            <span class="text-sm font-bold text-slate-700">Bank Teller 01</span>
          </div>
        </div>
      </nav>

      <div class="page-content p-8">
        <h1 class="text-2xl font-black text-indigo-900 tracking-tight mb-8">Teller Transaction Desk</h1>

        <div class="grid grid-cols-3 gap-6 mb-8">
          ${renderStatCard('Cash on Hand', 'Rp 12.500.000', 'Safe & Secure', 'indigo')}
          ${renderStatCard('Setoran (Deposits)', '84', 'Total processed today', 'green')}
          ${renderStatCard('Tarikan (Withdrawals)', '58', 'Total processed today', 'red')}
        </div>
        
        <div class="grid grid-cols-2 gap-8">
          <div class="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-100">
            <div class="bg-green-50/50 p-5 border-b border-green-100">
              <h2 class="text-base font-black text-green-800">Setor Tunai (Cash Deposit)</h2>
            </div>
            <form id="form-deposit" class="p-6 space-y-4">
              <div class="form-group">
                <label class="text-green-800">No. Rekening Nasabah</label>
                <input type="text" placeholder="Masukkan ID Nasabah..." required class="border-green-100" />
              </div>
              <div class="form-group">
                <label class="text-green-800">Nominal Uang (IDR)</label>
                <input type="number" placeholder="Rp 0" required class="border-green-100 text-2xl font-bold" />
              </div>
              <button type="submit" class="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2">
                ${ICONS.plus} Konfirmasi Setoran
              </button>
            </form>
          </div>

          <div class="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-100">
            <div class="bg-red-50/50 p-5 border-b border-red-100">
              <h2 class="text-base font-black text-red-800">Tarik Tunai (Cash Withdrawal)</h2>
            </div>
            <form id="form-withdraw" class="p-6 space-y-4">
              <div class="form-group">
                <label class="text-red-800">No. Rekening Nasabah</label>
                <input type="text" placeholder="Masukkan ID Nasabah..." required class="border-red-100" />
              </div>
              <div class="form-group">
                <label class="text-red-800">Nominal Uang (IDR)</label>
                <input type="number" placeholder="Rp 0" required class="border-red-100 text-2xl font-bold" />
              </div>
              <button type="submit" class="w-full bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                ${ICONS.minus} Konfirmasi Penarikan
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>`;

  attachEvents();
}

function renderStatCard(label, value, sub, color) {
  const colorMap = {
    indigo: 'border-indigo-600',
    green: 'border-green-600',
    red: 'border-red-600'
  };
  return `
    <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 ${colorMap[color]}">
      <div class="text-xs font-bold text-slate-400 uppercase mb-1">${label}</div>
      <div class="text-2xl font-black text-slate-900">${value}</div>
      <div class="text-[10px] font-bold mt-1 text-slate-500">${sub}</div>
    </div>`;
}

function attachEvents() {
  document.getElementById('form-deposit')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Setoran tunai berhasil diproses!');
    e.target.reset();
  });

  document.getElementById('form-withdraw')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Penarikan tunai berhasil diproses!', 'info');
    e.target.reset();
  });

  document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '/teller-login.html';
  });
}

bootstrap();
