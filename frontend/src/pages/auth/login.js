import '../../styles/auth.css';
import { ICONS, showToast } from '../../utils/ui-core.js';

/**
 * SMARTBANK AUTHENTICATION
 * Secure login portal for customers.
 */

const AUTH_CONTENT = {
  heroTitle: 'Standard Global Keuangan',
  heroDesc: 'Memfasilitasi seluruh transaksi digital di ekosistem SmartBank secara aman, instan, dan terpusat.',
  formHeader: 'Otoritas perbankan utama Anda. Silakan masukan kredensial untuk melanjutkan.'
};

async function initLogin() {
  renderLoginPage();
}

function renderLoginPage() {
  document.querySelector('#app-auth').innerHTML = `
  <div class="auth-wrapper login-theme">
    <div class="auth-hero">
      <div class="hero-content">
        <div class="hero-glass-card">
          <h2>${AUTH_CONTENT.heroTitle}</h2>
          <p>${AUTH_CONTENT.heroDesc}</p>
        </div>
      </div>
    </div>
    
    <div class="auth-form-side">
      <a href="/" class="back-home-btn">← Kembali ke Beranda</a>
      <div class="auth-container">
        <div class="auth-header">
          <div class="auth-logo-large">${ICONS.bank}</div>
          <h1>SmartBank</h1>
          <p>${AUTH_CONTENT.formHeader}</p>
        </div>
        <form class="auth-form" id="loginForm">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" name="email" required placeholder="budi@smartbank.local" />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required placeholder="••••••••••••" />
          </div>
          <button type="submit">Log in to Dashboard</button>
        </form>
        <div class="form-separator"><span>OR</span></div>
        <div class="auth-footer">
          <p>Belum terdaftar? <a href="/register.html">Registrasi sekarang</a></p>
        </div>
      </div>
    </div>
  </div>`;

  document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const err = await res.json();
      showToast(err.error || 'Kredensial salah! Akses ditolak.', 'error');
      return;
    }

    const user = await res.json();
    
    // Check if user is trying to access correct portal
    if (user.role !== 'user' && user.role !== 'contact') {
      showToast('Akses ditolak. Gunakan portal karyawan untuk staf.', 'error');
      return;
    }

    localStorage.setItem('currentUser', JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      balance: user.balance
    }));
    
    showToast('Login berhasil! Mengalihkan...');
    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 1500);

  } catch (err) {
    showToast('Koneksi ke database gagal!', 'error');
  }
}

initLogin();
