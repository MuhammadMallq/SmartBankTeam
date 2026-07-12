// ─── Pengaturan (Settings) Page ───────────────────────────────────────────────
import { ic } from '../utils/helpers.js';

let settingsTab = 'profile'; // 'profile' | 'security' | 'notifications' | 'display'

function getUserSettings(appState) {
  if (appState.settings) return appState.settings;

  let settings;
  const stored = localStorage.getItem(`settings_${appState.user.id}`);
  if (stored) {
    settings = JSON.parse(stored);
  } else {
    settings = {
      profile: {
        name: appState.user.name,
        email: appState.user.email,
        phone: '0812-3456-7890',
        address: 'Jl. Sariasih No. 54, Sarijadi, Bandung',
        birthdate: '1995-08-15',
        gender: 'Laki-laki',
        occupation: 'Wiraswasta',
      },
      security: {
        twoFactor: true,
        biometric: false,
        loginAlerts: true,
        lastPasswordChange: '2026-03-10',
        trustedDevices: [
          { name: 'Chrome — Windows 11', lastUsed: '2026-05-10T19:00:00+07:00', current: true },
          { name: 'SmartBank Mobile — Android 15', lastUsed: '2026-05-09T14:20:00+07:00', current: false },
        ]
      },
      notifications: {
        emailNotif: true,
        pushNotif: true,
        smsNotif: false,
        transactionAlert: true,
        promoAlert: false,
        securityAlert: true,
        monthlyReport: true,
      },
      display: {
        language: 'id',
        theme: 'light',
        compactMode: false,
        currency: 'IDR',
      }
    };
  }
  
  appState.settings = settings;
  appState.user.name = settings.profile.name;
  appState.user.email = settings.profile.email;
  return settings;
}

/* ─── Render ───────────────────────────────────────────────────────────────── */

export function renderPengaturanPage(appState) {
  const settings = getUserSettings(appState);

  return `
    <div class="page-heading">Pengaturan</div>
    <p class="page-subtitle">Kelola profil, keamanan, notifikasi, dan preferensi tampilan akun Anda</p>

    <div class="settings-layout">
      <!-- Sidebar Nav -->
      <div class="settings-nav">
        <button class="settings-nav-item ${settingsTab === 'profile' ? 'active' : ''}" data-settab="profile">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          Profil
        </button>
        <button class="settings-nav-item ${settingsTab === 'security' ? 'active' : ''}" data-settab="security">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          Keamanan
        </button>
        <button class="settings-nav-item ${settingsTab === 'notifications' ? 'active' : ''}" data-settab="notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          Notifikasi
        </button>
        <button class="settings-nav-item ${settingsTab === 'display' ? 'active' : ''}" data-settab="display">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
          Tampilan
        </button>
      </div>

      <!-- Settings Content -->
      <div class="settings-content">
        ${settingsTab === 'profile' ? renderProfileSettings(settings.profile) : ''}
        ${settingsTab === 'security' ? renderSecuritySettings(settings.security) : ''}
        ${settingsTab === 'notifications' ? renderNotificationSettings(settings.notifications) : ''}
        ${settingsTab === 'display' ? renderDisplaySettings(settings.display) : ''}
      </div>
    </div>
  `;
}

function renderProfileSettings(profile) {
  return `
    <div class="settings-section-card">
      <div class="settings-section-header">
        <div>
          <h3 class="settings-section-title">Informasi Profil</h3>
          <p class="settings-section-desc">Kelola informasi personal Anda</p>
        </div>
      </div>

      <div class="settings-avatar-row">
        <div class="settings-avatar">${profile.name.charAt(0)}</div>
        <div>
          <div style="font-weight:700;font-size:16px;color:var(--slate-900);">${profile.name}</div>
          <div style="font-size:13px;color:var(--slate-400);">${profile.email}</div>
        </div>
      </div>

      <div class="settings-form-grid">
        <div class="settings-field">
          <label>Nama Lengkap</label>
          <input type="text" value="${profile.name}" id="set-name" />
        </div>
        <div class="settings-field">
          <label>Email</label>
          <input type="email" value="${profile.email}" id="set-email" />
        </div>
        <div class="settings-field">
          <label>Telepon</label>
          <input type="tel" value="${profile.phone}" id="set-phone" />
        </div>
        <div class="settings-field">
          <label>Tanggal Lahir</label>
          <input type="date" value="${profile.birthdate}" id="set-dob" />
        </div>
        <div class="settings-field">
          <label>Jenis Kelamin</label>
          <select id="set-gender">
            <option value="Laki-laki" ${profile.gender === 'Laki-laki' ? 'selected' : ''}>Laki-laki</option>
            <option value="Perempuan" ${profile.gender === 'Perempuan' ? 'selected' : ''}>Perempuan</option>
          </select>
        </div>
        <div class="settings-field">
          <label>Pekerjaan</label>
          <input type="text" value="${profile.occupation}" id="set-occupation" />
        </div>
        <div class="settings-field full-width">
          <label>Alamat</label>
          <textarea id="set-address" rows="2">${profile.address}</textarea>
        </div>
      </div>

      <div class="settings-actions">
        <button class="btn-secondary" id="set-cancel-profile">Batal</button>
        <button class="btn-primary" id="set-save-profile" style="justify-content:center;">Simpan Perubahan</button>
      </div>
    </div>
  `;
}

