import { getUsers, resetUserCredits } from './api.js';
import { showToast } from './utils.js';

export async function renderUsers() {
  const main = document.getElementById('mainContent');
  
  main.innerHTML = `
    <div>
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-xl font-bold">Pengguna</h1>
          <p class="text-sm text-gray-500">Manajemen pengguna dan kredit</p>
        </div>
      </div>
      <div class="bg-card border border-theme rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-hover text-gray-400 text-[10px] uppercase tracking-wider">
                <th class="text-left px-4 py-2.5">Nama</th>
                <th class="text-left px-4 py-2.5">Email</th>
                <th class="text-left px-4 py-2.5">Kredit</th>
                <th class="text-left px-4 py-2.5">Status</th>
                <th class="text-left px-4 py-2.5">Aksi</th>
              </tr>
            </thead>
            <tbody id="usersTbody"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  await loadUsers();
}

async function loadUsers() {
  const tbody = document.getElementById('usersTbody');
  if (!tbody) return;
  
  try {
    const result = await getUsers();
    const users = result.data?.users || [];
    
    if (users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-500">Belum ada pengguna</td></tr>';
      return;
    }
    
    tbody.innerHTML = users.map(u => {
      const pct = u.creditLimit ? Math.min((u.creditRemaining / u.creditLimit) * 100, 100) : 0;
      return `
        <tr class="border-b border-theme hover:bg-hover">
          <td class="px-4 py-2.5">${u.displayName || 'N/A'}</td>
          <td class="px-4 py-2.5 text-sm text-gray-400">${u.email || ''}</td>
          <td class="px-4 py-2.5">
            <div class="w-24 h-1.5 bg-hover rounded-full overflow-hidden">
              <div class="h-full rounded-full ${pct < 30 ? 'bg-red-500' : pct < 70 ? 'bg-amber-500' : 'bg-accent'}" style="width:${pct}%"></div>
            </div>
            <span class="text-[10px] text-gray-500">${u.creditRemaining || 0}/${u.creditLimit || 0}</span>
          </td>
          <td class="px-4 py-2.5">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ${u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}">
              ${u.status === 'active' ? 'Aktif' : 'Habis'}
            </span>
          </td>
          <td class="px-4 py-2.5">
            <button onclick="window.resetCredit('${u.id}')" class="text-xs px-2 py-1 border border-theme rounded-md hover:bg-hover">
              Reset
            </button>
          </td>
        </tr>
      `;
    }).join('');
    
  } catch (err) {
    showToast('Gagal memuat pengguna: ' + err.message, 'error');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-500">Gagal memuat data</td></tr>';
  }
}

window.resetCredit = async (uid) => {
  try {
    await resetUserCredits(uid);
    showToast('Kredit berhasil direset!', 'success');
    await loadUsers();
  } catch (err) {
    showToast('Gagal reset: ' + err.message, 'error');
  }
};

export default { renderUsers, loadUsers };