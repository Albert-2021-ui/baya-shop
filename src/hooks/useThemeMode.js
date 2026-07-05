import { useTheme } from '../context/ThemeContext';

/**
 * Hook personnalisé pour accéder au thème et le contrôler
 * @returns {Object} { theme, isDark, isLight, setTheme, toggleTheme, mounted }
 * 
 * Utilisation:
 * const { theme, isDark, toggleTheme } = useThemeMode();
 * 
 * Exemples:
 * - Afficher du contenu différent selon le thème:
 *   {isDark ? <DarkIcon /> : <LightIcon />}
 * 
 * - Changer le thème:
 *   onClick={() => toggleTheme()}
 * 
 * - Définir un thème spécifique:
 *   onClick={() => setTheme('light')}
 */
export function useThemeMode() {
  const { theme, setTheme, toggleTheme, mounted, isDark, isLight } = useTheme();

  return {
    theme,
    isDark,
    isLight,
    setTheme,
    toggleTheme,
    mounted,
  };
}

