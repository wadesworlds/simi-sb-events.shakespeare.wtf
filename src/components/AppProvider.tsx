import { ReactNode, useEffect } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface AppProviderProps {
  children: ReactNode;
  theme?: Theme;
}

export function AppProvider({ children, theme = 'light' }: AppProviderProps) {
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return <>{children}</>;
}
