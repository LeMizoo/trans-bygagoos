import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('dark');
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'system') {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.classList.add('dark');
    }
  }
}

const saved = (localStorage.getItem('theme') as Theme) || 'system';
applyTheme(saved);

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: saved,
  
  setTheme: (theme: Theme) => {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
    set({ theme });
  },
  
  toggle: () => {
    const current = get().theme;
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    applyTheme(next);
    set({ theme: next });
  },
}));
