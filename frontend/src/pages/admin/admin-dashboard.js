import './admin-dashboard.css';
import { ICONS, showToast, formatIDR } from '../../utils/ui-core.js';

// Setup admin body classes
document.body.classList.add('admin-dashboard-body');

// --- Global State ---
let appState = null;
let currentTab = 'System Data'; // 'System Data' | 'User Management' | 'Security Reports' | 'Policy Config'
let userSearchQuery = '';
let ledgerFilter = 'ALL';

// Economic/System Policies
let systemPolicies = {
  feeRate: 1.0,      // 1%
  taxRate: 2.0,      // 2%
  loanInterest: 10,  // 10%
  dailyLimit: 10     // 10 transactions
};

// Simulated Database Records (loaded from API on bootstrap)
let usersDB = [];
let ledgerDB = [];
let systemLogs = [
  { time: '00:45', tag: 'SYS', text: 'Daily secure database auto-backup completed.' },
  { time: '00:32', tag: 'SEC', text: 'Cryptographic SSL verification handshake successful.' },
  { time: '00:15', tag: 'SYS', text: 'Mainframe node cluster synchronized with API Gateway.' },
  { time: '00:02', tag: 'KYC', text: 'Customer ID USR-00142 (Budi Santoso) auto-verified by KYC rule.' }
];

// --- Bootstrapping System ---
async function bootstrap() {
  try {
    // Fetch all admin data
    const [usersRes, ledgersRes, statsRes, feesRes] = await Promise.all([
      fetch('http://localhost:3000/api/admin/users'),
      fetch('http://localhost:3000/api/admin/ledgers'),
      fetch('http://localhost:3000/api/admin/stats'),
      fetch('http://localhost:3000/api/admin/fees')
    ]);

    if (!usersRes.ok || !ledgersRes.ok || !statsRes.ok || !feesRes.ok) {
      throw new Error('Failed to load admin data from API');
    }

    usersDB = await usersRes.json();
    ledgerDB = await ledgersRes.json();
    appState = {
      stats: await statsRes.json(),
      fees: await feesRes.json()
    };

    // Render Base Page
    renderBaseLayout();
    attachGlobalEvents();
  } catch (e) {
    document.querySelector('#app').innerHTML = `
      <div style="padding: 80px; text-align: center; color: var(--neon-red);">
        <h2 style="font-family: var(--font-mono);">[FATAL_ERROR] CORE_SYSTEM_OFFLINE</h2>
        <p style="color: var(--text-dim); margin-top: 10px;">Gagal memuat basis data administrasi utama. Silakan muat ulang halaman.</p>
        <button onclick="location.reload()" class="btn-primary" style="margin-top: 20px;">INITIALIZE COLD BOOT</button>
      </div>
    `;
    console.error('System bootstrap failed:', e);
  }
}

// --- Layout Renderer ---
function renderBaseLayout() {
  document.querySelector('#app').innerHTML = `
  <div class="dashboard-layout fade-in">
    <!-- Sidebar Navigation -->
    <aside class="sidebar">
      <div class="sidebar-logo" title="SmartBank Secure Core">${ICONS.shield}</div>
      <nav class="sidebar-menu">
        <a href="#" class="menu-item ${currentTab === 'System Data' ? 'active' : ''}" data-tab="System Data" title="Mainframe Overview">${ICONS.database}</a>
        <a href="#" class="menu-item ${currentTab === 'User Management' ? 'active' : ''}" data-tab="User Management" title="User Directory & Authority">${ICONS.users}</a>
        <a href="#" class="menu-item ${currentTab === 'Security Reports' ? 'active' : ''}" data-tab="Security Reports" title="Global Ledger Audits">${ICONS.reports}</a>
        <a href="#" class="menu-item ${currentTab === 'Policy Config' ? 'active' : ''}" data-tab="Policy Config" title="Policy Configurations">${ICONS.activity}</a>
      </nav>
      <div class="sidebar-bottom">
        <a href="/admin-login.html" id="logoutBtn" class="menu-item" title="Terminate Session" style="color: var(--neon-red); background: var(--neon-red-glow); border-color: rgba(244, 63, 94, 0.2);">${ICONS.logout}</a>
        <div class="sidebar-user-avatar" title="Role: Admin">AD</div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="main-area">
      <!-- Top Navigation -->
      <nav class="topnav">
        <div class="topnav-brand">
            <span class="pulse-indicator"></span>
            SMARTBANK
        </div>
        <div class="topnav-search" style="display: ${currentTab === 'User Management' || currentTab === 'Security Reports' ? 'flex' : 'none'};">
          ${ICONS.search}
          <input type="text" id="globalSearchInput" placeholder="${currentTab === 'User Management' ? 'Cari nama, email, role, atau ID...' : 'Cari ledger ID atau user...'}" value="${currentTab === 'User Management' ? userSearchQuery : ''}" />
        </div>
        <div class="topnav-user">
          <div style="text-align: right;">
            <div style="font-weight: 800; font-size: 13px; color: #fff; font-family: var(--font-mono);">ADMIN</div>

          </div>
          <div class="topnav-user-avatar">SA</div>
        </div>
      </nav>

      <!-- Scrollable Tab Content Container -->
      <div class="page-content">
        <!-- Render Active Tab View -->
        ${renderActiveTab()}
      </div>
    </div>
  </div>`;

  attachTabEvents();
}

