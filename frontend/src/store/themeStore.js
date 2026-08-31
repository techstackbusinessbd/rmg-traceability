import { create } from 'zustand';

export const useThemeStore = create((set, get) => ({
  isDark: (() => {
    const saved = localStorage.getItem('theme');
    if (saved !== null) return saved === 'dark';
    return false; // Default to clean light mode
  })(),

  toggleTheme: () => {
    const newDark = !get().isDark;
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    if (newDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ isDark: newDark });
  },

  initTheme: () => {
    const saved = localStorage.getItem('theme');
    const isDark = saved === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ isDark });
  }
}));
