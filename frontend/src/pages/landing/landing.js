import '../../styles/style.css';
import './landing.css';

document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('.navbar');
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  // Handle scroll effect for navbar
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  // Close mobile menu when a link is clicked
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
    });
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        window.scrollTo({
          top: targetElement.offsetTop - 80, // Offset for navbar
          behavior: 'smooth'
        });
      }
    });
  });

  // Scroll Spy for updating active nav link
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (window.scrollY >= (sectionTop - 150)) {
        current = section.getAttribute('id') || '';
      }
    });

    // If at the very top, select Home
    if (window.scrollY < 200) {
      current = '';
    }

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (current) {
        if (href === `#${current}`) {
          link.classList.add('active');
        }
      } else {
        if (href === '#' || href === '/') {
          link.classList.add('active');
        }
      }
    });
  });

  // Fetch real-time news & stats
  fetchNews();
  fetchStats();
});

async function fetchStats() {
  try {
    const res = await fetch('http://localhost:3000/api/admin/stats');
    if (!res.ok) return;
    const stats = await res.json();
    
    const nasabahEl = document.getElementById('stat-nasabah');
    const asetEl = document.getElementById('stat-aset');
    
    if (nasabahEl && stats.totalUsers) {
      nasabahEl.textContent = stats.totalUsers.toLocaleString('id-ID');
    }
    if (asetEl && stats.totalBalance !== undefined) {
      let formattedAset;
      if (stats.totalBalance >= 1000000000) {
        formattedAset = `Rp ${(stats.totalBalance / 1000000000).toFixed(1)} Miliar+`;
      } else if (stats.totalBalance >= 1000000) {
        formattedAset = `Rp ${(stats.totalBalance / 1000000).toFixed(1)} Juta+`;
      } else {
        formattedAset = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(stats.totalBalance);
      }
      asetEl.textContent = formattedAset;
    }
  } catch(e) {
    console.error('Failed to fetch stats', e);
  }
}

let allNewsData = [];
let showingAllNews = false;

async function fetchNews() {
  // Bind the button regardless of fetch success
  const btn = document.getElementById('view-all-news-btn');
  if (btn && !btn.hasAttribute('data-bound')) {
    btn.setAttribute('data-bound', 'true');
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showingAllNews = !showingAllNews;
      renderNews();
      btn.textContent = showingAllNews ? 'Tampilkan Lebih Sedikit' : 'Lihat Semua Berita';
    });
  }

  try {
    const res = await fetch('http://localhost:3000/api/news');
    if (!res.ok) return;
    allNewsData = await res.json();
    renderNews();
  } catch (err) {
    console.error('Failed to fetch news', err);
  }
}

function renderNews() {
  const grid = document.getElementById('landing-news-grid');
  if (!grid || allNewsData.length === 0) return;
  
  const newsToShow = showingAllNews ? allNewsData : allNewsData.slice(0, 3);
  
  grid.innerHTML = newsToShow.map((n, i) => `
    <article class="news-card">
      <div class="news-img bg-blue-${(i % 3) + 1}"></div>
      <div class="news-content">
        <span class="news-date">${n.source}</span>
        <h3 class="news-title">${n.title}</h3>
        <p class="news-excerpt">${n.summary}</p>
        <a href="${n.url || 'javascript:void(0)'}" target="${n.url ? '_blank' : '_self'}" rel="noopener noreferrer" class="news-readmore">Baca Selengkapnya</a>
      </div>
    </article>
  `).join('');
}
