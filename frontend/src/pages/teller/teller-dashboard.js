import '../../styles/style.css';
import '../../styles/premium.css';
import { ICONS, showToast, formatIDR } from '../../utils/ui-core.js';

/**
 * SMARTBANK TELLER DASHBOARD
 * Premium Glassmorphism UI
 */

async function bootstrap() {
  renderTellerUI();
}

function renderTellerUI() {
  document.querySelector('#app').innerHTML = `
  <div class="dashboard-layout fade-in premium-bg">
    <aside class="sidebar">
      <div class="sidebar-logo" style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);">${ICONS.bank}</div>
      <nav class="sidebar-menu">
        <a href="#" class="menu-item active" title="Teller Desk">${ICONS.vault}</a>
        <a href="#" class="menu-item" title="Transaction Journal">${ICONS.activity}</a>
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
          <div class="topnav-user">
            <div class="topnav-user-avatar" style="background: rgba(96, 165, 250, 0.2); color: #60a5fa;">T</div>
            <span class="topnav-user-name">Bank Teller 01</span>
          </div>
        </div>
      </nav>

      <div class="page-content">
        <h1 class="page-heading">Teller Transaction Desk</h1>

        <!-- Stats -->
        <div class="grid-4 mb-8">
          <div class="glass-stat">
            <div class="glass-stat-label">Cash in Drawer</div>
            <div class="glass-stat-value">Rp 12.5M</div>
            <div class="glass-stat-sub">Aman & Sesuai Sistem</div>
          </div>
          <div class="glass-stat green">
            <div class="glass-stat-label">Setoran (Deposits)</div>
            <div class="glass-stat-value">84</div>
            <div class="glass-stat-sub">Transaksi Hari Ini</div>
          </div>
          <div class="glass-stat red">
            <div class="glass-stat-label">Tarikan (Withdrawals)</div>
            <div class="glass-stat-value">58</div>
            <div class="glass-stat-sub">Transaksi Hari Ini</div>
          </div>
          <div class="glass-stat purple">
            <div class="glass-stat-label">Transfer (Overbook)</div>
            <div class="glass-stat-value">112</div>
            <div class="glass-stat-sub">Transaksi Hari Ini</div>
          </div>
        </div>
        
        <div class="grid-2 mb-8">
          <!-- Setor Tunai -->
          <div class="glass-panel">
            <div class="glass-panel-header">
              <div class="glass-panel-icon" style="color: #34d399;">${ICONS.activity}</div>
              <h2 class="glass-panel-title text-gradient-green">Setor Tunai (Deposit)</h2>
            </div>
            <form id="form-deposit" class="glass-body">
              <div style="margin-bottom: 16px;">
                <label class="glass-label">No. Rekening Nasabah</label>
                <input type="text" placeholder="Masukkan ID Nasabah..." required class="glass-input" />
              </div>
              <div style="margin-bottom: 24px;">
                <label class="glass-label">Nominal Uang Disetor (IDR)</label>
                <input type="number" placeholder="Rp 0" required class="glass-input" style="font-size: 24px; font-weight: 800; color: #34d399;" />
              </div>
              <button type="submit" class="btn-glow green">
                Konfirmasi Setoran
              </button>
            </form>
          </div>

          <!-- Tarik Tunai -->
          <div class="glass-panel">
            <div class="glass-panel-header">
              <div class="glass-panel-icon" style="color: #f87171;">${ICONS.activity}</div>
              <h2 class="glass-panel-title text-gradient-red">Tarik Tunai (Withdrawal)</h2>
            </div>
            <form id="form-withdraw" class="glass-body">
              <div style="margin-bottom: 16px;">
                <label class="glass-label">No. Rekening Nasabah</label>
                <input type="text" placeholder="Masukkan ID Nasabah..." required class="glass-input" />
              </div>
              <div style="margin-bottom: 24px;">
                <label class="glass-label">Nominal Uang Ditarik (IDR)</label>
                <input type="number" placeholder="Rp 0" required class="glass-input" style="font-size: 24px; font-weight: 800; color: #f87171;" />
              </div>
              <button type="submit" class="btn-glow red">
                Konfirmasi Penarikan
              </button>
            </form>
          </div>
        </div>

        <div class="grid-2 mb-8">
          <!-- Transfer Dana (Overbooking) -->
          <div class="glass-panel">
            <div class="glass-panel-header">
              <div class="glass-panel-icon" style="color: #a78bfa;">${ICONS.activity}</div>
              <h2 class="glass-panel-title text-gradient">Transfer Dana (Overbooking)</h2>
            </div>
            <form id="form-transfer" class="glass-body">
              <div class="grid-2" style="gap:16px; margin-bottom:16px;">
                <div>
                  <label class="glass-label">Rekening Pengirim</label>
                  <input type="text" placeholder="ID Pengirim" required class="glass-input" />
                </div>
                <div>
                  <label class="glass-label">Rekening Penerima</label>
                  <input type="text" placeholder="ID Penerima" required class="glass-input" />
                </div>
              </div>
              <div style="margin-bottom: 24px;">
                <label class="glass-label">Nominal Transfer (IDR)</label>
                <input type="number" id="transfer-amount" placeholder="Rp 0" required class="glass-input" style="font-size: 20px; font-weight: 800; color: #a78bfa;" />
              </div>

              <!-- Kalkulator Otomatis -->
              <div style="background: rgba(0,0,0,0.2); border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.05);">
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                  <span style="font-size:13px; color:rgba(255,255,255,0.6);">Estimasi Biaya Bank (1%):</span>
                  <span id="transfer-fee" style="font-size:13px; font-weight:700; color:white;">Rp 0</span>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                  <span style="font-size:13px; color:rgba(255,255,255,0.6);">Estimasi Pajak (2%):</span>
                  <span id="transfer-tax" style="font-size:13px; font-weight:700; color:white;">Rp 0</span>
                </div>
                <div style="height:1px; background:rgba(255,255,255,0.1); margin-bottom:12px;"></div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-size:14px; font-weight:700; color:white;">Total Debit Pengirim:</span>
                  <span id="transfer-total" style="font-size:18px; font-weight:800; color:#60a5fa;">Rp 0</span>
                </div>
              </div>

              <button type="submit" class="btn-glow">
                Proses Pemindahbukuan
              </button>
            </form>
          </div>

          <!-- Kalkulator Pajak & Biaya Operasional Standalone -->
          <div class="glass-panel" style="display: flex; flex-direction: column;">
            <div class="glass-panel-header">
              <div class="glass-panel-icon" style="color: #60a5fa;">${ICONS.reports}</div>
              <h2 class="glass-panel-title">Kalkulator Pajak & Biaya</h2>
            </div>
            <div class="glass-body" style="flex: 1;">
              <p style="font-size: 13px; color: rgba(255,255,255,0.6); margin-bottom: 24px;">
                Gunakan alat ini untuk menghitung simulasi potongan biaya layanan bank secara real-time.
              </p>
              <div style="margin-bottom: 24px;">
                <label class="glass-label">Nominal Dasar Transaksi</label>
                <input type="number" id="calc-input" placeholder="Rp 0" class="glass-input" style="font-size: 20px; font-weight: 800;" />
              </div>
              
              <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.7);">Biaya Layanan Bank (1%)</span>
                  <span id="calc-fee" style="font-size: 16px; font-weight: 700; color: white;">Rp 0</span>
                </div>
                <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.7);">Pajak Sistem (2%)</span>
                  <span id="calc-tax" style="font-size: 16px; font-weight: 700; color: white;">Rp 0</span>
                </div>
                <div style="background: rgba(96,165,250,0.1); border: 1px solid rgba(96,165,250,0.2); padding: 20px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 14px; font-weight: 700; color: #60a5fa;">Potongan Total (3%)</span>
                  <span id="calc-total" style="font-size: 20px; font-weight: 800; color: #a78bfa;">Rp 0</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Rekonsiliasi Kas Harian -->
        <div class="glass-panel">
          <div class="glass-panel-header" style="background: rgba(0,0,0,0.2);">
            <div class="glass-panel-icon" style="color: #94a3b8;">${ICONS.database}</div>
            <h2 class="glass-panel-title">Rekonsiliasi Kas Harian (Closing)</h2>
          </div>
          <div class="glass-body grid-3" style="gap:32px;">
            <div style="grid-column: span 2;">
              <h3 class="glass-label">Ringkasan Ledger Kerja Hari Ini</h3>
              <div class="glass-table-container">
                <table class="glass-table">
                  <thead>
                    <tr>
                      <th>Kategori</th>
                      <th>Total Transaksi</th>
                      <th style="text-align: right;">Volume IDR</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="font-weight: 700;">Setor Tunai (Cash In)</td>
                      <td>84</td>
                      <td style="text-align: right; color: #34d399; font-weight: 700; font-family: monospace; font-size: 16px;">+ ${formatIDR(45000000)}</td>
                    </tr>
                    <tr>
                      <td style="font-weight: 700;">Tarik Tunai (Cash Out)</td>
                      <td>58</td>
                      <td style="text-align: right; color: #f87171; font-weight: 700; font-family: monospace; font-size: 16px;">- ${formatIDR(32500000)}</td>
                    </tr>
                    <tr style="background: rgba(0,0,0,0.1);">
                      <td style="font-weight: 800; color: #60a5fa;">Total Kas Tercatat (Sistem)</td>
                      <td></td>
                      <td style="text-align: right; font-weight: 800; color: #60a5fa; font-size: 18px;">${formatIDR(12500000)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div style="background: rgba(0,0,0,0.2); border-radius: 16px; padding: 24px; border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; justify-content: center; text-align: center;">
              <h3 class="glass-label" style="margin-bottom: 16px;">Kas Aktual Laci (Drawer)</h3>
              <input type="number" placeholder="Input Kas Aktual" class="glass-input" style="text-align: center; font-size: 24px; font-weight: 800; margin-bottom: 24px; padding: 20px;" />
              <button class="btn-glow" style="background: linear-gradient(135deg, #1e293b, #0f172a); box-shadow: 0 4px 15px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); margin-bottom: 16px;">Match & Close Register</button>
              <p style="font-size: 12px; color: rgba(255,255,255,0.4); line-height: 1.5;">Pastikan saldo sistem cocok dengan laci uang Anda sebelum melakukan closing shift harian.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>`;

  attachEvents();
  attachCalculatorEvents();
}