// --- Render Tab Views ---
function renderActiveTab() {
  switch (currentTab) {
    case 'System Data':
      return renderSystemOverview();
    case 'User Management':
      return renderUserManagement();
    case 'Security Reports':
      return renderLedgerAuditor();
    case 'Policy Config':
      return renderPolicyConfig();
    default:
      return '';
  }
}

// 1. Tab: Mainframe Overview
function renderSystemOverview() {
  // Compute basic metrics from API Stats
  const totalUsers = appState.stats.totalUsers || usersDB.length;
  const totalSupply = 1000000000; // 1 Billion Max Money Supply (updated to 1M)
  
  // Calculate total circulating balance (from real DB logic)
  const circulatingSupply = appState.stats.totalBalance || usersDB.reduce((sum, u) => sum + u.balance, 0);

  // Reserve Bank holds the remaining pool
  const bankReserve = totalSupply - circulatingSupply;
  const reservePercent = ((bankReserve / totalSupply) * 100).toFixed(2);

  const collectedFees = appState.stats.totalFeesCollected || 0;

  return `
    <div class="content-header">
      <h1>Dashboard Monitor Utama</h1>
      <p>Global Monitoring system nodes and economic stability indexes</p>
    </div>

    <!-- Stats Panel -->
    <div class="stats-grid">
      <div class="stat-card cyan">
        <div class="stat-label">Total Supply Maksimal</div>
        <div class="stat-value" style="color: var(--neon-cyan);">${formatIDR(totalSupply)}</div>
        <div class="stat-trend trend-up">SYS_LIMIT: 100% REGULATED</div>
      </div>
      <div class="stat-card purple">
        <div class="stat-label">Bank Reserves</div>
        <div class="stat-value" style="color: var(--neon-purple);">${formatIDR(bankReserve)}</div>
        <div class="stat-trend trend-up">CAPACITY: ${reservePercent}% [SAFE]</div>
      </div>
      <div class="stat-card green">
        <div class="stat-label">Circulating Supply</div>
        <div class="stat-value" style="color: var(--neon-green);">${formatIDR(circulatingSupply)}</div>
        <div class="stat-trend trend-down">LIQUIDITY_RATIO: ${(circulatingSupply / totalSupply * 100).toFixed(2)}%</div>
      </div>
      <div class="stat-card amber">
        <div class="stat-label">Collected Bank Fees & Taxes</div>
        <div class="stat-value" style="color: var(--neon-amber);">${formatIDR(collectedFees)}</div>
        <div class="stat-trend trend-up">FEES: 1% | TAXES: 2%</div>
      </div>
    </div>

    <!-- Infrastructure Data Row -->
    <div class="dashboard-grid">
      <!-- Node Clusters -->
      <div class="data-table-card">
        <div class="table-header">
          <h2>Active Infrastructure Cluster Nodes</h2>
          <span style="font-family: var(--font-mono); font-size: 10px; color: var(--neon-cyan);"></span>
        </div>
        <div class="table-container">
          <div class="grid-row grid-head" style="grid-template-columns: 1.5fr 1.5fr 1fr 1fr;">
            <div>CLUSTER_NODE</div>
            <div>GEOGRAPHIC_LOCATION</div>
            <div>CLUSTER_UPTIME</div>
            <div style="text-align: right;">LOAD_CAPACITY</div>
          </div>
          <div class="grid-row" style="grid-template-columns: 1.5fr 1.5fr 1fr 1fr;">
            <div style="font-family: var(--font-mono); font-weight: 700;">NODE-MAIN-JKT-01</div>
            <div>Jakarta, Indonesia</div>
            <div style="color: var(--neon-green); font-family: var(--font-mono);">99.98%</div>
            <div style="text-align: right;"><span class="status-badge status-verified">OPTIMAL (12%)</span></div>
          </div>
          <div class="grid-row" style="grid-template-columns: 1.5fr 1.5fr 1fr 1fr;">
            <div style="font-family: var(--font-mono); font-weight: 700;">NODE-GATE-SG-02</div>
            <div>Singapore Cluster</div>
            <div style="color: var(--neon-green); font-family: var(--font-mono);">100.00%</div>
            <div style="text-align: right;"><span class="status-badge status-verified">OPTIMAL (8%)</span></div>
          </div>
          <div class="grid-row" style="grid-template-columns: 1.5fr 1.5fr 1fr 1fr;">
            <div style="font-family: var(--font-mono); font-weight: 700;">NODE-BACK-AWS-03</div>
            <div>Tokyo, Japan (AWS-1)</div>
            <div style="color: var(--neon-green); font-family: var(--font-mono);">99.99%</div>
            <div style="text-align: right;"><span class="status-badge status-verified">OPTIMAL (24%)</span></div>
          </div>
        </div>
      </div>

      <!-- Logs and Instructions Column -->
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <!-- Live System Logs -->
        <div class="activity-card">
          <div class="activity-header">
            <h2>Live System Operation Logs</h2>
            <span style="font-family: var(--font-mono); font-size: 10px; color: var(--neon-cyan); letter-spacing: 0.5px;">FEED_LIVE</span>
          </div>
          <div class="activity-list">
            ${systemLogs.map(l => `
              <div class="log-item">
                <div class="log-time">${l.time}</div>
                <div class="log-content">
                  <span class="log-tag tag-${l.tag.toLowerCase()}">${l.tag}</span>
                  ${l.text}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Cara Kerja/Purpose of Admin -->
        <div class="info-panel">
          <h3>Apa Tugas & Tanggung Jawab Admin?</h3>
          <div class="info-item">
            <h4>${ICONS.vault} Regulator Moneter & Money Supply</h4>
            <p>Admin mengawasi kestabilan nilai uang dalam ekosistem. Sesuai ketentuan SmartBank, total uang dibatasi maksimal Rp 1.000.000.000 (1 Miliar) dengan minimal cadangan bank (Reserves) sebesar 90%.</p>
          </div>
          <div class="info-item">
            <h4>${ICONS.users} Manajemen Otoritas & Hak Akses Staff</h4>
            <p>Admin memiliki wewenang untuk menugaskan hak akses dan peran karyawan (Manager, Teller, dan Operator). Admin juga berhak memverifikasi (KYC) atau membekukan akun nasabah.</p>
          </div>
          <div class="info-item">
            <h4>${ICONS.reports} Audit Ledger & Keamanan Transaksi</h4>
            <p>Melihat dan melacak seluruh arus dana masuk dan keluar antar-aplikasi (PasarKita, WarungPOS, SupplierHub, LogistiKita) untuk mendeteksi anomali transaksi atau manipulasi saldo.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// 2. Tab: User Directory & Authority Manager
function renderUserManagement() {
  // Filter users based on search
  const filteredUsers = usersDB.filter(u => {
    const q = userSearchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q);
  });

  return `
    <div class="content-header">
      <h1>Direktori Pengguna & Hak Akses</h1>
      <p>Manage user registration, assign staff roles, and execute KYC verification</p>
    </div>

    <!-- Users Table Card -->
    <div class="data-table-card">
      <div class="table-header">
        <h2>System Directory (${filteredUsers.length} Account Records)</h2>
        <div class="table-actions">
          <button class="btn-primary" id="createNewAccountBtn">+ Pendaftaran Akun</button>
        </div>
      </div>
      <div class="table-container">
        <div class="grid-row grid-head user-layout">
          <div>ACCOUNT_NAME & IDENTIFIER</div>
          <div>SYSTEM_EMAIL</div>
          <div>ROLE_AUTHORITY</div>
          <div style="text-align: right; padding-right: 8px;">KYC_STATUS</div>
        </div>
        ${filteredUsers.map(user => `
          <div class="grid-row user-layout" data-user-id="${user.id}">
            <!-- Name & ID -->
            <div class="user-name-column">
              <span class="user-name">${user.name}</span>
              <span class="user-id">${user.id}</span>
            </div>
            <!-- Email -->
            <div class="user-email">${user.email}</div>
            <!-- Role -->
            <div>
              <select class="select-role" data-id="${user.id}">
                <option value="user" ${user.role === 'user' ? 'selected' : ''}>Customer</option>
                <option value="operator" ${user.role === 'operator' ? 'selected' : ''}>Operator</option>
                <option value="teller" ${user.role === 'teller' ? 'selected' : ''}>Teller</option>
                <option value="manager" ${user.role === 'manager' ? 'selected' : ''}>Manager</option>
                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
              </select>
            </div>
            <!-- KYC Status Toggle -->
            <div style="text-align: right;">
              <span class="status-badge ${user.status === 'verified' ? 'status-verified' : 'status-pending'}" data-action="toggle-kyc" data-id="${user.id}">
                ${user.status.toUpperCase()}
              </span>
            </div>
          </div>
        `).join('')}
        ${filteredUsers.length === 0 ? `
          <div style="padding: 40px; text-align: center; color: var(--text-dim); font-family: var(--font-mono);">
            [NO_RECORDS_MATCHING_SEARCH_QUERY]
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// 3. Tab: Global Ledger Auditor
function renderLedgerAuditor() {
  // Filter ledger based on search and type dropdown
  const filteredLedger = ledgerDB.filter(l => {
    // Type Filter
    if (ledgerFilter !== 'ALL' && l.type !== ledgerFilter) return false;

    // Search Query
    const q = userSearchQuery.toLowerCase();
    if (!q) return true;

    return l.id.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q) ||
      l.app.toLowerCase().includes(q) ||
      (l.from_user && l.from_user.toLowerCase().includes(q)) ||
      (l.to_user && l.to_user.toLowerCase().includes(q));
  });

  return `
    <div class="content-header">
      <h1>Audit Ledger Transaksi Global</h1>
      <p>Inspecting immutable single source of truth accounting ledger ledger entries</p>
    </div>

    <!-- Ledger Card -->
    <div class="data-table-card">
      <div class="table-header">
        <div style="display: flex; align-items: center; gap: 16px;">
          <h2>Ledger History Logs (${filteredLedger.length} Entries)</h2>
          <!-- Filter Dropdown -->
          <select id="ledgerFilterSelect" class="select-role" style="background: rgba(255,255,255,0.05); border-color: var(--border-color);">
            <option value="ALL" ${ledgerFilter === 'ALL' ? 'selected' : ''}>ALL TRANSACTIONS</option>
            <option value="PAYMENT" ${ledgerFilter === 'PAYMENT' ? 'selected' : ''}>PAYMENT</option>
            <option value="TRANSFER_IN" ${ledgerFilter === 'TRANSFER_IN' ? 'selected' : ''}>TRANSFER IN</option>
            <option value="TRANSFER_OUT" ${ledgerFilter === 'TRANSFER_OUT' ? 'selected' : ''}>TRANSFER OUT</option>
            <option value="LOAN_DISBURSEMENT" ${ledgerFilter === 'LOAN_DISBURSEMENT' ? 'selected' : ''}>LOAN DISBURSEMENT</option>
            <option value="LOAN_REPAYMENT" ${ledgerFilter === 'LOAN_REPAYMENT' ? 'selected' : ''}>LOAN REPAYMENT</option>
            <option value="STIMULUS" ${ledgerFilter === 'STIMULUS' ? 'selected' : ''}>STIMULUS</option>
          </select>
        </div>
        <button class="btn-secondary" id="exportLedgerCsvBtn">EXPORT_CSV</button>
      </div>
      <div class="table-container">
        <div class="grid-row grid-head ledger-layout">
          <div>ENTRY_ID</div>
          <div>TRANSACTION_INFO</div>
          <div>ECO_APP</div>
          <div>DEBIT/CREDIT</div>
          <div>TAX_FEE_POOL</div>
          <div style="text-align: right; padding-right: 8px;">AUDIT_HASH</div>
        </div>
        ${filteredLedger.map(log => {
    // Format signs
    let amountClass = 'amount-positive';
    let amountSign = '+';
    if (log.type === 'PAYMENT' || log.type === 'TRANSFER_OUT' || log.type === 'LOAN_REPAYMENT') {
      amountClass = 'amount-negative';
      amountSign = '-';
    }

    const totalFees = parseFloat(log.fee_bank) + parseFloat(log.fee_pajak);

    return `
            <div class="grid-row ledger-layout">
              <!-- ID -->
              <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: var(--neon-cyan);">${log.id}</div>
              <!-- Info -->
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <span style="font-weight: 600; font-size: 13px;">${log.description}</span>
                <span style="font-size: 10px; color: var(--text-dim);">${new Date(log.timestamp).toLocaleString('id-ID')}</span>
              </div>
              <!-- App Source -->
              <div><span class="role-badge role-customer" style="font-size: 9px; padding: 2px 6px;">${log.app}</span></div>
              <!-- Amount -->
              <div class="ledger-amount ${amountClass}" style="font-size: 13px;">
                ${amountSign}${formatIDR(log.amount)}
              </div>
              <!-- Fee/Tax Pool -->
              <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-dim);">
                Fee: ${formatIDR(log.fee_bank)}<br>
                Tax: ${formatIDR(log.fee_pajak)}
              </div>
              <!-- Verification Badge -->
              <div style="text-align: right;">
                <span class="status-badge status-verified" style="font-size: 8px; font-family: var(--font-mono); padding: 2px 6px; letter-spacing: 0.5px;">
                  VERIFIED
                </span>
              </div>
            </div>
          `;
  }).join('')}
        ${filteredLedger.length === 0 ? `
          <div style="padding: 40px; text-align: center; color: var(--text-dim); font-family: var(--font-mono);">
            [NO_LEDGER_ENTRIES_FOUND]
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// 4. Tab: Policy Config Page
function renderPolicyConfig() {
  return `
    <div class="content-header">
      <h1>Konfigurasi Aturan & Parameter Moneter</h1>
      <p>Fine-tune transactional fees, system taxes, interest parameters, and client transaction constraints</p>
    </div>

    <div class="policy-grid">
      <!-- Fee Card -->
      <div class="policy-card">
        <h3 class="policy-title">Biaya Layanan Bank (Transaction Fee)</h3>
        <p class="policy-desc">Persentase potongan bank untuk memproses setiap transaksi keuangan di ekosistem SmartBank.</p>
        <div class="policy-slider-container">
          <div class="policy-value-row">
            <span>RATES</span>
            <span id="label-fee">${systemPolicies.feeRate.toFixed(1)}%</span>
          </div>
          <input type="range" min="0" max="5" step="0.1" value="${systemPolicies.feeRate}" class="policy-slider" id="slider-fee" />
          <div class="policy-limits">
            <span>MIN: 0.0%</span>
            <span>MAX: 5.0%</span>
          </div>
        </div>
      </div>

      <!-- Tax Card -->
      <div class="policy-card">
        <h3 class="policy-title">Pajak Sistem (Ecosystem Tax)</h3>
        <p class="policy-desc">Pajak otomatis yang ditarik per transaksi sebagai sarana penarikan uang beredar (Money Sink) untuk mencegah inflasi.</p>
        <div class="policy-slider-container">
          <div class="policy-value-row">
            <span>RATES</span>
            <span id="label-tax">${systemPolicies.taxRate.toFixed(1)}%</span>
          </div>
          <input type="range" min="0" max="10" step="0.2" value="${systemPolicies.taxRate}" class="policy-slider" id="slider-tax" />
          <div class="policy-limits">
            <span>MIN: 0.0%</span>
            <span>MAX: 10.0%</span>
          </div>
        </div>
      </div>

      <!-- Loan Interest Card -->
      <div class="policy-card">
        <h3 class="policy-title">Bunga Pinjaman (Loan Interest Rate)</h3>
        <p class="policy-desc">Tingkat bunga mingguan yang dibebankan kepada debitur/nasabah yang meminjam dana ke bank reserve.</p>
        <div class="policy-slider-container">
          <div class="policy-value-row">
            <span>RATES</span>
            <span id="label-interest">${systemPolicies.loanInterest}%</span>
          </div>
          <input type="range" min="5" max="25" step="1" value="${systemPolicies.loanInterest}" class="policy-slider" id="slider-interest" />
          <div class="policy-limits">
            <span>MIN: 5%</span>
            <span>MAX: 25%</span>
          </div>
        </div>
      </div>

      <!-- Daily limit Card -->
      <div class="policy-card">
        <h3 class="policy-title">Batas Transaksi Harian (Daily Tx Limit)</h3>
        <p class="policy-desc">Batas maksimal frekuensi transaksi yang boleh dieksekusi oleh setiap nasabah per hari.</p>
        <div class="policy-slider-container">
          <div class="policy-value-row">
            <span>TX_LIMIT</span>
            <span id="label-limit">${systemPolicies.dailyLimit} Tx</span>
          </div>
          <input type="range" min="5" max="50" step="1" value="${systemPolicies.dailyLimit}" class="policy-slider" id="slider-limit" />
          <div class="policy-limits">
            <span>MIN: 5 Tx</span>
            <span>MAX: 50 Tx</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Apply Policy Settings -->
    <div style="text-align: right;">
      <button class="btn-primary" id="savePoliciesBtn" style="padding: 14px 28px; font-size: 13px;">Terapkan Kebijakan Baru</button>
    </div>
  `;
}

