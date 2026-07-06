import { getKnowledge, createKnowledge, deleteKnowledge } from './api.js';
import { showToast } from './utils.js';

export async function renderKnowledge() {
  const main = document.getElementById('mainContent');
  
  main.innerHTML = `
    <div>
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-xl font-bold">Basis Pengetahuan</h1>
          <p class="text-sm text-gray-500">Kelola pengetahuan untuk RAG</p>
        </div>
        <button id="addKnowledgeBtn" class="px-4 py-2 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg text-sm">
          + Tambah
        </button>
      </div>
      <div id="knowledgeGrid" class="grid grid-cols-1 md:grid-cols-2 gap-3"></div>
    </div>
    ${knowledgeModalHTML()}
  `;

  document.getElementById('addKnowledgeBtn').addEventListener('click', openKnowledgeModal);
  document.getElementById('knowledgeModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'knowledgeModal') closeKnowledgeModal();
  });
  document.getElementById('closeKnowledgeModal')?.addEventListener('click', closeKnowledgeModal);
  document.getElementById('knowledgeForm')?.addEventListener('submit', handleAddKnowledge);
  document.getElementById('cancelKnowledgeBtn')?.addEventListener('click', closeKnowledgeModal);

  await loadKnowledge();
}

function knowledgeModalHTML() {
  return `
    <div id="knowledgeModal" class="hidden fixed inset-0 z-[999] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-card border border-theme rounded-t-2xl md:rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto" onclick="event.stopPropagation()">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold">Tambah Pengetahuan</h2>
          <button id="closeKnowledgeModal" class="text-2xl text-gray-500 hover:text-white">&times;</button>
        </div>
        <form id="knowledgeForm" class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-gray-400 mb-1">Judul</label>
            <input type="text" id="kbTitle" placeholder="FAQ Perusahaan" class="w-full px-3 py-2 bg-hover border border-theme rounded-lg text-sm" required>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-400 mb-1">Konten</label>
            <textarea id="kbContent" rows="5" placeholder="Tulis konten pengetahuan..." class="w-full px-3 py-2 bg-hover border border-theme rounded-lg text-sm" required></textarea>
          </div>
          <div class="flex gap-3 justify-end pt-2">
            <button type="button" id="cancelKnowledgeBtn" class="px-4 py-2 border border-theme rounded-lg text-sm">Batal</button>
            <button type="submit" class="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-semibold">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function openKnowledgeModal() {
  document.getElementById('knowledgeModal').classList.remove('hidden');
}

function closeKnowledgeModal() {
  document.getElementById('knowledgeModal').classList.add('hidden');
  document.getElementById('knowledgeForm').reset();
}

async function handleAddKnowledge(e) {
  e.preventDefault();
  const title = document.getElementById('kbTitle').value.trim();
  const content = document.getElementById('kbContent').value.trim();
  
  if (!title || !content) {
    showToast('Judul dan konten wajib diisi', 'error');
    return;
  }
  
  try {
    await createKnowledge({ title, content, type: 'Umum' });
    showToast('Pengetahuan berhasil ditambahkan!', 'success');
    closeKnowledgeModal();
    await loadKnowledge();
  } catch (err) {
    showToast('Gagal: ' + err.message, 'error');
  }
}

async function loadKnowledge() {
  const grid = document.getElementById('knowledgeGrid');
  if (!grid) return;
  
  try {
    const result = await getKnowledge();
    const knowledge = result.data?.knowledge || [];
    
    if (knowledge.length === 0) {
      grid.innerHTML = '<p class="text-gray-500 text-center py-8 col-span-full">Belum ada entri pengetahuan</p>';
      return;
    }
    
    grid.innerHTML = knowledge.map(k => `
      <div class="bg-card border border-theme rounded-xl p-4 hover:border-accent cursor-pointer group">
        <div class="flex justify-between items-start">
          <h3 class="font-semibold text-sm mb-1">${k.title}</h3>
          <button onclick="window.deleteKnowledge('${k.id}')" class="text-red-400 hover:text-red-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
            Hapus
          </button>
        </div>
        <p class="text-xs text-gray-500 line-clamp-2 mb-2">${k.content}</p>
        <span class="text-[10px] text-gray-600">${k.type || 'Umum'}</span>
      </div>
    `).join('');
    
  } catch (err) {
    showToast('Gagal memuat pengetahuan: ' + err.message, 'error');
    grid.innerHTML = '<p class="text-gray-500 text-center py-8 col-span-full">Gagal memuat data</p>';
  }
}

window.deleteKnowledge = async (id) => {
  if (!confirm('Yakin hapus pengetahuan ini?')) return;
  try {
    await deleteKnowledge(id);
    showToast('Pengetahuan dihapus', 'info');
    await loadKnowledge();
  } catch (err) {
    showToast('Gagal hapus: ' + err.message, 'error');
  }
};

export default { renderKnowledge, loadKnowledge };