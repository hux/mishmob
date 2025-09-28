import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text, Surface } from 'react-native-paper';
import { theme } from '../theme';

interface LoadingScreenProps {
  message?: string;
  size?: 'small' | 'large';
  transparent?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...', 
  size = 'large',
  transparent = false 
}) => {
  const containerStyle = transparent 
    ? [styles.container, styles.transparentContainer]
    : styles.container;

  return (
    <View style={containerStyle}>
      <Surface style={styles.loadingCard}>
        <ActivityIndicator 
          size={size} 
          color={theme.colors.primary} 
          style={styles.spinner}
        />
        <Text style={styles.message}>{message}</Text>
      </Surface>
    </View>
  );
};

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  visible, 
  message = 'Loading...' 
}) => {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Surface style={styles.overlayCard}>
        <ActivityIndicator 
          size="large" 
          color={theme.colors.primary} 
          style={styles.spinner}
        />
        <Text style={styles.overlayMessage}>{message}</Text>
      </Surface>
    </View>
  );
};

interface SkeletonLoaderProps {
  lines?: number;
  animated?: boolean;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  lines = 3, 
  animated = true 
}) => {
  return (
    <View style={styles.skeletonContainer}>
      {Array.from({ length: lines }).map((_, index) => (
        <View 
          key={index}
          style={[
            styles.skeletonLine,
            index === lines - 1 && styles.skeletonLastLine,
            animated && styles.skeletonAnimated
          ]} 
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  transparentContainer: {
    backgroundColor: 'transparent',
  },
  loadingCard: {
    padding: 32,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    minWidth: 200,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  spinner: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: theme.colors.onSurface,
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayCard: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    minWidth: 160,
  },
  overlayMessage: {
    fontSize: 14,
    color: theme.colors.onSurface,
    textAlign: 'center',
  },
  skeletonContainer: {
    padding: 16,
  },
  skeletonLine: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonLastLine: {
    width: '70%',
  },
  skeletonAnimated: {
    // Add animation styles if needed
  },
});

export default LoadingScreen;