// --- Bind Tab and Interaction Events ---
function attachTabEvents() {
  // Tab Switchers
  document.querySelectorAll('[data-tab]').forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      currentTab = tab.getAttribute('data-tab');
      renderBaseLayout();
    });
  });

  // Search input binding
  const searchInput = document.getElementById('globalSearchInput');
  if (searchInput) {
    searchInput.focus();
    // Maintain cursor position at the end of the text
    const val = searchInput.value;
    searchInput.value = '';
    searchInput.value = val;

    searchInput.addEventListener('input', (e) => {
      userSearchQuery = e.target.value;
      const content = document.querySelector('.page-content');
      if (content) {
        content.innerHTML = renderActiveTab();
        attachTableActions(); // Bind action clicks within tables
      }
    });
  }

  attachTableActions();
}

function attachTableActions() {
  // 1. Role Change Handler
  document.querySelectorAll('.select-role').forEach(select => {
    select.addEventListener('change', async (e) => {
      const userId = e.target.getAttribute('data-id');
      const newRole = e.target.value;
      const user = usersDB.find(u => u.id === userId);

      if (user) {
        try {
          const res = await fetch(`http://localhost:3000/api/admin/users/${userId}/role`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole })
          });
          
          if (!res.ok) throw new Error('Update failed');
          
          const oldRole = user.role;
          user.role = newRole;

          // Log to system logs
          const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
          systemLogs.unshift({
            time: timeNow,
            tag: 'KYC',
            text: `User authority changed: "${user.name}" (${user.id}) elevated from ${oldRole.toUpperCase()} to ${newRole.toUpperCase()}.`
          });

          showToast(`Perubahan Hak Akses Berhasil: ${user.name} diubah menjadi ${newRole.toUpperCase()}`);

          // Refresh data quietly
          fetch('http://localhost:3000/api/admin/stats')
            .then(r => r.json())
            .then(data => appState.stats = data);
            
        } catch(err) {
          showToast(`Gagal merubah hak akses: ${err.message}`, 'error');
          e.target.value = user.role; // revert
        }
      }
    });
  });

  // 2. KYC Toggle Handler
  document.querySelectorAll('[data-action="toggle-kyc"]').forEach(badge => {
    badge.addEventListener('click', async (e) => {
      const userId = e.target.getAttribute('data-id');
      const user = usersDB.find(u => u.id === userId);
      if (user) {
        try {
          const res = await fetch(`http://localhost:3000/api/admin/users/${userId}/status`, {
            method: 'PUT'
          });
          if (!res.ok) throw new Error('Toggle status failed');
          const data = await res.json();
          
          user.status = data.new_status;

          const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
          systemLogs.unshift({
            time: timeNow,
            tag: 'KYC',
            text: `Account Verification update: "${user.name}" KYC status modified to ${user.status.toUpperCase()}.`
          });

          showToast(`KYC Status "${user.name}" diubah menjadi ${user.status.toUpperCase()}`);

          // Re-render table state
          const content = document.querySelector('.page-content');
          if (content) {
            content.innerHTML = renderActiveTab();
            attachTableActions();
          }
        } catch(err) {
          showToast(`Gagal merubah status KYC: ${err.message}`, 'error');
        }
      }
    });
  });

  // 3. Ledger Filter Dropdown Handler
  const ledgerSelect = document.getElementById('ledgerFilterSelect');
  if (ledgerSelect) {
    ledgerSelect.addEventListener('change', (e) => {
      ledgerFilter = e.target.value;
      const content = document.querySelector('.page-content');
      if (content) {
        content.innerHTML = renderActiveTab();
        attachTableActions();
      }
    });
  }

  // 4. Policy Sliders live labels
  const sliders = [
    { id: 'slider-fee', labelId: 'label-fee', format: (val) => `${parseFloat(val).toFixed(1)}%` },
    { id: 'slider-tax', labelId: 'label-tax', format: (val) => `${parseFloat(val).toFixed(1)}%` },
    { id: 'slider-interest', labelId: 'label-interest', format: (val) => `${val}%` },
    { id: 'slider-limit', labelId: 'label-limit', format: (val) => `${val} Tx` }
  ];

  sliders.forEach(s => {
    const sliderEl = document.getElementById(s.id);
    const labelEl = document.getElementById(s.labelId);
    if (sliderEl && labelEl) {
      sliderEl.addEventListener('input', (e) => {
        labelEl.textContent = s.format(e.target.value);
      });
    }
  });

  // 5. Policy Save Button
  const saveBtn = document.getElementById('savePoliciesBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const feeVal = parseFloat(document.getElementById('slider-fee').value);
      const taxVal = parseFloat(document.getElementById('slider-tax').value);
      const interestVal = parseInt(document.getElementById('slider-interest').value);
      const limitVal = parseInt(document.getElementById('slider-limit').value);

      systemPolicies = {
        feeRate: feeVal,
        taxRate: taxVal,
        loanInterest: interestVal,
        dailyLimit: limitVal
      };

      const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      systemLogs.unshift({
        time: timeNow,
        tag: 'SYS',
        text: `Global financial parameters updated: FEE=${feeVal}%, TAX=${taxVal}%, INTEREST=${interestVal}%, DAILY_LIMIT=${limitVal}Tx.`
      });

      showToast('Konfigurasi Kebijakan Moneter Berhasil Diperbarui!');
    });
  }

  // 6. Export ledger CSV click
  const exportCsvBtn = document.getElementById('exportLedgerCsvBtn');
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      showToast('Mengekspor berkas ledger_audit_log.csv...', 'info');
    });
  }

  // 7. Create New Account click
  const newAccountBtn = document.getElementById('createNewAccountBtn');
  if (newAccountBtn) {
    newAccountBtn.addEventListener('click', async () => {
      const name = prompt("Masukkan Nama Lengkap Nasabah Baru:");
      if (!name) return;
      const email = prompt("Masukkan Email Nasabah Baru:");
      if (!email) return;

      try {
        const res = await fetch('http://localhost:3000/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name,
            email: email,
            password: 'password123',
            role: 'user'
          })
        });

        if (!res.ok) throw new Error('Failed to create account');
        const newRecord = await res.json();

        usersDB.push(newRecord);

        const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        systemLogs.unshift({
          time: timeNow,
          tag: 'KYC',
          text: `New customer account registered: "${name}" (${newRecord.id}) with starting balance Rp 50.000.`
        });

        showToast(`Pendaftaran Berhasil: ${name} (${newRecord.id})`);

        // Re-render table
        const content = document.querySelector('.page-content');
        if (content) {
          content.innerHTML = renderActiveTab();
          attachTableActions();
        }
      } catch(err) {
        showToast(`Gagal mendaftarkan akun: ${err.message}`, 'error');
      }
    });
  }
}

function attachGlobalEvents() {
  document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('Anda yakin ingin memutus koneksi session Admin?')) {
      window.location.href = '/admin-login.html';
    }
  });
}

// Start Mainboard
bootstrap();
