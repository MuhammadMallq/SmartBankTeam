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

let appData = null;

async function initLogin() {
  try {
    const res = await fetch('/dummy_data.json');
    appData = await res.json();
    renderLoginPage();
  } catch (e) {
    console.error('Failed to load credentials:', e);
    renderLoginPage();
  }
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

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!appData) {
    showToast('Sistem belum siap, silakan coba lagi.', 'error');
    return;
  }

  let loggedInUser = null;

  // 1. Check primary user (Budi)
  if (email === appData.user.email && password === appData.user.password) {
    loggedInUser = {
      id: appData.user.id,
      name: appData.user.name,
      email: appData.user.email,
      balance: appData.dashboard.balance
    };
  } else {
    // 2. Check other registered customers (from contacts list)
    const matchedContact = appData.contacts.find(c => c.email === email && c.password === password);
    if (matchedContact) {
      loggedInUser = {
        id: matchedContact.id,
        name: matchedContact.name,
        email: matchedContact.email,
        balance: 50000.00 // Standard starting balance for other customers
      };
    }
  }

  if (loggedInUser) {
    localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
    showToast('Login berhasil! Mengalihkan...');
    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 1500);
  } else {
    showToast('Kredensial salah! Akses ditolak.', 'error');
  }
}

initLogin();
