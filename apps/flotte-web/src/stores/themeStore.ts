import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  collapsed: string[];
  setCollapsed: (collapsed: string[]) => void;
  toggleCollapsed: (title: string) => void;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: (localStorage.getItem('theme') as Theme) || 'light',
  collapsed: [],
  
  setCollapsed: (collapsed) => set({ collapsed }),
  
  toggleCollapsed: (title) => set((state) => ({
    collapsed: state.collapsed.includes(title) 
      ? state.collapsed.filter(t => t !== title) 
      : [...state.collapsed, title]
  })),
  
  toggle: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    return { theme: newTheme };
  }),
}));
