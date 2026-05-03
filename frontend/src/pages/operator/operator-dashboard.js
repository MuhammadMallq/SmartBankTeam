import '../../styles/style.css';
import { ICONS, showToast } from '../../utils/ui-core.js';

/**
 * SMARTBANK OPERATOR DASHBOARD
 * Support portal for managing customer tickets and service queue.
 */

let appState = null;

async function bootstrap() {
  try {
    const res = await fetch('/dummy_data.json');
    appState = await res.json();
    renderOperatorUI();
  } catch (e) {
    document.querySelector('#app').innerHTML = '<div class="p-10 text-teal-800 font-bold">SYSTEM_ERR: Failed to initialize support portal.</div>';
    console.error(e);
  }
}

function renderOperatorUI() {
  document.querySelector('#app').innerHTML = `
  <div class="dashboard-layout fade-in">
    <aside class="sidebar bg-teal-600">
      <div class="sidebar-logo bg-teal-800">${ICONS.bank}</div>
      <nav class="sidebar-menu">
        <a href="#" class="menu-item active text-white" title="Support Queue">${ICONS.reports}</a>
        <a href="#" class="menu-item text-white/70" title="Customer Lookup">${ICONS.users}</a>
      </nav>
      <div class="sidebar-bottom">
        <a href="/operator-login.html" id="logoutBtn" class="menu-item text-rose-300" title="Keluar Operator">${ICONS.logout}</a>
        <div class="sidebar-user-avatar bg-teal-800 text-white">O</div>
      </div>
    </aside>

    <div class="main-area bg-teal-50/30">
      <nav class="topnav bg-white border-b border-slate-100">
        <div class="topnav-brand text-teal-600 font-black">SmartBank <span class="font-normal text-slate-500 ml-2">Support Portal</span></div>
        <div class="topnav-search max-w-md">
          ${ICONS.search}
          <input type="text" placeholder="Lookup Customer ID or Name..." class="bg-slate-50 border-slate-200" />
        </div>
        <div class="topnav-actions">
          <div class="topnav-icon-btn border-slate-200 text-slate-400 relative">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            <div class="notif-dot bg-teal-600 border-white"></div>
          </div>
          <div class="topnav-user flex items-center gap-2">
            <div class="topnav-user-avatar bg-teal-600 text-white">O</div>
            <span class="text-sm font-bold text-slate-700">Operator Support</span>
          </div>
        </div>
      </nav>

      <div class="page-content p-8">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-2xl font-black text-teal-900 tracking-tight">Active Support Tickets</h1>
          <button class="bg-teal-600 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-teal-700 transition-colors">+ New Ticket</button>
        </div>

        <div class="grid grid-cols-3 gap-6 mb-8">
          ${renderStatCard('Open Tickets', '24', '12 Urgent', 'teal')}
          ${renderStatCard('Avg. Response Time', '1.4m', 'Last hour', 'cyan')}
          ${renderStatCard('Resolved Today', '86', 'Goal: 100', 'green')}
        </div>

        <div class="bg-white shadow-lg rounded-2xl overflow-hidden border border-slate-100">
          <div class="p-6 border-b border-slate-50 flex justify-between items-center">
            <h2 class="text-base font-black text-slate-900">Live Service Queue</h2>
            <span class="text-xs text-teal-600 font-bold uppercase tracking-widest">4 Clients Waiting</span>
          </div>
          <div class="px-6">
            <div class="grid grid-cols-[1.5fr_1fr_1fr_auto] py-4 border-b-2 border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <div>Nasabah</div><div>Issue</div><div>Waiting</div><div class="text-right pr-4">Action</div>
            </div>
            ${renderTicketList()}
          </div>
        </div>
      </div>
    </div>
  </div>`;

  attachEvents();
}

function renderStatCard(label, value, sub, color) {
  const colorMap = {
    teal: 'border-teal-600 text-teal-600',
    cyan: 'border-cyan-600 text-cyan-600',
    green: 'border-green-600 text-green-600'
  };
  return `
    <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 ${colorMap[color] || 'border-slate-400'}">
      <div class="text-xs font-bold text-slate-400 uppercase mb-1">${label}</div>
      <div class="text-3xl font-black text-slate-900">${value}</div>
      <div class="text-[10px] font-bold mt-1">${sub}</div>
    </div>`;
}

function renderTicketList() {
  const tickets = [
    { name: 'Bapak Budi Santoso', issue: 'Password Reset', time: '2m ago' },
    { name: 'Ibu Siti Aminah', issue: 'Transfer Failed', time: '5m ago' },
    { name: 'Joko Widodo', issue: 'Account Limit', time: '8m ago' },
    { name: 'Prabowo Subianto', issue: 'New Card Req', time: '12m ago' },
  ];

  return tickets.map(t => `
    <div class="grid grid-cols-[1.5fr_1fr_1fr_auto] items-center py-4 border-b border-slate-50 last:border-0">
      <div class="font-bold text-slate-900 text-sm">${t.name}</div>
      <div><span class="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-[10px] font-black uppercase">${t.issue}</span></div>
      <div class="text-slate-500 text-xs">${t.time}</div>
      <button class="btn-serve bg-teal-600 text-white font-bold py-1.5 px-4 rounded-lg text-xs hover:scale-105 active:scale-95 transition-all">Serve Now</button>
    </div>
  `).join('');
}

function attachEvents() {
  document.querySelectorAll('.btn-serve').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('.grid');
      row.style.backgroundColor = '#f0fdf4';
      btn.textContent = 'Serving...';
      btn.className = 'bg-green-600 text-white font-bold py-1.5 px-4 rounded-lg text-xs';
      showToast('Melayani nasabah: ' + row.querySelector('.font-bold').textContent);
    });
  });

  document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '/operator-login.html';
  });
}

bootstrap();
