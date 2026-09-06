const media = window.matchMedia('(prefers-color-scheme: dark)');
let preference = 'system';
try { preference = localStorage.getItem('hm.theme') || 'system'; } catch { /* Session preference works without storage. */ }

export function applyTheme(value = preference) {
  preference = value;
  const theme = value === 'system' ? (media.matches ? 'dark' : 'light') : value;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.dispatchEvent(new CustomEvent('hm:theme-changed', { detail: theme }));
}

export function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('hm.theme', next); } catch { /* Apply for this session. */ }
  applyTheme(next);
}

media.addEventListener('change', () => { if (preference === 'system') applyTheme(); });
applyTheme();
