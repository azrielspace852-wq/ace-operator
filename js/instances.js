import { getInstances, createInstance, deleteInstance } from './api.js';
import { showToast } from './utils.js';

let tempApiKeys = [];
let currentInstances = [];

export async function renderInstances() {
  const main = document.getElementById('mainContent');
  
  main.innerHTML = `
    <div>
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-xl font-bold">Instansi AI</h1>
          <p class="text-sm text-gray-500">Kelola instansi dan kunci API provider</p>
        </div>
        <button id="addInstanceBtn" class="px-4 py-2 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg text-sm">
          + Tambah Instansi
        </button>
      </div>
      <div id="instancesList"></div>
    </div>
    ${instanceModalHTML()}
  `;

  document.getElementById('addInstanceBtn').addEventListener('click', openInstanceModal);
  document.getElementById('instanceModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'instanceModal') closeInstanceModal();
  });
  document.getElementById('closeInstanceModal')?.addEventListener('click', closeInstanceModal);
  document.getElementById('instanceForm')?.addEventListener('submit', handleAddInstance);
  document.getElementById('instProvider')?.addEventListener('change', updateModelDropdown);
  document.getElementById('addApiKeyBtn')?.addEventListener('click', addApiKey);
  document.getElementById('cancelInstanceBtn')?.addEventListener('click', closeInstanceModal);
  
  await loadInstances();
}

