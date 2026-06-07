import { ICONS, showToast, formatIDR } from '../../utils/ui-core.js';
import {
  TRANSFER_RATES,
  depositCash,
  getCustomerDetail,
  getLedgerForAccount,
  getOperationalState,
  getRecentLedger,
  getTellerSummary,
  lookupAccount,
  resolveCustomerLookup,
  subscribeOperationalStore,
  transferFunds,
  withdrawCash
} from '../../utils/smartbank-ops-store.js';

let selectedCustomerId = 'CST-001';
let selectedAccountNo = '1002003001';
let tellerSearch = '';
let lastReceipt = null;

async function bootstrap() {
  renderTellerUI();
  subscribeOperationalStore(() => renderTellerUI());
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

function parseAmount(value) {
  const amount = Math.round(Number(value));
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Nominal transaksi harus lebih dari 0.');
  return amount;
}

function statusBadge(status) {
  const className = {
    AKTIF: 'success',
    BLOKIR: 'danger',
    SUCCESS: 'success'
  }[status] || 'info';

  const label = {
    AKTIF: 'Aktif',
    BLOKIR: 'Blokir',
    SUCCESS: 'Sukses'
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
    ledger: account ? getLedgerForAccount(account.accountNo, 6, state) : []
  };
}

function renderTellerUI() {
  const state = getOperationalState();
  const summary = getTellerSummary(state);
  const recentLedger = getRecentLedger(8, state);
  const { customer, account, ledger } = getCurrentContext(state);

  document.querySelector('#app').innerHTML = `
  <div class="dashboard-layout fade-in premium-bg">
    <aside class="sidebar">
      <div class="sidebar-logo" style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);">${ICONS.bank}</div>
      <nav class="sidebar-menu">
        <a href="#" class="menu-item active" title="Teller Desk">${ICONS.vault}</a>
        <a href="#" class="menu-item" title="Transaksi">${ICONS.activity}</a>
        <a href="#" class="menu-item" title="Ledger">${ICONS.database}</a>
      </nav>
      <div class="sidebar-bottom">
        <a href="/teller-login.html" id="logoutBtn" class="menu-item" style="color: #f87171;" title="Logout">${ICONS.logout}</a>
        <div class="sidebar-user-avatar" style="background: rgba(255,255,255,0.1); color: white;">T</div>
      </div>
    </aside>

    <div class="main-area">
      <nav class="topnav">
        <div class="topnav-brand">
          <span style="color:#60a5fa">${ICONS.bank}</span>
          SmartBank <span style="font-weight:400; opacity:0.6; margin-left:8px;">Teller Dashboard</span>
        </div>
        <div class="topnav-actions">
          <span class="ops-live-chip">Shift ${state.tellerSession.status} - ${formatDateTime(state.meta.lastUpdated)}</span>
          <div class="topnav-user">
            <div class="topnav-user-avatar" style="background: rgba(96, 165, 250, 0.2); color: #60a5fa;">T</div>
            <span class="topnav-user-name">Bank Teller 01</span>
          </div>
        </div>
      </nav>

      <div class="page-content">
        <div class="ops-page-head">
          <div>
            <h1 class="page-heading">Teller Transaction Desk</h1>
            <p class="ops-subtitle">Transaksi kas, transfer, konfirmasi, bukti transaksi, dan rekonsiliasi kas.</p>
          </div>
          <div class="ops-current-account">
            <span>Rekening aktif</span>
            <strong>${account ? account.accountNo : '-'}</strong>
          </div>
        </div>

        <div class="grid-4 mb-8">
          ${renderStat('Cash in Drawer', formatIDR(summary.drawerCash), `Modal awal ${formatIDR(summary.drawerOpening)}`, '')}
          ${renderStat('Setoran', summary.depositCount, formatIDR(summary.depositVolume), 'green')}
          ${renderStat('Tarikan', summary.withdrawalCount, formatIDR(summary.withdrawalVolume), 'red')}
          ${renderStat('Transfer', summary.transferCount, formatIDR(summary.transferVolume), 'purple')}
        </div>

        <div class="ops-workspace mb-8">
          <div class="glass-panel">
            <div class="glass-panel-header">
              <div class="glass-panel-icon" style="color:#60a5fa;">${ICONS.search}</div>
              <h2 class="glass-panel-title text-gradient">Cek Rekening dan Tabungan</h2>
            </div>
            <div class="glass-body">
              <form id="form-teller-search" class="ops-search-row">
                <input id="teller-search" class="glass-input" value="${escapeHtml(tellerSearch)}" placeholder="Nama, NIK, ID nasabah, atau nomor rekening" />
                <button class="btn-glow ops-fit-btn" type="submit">${ICONS.search} Cari</button>
              </form>

              ${customer ? renderCustomerAccounts(customer, account, ledger) : renderEmpty('Cari nasabah atau rekening terlebih dahulu.')}
            </div>
          </div>

          <div class="glass-panel">
            <div class="glass-panel-header">
              <div class="glass-panel-icon" style="color:#34d399;">${ICONS.check}</div>
              <h2 class="glass-panel-title text-gradient-green">Bukti Transaksi</h2>
              ${lastReceipt ? statusBadge('SUCCESS') : ''}
            </div>
            <div class="glass-body">
              ${lastReceipt ? renderReceipt(lastReceipt) : renderEmpty('Belum ada transaksi pada sesi ini.')}
            </div>
          </div>
        </div>

        <div class="ops-transaction-grid mb-8">
          <div class="glass-panel">
            <div class="glass-panel-header">
              <div class="glass-panel-icon" style="color:#34d399;">${ICONS.activity}</div>
              <h2 class="glass-panel-title text-gradient-green">Setor Tunai</h2>
            </div>
            <form id="form-deposit" class="glass-body ops-form-stack">
              <div>
                <label class="glass-label">No. Rekening Nasabah</label>
                <input name="accountNo" class="glass-input" value="${account ? account.accountNo : ''}" required />
              </div>
              <div>
                <label class="glass-label">Nominal Setoran</label>
                <input name="amount" type="number" min="1" class="glass-input ops-money-input green" placeholder="0" required />
              </div>
              <div>
                <label class="glass-label">Keterangan</label>
                <input name="note" class="glass-input" placeholder="Setor tunai counter" />
              </div>
              <button type="submit" class="btn-glow green">${ICONS.check} Review Setoran</button>
            </form>
          </div>

          <div class="glass-panel">
            <div class="glass-panel-header">
              <div class="glass-panel-icon" style="color:#f87171;">${ICONS.activity}</div>
              <h2 class="glass-panel-title text-gradient-red">Tarik Tunai</h2>
            </div>
            <form id="form-withdraw" class="glass-body ops-form-stack">
              <div>
                <label class="glass-label">No. Rekening Nasabah</label>
                <input name="accountNo" class="glass-input" value="${account ? account.accountNo : ''}" required />
              </div>
              <div>
                <label class="glass-label">Nominal Penarikan</label>
                <input name="amount" type="number" min="1" class="glass-input ops-money-input red" placeholder="0" required />
              </div>
              <div>
                <label class="glass-label">Keterangan</label>
                <input name="note" class="glass-input" placeholder="Tarik tunai counter" />
              </div>
              <button type="submit" class="btn-glow red">${ICONS.check} Review Penarikan</button>
            </form>
          </div>

          <div class="glass-panel">
            <div class="glass-panel-header">
              <div class="glass-panel-icon" style="color:#a78bfa;">${ICONS.activity}</div>
              <h2 class="glass-panel-title text-gradient">Transfer Dana</h2>
            </div>
            <form id="form-transfer" class="glass-body ops-form-stack">
              <div>
                <label class="glass-label">Rekening Pengirim</label>
                <input name="sourceAccountNo" class="glass-input" value="${account ? account.accountNo : ''}" required />
              </div>
              <div>
                <label class="glass-label">Rekening Penerima</label>
                <input name="targetAccountNo" class="glass-input" placeholder="1002003002" required />
              </div>
              <div>
                <label class="glass-label">Nominal Transfer</label>
                <input id="transfer-amount" name="amount" type="number" min="1" class="glass-input ops-money-input" placeholder="0" required />
              </div>
              <div class="ops-cost-box">
                <div><span>Biaya bank 1%</span><strong id="transfer-fee">Rp 0</strong></div>
                <div><span>Pajak 2%</span><strong id="transfer-tax">Rp 0</strong></div>
                <div class="total"><span>Total debit</span><strong id="transfer-total">Rp 0</strong></div>
              </div>
              <div>
                <label class="glass-label">Keterangan</label>
                <input name="note" class="glass-input" placeholder="Transfer teller" />
              </div>
              <button type="submit" class="btn-glow">${ICONS.check} Review Transfer</button>
            </form>
          </div>
        </div>

        <div class="grid-2">
          <div class="glass-panel">
            <div class="glass-panel-header">
              <div class="glass-panel-icon" style="color:#94a3b8;">${ICONS.database}</div>
              <h2 class="glass-panel-title">Jurnal Transaksi Teller</h2>
            </div>
            <div class="glass-body">
              ${renderLedgerTable(recentLedger)}
            </div>
          </div>

          <div class="glass-panel">
            <div class="glass-panel-header">
              <div class="glass-panel-icon" style="color:#fbbf24;">${ICONS.vault}</div>
              <h2 class="glass-panel-title">Rekonsiliasi Kas Harian</h2>
            </div>
            <div class="glass-body ops-form-stack">
              <div class="ops-recon-grid">
                <div>
                  <span class="glass-label">Kas Sistem</span>
                  <strong>${formatIDR(summary.drawerCash)}</strong>
                </div>
                <div>
                  <span class="glass-label">Selisih dari Modal</span>
                  <strong class="${summary.drawerCash >= summary.drawerOpening ? 'ops-money credit' : 'ops-money debit'}">${formatIDR(summary.drawerCash - summary.drawerOpening)}</strong>
                </div>
              </div>
              <div>
                <label class="glass-label">Kas Aktual Laci</label>
                <input id="drawer-actual" type="number" class="glass-input ops-money-input" placeholder="0" />
              </div>
              <button id="btn-reconcile" class="btn-glow amber" type="button">${ICONS.check} Cocokkan Kas</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;

  attachEvents();
  attachCalculatorEvents();
}

function renderStat(label, value, sub, tone) {
  const className = tone === 'green' ? 'green' : tone === 'red' ? 'red' : tone === 'purple' ? 'purple' : '';
  return `
    <div class="glass-stat ${className}">
      <div class="glass-stat-label">${label}</div>
      <div class="glass-stat-value">${value}</div>
      <div class="glass-stat-sub">${sub}</div>
    </div>`;
}

function renderCustomerAccounts(customer, account, ledger) {
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

      <div class="ops-section-title">Tabungan dan Rekening Nasabah</div>
      <div class="ops-account-grid">
        ${customer.accounts.map((item) => renderAccountCard(item, item.accountNo === account?.accountNo)).join('')}
      </div>

      ${account ? `
        <div class="ops-selected-balance">
          <div>
            <span class="glass-label">Saldo tersedia</span>
            <strong>${formatIDR(account.balance)}</strong>
          </div>
          <div>
            <span class="glass-label">Produk</span>
            <strong>${escapeHtml(account.product)}</strong>
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

function renderLedgerTable(entries) {
  return `
    <div class="glass-table-container">
      <table class="glass-table ops-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Waktu</th>
            <th>Aktivitas</th>
            <th>Rekening</th>
            <th style="text-align:right;">Nominal</th>
            <th style="text-align:right;">Saldo</th>
          </tr>
        </thead>
        <tbody>
          ${entries.length ? entries.map((entry) => `
            <tr>
              <td class="ops-mono">${entry.id}</td>
              <td>${formatDateTime(entry.timestamp)}</td>
              <td>
                <strong>${transactionLabel(entry.type)}</strong>
                <div class="ops-muted">${escapeHtml(entry.description)}</div>
              </td>
              <td class="ops-mono">${entry.accountNo}</td>
              <td style="text-align:right;">${signedAmount(entry)}</td>
              <td style="text-align:right; font-weight:700;">${formatIDR(entry.balanceAfter)}</td>
            </tr>
          `).join('') : `<tr><td colspan="6">${renderEmpty('Belum ada transaksi.')}</td></tr>`}
        </tbody>
      </table>
    </div>`;
}

function renderReceipt(receipt) {
  return `
    <div class="ops-receipt">
      <div class="ops-receipt-top">
        <div>
          <span class="ops-kicker">${receipt.type}</span>
          <h3>${receipt.id}</h3>
        </div>
        <span>${formatDateTime(receipt.timestamp)}</span>
      </div>
      ${receipt.rows.map((row) => `
        <div class="ops-receipt-row">
          <span>${escapeHtml(row.label)}</span>
          <strong>${escapeHtml(row.value)}</strong>
        </div>
      `).join('')}
    </div>`;
}

function renderEmpty(message) {
  return `<div class="ops-empty">${message}</div>`;
}

function buildCashReceipt(type, result) {
  return {
    type,
    id: result.transaction.id,
    timestamp: result.transaction.timestamp,
    rows: [
      { label: 'Nasabah', value: result.customer.name },
      { label: 'Rekening', value: result.account.accountNo },
      { label: 'Nominal', value: formatIDR(result.transaction.amount) },
      { label: 'Saldo Akhir', value: formatIDR(result.account.balance) },
      { label: 'Officer', value: result.transaction.officer }
    ]
  };
}

function buildTransferReceipt(result) {
  return {
    type: 'Transfer Dana',
    id: result.transaction.reference,
    timestamp: result.transaction.timestamp,
    rows: [
      { label: 'Pengirim', value: `${result.sourceCustomer.name} - ${result.sourceAccount.accountNo}` },
      { label: 'Penerima', value: `${result.targetCustomer.name} - ${result.targetAccount.accountNo}` },
      { label: 'Nominal', value: formatIDR(result.transaction.amount) },
      { label: 'Biaya Bank', value: formatIDR(result.transaction.fee) },
      { label: 'Pajak', value: formatIDR(result.transaction.tax) },
      { label: 'Total Debit', value: formatIDR(result.transaction.totalDebit) },
      { label: 'Saldo Pengirim', value: formatIDR(result.sourceAccount.balance) }
    ]
  };
}

function openConfirmDialog({ title, tone = 'info', rows, confirmText = 'Konfirmasi', onConfirm }) {
  const overlay = document.createElement('div');
  overlay.className = 'ops-modal-backdrop active';
  overlay.innerHTML = `
    <div class="ops-confirm-modal">
      <div class="ops-confirm-head">
        <div>
          <span class="ops-kicker">Review Transaksi</span>
          <h2>${escapeHtml(title)}</h2>
        </div>
        <button type="button" class="ops-icon-btn" data-close-confirm>${ICONS.x}</button>
      </div>
      <div class="ops-confirm-body">
        ${rows.map((row) => `
          <div class="ops-confirm-row">
            <span>${escapeHtml(row.label)}</span>
            <strong>${escapeHtml(row.value)}</strong>
          </div>
        `).join('')}
      </div>
      <div class="ops-confirm-actions">
        <button type="button" class="ops-mini-btn" data-close-confirm>Batalkan</button>
        <button type="button" class="btn-glow ${tone === 'green' ? 'green' : tone === 'red' ? 'red' : ''}" data-confirm-action>${escapeHtml(confirmText)}</button>
      </div>
    </div>`;

  overlay.querySelectorAll('[data-close-confirm]').forEach((button) => {
    button.addEventListener('click', () => overlay.remove());
  });

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) overlay.remove();
  });

  overlay.querySelector('[data-confirm-action]').addEventListener('click', () => {
    try {
      onConfirm();
      overlay.remove();
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  document.body.appendChild(overlay);
}

function ensureActiveDetail(accountNo) {
  const detail = lookupAccount(accountNo);
  if (!detail) throw new Error('Nomor rekening tidak ditemukan.');
  if (detail.account.status !== 'AKTIF') throw new Error(`Rekening ${detail.account.accountNo} berstatus ${detail.account.status}.`);
  return detail;
}

function attachCalculatorEvents() {
  const transferAmount = document.getElementById('transfer-amount');
  const transferFee = document.getElementById('transfer-fee');
  const transferTax = document.getElementById('transfer-tax');
  const transferTotal = document.getElementById('transfer-total');

  transferAmount?.addEventListener('input', (event) => {
    const amount = Math.max(0, Math.round(Number(event.target.value) || 0));
    const fee = Math.round(amount * TRANSFER_RATES.fee);
    const tax = Math.round(amount * TRANSFER_RATES.tax);
    transferFee.innerText = formatIDR(fee);
    transferTax.innerText = formatIDR(tax);
    transferTotal.innerText = formatIDR(amount + fee + tax);
  });
}

function attachEvents() {
  document.getElementById('form-teller-search')?.addEventListener('submit', (event) => {
    event.preventDefault();
    tellerSearch = document.getElementById('teller-search').value.trim();
    const result = resolveCustomerLookup(tellerSearch);

    if (!result.customer) {
      showToast('Data rekening atau nasabah tidak ditemukan.', 'error');
      return;
    }

    selectedCustomerId = result.customer.id;
    selectedAccountNo = result.selectedAccountNo || result.customer.accounts[0]?.accountNo || selectedAccountNo;
    showToast('Data rekening berhasil ditemukan.', 'success');
    renderTellerUI();
  });

  document.querySelectorAll('[data-account-no]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedAccountNo = button.getAttribute('data-account-no');
      const detail = lookupAccount(selectedAccountNo);
      if (detail?.customer) selectedCustomerId = detail.customer.id;
      renderTellerUI();
    });
  });

  document.getElementById('form-deposit')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    try {
      const accountNo = form.get('accountNo');
      const amount = parseAmount(form.get('amount'));
      const note = form.get('note');
      const detail = ensureActiveDetail(accountNo);

      openConfirmDialog({
        title: 'Konfirmasi Setor Tunai',
        tone: 'green',
        confirmText: 'Proses Setoran',
        rows: [
          { label: 'Nasabah', value: detail.customer.name },
          { label: 'Rekening', value: detail.account.accountNo },
          { label: 'Saldo Sebelum', value: formatIDR(detail.account.balance) },
          { label: 'Nominal Setor', value: formatIDR(amount) },
          { label: 'Saldo Setelah', value: formatIDR(detail.account.balance + amount) }
        ],
        onConfirm: () => {
          const result = depositCash({ accountNo, amount, note });
          selectedCustomerId = result.customer.id;
          selectedAccountNo = result.account.accountNo;
          lastReceipt = buildCashReceipt('Setor Tunai', result);
          showToast('Setoran tunai berhasil diproses.', 'success');
          renderTellerUI();
        }
      });
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  document.getElementById('form-withdraw')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    try {
      const accountNo = form.get('accountNo');
      const amount = parseAmount(form.get('amount'));
      const note = form.get('note');
      const detail = ensureActiveDetail(accountNo);

      if (detail.account.balance < amount) throw new Error('Saldo rekening tidak mencukupi untuk penarikan.');

      openConfirmDialog({
        title: 'Konfirmasi Tarik Tunai',
        tone: 'red',
        confirmText: 'Proses Penarikan',
        rows: [
          { label: 'Nasabah', value: detail.customer.name },
          { label: 'Rekening', value: detail.account.accountNo },
          { label: 'Saldo Sebelum', value: formatIDR(detail.account.balance) },
          { label: 'Nominal Tarik', value: formatIDR(amount) },
          { label: 'Saldo Setelah', value: formatIDR(detail.account.balance - amount) }
        ],
        onConfirm: () => {
          const result = withdrawCash({ accountNo, amount, note });
          selectedCustomerId = result.customer.id;
          selectedAccountNo = result.account.accountNo;
          lastReceipt = buildCashReceipt('Tarik Tunai', result);
          showToast('Penarikan tunai berhasil diproses.', 'success');
          renderTellerUI();
        }
      });
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  document.getElementById('form-transfer')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    try {
      const sourceAccountNo = form.get('sourceAccountNo');
      const targetAccountNo = form.get('targetAccountNo');
      const amount = parseAmount(form.get('amount'));
      const note = form.get('note');
      const source = ensureActiveDetail(sourceAccountNo);
      const target = ensureActiveDetail(targetAccountNo);
      const fee = Math.round(amount * TRANSFER_RATES.fee);
      const tax = Math.round(amount * TRANSFER_RATES.tax);
      const totalDebit = amount + fee + tax;

      if (source.account.accountNo === target.account.accountNo) throw new Error('Rekening pengirim dan penerima tidak boleh sama.');
      if (source.account.balance < totalDebit) throw new Error('Saldo pengirim tidak cukup setelah biaya dan pajak.');

      openConfirmDialog({
        title: 'Konfirmasi Transfer Dana',
        confirmText: 'Proses Transfer',
        rows: [
          { label: 'Pengirim', value: `${source.customer.name} - ${source.account.accountNo}` },
          { label: 'Penerima', value: `${target.customer.name} - ${target.account.accountNo}` },
          { label: 'Saldo Pengirim', value: formatIDR(source.account.balance) },
          { label: 'Nominal Transfer', value: formatIDR(amount) },
          { label: 'Biaya Bank', value: formatIDR(fee) },
          { label: 'Pajak', value: formatIDR(tax) },
          { label: 'Total Debit', value: formatIDR(totalDebit) },
          { label: 'Saldo Setelah', value: formatIDR(source.account.balance - totalDebit) }
        ],
        onConfirm: () => {
          const result = transferFunds({ sourceAccountNo, targetAccountNo, amount, note });
          selectedCustomerId = result.sourceCustomer.id;
          selectedAccountNo = result.sourceAccount.accountNo;
          lastReceipt = buildTransferReceipt(result);
          showToast('Transfer dana berhasil diproses.', 'success');
          renderTellerUI();
        }
      });
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  document.getElementById('btn-reconcile')?.addEventListener('click', () => {
    const state = getOperationalState();
    const summary = getTellerSummary(state);
    const actual = Math.round(Number(document.getElementById('drawer-actual').value) || 0);
    const difference = actual - summary.drawerCash;

    if (actual <= 0) {
      showToast('Masukkan jumlah kas aktual terlebih dahulu.', 'error');
      return;
    }

    if (difference === 0) {
      showToast('Kas aktual sesuai dengan kas sistem.', 'success');
      return;
    }

    showToast(`Selisih kas ${formatIDR(difference)}. Perlu pemeriksaan ulang.`, 'error');
  });

  document.getElementById('logoutBtn')?.addEventListener('click', (event) => {
    event.preventDefault();
    window.location.href = '/teller-login.html';
  });
}

bootstrap();
