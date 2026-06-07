import '../../styles/auth.css';
import { ICONS, showToast } from '../../utils/ui-core.js';

/**
 * SMARTBANK TELLER AUTH
 * Transaction desk entry point.
 */

async function initTellerLogin() {
  try {
    const res = await fetch('/dummy_data.json');
    const data = await res.json();
    renderTellerLoginPage(data.teller);
  } catch (e) {
    console.error('Failed to load teller credentials:', e);
    renderTellerLoginPage({ email: 'teller@smartbank.local', password: 'password' });
  }
}

function renderTellerLoginPage(creds) {
  document.querySelector('#app-auth').innerHTML = `
  <div class="auth-wrapper login-theme">
    <div class="auth-hero" style="background: linear-gradient(135deg, #4338ca 0%, #4f46e5 100%);">
      <div class="hero-content">
        <div class="hero-glass-card">
          <h2>Meja Teller Perbankan</h2>
          <p>Layanan transaksi tunai yang cepat, akurat, dan terpercaya.</p>
        </div>
      </div>
    </div>
    
    <div class="auth-form-side">
      <a href="/" class="back-home-btn">← Kembali ke Beranda</a>
      <div class="auth-container">
        <div class="auth-header">
          <div class="auth-logo-large" style="color: #4f46e5;">${ICONS.bank}</div>
          <h1 style="color: #4f46e5;">Teller Login</h1>
          <p>Silakan masukan kredensial teller Anda untuk melayani transaksi tunai.</p>
        </div>
        <form class="auth-form" id="tellerLoginForm">
          <div class="form-group">
            <label for="email">Teller Email</label>
            <input type="email" id="email" name="email" required placeholder="teller@smartbank.local" />
          </div>
          <div class="form-group">
            <label for="password">Teller Password</label>
            <input type="password" id="password" name="password" required placeholder="••••••••••••" />
          </div>
          <button type="submit" style="background: #4f46e5;">Open Teller Desk</button>
        </form>
        <div class="auth-footer">
          <p>Bukan teller? <a href="/login.html">Login sebagai Nasabah</a></p>
        </div>
      </div>
    </div>
  </div>`;

  const form = document.getElementById('tellerLoginForm');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (email === creds.email && password === creds.password) {
      showToast('Login Teller Berhasil!');
      setTimeout(() => {
        window.location.href = '/teller-dashboard.html';
      }, 1500);
    } else {
      showToast('Kredensial Teller Salah!', 'error');
    }
  });
}

initTellerLogin();
