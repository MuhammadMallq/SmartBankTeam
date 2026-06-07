import '../../styles/auth.css';
import { ICONS, showToast } from '../../utils/ui-core.js';

/**
 * SMARTBANK OPERATOR AUTH
 * Support portal entry point.
 */

async function initOperatorLogin() {
  try {
    const res = await fetch('/dummy_data.json');
    const data = await res.json();
    renderOperatorLoginPage(data.operator);
  } catch (e) {
    console.error('Failed to load operator credentials:', e);
    renderOperatorLoginPage({ email: 'operator@smartbank.local', password: 'password' });
  }
}

function renderOperatorLoginPage(creds = { email: 'operator@smartbank.local', password: 'OperatorSmartBank!' }) {
  const finalCreds = creds || { email: 'operator@smartbank.local', password: 'OperatorSmartBank!' };
  document.querySelector('#app-auth').innerHTML = `
  <div class="auth-wrapper login-theme">
    <div class="auth-hero" style="background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%);">
      <div class="hero-content">
        <div class="hero-glass-card">
          <h2>Pusat Dukungan Operator</h2>
          <p>Bantu nasabah dan kelola tiket layanan dengan efisiensi maksimal.</p>
        </div>
      </div>
    </div>
    
    <div class="auth-form-side">
      <a href="/" class="back-home-btn">← Kembali ke Beranda</a>
      <div class="auth-container">
        <div class="auth-header">
          <div class="auth-logo-large" style="color: #0d9488;">${ICONS.bank}</div>
          <h1 style="color: #0d9488;">Operator Login</h1>
          <p>Silakan masukan kredensial operator Anda untuk melayani nasabah.</p>
        </div>
        <form class="auth-form" id="operatorLoginForm">
          <div class="form-group">
            <label for="email">Operator Email</label>
            <input type="email" id="email" name="email" required placeholder="operator@smartbank.local" />
          </div>
          <div class="form-group">
            <label for="password">Operator Password</label>
            <input type="password" id="password" name="password" required placeholder="••••••••••••" />
          </div>
          <button type="submit" style="background: #0d9488;">Start Serving Customers</button>
        </form>
        <div class="auth-footer">
          <p>Bukan operator? <a href="/login.html">Login sebagai Nasabah</a></p>
        </div>
      </div>
    </div>
  </div>`;

  const form = document.getElementById('operatorLoginForm');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (email === finalCreds.email && password === finalCreds.password) {
      showToast('Login Operator Berhasil!');
      setTimeout(() => {
        window.location.href = '/operator-dashboard.html';
      }, 1500);
    } else {
      showToast('Kredensial Operator Salah!', 'error');
    }
  });
}

initOperatorLogin();
