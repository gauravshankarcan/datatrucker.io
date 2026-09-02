/*
 * DataTrucker Theme System — Light/Dark mode with modern palette
 * Gaurav Shankar
 */
import { createTheme } from '@material-ui/core/styles';

const sharedTypography = {
  fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
  h1: { fontWeight: 700, fontSize: '2.25rem' },
  h2: { fontWeight: 600, fontSize: '1.75rem' },
  h3: { fontWeight: 600, fontSize: '1.375rem' },
  h4: { fontWeight: 600, fontSize: '1.125rem' },
  h5: { fontWeight: 500, fontSize: '1rem' },
  h6: { fontWeight: 500, fontSize: '0.875rem' },
  body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
  body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
  button: { fontWeight: 600, textTransform: 'none' },
};

export const lightTheme = createTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#2563EB',
      light: '#60A5FA',
      dark: '#1D4ED8',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#7C3AED',
      light: '#A78BFA',
      dark: '#5B21B6',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#64748B',
    },
    success: { main: '#10B981' },
    warning: { main: '#F59E0B' },
    error: { main: '#EF4444' },
    divider: '#E2E8F0',
  },
  typography: sharedTypography,
  shape: { borderRadius: 8 },
  overrides: {
    MuiButton: {
      root: { borderRadius: 8, padding: '8px 20px' },
    },
    MuiPaper: {
      rounded: { borderRadius: 12 },
    },
    MuiCard: {
      root: { borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#8B5CF6',
      light: '#A78BFA',
      dark: '#7C3AED',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#0F172A',
      paper: '#1E293B',
    },
    text: {
      primary: '#F1F5F9',
      secondary: '#94A3B8',
    },
    success: { main: '#34D399' },
    warning: { main: '#FBBF24' },
    error: { main: '#F87171' },
    divider: '#334155',
  },
  typography: sharedTypography,
  shape: { borderRadius: 8 },
  overrides: {
    MuiButton: {
      root: { borderRadius: 8, padding: '8px 20px' },
    },
    MuiPaper: {
      rounded: { borderRadius: 12 },
    },
    MuiCard: {
      root: { borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.3)' },
    },
  },
});

export const THEME_STORAGE_KEY = 'datatrucker-theme-mode';

export function getStoredThemeMode() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) || 'light';
  } catch {
    return 'light';
  }
}

export function storeThemeMode(mode) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}
