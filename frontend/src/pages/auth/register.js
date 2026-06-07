import '../../styles/auth.css';
import { ICONS, showToast } from '../../utils/ui-core.js';

/**
 * SMARTBANK REGISTRATION
 * Customer onboarding portal.
 */

function renderRegisterPage() {
  document.querySelector('#app-auth').innerHTML = `
  <div class="auth-wrapper register-theme">
    <div class="auth-hero">
      <div class="hero-content">
        <div class="hero-glass-card">
          <h2>Masa Depan Finansial</h2>
          <p>Mulai perjalanan perbankan digital Anda hari ini. Aman, cepat, dan transparan untuk semua nasabah.</p>
        </div>
      </div>
    </div>
    
    <div class="auth-form-side">
      <a href="/" class="back-home-btn">← Kembali ke Beranda</a>
      <div class="auth-container">
        <div class="auth-header">
          <div class="auth-logo-large">${ICONS.bank}</div>
          <h1>Registrasi SmartBank</h1>
          <p>Lengkapi data diri Anda untuk bergabung dalam ekosistem perbankan modern kami.</p>
        </div>
        <form class="auth-form" id="registerForm">
          <div class="form-group">
            <label for="name">Full Name</label>
            <input type="text" id="name" name="name" required placeholder="John Doe" />
          </div>
          <div class="form-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" name="email" required placeholder="budi@smartbank.local" />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required placeholder="••••••••••••" />
          </div>
          <button type="submit">Buat Akun Sekarang</button>
        </form>
        <div class="form-separator"><span>OR</span></div>
        <div class="auth-footer">
          <p>Sudah memiliki akses? <a href="/login.html">Login di sini</a></p>
        </div>
      </div>
    </div>
  </div>`;

  document.getElementById('registerForm').addEventListener('submit', handleRegister);
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    if (!res.ok) {
      const err = await res.json();
      showToast(err.error || 'Gagal mendaftar', 'error');
      return;
    }

    showToast('Registrasi berhasil! Mengalihkan ke login...');
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 1500);

  } catch (err) {
    showToast('Koneksi ke server gagal!', 'error');
  }
}

renderRegisterPage();