function attachCalculatorEvents() {
  const transferAmount = document.getElementById('transfer-amount');
  const transferFee = document.getElementById('transfer-fee');
  const transferTax = document.getElementById('transfer-tax');
  const transferTotal = document.getElementById('transfer-total');

  if(transferAmount) {
    transferAmount.addEventListener('input', (e) => {
      const val = parseInt(e.target.value) || 0;
      const fee = val * 0.01;
      const tax = val * 0.02;
      transferFee.innerText = formatIDR(fee);
      transferTax.innerText = formatIDR(tax);
      transferTotal.innerText = formatIDR(val + fee + tax);
    });
  }

  const calcInput = document.getElementById('calc-input');
  const calcFee = document.getElementById('calc-fee');
  const calcTax = document.getElementById('calc-tax');
  const calcTotal = document.getElementById('calc-total');

  if(calcInput) {
    calcInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value) || 0;
      const fee = val * 0.01;
      const tax = val * 0.02;
      calcFee.innerText = formatIDR(fee);
      calcTax.innerText = formatIDR(tax);
      calcTotal.innerText = formatIDR(fee + tax);
    });
  }
}

function attachEvents() {
  document.getElementById('form-deposit')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Setoran tunai berhasil diproses ke sistem!', 'success');
    e.target.reset();
  });

  document.getElementById('form-withdraw')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Penarikan tunai berhasil diproses!', 'info');
    e.target.reset();
  });

  document.getElementById('form-transfer')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Transfer dana berhasil dikirimkan ke tujuan!', 'success');
    e.target.reset();
    document.getElementById('transfer-fee').innerText = 'Rp 0';
    document.getElementById('transfer-tax').innerText = 'Rp 0';
    document.getElementById('transfer-total').innerText = 'Rp 0';
  });

  document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '/teller-login.html';
  });
}

bootstrap();
