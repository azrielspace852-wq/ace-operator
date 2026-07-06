import CONFIG from './config.js';
import { initTheme } from './theme.js';
import { initAuth } from './auth.js';
import { renderDashboard } from './dashboard.js';
import { renderInstances } from './instances.js';
import { renderUsers } from './users.js';
import { renderKnowledge } from './knowledge.js';
import { renderPlayground } from './playground.js';
import { renderSettings } from './settings.js';
import { showToast } from './utils.js';
import AppState from './state.js';

let initialized = false;

function initApp() {
  if (initialized) return;
  initialized = true;

  try {
    firebase.initializeApp(CONFIG.firebase);
    initTheme();
    initAuth(firebase);
    setupNavigation();

    document.addEventListener('auth:login', () => {
      navigate('dashboard');
    });

    window.addEventListener('online', () => showToast('Koneksi kembali', 'success'));
    window.addEventListener('offline', () => showToast('Koneksi terputus.', 'warning'));

    console.log('🚀 ACE OPERATIONS v1.0.0 initialized');
  } catch (err) {
    console.error('Failed to initialize app:', err);
    showToast('Gagal memuat aplikasi: ' + err.message, 'error');
  }
}

function setupNavigation() {
  document.querySelectorAll('#sidebarNav a').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(a.getAttribute('href').substring(1));
    });
  });

  document.querySelectorAll('#bottomNav button[data-nav]').forEach(b => {
    b.addEventListener('click', () => {
      navigate(b.getAttribute('data-nav'));
      document.getElementById('moreMenu')?.classList.add('hidden');
    });
  });

  document.getElementById('moreBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('moreMenu')?.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#moreBtn')) {
      document.getElementById('moreMenu')?.classList.add('hidden');
    }
  });
}

const pageMap = {
  dashboard: renderDashboard,
  instances: renderInstances,
  users: renderUsers,
  knowledge: renderKnowledge,
  playground: renderPlayground,
  settings: renderSettings,
  databases: renderDatabases,
};

async function navigate(page) {
  AppState.set('currentPage', page);
  
  document.querySelectorAll('#sidebarNav a').forEach(a => {
    a.classList.remove('text-white', 'bg-white/10');
    a.classList.add('text-gray-500');
    if (a.getAttribute('href') === '#' + page) {
      a.classList.add('text-white', 'bg-white/10');
      a.classList.remove('text-gray-500');
    }
  });

  document.querySelectorAll('#bottomNav button[data-nav]').forEach(b => {
    b.classList.remove('text-accent');
    b.classList.add('text-gray-500');
    if (b.getAttribute('data-nav') === page) {
      b.classList.add('text-accent');
      b.classList.remove('text-gray-500');
    }
  });

  if (pageMap[page]) {
    await pageMap[page]();
  } else {
    document.getElementById('mainContent').innerHTML = `
      <div class="text-center py-20">
        <h2 class="text-2xl font-bold">Halaman tidak ditemukan</h2>
        <p class="text-gray-500">Fitur ini sedang dalam pengembangan</p>
      </div>
    `;
  }

  window.scrollTo(0, 0);
}

function renderDatabases() {
  document.getElementById('mainContent').innerHTML = `
    <div>
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-xl font-bold">Database</h1>
          <p class="text-sm text-gray-500">Konfigurasi koneksi database</p>
        </div>
      </div>
      <div class="bg-card border border-theme rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-hover text-gray-400 text-[10px] uppercase tracking-wider">
                <th class="text-left px-4 py-2.5">Nama</th>
                <th class="text-left px-4 py-2.5">Tipe</th>
                <th class="text-left px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-theme">
                <td class="px-4 py-2.5">Default (azriel-web2)</td>
                <td class="px-4 py-2.5">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent/10 text-accent">Firestore</span>
                </td>
                <td class="px-4 py-2.5">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400">Terhubung</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <p class="text-sm text-gray-500 mt-4">Fitur tambah database akan tersedia setelah MVP.</p>
    </div>
  `;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

export default { CONFIG }; 