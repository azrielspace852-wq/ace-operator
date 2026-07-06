import { sendPlaygroundMessage, getInstances } from './api.js';
import { showToast } from './utils.js';

let chatHistory = [];

export async function renderPlayground() {
  const main = document.getElementById('mainContent');
  
  main.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 h-[calc(100vh-160px)] min-h-[450px]">
      <div class="bg-card border border-theme rounded-xl p-4 overflow-y-auto">
        <h3 class="text-sm font-semibold mb-3">Konfigurasi</h3>
        <div class="space-y-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Instansi</label>
            <select id="pgInstance" class="w-full px-3 py-2 bg-hover border border-theme rounded-lg text-sm">
              <option value="default">Default</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Suhu: <span id="pgTempVal">0.7</span></label>
            <input type="range" min="0" max="2" step="0.1" value="0.7" id="pgTemp" oninput="document.getElementById('pgTempVal').textContent=this.value">
          </div>
          <button id="clearChatBtn" class="w-full px-3 py-2 border border-theme rounded-lg text-sm text-gray-300 hover:bg-hover">
            Bersihkan Chat
          </button>
        </div>
      </div>
      <div class="bg-card border border-theme rounded-xl flex flex-col overflow-hidden">
        <div class="flex-1 overflow-y-auto p-4 space-y-3" id="chatMessages">
          <div class="max-w-[85%] self-start bg-hover border border-theme rounded-xl rounded-bl-sm px-3 py-2 text-sm">
            Halo! Pilih konfigurasi dan mulai mengobrol.
          </div>
        </div>
        <div class="flex gap-2 p-3 border-t border-theme">
          <input type="text" id="chatInput" placeholder="Ketik pesan..." class="flex-1 px-3 py-2 bg-hover border border-theme rounded-lg text-sm" onkeydown="if(event.key==='Enter')window.sendPlayground()">
          <button id="sendPlaygroundBtn" class="px-4 py-2 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg text-sm">
            Kirim
          </button>
        </div>
      </div>
    </div>
  `;

  chatHistory = [];
  
  document.getElementById('sendPlaygroundBtn').addEventListener('click', sendPlayground);
  document.getElementById('clearChatBtn').addEventListener('click', clearChat);
  
  await loadInstanceDropdown();
}

async function loadInstanceDropdown() {
  try {
    const result = await getInstances();
    const instances = result.data?.instances || [];
    const select = document.getElementById('pgInstance');
    if (select) {
      select.innerHTML = instances.map(i => 
        `<option value="${i.slug || i.id}">${i.name}</option>`
      ).join('');
      if (instances.length === 0) {
        select.innerHTML = '<option value="default">Default</option>';
      }
    }
  } catch (err) {
    // Silent fail
  }
}

window.sendPlayground = async () => {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (!msg) return;
  
  const container = document.getElementById('chatMessages');
  
  container.innerHTML += `
    <div class="max-w-[85%] self-end bg-accent text-white rounded-xl rounded-br-sm px-3 py-2 text-sm ml-auto">
      ${escapeHtml(msg)}
    </div>
  `;
  input.value = '';
  
  const loadingId = 'loading-' + Date.now();
  container.innerHTML += `
    <div id="${loadingId}" class="max-w-[85%] self-start bg-hover border border-theme rounded-xl rounded-bl-sm px-3 py-2 text-sm text-gray-400">
      ⏳ Mengetik...
    </div>
  `;
  container.scrollTop = container.scrollHeight;
  
  try {
    const instance = document.getElementById('pgInstance').value;
    chatHistory.push({ role: 'user', content: msg });
    
    const result = await sendPlaygroundMessage(chatHistory, instance);
    const reply = result.data?.reply || 'Tidak ada respons.';
    
    document.getElementById(loadingId)?.remove();
    
    container.innerHTML += `
      <div class="max-w-[85%] self-start bg-hover border border-theme rounded-xl rounded-bl-sm px-3 py-2 text-sm">
        ${escapeHtml(reply)}
      </div>
    `;
    
    chatHistory.push({ role: 'assistant', content: reply });
    
  } catch (err) {
    document.getElementById(loadingId)?.remove();
    container.innerHTML += `
      <div class="max-w-[85%] self-start bg-red-500/10 border border-red-500/30 rounded-xl rounded-bl-sm px-3 py-2 text-sm text-red-400">
        ❌ Gagal: ${escapeHtml(err.message)}
      </div>
    `;
    showToast('Gagal mengirim: ' + err.message, 'error');
  }
  
  container.scrollTop = container.scrollHeight;
};

function clearChat() {
  chatHistory = [];
  const container = document.getElementById('chatMessages');
  if (container) {
    container.innerHTML = `
      <div class="max-w-[85%] self-start bg-hover border border-theme rounded-xl rounded-bl-sm px-3 py-2 text-sm">
        Chat dibersihkan. Mulai obrolan baru!
      </div>
    `;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export default { renderPlayground };