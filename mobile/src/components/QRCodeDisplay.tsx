import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { ticketsApi } from '../services/api';

interface QRCodeDisplayProps {
  ticketId: string;
  size?: number;
  autoRefresh?: boolean;
}

interface QRCodeData {
  qr_code_base64: string;
  expires_at: string;
  valid_seconds: number;
}

export default function QRCodeDisplay({ 
  ticketId, 
  size = 200, 
  autoRefresh = true 
}: QRCodeDisplayProps) {
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [imageKey, setImageKey] = useState(0);
  
  const mountedRef = useRef(true);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const fetchQRCode = useCallback(async () => {
    if (!mountedRef.current) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching QR code for ticket:', ticketId, 'at', new Date().toISOString());
      
      const response = await ticketsApi.getQRCode(ticketId);
      
      if (mountedRef.current && response.qr_code_base64) {
        setQrData(response);
        setImageKey(prev => prev + 1);
        setCountdown(response.valid_seconds);
        console.log('QR code updated, valid for', response.valid_seconds, 'seconds');
      }
    } catch (err: any) {
      console.error('Failed to fetch QR code:', err);
      if (mountedRef.current) {
        setError(err.message || 'Failed to generate QR code');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [ticketId]);

  // Initial fetch and auto-refresh setup
  useEffect(() => {
    mountedRef.current = true;
    
    // Initial fetch
    fetchQRCode();
    
    // Set up auto-refresh if enabled
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        fetchQRCode();
      }, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      mountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [ticketId, autoRefresh, fetchQRCode]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0 && autoRefresh) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [countdown, autoRefresh]);
  
  if (loading && !qrData) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Generating QR code...</Text>
      </View>
    );
  }
  
  if (error && !qrData) {
    return (
      <View style={[styles.container, styles.errorContainer, { width: size, height: size }]}>
        <Text style={styles.errorText}>QR Error</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {qrData?.qr_code_base64 ? (
        <>
          <Image
            key={`qr-image-${imageKey}`}
            source={{ uri: qrData.qr_code_base64 }}
            style={{ width: size - 40, height: size - 40 }}
            resizeMode="contain"
          />
          {autoRefresh && (
            <View style={styles.statusContainer}>
              {loading ? (
                <View style={styles.refreshingIndicator}>
                  <ActivityIndicator size="small" color="#3B82F6" />
                  <Text style={styles.refreshingText}>Updating...</Text>
                </View>
              ) : (
                <View style={styles.countdownContainer}>
                  <Text style={styles.countdownText}>
                    {countdown > 0 ? `Refreshes in ${countdown}s` : 'Auto-refreshing...'}
                  </Text>
                </View>
              )}
            </View>
          )}
        </>
      ) : (
        <Text style={styles.noImageText}>No QR code available</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorSubtext: {
    color: '#DC2626',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  loadingText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  noImageText: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
  },
  statusContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  countdownContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#3B82F6',
    borderRadius: 16,
  },
  countdownText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  refreshingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
  },
  refreshingText: {
    color: '#3B82F6',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 6,
  },
});