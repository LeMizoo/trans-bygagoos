import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

const getStoredTheme = (): Theme => {
  const stored = localStorage.getItem('theme') as Theme;
  return stored || 'system';
};

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: getStoredTheme(),
  setTheme: (theme: Theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
    applyTheme(theme);
  },
  toggle: () => {
    const current = get().theme;
    const next = current === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },
}));

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
}

// Appliquer au chargement
applyTheme(getStoredTheme());
