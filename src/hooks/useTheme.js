import { useTheme as useThemeContext } from '../context/ThemeContext';

/**
 * Hook pour accéder au thème actuel et le changer
 * @returns {Object} { theme, setTheme, toggleTheme, mounted }
 * 
 * Utilisation:
 * const { theme, toggleTheme } = useTheme();
 * console.log(theme); // 'dark' ou 'light'
 */
export function useTheme() {
  return useThemeContext();
}

