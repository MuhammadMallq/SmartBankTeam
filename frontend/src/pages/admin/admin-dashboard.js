import './admin-dashboard.css';
import { ICONS, showToast } from '../../utils/ui-core.js';

/**
 * SMARTBANK ADMIN DASHBOARD
 * Core infrastructure for system monitoring and authority management.
 */

document.body.classList.add('admin-dashboard-body');

// --- View Definitions ---
const DASHBOARD_VIEWS = {
  'System Data': {
    header: 'System Infrastructure',
    sub: 'Global monitoring of bank nodes and user identities',
    stats: [
      { label: 'Network Latency', value: '12ms', trend: 'OPTIMAL_DELAY' },
      { label: 'Mainframe CPU', value: '42.5%', trend: 'STABLE_LOAD' },
      { label: 'Active Nodes', value: '08/08', trend: '100% ONLINE', color: 'var(--neon-cyan)' }
    ],
    table: {
      title: 'Network Node Clusters',
      headers: ['NODE_IDENTIFIER', 'REGION_LOCATION', 'UPTIME_STATUS', 'LOAD_CAPACITY'],
      rows: [
        ['NODE-JKT-01', 'Jakarta, ID', '<span style="color: #10b981;">99.99%</span>', '<span class="status-badge status-verified">OPTIMAL</span>'],
        ['NODE-SG-02', 'Singapore, SG', '<span style="color: #10b981;">100.00%</span>', '<span class="status-badge status-verified">OPTIMAL</span>']
      ]
    },
    logs: [
      { time: '21:20', tag: 'SYS', text: 'Node JKT-01 synchronized.' },
      { time: '21:05', tag: 'SYS', text: 'Daily DB backup completed.' }
    ]
  },
  'User Management': {
    header: 'Identity Management',
    sub: 'Authority portal for managing secure user records',
    stats: [
      { label: 'Total Verified Identities', value: '1,284', trend: '+12% THIS_MONTH' },
      { label: 'Pending KYC', value: '12', trend: 'ACTION_REQUIRED' },
      { label: 'New Today', value: '+45', trend: 'INCREASING', color: 'var(--neon-cyan)' }
    ],
    table: {
      title: 'Identity Verification Queue',
      headers: ['FULL_LEGAL_NAME', 'SYSTEM_EMAIL', 'REG_DATE', 'KYC_STATUS'],
      rows: [
        ['Budi Santoso', 'budi@smartbank.local', '2026-05-01', '<span class="status-badge status-verified">VERIFIED</span>'],
        ['Joko Widodo', 'joko@smartbank.local', '2026-05-01', '<span class="status-badge status-pending">PENDING</span>']
      ]
    },
    logs: [
      { time: '21:18', tag: 'KYC', text: 'New user "Joko" awaiting review.' },
      { time: '20:45', tag: 'USER', text: 'Budi Santoso verified by system.' }
    ]
  },
  'Security Reports': {
    header: 'Security & Audit Logs',
    sub: 'Monitoring cryptographic access and system breaches',
    stats: [
      { label: 'Global Threat Score', value: 'LOW', trend: 'SECURE_ENV' },
      { label: 'Blocked IPs', value: '1,024', trend: 'FIREWALL_ACTIVE' },
      { label: 'SSL Sessions', value: '856', trend: 'ENCRYPTED_CORE', color: 'var(--neon-cyan)' }
    ],
    table: {
      title: 'Threat Intelligence Feed',
      headers: ['EVENT_TYPE', 'SOURCE_IP', 'TIMESTAMP', 'RISK_LEVEL'],
      rows: [
        ['SSL_RENEWAL', 'INTERNAL_CORE', '14:02:11', '<span class="status-badge status-verified">SECURE</span>'],
        ['BRUTE_FORCE_DETECTED', '45.12.88.2', '13:55:02', '<span class="status-badge status-pending">CRITICAL</span>']
      ]
    },
    logs: [
      { time: '21:25', tag: 'SEC', text: 'Firewall blocked IP 45.12.88.2.' },
      { time: '21:10', tag: 'SEC', text: 'SSL Handshake success (v3.0).' }
    ]
  }
};

let appState = null;

async function bootstrap() {
  try {
    const res = await fetch('/dummy_data.json');
    appState = await res.json();
    renderBaseLayout();
    attachEventListeners();
  } catch (e) {
    document.querySelector('#app').innerHTML = '<h2 style="padding:40px">CORE_ERR: Failed to initialize system.</h2>';
    console.error('Bootstrap error:', e);
  }
}

