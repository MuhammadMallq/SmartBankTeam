import '../../styles/style.css';
import '../../styles/premium.css';
import { ICONS, showToast, formatIDR } from '../../utils/ui-core.js';

/**
 * SMARTBANK CUSTOMER SERVICE DASHBOARD
 * Premium Glassmorphism UI
 */

async function bootstrap() {
  renderCSUI();
}

function renderCSUI() {
  // Apply premium background to body via wrapper class
  document.querySelector('#app').innerHTML = `
  <div class="dashboard-layout fade-in premium-bg">
    <aside class="sidebar">
      <div class="sidebar-logo" style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);">${ICONS.users}</div>
      <nav class="sidebar-menu">
        <a href="#" class="menu-item active" title="Customer Service">${ICONS.users}</a>
        <a href="#" class="menu-item" title="Loan Management">${ICONS.reports}</a>
        <a href="#" class="menu-item" title="Ledger Audit">${ICONS.database}</a>
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
          <div class="topnav-user">
            <div class="topnav-user-avatar" style="background: rgba(167, 139, 250, 0.2); color: #a78bfa;">CS</div>
            <span class="topnav-user-name">CS Officer 01</span>
          </div>
        </div>
      </nav>

      <div class="page-content">
        <h1 class="page-heading">Customer Service Desk</h1>

        <div class="grid-2 mb-8">
          <!-- Registrasi & Pemeliharaan Akun -->
          <div class="glass-panel">
            <div class="glass-panel-header">
              <div class="glass-panel-icon">${ICONS.users}</div>
              <h2 class="glass-panel-title text-gradient">Registrasi & Pemeliharaan Akun</h2>
            </div>
            <form id="form-onboarding" class="glass-body">
              <div style="margin-bottom: 16px;">
                <label class="glass-label">Nama Lengkap Nasabah</label>
                <input type="text" placeholder="Masukkan nama sesuai KTP" required class="glass-input" />
              </div>
              <div style="margin-bottom: 16px;">
                <label class="glass-label">Email / Kontak</label>
                <input type="email" placeholder="email@example.com" required class="glass-input" />
              </div>
              <div style="margin-bottom: 24px;">
                <label class="glass-label">Tindakan Sistem</label>
                <select class="glass-select">
                  <option value="new">Buka Rekening Baru</option>
                  <option value="recover">Pulihkan Akun Terkunci</option>
                  <option value="update">Update Data Nasabah</option>
                </select>
              </div>
              <button type="submit" class="btn-glow">
                ${ICONS.check} Proses Permintaan Akun
              </button>
            </form>
          </div>

          <!-- Inquiry Informasi & Saldo Nasabah -->
          <div class="glass-panel">
            <div class="glass-panel-header">
              <div class="glass-panel-icon" style="color: #60a5fa;">${ICONS.search}</div>
              <h2 class="glass-panel-title text-gradient" style="background: linear-gradient(135deg, #60a5fa, #3b82f6); -webkit-background-clip: text;">Inquiry Informasi Nasabah</h2>
            </div>
            <div class="glass-body">
              <div class="flex gap-4 mb-6">
                <input type="text" placeholder="Cari berdasarkan User ID atau Nama..." class="glass-input" style="flex: 1;" />
                <button class="btn-glow" style="width: auto; padding: 0 24px;" onclick="alert('Mencari data...')">Cari</button>
              </div>
              
              <div style="background: rgba(0,0,0,0.2); border-radius: 16px; padding: 20px; border: 1px solid rgba(255,255,255,0.05);">
                <div class="flex justify-between mb-6">
                  <div>
                    <div class="glass-label">Status Rekening</div>
                    <div class="flex items-center gap-2" style="color: #34d399; font-weight: 700;">
                      <span style="width:8px; height:8px; background:#34d399; border-radius:50%; box-shadow: 0 0 10px #34d399;"></span>
                      AKTIF
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <div class="glass-label">Sisa Saldo Tersedia</div>
                    <div class="text-gradient-green" style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">${formatIDR(1500000)}</div>
                  </div>
                </div>
                
                <div class="glass-label mb-4">Mutasi Terakhir</div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 13px; color: rgba(255,255,255,0.8);">Transfer Masuk dari USR-092</span>
                    <span style="color: #34d399; font-weight: 700; font-size: 14px;">+ ${formatIDR(500000)}</span>
                  </div>
                  <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 13px; color: rgba(255,255,255,0.8);">Potongan Pajak Sistem</span>
                    <span style="color: #f87171; font-weight: 700; font-size: 14px;">- ${formatIDR(10000)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid-2">
          <!-- Pengajuan Pinjaman (Loan Management) -->
          <div class="glass-panel">
            <div class="glass-panel-header">
              <div class="glass-panel-icon" style="color: #fbbf24;">${ICONS.bank}</div>
              <h2 class="glass-panel-title text-gradient" style="background: linear-gradient(135deg, #fbbf24, #f59e0b); -webkit-background-clip: text;">Pengajuan Pinjaman (Loan)</h2>
            </div>
            <form id="form-loan" class="glass-body">
              <div style="margin-bottom: 16px;">
                <label class="glass-label">ID Nasabah</label>
                <input type="text" placeholder="Masukkan ID Nasabah (contoh: USR-123)" required class="glass-input" />
              </div>
              <div class="grid-2" style="margin-bottom: 16px; gap: 16px;">
                <div>
                  <label class="glass-label">Nominal Pengajuan</label>
                  <input type="number" placeholder="Maks. 100.000" max="100000" required class="glass-input" style="font-size: 18px; font-weight: 700;" />
                </div>
                <div>
                  <label class="glass-label">Jangka Waktu</label>
                  <select class="glass-select">
                    <option value="1">1 Bulan (Bunga 10%)</option>
                    <option value="3">3 Bulan (Bunga 10%)</option>
                    <option value="6">6 Bulan (Bunga 10%)</option>
                  </select>
                </div>
              </div>
              <div style="margin-bottom: 24px;">
                <label class="glass-label">Berkas Penunjang Tambahan</label>
                <input type="file" class="glass-input" style="padding: 10px 14px; font-size: 13px;" />
              </div>
              <button type="submit" class="btn-glow amber">
                ${ICONS.plus} Ajukan Pinjaman ke Sistem
              </button>
            </form>
          </div>

          <!-- Audit Ledger Transaksi Nasabah -->
          <div class="glass-panel" style="display: flex; flex-direction: column;">
            <div class="glass-panel-header">
              <div class="glass-panel-icon" style="color: #94a3b8;">${ICONS.database}</div>
              <h2 class="glass-panel-title">Audit Ledger Transaksi</h2>
              <span class="glass-badge danger" style="margin-left: auto;">Read-Only</span>
            </div>
            <div class="glass-body" style="flex: 1;">
              <p style="font-size: 13px; color: rgba(255,255,255,0.6); margin-bottom: 16px;">
                Akses riwayat ledger sistem untuk melacak mutasi dan kendala rekening nasabah (Single Source of Truth).
              </p>
              
              <div class="glass-table-container">
                <table class="glass-table">
                  <thead>
                    <tr>
                      <th>ID Transaksi</th>
                      <th>Keterangan Tipe</th>
                      <th>Nominal</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="font-family: monospace; color: rgba(255,255,255,0.5);">TRX-001</td>
                      <td>Transfer Antar User</td>
                      <td style="font-weight: 700;">${formatIDR(50000)}</td>
                      <td><span class="glass-badge success">SUCCESS</span></td>
                    </tr>
                    <tr>
                      <td style="font-family: monospace; color: rgba(255,255,255,0.5);">TRX-002</td>
                      <td>Potongan Pajak (2%)</td>
                      <td style="color: #f87171; font-weight: 700;">-${formatIDR(1000)}</td>
                      <td><span class="glass-badge success">SUCCESS</span></td>
                    </tr>
                    <tr>
                      <td style="font-family: monospace; color: rgba(255,255,255,0.5);">TRX-003</td>
                      <td>Pembayaran Merchant</td>
                      <td style="font-weight: 700;">${formatIDR(150000)}</td>
                      <td><span class="glass-badge danger">FAILED</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>`;

  attachEvents();
}

function attachEvents() {
  document.getElementById('form-onboarding')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Permintaan akun berhasil diproses secara sistem!', 'success');
    e.target.reset();
  });

  document.getElementById('form-loan')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Pengajuan pinjaman berhasil disubmit ke SmartBank untuk direview.', 'success');
    e.target.reset();
  });

  document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '/login.html';
  });
}

bootstrap();
