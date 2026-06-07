import './dashboard.css';

document.body.classList.add('admin-dashboard-body');

const ic = {
  bank: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="20" width="20" height="2"/><path d="M12 2L2 8h20L12 2z"/><rect x="4" y="10" width="4" height="8"/><rect x="16" y="10" width="4" height="8"/><rect x="10" y="10" width="4" height="8"/></svg>`,
  users: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  reports: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  shield: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  search: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  logout: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  database: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`
};

let appState = null;

async function bootstrap() {
  try {
    const res = await fetch('http://localhost:3000/api/data');
    appState = await res.json();
    renderAdminUI();
  } catch (e) {
    document.querySelector('#app').innerHTML = '<h2 style="padding:40px">CORE_ERR: Failed to initialize system.</h2>';
    console.error(e);
  }
}

function renderAdminUI() {
  document.querySelector('#app').innerHTML = `
  <div class="dashboard-layout fade-in">
    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="sidebar-logo">${ic.shield}</div>
      <nav class="sidebar-menu">
        <a href="#" class="menu-item active" title="System Data">${ic.database}</a>
        <a href="#" class="menu-item" title="User Management">${ic.users}</a>
        <a href="#" class="menu-item" title="Security Reports">${ic.shield}</a>
      </nav>
      <div class="sidebar-bottom">
        <a href="/admin-login.html" id="logoutBtn" class="menu-item" title="Terminate Session" style="color: var(--neon-red); background: rgba(244, 63, 94, 0.1);">${ic.logout}</a>
        <div class="sidebar-user-avatar">AD</div>
      </div>
    </aside>

    <!-- MAIN AREA -->
    <div class="main-area">
      <!-- Top Nav -->
      <nav class="topnav">
        <div class="topnav-brand">
          SMARTBANK // SECURE_CORE_v1.0
        </div>
        <div class="topnav-search">
          ${ic.search}
          <input type="text" placeholder="QUERY_SYSTEM_DATA..." />
        </div>
        <div class="topnav-user">
          <div style="text-align: right;">
            <div class="topnav-user-name" style="font-weight: 700; font-size: 14px;">SUPER_ADMIN</div>
            <div style="font-size: 10px; color: var(--neon-cyan); font-family: var(--font-mono);">AUTH_LEVEL: 10</div>
          </div>
          <div class="topnav-user-avatar">SA</div>
        </div>
      </nav>

      <!-- Page Content -->
      <div class="page-content">
        <div class="content-header">
          <h1>System Infrastructure</h1>
          <p>Global monitoring of bank nodes and user identities</p>
        </div>

        <!-- STATS GRID -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Total Verified Identities</div>
            <div class="stat-value">1,284</div>
            <div class="stat-trend trend-up">+12.5% [AUTO_SYNC]</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Vault Volume</div>
            <div class="stat-value">Rp 8.42B</div>
            <div class="stat-trend trend-up">+5.20% [INBOUND]</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">System Node Status</div>
            <div class="stat-value" style="color: var(--neon-cyan);">ACTIVE</div>
            <div class="stat-trend trend-up">100% OPERATIONAL</div>
          </div>
        </div>

        <!-- MAIN GRID: TABLE + SIDE INFO -->
        <div class="dashboard-grid">
          <!-- LEFT: USER TABLE -->
          <div class="data-table-card">
            <div class="table-header">
              <h2 id="tableTitle">Network Node Clusters</h2>
              <div class="table-actions">
                <button class="btn-secondary" id="exportBtn">DOWNLOAD_LOGS</button>
                <button class="btn-primary" id="addBtn">+ NEW_RECORD</button>
              </div>
            </div>
            <div class="table-container" id="tableContainer">
              <div class="grid-row grid-head">
                <div>NODE_IDENTIFIER</div>
                <div>REGION_LOCATION</div>
                <div>UPTIME_STATUS</div>
                <div>LOAD_CAPACITY</div>
              </div>
              <div class="grid-row">
                <div class="user-name">NODE-JKT-01</div>
                <div class="user-email">Jakarta, ID</div>
                <div style="color: #10b981;">99.99%</div>
                <div><span class="status-badge status-verified">OPTIMAL</span></div>
              </div>
              <div class="grid-row">
                <div class="user-name">NODE-SG-02</div>
                <div class="user-email">Singapore, SG</div>
                <div style="color: #10b981;">100.00%</div>
                <div><span class="status-badge status-verified">OPTIMAL</span></div>
              </div>
            </div>
          </div>

          <!-- RIGHT: ACTIVITY & INFO -->
          <div class="side-content">
            <div class="activity-card">
              <div class="activity-header">
                <h2 style="font-size: 18px; margin: 0;">Recent System Activity</h2>
                <span style="font-size: 10px; color: var(--neon-cyan); font-family: var(--font-mono);">LIVE_FEED</span>
              </div>
              <div class="activity-list" id="activityList">
                <div class="log-item">
                  <div class="log-time">21:20:45</div>
                  <div class="log-content"><span class="log-tag">AUTH</span> Admin "SuperAdmin" initialized secure session.</div>
                </div>
                <div class="log-item">
                  <div class="log-time">21:18:12</div>
                  <div class="log-content"><span class="log-tag">KYC</span> New registration: "Joko Widodo" added to queue.</div>
                </div>
                <div class="log-item">
                  <div class="log-time">21:05:00</div>
                  <div class="log-content"><span class="log-tag">SYS</span> Node "JKT-01" performed automated backup.</div>
                </div>
              </div>
            </div>

            <div class="info-panel">
              <h2 style="font-size: 18px; margin: 0 0 20px 0; border-bottom: 1px solid var(--border-glow); padding-bottom: 10px;">Admin Operations Guide</h2>
              <div class="info-item">
                <h4>${ic.shield} Gatekeeping</h4>
                <p>Verifikasi identitas nasabah di daftar antrian kiri. Ubah status menjadi 'Verified' untuk memberikan akses perbankan.</p>
              </div>
              <div class="info-item">
                <h4>${ic.database} Infrastructure</h4>
                <p>Pantau 'Vault Volume' dan 'Node Status' di atas. Pastikan ketersediaan sistem 100% untuk seluruh nasabah.</p>
              </div>
              <div class="info-item">
                <h4>${ic.reports} Audit Compliance</h4>
                <p>Gunakan 'Download Logs' untuk kebutuhan pelaporan regulasi bulanan kepada Bank Indonesia.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;
}

// --- Handlers ---
const mainArea = document.querySelector('.page-content');

// Sidebar Logic
const menuItems = document.querySelectorAll('.menu-item');
menuItems.forEach(item => {
  item.addEventListener('click', (e) => {
    if (item.getAttribute('href') === '#') {
      e.preventDefault();
      menuItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const title = item.getAttribute('title');
      // Toast disabled
      mainArea.style.opacity = '0.3';
      mainArea.style.pointerEvents = 'none';
      setTimeout(() => {
        mainArea.style.opacity = '1';
        mainArea.style.pointerEvents = 'all';
        const contentHeader = document.querySelector('.content-header h1');
        const contentSub = document.querySelector('.content-header p');
        const tableTitle = document.getElementById('tableTitle');
        const tableContainer = document.getElementById('tableContainer');
        const activityList = document.getElementById('activityList');
        const statCards = document.querySelectorAll('.stat-card');
        if (title === 'System Data') {
          contentHeader.textContent = 'System Infrastructure';
          contentSub.textContent = 'Global monitoring of bank nodes and user identities';
          statCards[0].innerHTML = `<div class="stat-label">Network Latency</div><div class="stat-value">12ms</div><div class="stat-trend trend-up">OPTIMAL_DELAY</div>`;
          statCards[1].innerHTML = `<div class="stat-label">Mainframe CPU</div><div class="stat-value">42.5%</div><div class="stat-trend trend-up">STABLE_LOAD</div>`;
          statCards[2].innerHTML = `<div class="stat-label">Active Nodes</div><div class="stat-value" style="color: var(--neon-cyan);">08/08</div><div class="stat-trend trend-up">100% ONLINE</div>`;
          tableTitle.textContent = 'Network Node Clusters';
          tableContainer.innerHTML = `
            <div class="grid-row grid-head">
              <div>NODE_IDENTIFIER</div>
              <div>REGION_LOCATION</div>
              <div>UPTIME_STATUS</div>
              <div>LOAD_CAPACITY</div>
            </div>
            <div class="grid-row">
              <div class="user-name">NODE-JKT-01</div>
              <div class="user-email">Jakarta, ID</div>
              <div style="color: #10b981;">99.99%</div>
              <div><span class="status-badge status-verified">OPTIMAL</span></div>
            </div>
            <div class="grid-row">
              <div class="user-name">NODE-SG-02</div>
              <div class="user-email">Singapore, SG</div>
              <div style="color: #10b981;">100.00%</div>
              <div><span class="status-badge status-verified">OPTIMAL</span></div>
            </div>
          `;
          activityList.innerHTML = `
            <div class="log-item"><div class="log-time">21:20</div><div class="log-content"><span class="log-tag">SYS</span> Node JKT-01 synchronized.</div></div>
            <div class="log-item"><div class="log-time">21:05</div><div class="log-content"><span class="log-tag">SYS</span> Daily DB backup completed.</div></div>
          `;
        } else if (title === 'User Management') {
          contentHeader.textContent = 'Identity Management';
          contentSub.textContent = 'Authority portal for managing secure user records';
          statCards[0].innerHTML = `<div class="stat-label">Total Verified Identities</div><div class="stat-value">1,284</div><div class="stat-trend trend-up">+12% THIS_MONTH</div>`;
          statCards[1].innerHTML = `<div class="stat-label">Pending KYC</div><div class="stat-value">12</div><div class="stat-trend trend-down">ACTION_REQUIRED</div>`;
          statCards[2].innerHTML = `<div class="stat-label">New Today</div><div class="stat-value" style="color: var(--neon-cyan);">+45</div><div class="stat-trend trend-up">INCREASING</div>`;
          tableTitle.textContent = 'Identity Verification Queue';
          tableContainer.innerHTML = `
            <div class="grid-row grid-head">
              <div>FULL_LEGAL_NAME</div>
              <div>SYSTEM_EMAIL</div>
              <div>REG_DATE</div>
              <div>KYC_STATUS</div>
            </div>
            <div class="grid-row">
              <div class="user-name">Budi Santoso</div>
              <div class="user-email">budi@smartbank.local</div>
              <div>2026-05-01</div>
              <div><span class="status-badge status-verified">VERIFIED</span></div>
            </div>
            <div class="grid-row">
              <div class="user-name">Joko Widodo</div>
              <div class="user-email">joko@smartbank.local</div>
              <div>2026-05-01</div>
              <div><span class="status-badge status-pending">PENDING</span></div>
            </div>
          `;
          activityList.innerHTML = `
            <div class="log-item"><div class="log-time">21:18</div><div class="log-content"><span class="log-tag">KYC</span> New user "Joko" awaiting review.</div></div>
            <div class="log-item"><div class="log-time">20:45</div><div class="log-content"><span class="log-tag">USER</span> Budi Santoso verified by system.</div></div>
          `;
        } else if (title === 'Security Reports') {
          contentHeader.textContent = 'Security & Audit Logs';
          contentSub.textContent = 'Monitoring cryptographic access and system breaches';
          statCards[0].innerHTML = `<div class="stat-label">Global Threat Score</div><div class="stat-value">LOW</div><div class="stat-trend trend-up">SECURE_ENV</div>`;
          statCards[1].innerHTML = `<div class="stat-label">Blocked IPs</div><div class="stat-value">1,024</div><div class="stat-trend trend-up">FIREWALL_ACTIVE</div>`;
          statCards[2].innerHTML = `<div class="stat-label">SSL Sessions</div><div class="stat-value" style="color: var(--neon-cyan);">856</div><div class="stat-trend trend-up">ENCRYPTED_CORE</div>`;
          tableTitle.textContent = 'Threat Intelligence Feed';
          tableContainer.innerHTML = `
            <div class="grid-row grid-head">
              <div>EVENT_TYPE</div>
              <div>SOURCE_IP</div>
              <div>TIMESTAMP</div>
              <div>RISK_LEVEL</div>
            </div>
            <div class="grid-row">
              <div class="user-name">SSL_RENEWAL</div>
              <div class="user-email">INTERNAL_CORE</div>
              <div>14:02:11</div>
              <div><span class="status-badge status-verified">SECURE</span></div>
            </div>
            <div class="grid-row">
              <div class="user-name">BRUTE_FORCE_DETECTED</div>
              <div class="user-email">45.12.88.2</div>
              <div>13:55:02</div>
              <div><span class="status-badge status-pending">CRITICAL</span></div>
            </div>
          `;
          activityList.innerHTML = `
            <div class="log-item"><div class="log-time">21:25</div><div class="log-content"><span class="log-tag">SEC</span> Firewall blocked IP 45.12.88.2.</div></div>
            <div class="log-item"><div class="log-time">21:10</div><div class="log-content"><span class="log-tag">SEC</span> SSL Handshake success (v3.0).</div></div>
          `;
        }
      }, 400);
    }
  });
});

document.getElementById('logoutBtn').addEventListener('click', (e) => {
  e.preventDefault();
  window.location.href = '/admin-login.html';
});

document.getElementById('exportBtn').addEventListener('click', () => {
  // Toast disabled
});

document.getElementById('addBtn').addEventListener('click', () => {
  // Toast disabled
});

document.querySelector('.topnav-search input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    // Toast disabled
  }
});

bootstrap();