function renderBaseLayout() {
  document.querySelector('#app').innerHTML = `
  <div class="dashboard-layout fade-in">
    <aside class="sidebar">
      <div class="sidebar-logo">${ICONS.shield}</div>
      <nav class="sidebar-menu">
        <a href="#" class="menu-item active" title="System Data">${ICONS.database}</a>
        <a href="#" class="menu-item" title="User Management">${ICONS.users}</a>
        <a href="#" class="menu-item" title="Security Reports">${ICONS.shield}</a>
      </nav>
      <div class="sidebar-bottom">
        <a href="/admin-login.html" id="logoutBtn" class="menu-item" title="Terminate Session" style="color: var(--neon-red); background: rgba(244, 63, 94, 0.1);">${ICONS.logout}</a>
        <div class="sidebar-user-avatar">AD</div>
      </div>
    </aside>

    <div class="main-area">
      <nav class="topnav">
        <div class="topnav-brand">SMARTBANK // SECURE_CORE_v1.0</div>
        <div class="topnav-search">${ICONS.search}<input type="text" placeholder="QUERY_SYSTEM_DATA..." /></div>
        <div class="topnav-user">
          <div style="text-align: right;">
            <div class="topnav-user-name" style="font-weight: 700; font-size: 14px;">SUPER_ADMIN</div>
            <div style="font-size: 10px; color: var(--neon-cyan); font-family: var(--font-mono);">AUTH_LEVEL: 10</div>
          </div>
          <div class="topnav-user-avatar">SA</div>
        </div>
      </nav>

      <div class="page-content">
        <!-- Content injected here -->
      </div>
    </div>
  </div>`;
  
  switchView('System Data');
}

function switchView(viewName) {
  const data = DASHBOARD_VIEWS[viewName];
  if (!data) return;

  const contentArea = document.querySelector('.page-content');
  contentArea.style.opacity = '0.3';
  contentArea.style.pointerEvents = 'none';

  setTimeout(() => {
    contentArea.innerHTML = `
      <div class="content-header">
        <h1>${data.header}</h1>
        <p>${data.sub}</p>
      </div>

      <div class="stats-grid">
        ${data.stats.map(s => `
          <div class="stat-card">
            <div class="stat-label">${s.label}</div>
            <div class="stat-value" ${s.color ? `style="color: ${s.color}"` : ''}>${s.value}</div>
            <div class="stat-trend trend-up">${s.trend}</div>
          </div>
        `).join('')}
      </div>

      <div class="dashboard-grid">
        <div class="data-table-card">
          <div class="table-header">
            <h2 id="tableTitle">${data.table.title}</h2>
            <div class="table-actions">
              <button class="btn-secondary" id="exportBtn">DOWNLOAD_LOGS</button>
              <button class="btn-primary" id="addBtn">+ NEW_RECORD</button>
            </div>
          </div>
          <div class="table-container">
            <div class="grid-row grid-head">
              ${data.table.headers.map(h => `<div>${h}</div>`).join('')}
            </div>
            ${data.table.rows.map(row => `
              <div class="grid-row">
                ${row.map(cell => `<div>${cell}</div>`).join('')}
              </div>
            `).join('')}
          </div>
        </div>

        <div class="side-content">
          <div class="activity-card">
            <div class="activity-header">
              <h2 style="font-size: 18px; margin: 0;">Recent System Activity</h2>
              <span style="font-size: 10px; color: var(--neon-cyan); font-family: var(--font-mono);">LIVE_FEED</span>
            </div>
            <div class="activity-list">
              ${data.logs.map(log => `
                <div class="log-item">
                  <div class="log-time">${log.time}</div>
                  <div class="log-content"><span class="log-tag">${log.tag}</span> ${log.text}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="info-panel">
            <h2 style="font-size: 18px; margin: 0 0 20px 0; border-bottom: 1px solid var(--border-glow); padding-bottom: 10px;">Operations Guide</h2>
            <div class="info-item">
              <h4>${ICONS.shield} Gatekeeping</h4>
              <p>Verifikasi identitas nasabah di daftar antrian kiri. Ubah status menjadi 'Verified' untuk memberikan akses perbankan.</p>
            </div>
            <div class="info-item">
              <h4>${ICONS.database} Infrastructure</h4>
              <p>Pantau 'Vault Volume' dan 'Node Status' di atas. Pastikan ketersediaan sistem 100% untuk seluruh nasabah.</p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    contentArea.style.opacity = '1';
    contentArea.style.pointerEvents = 'all';
  }, 400);
}

function attachEventListeners() {
  const menuItems = document.querySelectorAll('.menu-item');
  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const href = item.getAttribute('href');
      if (href === '#') {
        e.preventDefault();
        menuItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        switchView(item.getAttribute('title'));
      }
    });
  });

  document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '/admin-login.html';
  });

  document.getElementById('exportBtn')?.addEventListener('click', () => {
    showToast('Exporting system logs...');
  });

  document.getElementById('addBtn')?.addEventListener('click', () => {
    showToast('Initialize new record...', 'info');
  });
}

bootstrap();
