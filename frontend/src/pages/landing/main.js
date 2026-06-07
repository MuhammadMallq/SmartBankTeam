import '../../styles/style.css';
import { renderLedgerPage, bindLedgerEvents } from '../../modules/ledger.js';
import { renderBiayaLayananPage, bindBiayaLayananEvents } from '../../modules/biaya-layanan.js';
import { renderPembayaranPage, bindPembayaranEvents } from '../../modules/pembayaran.js';
import { renderPinjamanPage, bindPinjamanEvents } from '../../modules/pinjaman.js';
import { renderPengaturanPage, bindPengaturanEvents } from '../../modules/pengaturan.js';
import { renderDashboardUI, renderShellPage } from './ui.js';
import { bindCommonEvents, bindDashboardEvents, openModal, closeModal } from './events.js';

/* ─── Application State ────────────────────────────────────────────────────── */
let appState = null;
let currentPage = 'dashboard';

/* ─── Core Logic ───────────────────────────────────────────────────────────── */

async function bootstrap() {
  try {
    const res = await fetch('/dummy_data.json');
    if (!res.ok) throw new Error('Data not found');
    appState = await res.json();
    
    // Dynamically override user state if a specific user session is active
    const storedUserStr = localStorage.getItem('currentUser');
    if (storedUserStr) {
      const storedUser = JSON.parse(storedUserStr);
      appState.user.id = storedUser.id;
      appState.user.name = storedUser.name;
      appState.user.email = storedUser.email;
      appState.dashboard.balance = storedUser.balance;
      
      // Filter out this user from the contacts list so they don't see themselves as a contact
      appState.contacts = appState.contacts.filter(c => c.id !== storedUser.id);
    }
    
    renderApp();
  } catch (e) {
    document.querySelector('#app').innerHTML = `
      <div style="padding:40px; text-align:center;">
        <h2 style="color:var(--red-600)">Gagal memuat data.</h2>
        <p style="color:var(--slate-500)">Terjadi kesalahan koneksi ke server data.</p>
        <button onclick="location.reload()" class="btn-primary" style="margin-top:20px;">Coba Lagi</button>
      </div>`;
    console.error('Bootstrap Error:', e);
  }
}

function navigateTo(page) {
  currentPage = page;
  renderApp();
}

function renderApp() {
  const container = document.querySelector('#app');
  
  switch (currentPage) {
    case 'dashboard':
      container.innerHTML = renderDashboardUI(appState);
      bindDashboardEvents(appState, renderApp);
      break;

    case 'ledger':
      container.innerHTML = renderShellPage(appState, 'ledger', renderLedgerPage(appState));
      bindLedgerEvents(appState, renderApp, openModal, closeModal);
      break;

    case 'biaya':
      container.innerHTML = renderShellPage(appState, 'biaya', renderBiayaLayananPage(appState));
      bindBiayaLayananEvents(appState, renderApp);
      break;

    case 'pembayaran':
      container.innerHTML = renderShellPage(appState, 'pembayaran', renderPembayaranPage(appState));
      bindPembayaranEvents(appState, renderApp);
      break;

    case 'pinjaman':
      container.innerHTML = renderShellPage(appState, 'pinjaman', renderPinjamanPage(appState));
      bindPinjamanEvents(appState, renderApp);
      break;

    case 'pengaturan':
      container.innerHTML = renderShellPage(appState, 'pengaturan', renderPengaturanPage(appState));
      bindPengaturanEvents(appState, renderApp);
      break;

    default:
      console.warn('Page not found:', currentPage);
      navigateTo('dashboard');
  }

  // Common events like navigation and logout are bound on every render
  bindCommonEvents(navigateTo, appState, renderApp);
}

// Kickstart application
bootstrap();
