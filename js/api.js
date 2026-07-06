import CONFIG from './config.js';
import AppState from './state.js';
import { showToast } from './utils.js';

async function apiFetch(endpoint, options = {}) {
  const token = AppState.get('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    const data = await response.json();

    if (response.status === 401) {
      AppState.clearSession();
      throw new Error('Sesi berakhir. Silakan login kembali.');
    }
    if (!response.ok) {
      throw new Error(data.error?.message || data.error || `HTTP ${response.status}`);
    }
    return data;
  } catch (err) {
    if (err.message === 'Failed to fetch') {
      showToast('Tidak ada koneksi internet.', 'error');
      throw new Error('Network error');
    }
    throw err;
  }
}

// INSTANCES
export async function getInstances() {
  return apiFetch(CONFIG.endpoints.instances.list);
}
export async function createInstance(data) {
  return apiFetch(CONFIG.endpoints.instances.create, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
export async function updateInstance(id, data) {
  return apiFetch(CONFIG.endpoints.instances.update(id), {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
export async function deleteInstance(id) {
  return apiFetch(CONFIG.endpoints.instances.delete(id), {
    method: 'DELETE',
  });
}

// KNOWLEDGE
export async function getKnowledge() {
  return apiFetch(CONFIG.endpoints.knowledge.list);
}
export async function createKnowledge(data) {
  return apiFetch(CONFIG.endpoints.knowledge.create, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
export async function deleteKnowledge(id) {
  return apiFetch(CONFIG.endpoints.knowledge.delete(id), {
    method: 'DELETE',
  });
}

// USERS
export async function getUsers() {
  return apiFetch(CONFIG.endpoints.users.list);
}
export async function resetUserCredits(id) {
  return apiFetch(CONFIG.endpoints.users.reset(id), {
    method: 'POST',
  });
}

// PLAYGROUND
export async function sendPlaygroundMessage(messages, instance = 'default') {
  return apiFetch(CONFIG.endpoints.playground.chat, {
    method: 'POST',
    body: JSON.stringify({ messages, instance }),
  });
}

// PROFILE
export async function getProfile() {
  return apiFetch(CONFIG.endpoints.user.profile);
}

export default {
  getInstances,
  createInstance,
  updateInstance,
  deleteInstance,
  getKnowledge,
  createKnowledge,
  deleteKnowledge,
  getUsers,
  resetUserCredits,
  sendPlaygroundMessage,
  getProfile,
};