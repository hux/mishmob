import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, Surface } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error: Error;
    resetError: () => void;
  }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props;
      
      if (Fallback && this.state.error) {
        return <Fallback error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <DefaultErrorFallback 
          error={this.state.error} 
          resetError={this.resetError} 
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  resetError: () => void;
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetError 
}) => {
  const isDevelopment = __DEV__;

  return (
    <View style={styles.container}>
      <Surface style={styles.errorCard}>
        <Icon name="alert-circle" size={64} color="#EF4444" style={styles.icon} />
        
        <Text style={styles.title}>Something went wrong</Text>
        
        <Text style={styles.message}>
          We're sorry, but something unexpected happened. Please try again.
        </Text>

        {isDevelopment && error && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Debug Information:</Text>
            <Text style={styles.debugText}>{error.name}: {error.message}</Text>
            {error.stack && (
              <Text style={styles.debugStack} numberOfLines={10}>
                {error.stack}
              </Text>
            )}
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            onPress={resetError}
            style={styles.retryButton}
          >
            Try Again
          </Button>
        </View>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  errorCard: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  debugContainer: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#EF4444',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  debugStack: {
    fontSize: 10,
    color: '#6B7280',
    fontFamily: 'monospace',
    lineHeight: 14,
  },
  buttonContainer: {
    width: '100%',
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
  },
});

export default ErrorBoundary;