function instanceModalHTML() {
  return `
    <div id="instanceModal" class="hidden fixed inset-0 z-[999] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-card border border-theme rounded-t-2xl md:rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto" onclick="event.stopPropagation()">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold">Tambah Instansi AI</h2>
          <button id="closeInstanceModal" class="text-2xl text-gray-500 hover:text-white">&times;</button>
        </div>
        <form id="instanceForm" class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-gray-400 mb-1">Nama Instansi</label>
            <input type="text" id="instName" placeholder="AI Standar" class="w-full px-3 py-2 bg-hover border border-theme rounded-lg text-sm" required>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-gray-400 mb-1">Provider</label>
              <select id="instProvider" class="w-full px-3 py-2 bg-hover border border-theme rounded-lg text-sm">
                <option value="groq">Groq</option>
                <option value="deepseek">DeepSeek</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-400 mb-1">Model</label>
              <select id="instModel" class="w-full px-3 py-2 bg-hover border border-theme rounded-lg text-sm"></select>
            </div>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-400 mb-1">System Prompt</label>
            <textarea id="instPrompt" rows="3" placeholder="Tentukan perilaku AI..." class="w-full px-3 py-2 bg-hover border border-theme rounded-lg text-sm"></textarea>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-400 mb-1">API Key Provider</label>
            <div class="flex gap-2 mb-2">
              <input type="text" id="apiKeyLabel" placeholder="Label" class="flex-1 px-3 py-2 bg-hover border border-theme rounded-lg text-sm">
              <input type="password" id="apiKeyValue" placeholder="gsk_xxxxx" class="flex-1 px-3 py-2 bg-hover border border-theme rounded-lg text-sm">
            </div>
            <button type="button" id="addApiKeyBtn" class="text-xs text-accent hover:underline">+ Tambah API Key</button>
            <div id="apiKeyList" class="mt-2 space-y-1"></div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-gray-400 mb-1">Suhu: <span id="tempVal">0.7</span></label>
              <input type="range" min="0" max="2" step="0.1" value="0.7" id="instTemp" oninput="document.getElementById('tempVal').textContent=this.value">
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-400 mb-1">Token Maks</label>
              <input type="number" id="instMaxTokens" value="4096" class="w-full px-3 py-2 bg-hover border border-theme rounded-lg text-sm">
            </div>
          </div>
          <div class="flex gap-3 justify-end pt-2">
            <button type="button" id="cancelInstanceBtn" class="px-4 py-2 border border-theme rounded-lg text-sm">Batal</button>
            <button type="submit" class="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-semibold">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

const modelsByProvider = {
  groq: [
    { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B' },
    { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
    { value: 'gemma2-9b-it', label: 'Gemma 2 9B' }
  ],
  deepseek: [
    { value: 'deepseek-chat', label: 'DeepSeek Chat' },
    { value: 'deepseek-coder', label: 'DeepSeek Coder' }
  ],
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' }
  ],
  anthropic: [
    { value: 'claude-sonnet-4', label: 'Claude Sonnet 4' },
    { value: 'claude-haiku-3-5', label: 'Claude Haiku 3.5' }
  ]
};

function updateModelDropdown() {
  const provider = document.getElementById('instProvider')?.value || 'groq';
  const modelSelect = document.getElementById('instModel');
  if (!modelSelect) return;
  const models = modelsByProvider[provider] || [];
  modelSelect.innerHTML = models.map(m => `<option value="${m.value}">${m.label}</option>`).join('');
}

function openInstanceModal() {
  tempApiKeys = [];
  renderApiKeyList();
  document.getElementById('instanceModal').classList.remove('hidden');
  updateModelDropdown();
}

function closeInstanceModal() {
  document.getElementById('instanceModal').classList.add('hidden');
  document.getElementById('instanceForm').reset();
  tempApiKeys = [];
}

function renderApiKeyList() {
  const list = document.getElementById('apiKeyList');
  if (!list) return;
  list.innerHTML = tempApiKeys.map((k, i) => `
    <div class="flex items-center justify-between bg-hover px-3 py-1.5 rounded-lg text-xs">
      <span>${k.label} — <code>${(k.key||'').slice(0,6)}...${(k.key||'').slice(-4)}</code></span>
      <button type="button" onclick="window.removeApiKey(${i})" class="text-red-400 hover:underline">Hapus</button>
    </div>
  `).join('');
}

window.removeApiKey = (index) => {
  tempApiKeys.splice(index, 1);
  renderApiKeyList();
};

function addApiKey() {
  const label = document.getElementById('apiKeyLabel')?.value.trim();
  const key = document.getElementById('apiKeyValue')?.value.trim();
  if (!label || !key) {
    showToast('Label dan API Key wajib diisi', 'error');
    return;
  }
  tempApiKeys.push({ label, key, status: 'active', dailyLimit: 1000, usageToday: 0 });
  document.getElementById('apiKeyLabel').value = '';
  document.getElementById('apiKeyValue').value = '';
  renderApiKeyList();
}

async function handleAddInstance(e) {
  e.preventDefault();
  const name = document.getElementById('instName').value.trim();
  if (!name) {
    showToast('Nama wajib diisi', 'error');
    return;
  }
  if (tempApiKeys.length === 0) {
    showToast('Minimal 1 API Key provider', 'error');
    return;
  }

  try {
    await createInstance({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      provider: document.getElementById('instProvider').value,
      model: document.getElementById('instModel').value,
      systemPrompt: document.getElementById('instPrompt').value,
      temperature: parseFloat(document.getElementById('instTemp').value),
      maxTokens: parseInt(document.getElementById('instMaxTokens').value),
      status: 'active',
      apiKeys: tempApiKeys,
      rotationStrategy: 'round_robin'
    });
    showToast('Instansi berhasil dibuat!', 'success');
    closeInstanceModal();
    await loadInstances();
  } catch (err) {
    showToast('Gagal: ' + err.message, 'error');
  }
}

async function loadInstances() {
  const list = document.getElementById('instancesList');
  if (!list) return;
  
  try {
    const result = await getInstances();
    currentInstances = result.data?.instances || [];
    
    if (currentInstances.length === 0) {
      list.innerHTML = '<p class="text-gray-500 text-center py-8">Belum ada instansi AI</p>';
      return;
    }
    
    list.innerHTML = currentInstances.map(i => {
      const apiKeysHtml = (i.apiKeys || []).map(k => `
        <div class="flex items-center justify-between text-xs py-1">
          <span>${k.label} — <code>${(k.key||'').slice(0,6)}...${(k.key||'').slice(-4)}</code></span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ${k.status==='active'?'bg-emerald-500/10 text-emerald-400':'bg-amber-500/10 text-amber-400'}">
            ${k.status==='active'?'Aktif':'Limit'}
          </span>
        </div>
      `).join('');
      
      return `
        <div class="bg-card border border-theme rounded-xl mb-4 overflow-hidden">
          <div class="px-4 py-3 border-b border-theme flex justify-between items-center">
            <div>
              <h2 class="font-semibold">${i.name}</h2>
              <p class="text-xs text-gray-500">Model: ${i.model} · Provider: ${i.provider}</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${i.status==='active'?'bg-emerald-500/10 text-emerald-400':'bg-gray-500/10 text-gray-400'}">
                ${i.status==='active'?'Aktif':'Nonaktif'}
              </span>
              <button onclick="window.deleteInstance('${i.id}')" class="text-red-400 hover:text-red-300 text-sm">Hapus</button>
            </div>
          </div>
          <div class="p-4">
            <div class="bg-hover p-3 rounded-lg text-xs text-gray-400 font-mono mb-3 border border-theme">
              ${i.systemPrompt || 'System prompt belum diatur'}
            </div>
            <div class="flex gap-4 text-xs text-gray-500 mb-2">
              <span>Rotasi: <strong>${i.rotationStrategy || 'round_robin'}</strong></span>
              <span>Suhu: <strong>${i.temperature || 0.7}</strong></span>
            </div>
            ${i.apiKeys?.length ? `
              <div class="border-t border-theme pt-2 mt-2">
                <p class="text-[10px] text-gray-500 mb-1">API Keys:</p>
                ${apiKeysHtml}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
    
  } catch (err) {
    showToast('Gagal memuat instansi: ' + err.message, 'error');
    list.innerHTML = '<p class="text-gray-500 text-center py-8">Gagal memuat data</p>';
  }
}

window.deleteInstance = async (id) => {
  if (!confirm('Yakin hapus instansi ini?')) return;
  try {
    await deleteInstance(id);
    showToast('Instansi dihapus', 'info');
    await loadInstances();
  } catch (err) {
    showToast('Gagal hapus: ' + err.message, 'error');
  }
};

export default { renderInstances, loadInstances };