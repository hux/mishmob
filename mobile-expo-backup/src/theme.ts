import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
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
  },
  roundness: 8,
};