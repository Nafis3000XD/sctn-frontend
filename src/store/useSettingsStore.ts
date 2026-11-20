import { create } from 'zustand';
import { translations } from '../lib/translations';

interface SettingsState {
  theme: 'dark' | 'light';
  lang: 'en' | 'bn';
  toggleTheme: () => void;
  setLang: (lang: 'en' | 'bn') => void;
}

export const useSettingsStore = create<SettingsState>((set) => {
  const initialTheme = (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
  const initialLang = (localStorage.getItem('lang') as 'en' | 'bn') || 'en';

  if (typeof document !== 'undefined') {
    if (initialTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }

  return {
    theme: initialTheme,
    lang: initialLang,
    toggleTheme: () => {
      set((state) => {
        const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', nextTheme);
        if (typeof document !== 'undefined') {
          if (nextTheme === 'light') {
            document.documentElement.classList.add('light');
          } else {
            document.documentElement.classList.remove('light');
          }
        }
        return { theme: nextTheme };
      });
    },
    setLang: (lang) => {
      localStorage.setItem('lang', lang);
      set({ lang });
    }
  };
});

export const useTranslation = () => {
  const { lang, theme, toggleTheme, setLang } = useSettingsStore();

  const t = (key: string, defaultText?: string): string => {
    const entry = translations[key];
    if (!entry) return defaultText || key;
    return entry[lang] || defaultText || key;
  };

  return { t, lang, theme, toggleTheme, setLang };
};
