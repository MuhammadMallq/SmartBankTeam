import { ICONS, showToast, formatIDR } from '../../utils/ui-core.js';
import {
  addQueueItem,
  createCustomerWithAccount,
  createServiceTicket,
  getCustomerDetail,
  getCustomerServiceSummary,
  getLedgerForAccount,
  getOperationalState,
  getQueue,
  getRecentLedger,
  getTickets,
  lookupAccount,
  resolveCustomerLookup,
  subscribeOperationalStore,
  unlockAccount,
  updateCustomerContact,
  updateQueueStatus,
  updateServiceTicketStatus
} from '../../utils/smartbank-ops-store.js';

let selectedCustomerId = 'CST-001';
let selectedAccountNo = '1002003001';
let lastSearch = '';
let balanceInquiryAccountNo = '1002003001';

async function bootstrap() {
  const { syncWithBackend } = await import('../../utils/smartbank-ops-store.js');
  await syncWithBackend();
  renderCSUI();
  subscribeOperationalStore(() => renderCSUI());
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

function statusBadge(status) {
  const className = {
    AKTIF: 'success',
    BLOKIR: 'danger',
    OPEN: 'danger',
    IN_PROGRESS: 'warning',
    DONE: 'success',
    WAITING: 'warning',
    CALLED: 'info'
  }[status] || 'info';

  const label = {
    AKTIF: 'Aktif',
    BLOKIR: 'Blokir',
    OPEN: 'Baru',
    IN_PROGRESS: 'Diproses',
    DONE: 'Selesai',
    WAITING: 'Menunggu',
    CALLED: 'Dipanggil'
  }[status] || status;

  return `<span class="ops-badge ${className}">${label}</span>`;
}

function transactionLabel(type) {
  return {
    CASH_DEPOSIT: 'Setor Tunai',
    CASH_WITHDRAWAL: 'Tarik Tunai',
    TRANSFER_OUT: 'Transfer Keluar',
    TRANSFER_IN: 'Transfer Masuk',
    ACCOUNT_OPENING_DEPOSIT: 'Setoran Awal',
    SERVICE_ADJUSTMENT: 'Layanan CS',
    ACCOUNT_UNLOCK: 'Aktivasi Rekening'
  }[type] || type;
}

function signedAmount(entry) {
  if (entry.direction === 'CREDIT') return `<span class="ops-money credit">+${formatIDR(entry.amount)}</span>`;
  if (entry.direction === 'DEBIT') return `<span class="ops-money debit">-${formatIDR(entry.totalDebit || entry.amount)}</span>`;
  return '<span class="ops-muted">-</span>';
}

function getCurrentContext(state) {
  let customer = getCustomerDetail(selectedCustomerId, state);

  if (!customer && state.customers.length) {
    selectedCustomerId = state.customers[0].id;
    customer = getCustomerDetail(selectedCustomerId, state);
  }

  let account = customer?.accounts.find((item) => item.accountNo === selectedAccountNo);
  if (!account && customer?.accounts.length) {
    account = customer.accounts[0];
    selectedAccountNo = account.accountNo;
  }

  return {
    customer,
    account,
    ledger: account ? getLedgerForAccount(account.accountNo, 8, state) : []
  };
}

function renderCSUI() {
  const state = getOperationalState();
  const summary = getCustomerServiceSummary(state);
  const queue = getQueue(state);
  const tickets = getTickets(state);
  const recentLedger = getRecentLedger(7, state);
  const { customer, account, ledger } = getCurrentContext(state);
  const balanceInquiry = balanceInquiryAccountNo ? lookupAccount(balanceInquiryAccountNo, state) : null;

  document.querySelector('#app').innerHTML = `
  <div class="dashboard-layout fade-in premium-bg">
    <aside class="sidebar">
      <div class="sidebar-logo" style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);">${ICONS.users}</div>
      <nav class="sidebar-menu">
        <a href="#" class="menu-item active" title="Customer Service">${ICONS.users}</a>
        <a href="#" class="menu-item" title="Saldo dan Rekening">${ICONS.search}</a>
        <a href="#" class="menu-item" title="Ledger">${ICONS.database}</a>
      </nav>
      <div class="sidebar-bottom">
        <a href="/login.html" id="logoutBtn" class="menu-item" style="color: #f87171;" title="Logout">${ICONS.logout}</a>
        <div class="sidebar-user-avatar" style="background: rgba(255,255,255,0.1); color: white;">CS</div>
      </div>
    </aside>

    <div class="main-area">
      <nav class="topnav">
        <div class="topnav-brand">
          <span style="color:#a78bfa">${ICONS.bank}</span>
          SmartBank <span style="font-weight:400; opacity:0.6; margin-left:8px;">Customer Service</span>
        </div>
        <div class="topnav-actions">
          <span class="ops-live-chip">Live ${formatDateTime(summary.lastUpdated)}</span>
          <div class="topnav-user">
            <div class="topnav-user-avatar" style="background: rgba(167, 139, 250, 0.2); color: #a78bfa;">CS</div>
            <span class="topnav-user-name">CS Officer 01</span>
          </div>
        </div>
      </nav>

      <div class="page-content">
        <div class="ops-page-head">
          <div>
            <h1 class="page-heading">Customer Service Desk</h1>
            <p class="ops-subtitle">Layanan nasabah, cek saldo, tabungan, tiket, dan antrean operasional.</p>
          </div>
          <div class="ops-current-account">
            <span>Rekening aktif</span>
            <strong>${account ? account.accountNo : '-'}</strong>
          </div>
        </div>

        <div class="grid-4 mb-8">
          ${renderStat('Total Nasabah', summary.totalCustomers, 'Data aktif di aplikasi', 'info')}
          ${renderStat('Rekening Aktif', summary.activeAccounts, 'Tabungan dan giro', 'green')}
          ${renderStat('Antrean Menunggu', summary.waitingQueue, 'Layanan CS', 'amber')}
          ${renderStat('Tiket Aktif', summary.openTickets, 'Belum selesai', 'red')}
        </div>

        <div class="ops-workspace mb-8">
          <div class="glass-panel">
            <div class="glass-panel-header">
              <div class="glass-panel-icon">${ICONS.search}</div>
              <h2 class="glass-panel-title text-gradient">Inquiry Nasabah dan Rekening</h2>
            </div>
            <div class="glass-body">
              <form id="form-cs-search" class="ops-search-row">
                <input id="cs-search" class="glass-input" type="text" value="${escapeHtml(lastSearch)}" placeholder="Nama, NIK, ID nasabah, atau nomor rekening" />
                <button class="btn-glow ops-fit-btn" type="submit">${ICONS.search} Cari</button>
              </form>

              ${customer ? renderCustomerProfile(customer, account, ledger) : renderEmpty('Tidak ada nasabah terpilih.')}
            </div>
          </div>

          <div class="ops-side-stack">
            <div class="glass-panel">
              <div class="glass-panel-header">
                <div class="glass-panel-icon" style="color:#34d399;">${ICONS.bank}</div>
                <h2 class="glass-panel-title text-gradient-green">Cek Saldo Rekening</h2>
              </div>
              <div class="glass-body">
                <form id="form-balance-check" class="ops-mini-form">
                  <label class="glass-label">Nomor Rekening</label>
                  <div class="ops-search-row compact">
                    <input id="balance-account-no" class="glass-input" type="text" value="${escapeHtml(balanceInquiryAccountNo)}" placeholder="Contoh: 1002003001" />
                    <button class="btn-glow green ops-fit-btn" type="submit">${ICONS.check}</button>
                  </div>
                </form>
                ${balanceInquiry ? renderBalanceInquiry(balanceInquiry) : renderEmpty('Masukkan nomor rekening untuk melihat saldo.')}
              </div>
            </div>

            <div class="glass-panel">
              <div class="glass-panel-header">
                <div class="glass-panel-icon" style="color:#fbbf24;">${ICONS.users}</div>
                <h2 class="glass-panel-title">Registrasi dan Pemeliharaan</h2>
              </div>
              <form id="form-onboarding" class="glass-body ops-form-grid">
                <div>
                  <label class="glass-label">Tindakan</label>
                  <select name="action" class="glass-select">
                    <option value="open">Buka Rekening Baru</option>
                    <option value="update">Update Kontak Nasabah Terpilih</option>
                    <option value="unlock">Aktifkan Rekening Terblokir</option>
                  </select>
                </div>
                <div>
                  <label class="glass-label">Nomor Rekening</label>
                  <input name="accountNo" class="glass-input" value="${account ? account.accountNo : ''}" placeholder="Untuk aktivasi rekening" />
                </div>
                <div>
                  <label class="glass-label">Nama Nasabah</label>
                  <input name="name" class="glass-input" placeholder="Untuk pembukaan rekening" />
                </div>
                <div>
                  <label class="glass-label">NIK</label>
                  <input name="nik" class="glass-input" placeholder="Nomor identitas" />
                </div>
                <div>
                  <label class="glass-label">Email</label>
                  <input name="email" class="glass-input" type="email" value="${customer ? escapeHtml(customer.email) : ''}" placeholder="email@domain.local" />
                </div>
                <div>
                  <label class="glass-label">Telepon</label>
                  <input name="phone" class="glass-input" value="${customer ? escapeHtml(customer.phone) : ''}" placeholder="08xx" />
                </div>
                <div>
                  <label class="glass-label">Produk</label>
                  <select name="product" class="glass-select">
                    <option value="Tabungan Smart">Tabungan Smart</option>
                    <option value="Tabungan Payroll">Tabungan Payroll</option>
                    <option value="Giro Usaha">Giro Usaha</option>
                  </select>
                </div>
                <div>
                  <label class="glass-label">Setoran Awal</label>
                  <input name="initialDeposit" class="glass-input" type="number" min="0" placeholder="0" />
                </div>
                <div class="ops-full">
                  <label class="glass-label">Alamat</label>
                  <textarea name="address" class="glass-input ops-textarea" rows="2" placeholder="Alamat nasabah">${customer ? escapeHtml(customer.address) : ''}</textarea>
                </div>
                <button type="submit" class="btn-glow amber ops-full">${ICONS.check} Proses Layanan Akun</button>
              </form>
            </div>
          </div>
        </div>

        <div class="grid-2 mb-8">
          <div class="glass-panel">
            <div class="glass-panel-header">
              <div class="glass-panel-icon" style="color:#60a5fa;">${ICONS.users}</div>
              <h2 class="glass-panel-title">Antrean Layanan</h2>
            </div>
            <div class="glass-body">
              <form id="form-queue" class="ops-ticket-form">
                <select name="service" class="glass-select">
                  <option value="Informasi Saldo">Informasi Saldo</option>
                  <option value="Aktivasi Rekening">Aktivasi Rekening</option>
                  <option value="Keluhan Transaksi">Keluhan Transaksi</option>
                  <option value="Pembukaan Rekening">Pembukaan Rekening</option>
                </select>
                <input name="notes" class="glass-input" placeholder="Catatan singkat" />
                <button class="btn-glow ops-fit-btn" type="submit">Tambah</button>
              </form>
              <div class="ops-scroll-list">
                ${queue.length ? queue.map(renderQueueItem).join('') : renderEmpty('Belum ada antrean.')}
              </div>
            </div>
          </div>

          <div class="glass-panel">
            <div class="glass-panel-header">
              <div class="glass-panel-icon" style="color:#f87171;">${ICONS.reports}</div>
              <h2 class="glass-panel-title">Tiket Nasabah</h2>
            </div>
            <div class="glass-body">
              <form id="form-ticket" class="ops-ticket-form">
                <select name="category" class="glass-select">
                  <option value="Kartu ATM">Kartu ATM</option>
                  <option value="Mutasi Rekening">Mutasi Rekening</option>
                  <option value="Aktivasi Rekening">Aktivasi Rekening</option>
                  <option value="Keluhan Transaksi">Keluhan Transaksi</option>
                </select>
                <select name="priority" class="glass-select">
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">Prioritas</option>
                </select>
                <input name="note" class="glass-input" placeholder="Catatan tiket" />
                <button class="btn-glow red ops-fit-btn" type="submit">Buat</button>
              </form>
              <div class="ops-scroll-list">
                ${tickets.slice(0, 6).map(renderTicketItem).join('')}
              </div>
            </div>
          </div>
        </div>

        <div class="glass-panel">
          <div class="glass-panel-header">
            <div class="glass-panel-icon" style="color:#94a3b8;">${ICONS.database}</div>
            <h2 class="glass-panel-title">Ledger Operasional Terbaru</h2>
            <span class="glass-badge success" style="margin-left:auto;">Read Only</span>
          </div>
          <div class="glass-body">
            ${renderLedgerTable(recentLedger)}
          </div>
        </div>
      </div>
    </div>
  </div>`;

  attachEvents();
}

function renderStat(label, value, sub, tone) {
  const className = tone === 'green' ? 'green' : tone === 'red' ? 'red' : tone === 'amber' ? 'amber' : '';
  return `
    <div class="glass-stat ${className}">
      <div class="glass-stat-label">${label}</div>
      <div class="glass-stat-value">${value}</div>
      <div class="glass-stat-sub">${sub}</div>
    </div>`;
}

function renderCustomerProfile(customer, account, ledger) {
  return `
    <div class="ops-profile">
      <div class="ops-profile-header">
        <div>
          <div class="ops-kicker">${escapeHtml(customer.id)} - ${escapeHtml(customer.segment)}</div>
          <h2>${escapeHtml(customer.name)}</h2>
          <div class="ops-profile-meta">
            <span>${escapeHtml(customer.nik)}</span>
            <span>${escapeHtml(customer.phone || '-')}</span>
            <span>${escapeHtml(customer.email || '-')}</span>
          </div>
        </div>
        ${statusBadge(customer.status)}
      </div>

      <div class="ops-profile-grid">
        <div>
          <span class="glass-label">Alamat</span>
          <strong>${escapeHtml(customer.address || '-')}</strong>
        </div>
        <div>
          <span class="glass-label">Risk</span>
          <strong>${escapeHtml(customer.risk)}</strong>
        </div>
        <div>
          <span class="glass-label">Terdaftar</span>
          <strong>${escapeHtml(customer.joinedAt)}</strong>
        </div>
      </div>

      <div class="ops-section-title">Daftar Tabungan Nasabah</div>
      <div class="ops-account-grid">
        ${customer.accounts.map((item) => renderAccountCard(item, item.accountNo === account?.accountNo)).join('')}
      </div>

      ${account ? `
        <div class="ops-selected-balance">
          <div>
            <span class="glass-label">Saldo Rekening ${account.accountNo}</span>
            <strong>${formatIDR(account.balance)}</strong>
          </div>
          ${statusBadge(account.status)}
        </div>
        <div class="ops-section-title">Mutasi Rekening Terpilih</div>
        ${renderLedgerTable(ledger)}
      ` : renderEmpty('Nasabah belum memiliki rekening.')}
    </div>`;
}

function renderAccountCard(account, active) {
  return `
    <button type="button" class="ops-account-card ${active ? 'active' : ''}" data-account-no="${account.accountNo}">
      <span>${escapeHtml(account.product)}</span>
      <strong>${formatIDR(account.balance)}</strong>
      <small>${account.accountNo} - ${account.type}</small>
      ${statusBadge(account.status)}
    </button>`;
}

function renderBalanceInquiry(detail) {
  return `
    <div class="ops-balance-result">
      <div class="ops-kicker">${escapeHtml(detail.customer.name)}</div>
      <div class="ops-balance-number">${formatIDR(detail.account.balance)}</div>
      <div class="ops-profile-meta">
        <span>${detail.account.accountNo}</span>
        <span>${escapeHtml(detail.account.product)}</span>
        ${statusBadge(detail.account.status)}
      </div>
    </div>`;
}

function renderLedgerTable(entries) {
  return `
    <div class="glass-table-container">
      <table class="glass-table ops-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Waktu</th>
            <th>Rekening</th>
            <th>Aktivitas</th>
            <th style="text-align:right;">Nominal</th>
            <th style="text-align:right;">Saldo</th>
          </tr>
        </thead>
        <tbody>
          ${entries.length ? entries.map((entry) => `
            <tr>
              <td class="ops-mono">${entry.id}</td>
              <td>${formatDateTime(entry.timestamp)}</td>
              <td class="ops-mono">${entry.accountNo}</td>
              <td>
                <strong>${transactionLabel(entry.type)}</strong>
                <div class="ops-muted">${escapeHtml(entry.description)}</div>
              </td>
              <td style="text-align:right;">${signedAmount(entry)}</td>
              <td style="text-align:right; font-weight:700;">${formatIDR(entry.balanceAfter)}</td>
            </tr>
          `).join('') : `<tr><td colspan="6">${renderEmpty('Belum ada mutasi.')}</td></tr>`}
        </tbody>
      </table>
    </div>`;
}

function renderQueueItem(item) {
  return `
    <div class="ops-list-item">
      <div class="ops-list-main">
        <div class="ops-list-title">${item.number} - ${escapeHtml(item.customer?.name || 'Nasabah')}</div>
        <div class="ops-muted">${escapeHtml(item.service)} - ${escapeHtml(item.notes || 'Tanpa catatan')}</div>
      </div>
      <div class="ops-list-actions">
        ${statusBadge(item.status)}
        ${item.status !== 'DONE' ? `
          <button class="ops-mini-btn" data-queue-status="CALLED" data-queue-id="${item.id}">Panggil</button>
          <button class="ops-mini-btn success" data-queue-status="DONE" data-queue-id="${item.id}">Selesai</button>
        ` : ''}
      </div>
    </div>`;
}

function renderTicketItem(ticket) {
  return `
    <div class="ops-list-item">
      <div class="ops-list-main">
        <div class="ops-list-title">${ticket.id} - ${escapeHtml(ticket.category)}</div>
        <div class="ops-muted">${escapeHtml(ticket.customer?.name || 'Nasabah')} - ${escapeHtml(ticket.note)}</div>
      </div>
      <div class="ops-list-actions">
        ${statusBadge(ticket.status)}
        ${ticket.status !== 'DONE' ? `
          <button class="ops-mini-btn" data-ticket-status="IN_PROGRESS" data-ticket-id="${ticket.id}">Proses</button>
          <button class="ops-mini-btn success" data-ticket-status="DONE" data-ticket-id="${ticket.id}">Selesai</button>
        ` : ''}
      </div>
    </div>`;
}

function renderEmpty(message) {
  return `<div class="ops-empty">${message}</div>`;
}

function attachEvents() {
  document.getElementById('form-cs-search')?.addEventListener('submit', (event) => {
    event.preventDefault();
    lastSearch = document.getElementById('cs-search').value.trim();

    const result = resolveCustomerLookup(lastSearch);
    if (!result.customer) {
      showToast('Data nasabah atau rekening tidak ditemukan.', 'error');
      return;
    }

    selectedCustomerId = result.customer.id;
    selectedAccountNo = result.selectedAccountNo || result.customer.accounts[0]?.accountNo || selectedAccountNo;
    balanceInquiryAccountNo = selectedAccountNo;
    showToast('Data nasabah berhasil ditemukan.', 'success');
    renderCSUI();
  });

  document.querySelectorAll('[data-account-no]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedAccountNo = button.getAttribute('data-account-no');
      balanceInquiryAccountNo = selectedAccountNo;
      renderCSUI();
    });
  });

  document.getElementById('form-balance-check')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const accountNo = document.getElementById('balance-account-no').value.trim();
    const detail = lookupAccount(accountNo);

    if (!detail) {
      showToast('Nomor rekening tidak ditemukan.', 'error');
      return;
    }

    selectedCustomerId = detail.customer.id;
    selectedAccountNo = detail.account.accountNo;
    balanceInquiryAccountNo = detail.account.accountNo;
    showToast(`Saldo ${detail.account.accountNo}: ${formatIDR(detail.account.balance)}`, 'info');
    renderCSUI();
  });

  document.getElementById('form-onboarding')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const action = form.get('action');

    try {
      if (action === 'open') {
        const token = localStorage.getItem('token');
        const payload = {
          name: form.get('name'),
          email: form.get('email'),
          password: 'password123',
          role: 'user'
        };
        const res = await fetch('http://localhost:3000/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
        
        if (!res.ok) throw new Error('Gagal membuka rekening (Email mungkin sudah dipakai)');
        
        const { syncWithBackend } = await import('../../utils/smartbank-ops-store.js');
        await syncWithBackend();
        showToast(`Rekening untuk ${payload.name} berhasil dibuka.`, 'success');
      }

      if (action === 'update') {
        updateCustomerContact({
          customerId: selectedCustomerId,
          email: form.get('email'),
          phone: form.get('phone'),
          address: form.get('address')
        });
        showToast('Data kontak nasabah berhasil diperbarui.', 'success');
      }

      if (action === 'unlock') {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:3000/api/admin/users/${selectedCustomerId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Gagal membuka blokir');

        const { syncWithBackend } = await import('../../utils/smartbank-ops-store.js');
        await syncWithBackend();
        showToast(`Rekening nasabah sudah aktif.`, 'success');
      }

      event.currentTarget.reset();
      renderCSUI();
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  document.getElementById('form-ticket')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/ops/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          customer_id: selectedCustomerId,
          account_no: selectedAccountNo,
          category: form.get('category'),
          priority: form.get('priority'),
          note: form.get('note')
        })
      });
      if (!res.ok) throw new Error('Gagal buat tiket');
      
      const { syncWithBackend } = await import('../../utils/smartbank-ops-store.js');
      await syncWithBackend();
      
      showToast('Tiket nasabah berhasil dibuat.', 'success');
      event.currentTarget.reset();
      renderCSUI();
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  document.getElementById('form-queue')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/ops/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          customer_id: selectedCustomerId,
          service: form.get('service'),
          notes: form.get('notes')
        })
      });
      if (!res.ok) throw new Error('Gagal buat antrean');
      const item = await res.json();
      
      const { syncWithBackend } = await import('../../utils/smartbank-ops-store.js');
      await syncWithBackend();
      
      showToast(`Nomor antrean ${item.number} ditambahkan.`, 'success');
      event.currentTarget.reset();
      renderCSUI();
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  document.querySelectorAll('[data-ticket-status]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        const ticketId = button.getAttribute('data-ticket-id');
        const status = button.getAttribute('data-ticket-status');
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:3000/api/ops/tickets/${ticketId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ status })
        });
        
        const { syncWithBackend } = await import('../../utils/smartbank-ops-store.js');
        await syncWithBackend();
        
        showToast('Status tiket diperbarui.', 'success');
        renderCSUI();
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
  });

  document.querySelectorAll('[data-queue-status]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        const queueId = button.getAttribute('data-queue-id');
        const status = button.getAttribute('data-queue-status');
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:3000/api/ops/queue/${queueId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ status })
        });
        
        const { syncWithBackend } = await import('../../utils/smartbank-ops-store.js');
        await syncWithBackend();
        
        showToast('Status antrean diperbarui.', 'success');
        renderCSUI();
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
  });

  document.getElementById('logoutBtn')?.addEventListener('click', (event) => {
    event.preventDefault();
    window.location.href = '/login.html';
  });
}

bootstrap();
