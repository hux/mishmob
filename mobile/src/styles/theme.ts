import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const colors = {
  ...DefaultTheme.colors,
  primary: '#3B82F6', // Purpose-driven blue
  secondary: '#F97316', // Community orange
  tertiary: '#10B981', // Growth green
  background: '#F8FAFC',
  surface: '#FFFFFF',
  error: '#EF4444',
  onPrimary: '#FFFFFF',
  onSecondary: '#FFFFFF',
  onBackground: '#1E293B',
  onSurface: '#1E293B',
  white: '#FFFFFF',
  black: '#000000',
  success: {
    main: '#10B981',
    light: '#34D399',
    dark: '#059669',
  },
  text: {
    primary: '#1E293B',
    secondary: '#64748B',
  },
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
};

export const theme = {
  ...DefaultTheme,
  colors,
  roundness: 8,
};