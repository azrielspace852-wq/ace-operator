import AppState from './state.js';

export function getTheme() {
  return AppState.get('theme') || 'dark';
}

export function setTheme(theme) {
  AppState.set('theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  updateThemeLabel();
}

export function toggleTheme() {
  const current = getTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
}

function updateThemeLabel() {
  const label = document.getElementById('themeLabel');
  if (label) {
    label.textContent = getTheme() === 'dark' ? 'Mode Gelap' : 'Mode Terang';
  }
}

export function initTheme() {
  const saved = localStorage.getItem('theme') || 'dark';
  setTheme(saved);
  
  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
  document.getElementById('themeToggleMobile')?.addEventListener('click', () => {
    toggleTheme();
    document.getElementById('moreMenu')?.classList.add('hidden');
  });
}

export default { getTheme, setTheme, toggleTheme, initTheme };