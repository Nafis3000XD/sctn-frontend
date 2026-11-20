import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSettingsStore, useTranslation } from '../src/store/useSettingsStore';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('light');
  useSettingsStore.setState({ theme: 'dark', lang: 'en' });
});

describe('useSettingsStore', () => {
  it('toggleTheme flips theme, persists, and toggles the light class', () => {
    useSettingsStore.getState().toggleTheme();
    expect(useSettingsStore.getState().theme).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);

    useSettingsStore.getState().toggleTheme();
    expect(useSettingsStore.getState().theme).toBe('dark');
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  it('setLang updates language and persists it', () => {
    useSettingsStore.getState().setLang('bn');
    expect(useSettingsStore.getState().lang).toBe('bn');
    expect(localStorage.getItem('lang')).toBe('bn');
  });
});

describe('useTranslation', () => {
  it('falls back to the provided default text for an unknown key', () => {
    const { result } = renderHook(() => useTranslation());
    expect(result.current.t('___missing_key___', 'Fallback')).toBe('Fallback');
  });
});
