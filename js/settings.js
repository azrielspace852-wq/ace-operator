import { getProfile } from './api.js';
import { showToast } from './utils.js';
import { toggleTheme, getTheme } from './theme.js';
import { logout } from './auth.js';

export async function renderSettings() {
  const main = document.getElementById('mainContent');
  
  main.innerHTML = `
    <div>
      <div class="bg-card border border-theme rounded-xl overflow-hidden">
        <div class="px-4 py-3 border-b border-theme">
          <h2 class="text-sm font-semibold">Pengaturan</h2>
        </div>
        <div class="p-4 space-y-4">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Email</label>
            <p id="settingsEmail" class="text-sm font-medium">-</p>
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Nama</label>
            <p id="settingsName" class="text-sm font-medium">-</p>
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Tema</label>
            <button id="settingsThemeBtn" class="px-4 py-2 bg-hover border border-theme rounded-lg text-sm">
              ${getTheme() === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            </button>
          </div>
          <div class="pt-4 border-t border-theme">
            <button id="settingsLogoutBtn" class="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm hover:bg-red-500/20">
              Keluar
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  try {
    const result = await getProfile();
    const user = result.data?.user || {};
    document.getElementById('settingsEmail').textContent = user.email || '-';
    document.getElementById('settingsName').textContent = user.displayName || '-';
  } catch (err) {
    showToast('Gagal memuat profil: ' + err.message, 'error');
  }

  document.getElementById('settingsThemeBtn').addEventListener('click', () => {
    toggleTheme();
    document.getElementById('settingsThemeBtn').textContent = 
      getTheme() === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap';
  });

  document.getElementById('settingsLogoutBtn').addEventListener('click', async () => {
    await logout();
  });
}

export default { renderSettings };