import '../../styles/auth.css';
import { ICONS, showToast } from '../../utils/ui-core.js';

/**
 * SMARTBANK MANAGER AUTH
 * Operational authority entry point.
 */

async function initManagerLogin() {
  try {
    const res = await fetch('/dummy_data.json');
    const data = await res.json();
    renderManagerLoginPage(data.manager);
  } catch (e) {
    console.error('Failed to load manager credentials:', e);
    renderManagerLoginPage({ email: 'manager@smartbank.local', password: 'password' });
  }
}

function renderManagerLoginPage(creds) {
  document.querySelector('#app-auth').innerHTML = `
  <div class="auth-wrapper login-theme">
    <div class="auth-hero" style="background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%);">
      <div class="hero-content">
        <div class="hero-glass-card">
          <h2>Panel Operasional Manajer</h2>
          <p>Pantau performa harian dan validasi transaksi strategis SmartBank.</p>
        </div>
      </div>
    </div>
    
    <div class="auth-form-side">
      <a href="/" class="back-home-btn">← Kembali ke Beranda</a>
      <div class="auth-container">
        <div class="auth-header">
          <div class="auth-logo-large" style="color: #1d4ed8;">${ICONS.bank}</div>
          <h1 style="color: #1d4ed8;">Manager Portal</h1>
          <p>Masukan kredensial manajer Anda untuk mengakses dashboard operasional.</p>
        </div>
        <form class="auth-form" id="managerLoginForm">
          <div class="form-group">
            <label for="email">Manager Email</label>
            <input type="email" id="email" name="email" required placeholder="manager@smartbank.local" />
          </div>
          <div class="form-group">
            <label for="password">Manager Password</label>
            <input type="password" id="password" name="password" required placeholder="••••••••••••" />
          </div>
          <button type="submit" style="background: #1d4ed8;">Log in to Manager Dashboard</button>
        </form>
        <div class="auth-footer">
          <p>Bukan manajer? <a href="/login.html">Login sebagai Nasabah</a></p>
        </div>
      </div>
    </div>
  </div>`;

  const form = document.getElementById('managerLoginForm');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (email === creds.email && password === creds.password) {
      showToast('Login Manajer Berhasil!');
      setTimeout(() => {
        window.location.href = '/manager-dashboard.html';
      }, 1500);
    } else {
      showToast('Kredensial Manajer Salah!', 'error');
    }
  });
}

initManagerLogin();
