import { getInstances, getKnowledge, getUsers } from './api.js';
import { showToast } from './utils.js';

export async function renderDashboard() {
  const main = document.getElementById('mainContent');
  
  main.innerHTML = `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-xl font-bold">Dashboard</h1>
          <p class="text-sm text-gray-500">Panel Kontrol ACE Operations</p>
        </div>
        <div class="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full text-xs font-semibold border border-emerald-500/20">
          <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
          Sistem Online
        </div>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6" id="statsGrid"></div>
      <div class="bg-card border border-theme rounded-xl overflow-hidden">
        <div class="px-4 py-3 border-b border-theme">
          <h2 class="text-sm font-semibold">Ringkasan</h2>
        </div>
        <div id="summaryContent" class="p-4 text-sm text-gray-400">
          Memuat data...
        </div>
      </div>
    </div>
  `;

  try {
    const [instSnap, knowSnap, usersSnap] = await Promise.all([
      getInstances(),
      getKnowledge(),
      getUsers()
    ]);

    const instances = instSnap.data?.instances || [];
    const knowledge = knowSnap.data?.knowledge || [];
    const users = usersSnap.data?.users || [];

    const activeInst = instances.filter(i => i.status === 'active').length;
    let totalCredits = 0;
    let usedCredits = 0;
    users.forEach(u => {
      totalCredits += u.creditLimit || 0;
      usedCredits += (u.creditLimit || 0) - (u.creditRemaining || 0);
    });

    document.getElementById('statsGrid').innerHTML = `
      <div class="bg-card border border-theme rounded-xl p-4 border-l-accent border-l-4">
        <p class="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2">Instansi AI</p>
        <p class="text-2xl font-bold">${instances.length}</p>
        <p class="text-xs text-gray-500">${activeInst} aktif</p>
      </div>
      <div class="bg-card border border-theme rounded-xl p-4">
        <p class="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2">Pengetahuan</p>
        <p class="text-2xl font-bold">${knowledge.length}</p>
      </div>
      <div class="bg-card border border-theme rounded-xl p-4">
        <p class="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2">Pengguna</p>
        <p class="text-2xl font-bold">${users.length}</p>
      </div>
      <div class="bg-card border border-theme rounded-xl p-4 border-l-amber-500 border-l-4">
        <p class="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2">Kredit Terpakai</p>
        <p class="text-2xl font-bold">${usedCredits}</p>
        <p class="text-xs text-gray-500">dari ${totalCredits}</p>
      </div>
    `;

    document.getElementById('summaryContent').innerHTML = `
      <div class="space-y-2">
        <p>📊 <strong>${instances.length}</strong> Instansi AI terdaftar</p>
        <p>📚 <strong>${knowledge.length}</strong> Entri pengetahuan</p>
        <p>👥 <strong>${users.length}</strong> Pengguna terdaftar</p>
        <p>⚡ <strong>${activeInst}</strong> Instansi aktif</p>
      </div>
    `;

  } catch (err) {
    showToast('Gagal memuat dashboard: ' + err.message, 'error');
    document.getElementById('summaryContent').innerHTML = 'Gagal memuat data.';
  }
}

export default { renderDashboard };