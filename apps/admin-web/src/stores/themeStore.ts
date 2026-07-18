type Theme = 'light' | 'dark' | 'system';

// Appliquer le thème au DOM
function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    // system
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
}

// Initialiser au chargement
const storedTheme = (localStorage.getItem('theme') as Theme) || 'system';
applyTheme(storedTheme);

// Écouter les changements système
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  const currentTheme = localStorage.getItem('theme') as Theme || 'system';
  if (currentTheme === 'system') {
    applyTheme('system');
  }
});

export function getTheme(): Theme {
  return (localStorage.getItem('theme') as Theme) || 'system';
}

export function setTheme(theme: Theme) {
  localStorage.setItem('theme', theme);
  applyTheme(theme);
}

export function toggleTheme() {
  const current = getTheme();
  const next = current === 'dark' ? 'light' : current === 'light' ? 'system' : 'dark';
  setTheme(next);
  return next;
}