function renderSecuritySettings(security) {
  return `
    <div class="settings-section-card">
      <div class="settings-section-header">
        <div>
          <h3 class="settings-section-title">Keamanan Akun</h3>
          <p class="settings-section-desc">Lindungi akun Anda dengan pengaturan keamanan berlapis</p>
        </div>
      </div>

      <div class="settings-security-grid">
        <div class="settings-toggle-row">
          <div class="settings-toggle-info">
            <div class="settings-toggle-title">Autentikasi Dua Faktor (2FA)</div>
            <div class="settings-toggle-desc">Aktifkan verifikasi tambahan setiap kali login</div>
          </div>
          <label class="settings-switch">
            <input type="checkbox" ${security.twoFactor ? 'checked' : ''} id="set-2fa" />
            <span class="settings-slider"></span>
          </label>
        </div>

        <div class="settings-toggle-row">
          <div class="settings-toggle-info">
            <div class="settings-toggle-title">Login Biometrik</div>
            <div class="settings-toggle-desc">Gunakan sidik jari atau wajah untuk masuk</div>
          </div>
          <label class="settings-switch">
            <input type="checkbox" ${security.biometric ? 'checked' : ''} id="set-biometric" />
            <span class="settings-slider"></span>
          </label>
        </div>

        <div class="settings-toggle-row">
          <div class="settings-toggle-info">
            <div class="settings-toggle-title">Notifikasi Login Baru</div>
            <div class="settings-toggle-desc">Dapatkan notifikasi ketika ada login dari perangkat baru</div>
          </div>
          <label class="settings-switch">
            <input type="checkbox" ${security.loginAlerts ? 'checked' : ''} id="set-login-alert" />
            <span class="settings-slider"></span>
          </label>
        </div>
      </div>

      <div class="settings-divider"></div>

      <div class="settings-section-header" style="margin-bottom:16px;">
        <div>
          <h3 class="settings-section-title" style="font-size:15px;">Kata Sandi</h3>
          <p class="settings-section-desc">Terakhir diubah: ${security.lastPasswordChange}</p>
        </div>
        <button class="btn-secondary" id="set-change-pw">Ubah Kata Sandi</button>
      </div>

      <div class="settings-divider"></div>

      <div style="margin-top:8px;">
        <h3 class="settings-section-title" style="font-size:15px;margin-bottom:12px;">Perangkat Terpercaya</h3>
        <div class="settings-devices-list">
          ${security.trustedDevices.map(d => `
            <div class="settings-device-item">
              <div class="settings-device-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
              </div>
              <div class="settings-device-info">
                <div class="settings-device-name">${d.name} ${d.current ? '<span class="ldg-badge success" style="font-size:10px;padding:2px 6px;">Perangkat Ini</span>' : ''}</div>
                <div class="settings-device-last">Terakhir: ${new Date(d.lastUsed).toLocaleString('id-ID')}</div>
              </div>
              ${!d.current ? '<button class="settings-device-remove" title="Hapus">✕</button>' : ''}
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderNotificationSettings(notif) {
  const toggleRow = (id, title, desc, checked) => `
    <div class="settings-toggle-row">
      <div class="settings-toggle-info">
        <div class="settings-toggle-title">${title}</div>
        <div class="settings-toggle-desc">${desc}</div>
      </div>
      <label class="settings-switch">
        <input type="checkbox" ${checked ? 'checked' : ''} id="${id}" />
        <span class="settings-slider"></span>
      </label>
    </div>
  `;

  return `
    <div class="settings-section-card">
      <div class="settings-section-header">
        <div>
          <h3 class="settings-section-title">Preferensi Notifikasi</h3>
          <p class="settings-section-desc">Atur notifikasi yang ingin Anda terima</p>
        </div>
      </div>

      <div class="settings-notif-group">
        <div class="settings-notif-group-title">Saluran Notifikasi</div>
        <div class="settings-security-grid">
          ${toggleRow('set-email-notif', 'Notifikasi Email', 'Terima pemberitahuan ke email Anda', notif.emailNotif)}
          ${toggleRow('set-push-notif', 'Push Notification', 'Notifikasi di perangkat mobile', notif.pushNotif)}
          ${toggleRow('set-sms-notif', 'Notifikasi SMS', 'Terima SMS untuk transaksi penting', notif.smsNotif)}
        </div>
      </div>

      <div class="settings-divider"></div>

      <div class="settings-notif-group">
        <div class="settings-notif-group-title">Tipe Notifikasi</div>
        <div class="settings-security-grid">
          ${toggleRow('set-tx-alert', 'Peringatan Transaksi', 'Notifikasi setiap kali ada transaksi masuk/keluar', notif.transactionAlert)}
          ${toggleRow('set-promo-alert', 'Promo & Penawaran', 'Info promo dan penawaran khusus dari SmartBank', notif.promoAlert)}
          ${toggleRow('set-sec-alert', 'Peringatan Keamanan', 'Notifikasi aktivitas mencurigakan pada akun', notif.securityAlert)}
          ${toggleRow('set-report', 'Laporan Bulanan', 'Ringkasan transaksi dan keuangan bulanan', notif.monthlyReport)}
        </div>
      </div>

      <div class="settings-actions">
        <button class="btn-primary" id="set-save-notif" style="justify-content:center;">Simpan Preferensi</button>
      </div>
    </div>
  `;
}

function renderDisplaySettings(display) {
  return `
    <div class="settings-section-card">
      <div class="settings-section-header">
        <div>
          <h3 class="settings-section-title">Pengaturan Tampilan</h3>
          <p class="settings-section-desc">Sesuaikan tampilan aplikasi sesuai preferensi Anda</p>
        </div>
      </div>

      <div class="settings-form-grid">
        <div class="settings-field">
          <label>Bahasa</label>
          <select id="set-lang">
            <option value="id" ${display.language === 'id' ? 'selected' : ''}>Bahasa Indonesia</option>
            <option value="en" ${display.language === 'en' ? 'selected' : ''}>English</option>
          </select>
        </div>
        <div class="settings-field">
          <label>Tema</label>
          <select id="set-theme">
            <option value="light" ${display.theme === 'light' ? 'selected' : ''}>Terang (Light)</option>
            <option value="dark" ${display.theme === 'dark' ? 'selected' : ''}>Gelap (Dark)</option>
            <option value="auto" ${display.theme === 'auto' ? 'selected' : ''}>Ikuti Sistem</option>
          </select>
        </div>
        <div class="settings-field">
          <label>Mata Uang</label>
          <select id="set-currency">
            <option value="IDR" ${display.currency === 'IDR' ? 'selected' : ''}>IDR — Rupiah Indonesia</option>
            <option value="USD" ${display.currency === 'USD' ? 'selected' : ''}>USD — Dolar Amerika</option>
          </select>
        </div>
      </div>

      <div class="settings-divider"></div>

      <div class="settings-security-grid">
        <div class="settings-toggle-row">
          <div class="settings-toggle-info">
            <div class="settings-toggle-title">Mode Kompak</div>
            <div class="settings-toggle-desc">Tampilkan lebih banyak konten dengan mengurangi padding</div>
          </div>
          <label class="settings-switch">
            <input type="checkbox" ${display.compactMode ? 'checked' : ''} id="set-compact" />
            <span class="settings-slider"></span>
          </label>
        </div>
      </div>

      <div class="settings-actions">
        <button class="btn-secondary" id="set-cancel-display">Batal</button>
        <button class="btn-primary" id="set-save-display" style="justify-content:center;">Simpan Pengaturan</button>
      </div>
    </div>
  `;
}

/* ─── Bind Events ──────────────────────────────────────────────────────────── */

export function bindPengaturanEvents(appState, rerenderPage) {
  // Tab switching
  document.querySelectorAll('[data-settab]').forEach(tab => {
    tab.addEventListener('click', () => {
      settingsTab = tab.getAttribute('data-settab');
      rerenderPage();
    });
  });

  // Save profile toast
  document.getElementById('set-save-profile')?.addEventListener('click', () => {
    if (appState.settings) {
      appState.settings.profile.name = document.getElementById('set-name')?.value || '';
      appState.settings.profile.email = document.getElementById('set-email')?.value || '';
      appState.settings.profile.phone = document.getElementById('set-phone')?.value || '';
      appState.settings.profile.birthdate = document.getElementById('set-dob')?.value || '';
      appState.settings.profile.gender = document.getElementById('set-gender')?.value || '';
      appState.settings.profile.occupation = document.getElementById('set-occupation')?.value || '';
      appState.settings.profile.address = document.getElementById('set-address')?.value || '';
      
      // Also update top-level user so the header/sidebar updates
      appState.user.name = appState.settings.profile.name;
      appState.user.email = appState.settings.profile.email;
      
      localStorage.setItem(`settings_${appState.user.id}`, JSON.stringify(appState.settings));
    }
    showSettingsToast('Profil berhasil diperbarui!');
    rerenderPage();
  });

  document.getElementById('set-save-notif')?.addEventListener('click', () => {
    showSettingsToast('Preferensi notifikasi berhasil disimpan!');
  });

  document.getElementById('set-save-display')?.addEventListener('click', () => {
    showSettingsToast('Pengaturan tampilan berhasil disimpan!');
  });

  document.getElementById('set-change-pw')?.addEventListener('click', () => {
    showSettingsToast('Fitur ubah kata sandi akan segera hadir.');
  });
}

function showSettingsToast(msg) {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;bottom:28px;right:28px;background:#0f172a;color:white;padding:14px 20px;border-radius:12px;font-size:14px;font-weight:500;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.2);animation:slideUp 0.3s ease;';
  el.textContent = '✓ ' + msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}
