import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { COLORS } from '@/constants/theme';

type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = '@scholarship_scout_theme';

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') {
        setThemeMode(stored);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = useCallback(async () => {
    const newMode: ThemeMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }, [themeMode]);

  const colors = useMemo(() => COLORS[themeMode], [themeMode]);

  return useMemo(() => ({
    themeMode,
    colors,
    toggleTheme,
    isLoading,
  }), [themeMode, colors, toggleTheme, isLoading]);
});
