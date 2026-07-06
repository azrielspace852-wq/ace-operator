import CONFIG from './config.js';
import AppState from './state.js';
import { showToast } from './utils.js';

let auth = null;
let unsubscribe = null;

export function initAuth(firebaseApp) {
  auth = firebaseApp.auth();

  unsubscribe = auth.onAuthStateChanged(async (user) => {
    if (user) {
      try {
        const token = await user.getIdToken();
        AppState.setToken(token);
        AppState.setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email
        });
        showToast(`Selamat datang, ${user.displayName || 'User'}!`, 'success');
        document.getElementById('authScreen').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        document.dispatchEvent(new CustomEvent('auth:login'));
      } catch (err) {
        console.error('Auth error:', err);
        showToast('Gagal memverifikasi sesi', 'error');
        auth.signOut();
      }
    } else {
      AppState.clearSession();
      document.getElementById('authScreen').classList.remove('hidden');
      document.getElementById('app').classList.add('hidden');
    }
  });

  setupAuthForms();
}

function setupAuthForms() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const showRegisterLink = document.getElementById('showRegisterLink');
  const showLoginLink = document.getElementById('showLoginLink');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (err) {
      showToast('Login gagal: ' + err.message, 'error');
    }
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    try {
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      await cred.user.updateProfile({ displayName: name });
      showToast('Akun berhasil dibuat!', 'success');
    } catch (err) {
      showToast('Daftar gagal: ' + err.message, 'error');
    }
  });

  showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
  });

  showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
  });
}

export async function logout() {
  if (auth) {
    await auth.signOut();
  }
  AppState.clearSession();
  showToast('Anda telah keluar', 'info');
}

export function getCurrentUser() {
  return AppState.get('user');
}

export function cleanup() {
  if (unsubscribe) unsubscribe();
}

export default { initAuth, logout, getCurrentUser, cleanup };