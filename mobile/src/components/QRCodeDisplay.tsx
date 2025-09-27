import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { ticketsApi } from '../services/api';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

export default function QRCodeDisplay({ value, size = 200 }: QRCodeDisplayProps) {
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState(0);
  
  useEffect(() => {
    let mounted = true;
    
    const fetchQRCode = async () => {
      try {
        setLoading(true);
        setError(null);
        // Clear previous image to force re-render
        setQrImage(null);
        
        console.log('Fetching NEW QR code for:', value);
        
        // Add timestamp to prevent caching
        const timestampedValue = `${value}&t=${Date.now()}`;
        const response = await ticketsApi.getQRCode(timestampedValue);
        
        console.log('QR code response received at:', new Date().toISOString());
        
        if (mounted && response.qr_image) {
          setQrImage(response.qr_image);
          // Force image component to remount
          setImageKey(prev => prev + 1);
        }
      } catch (err: any) {
        console.error('Failed to fetch QR code:', err);
        if (mounted) {
          setError(err.message || 'Failed to generate QR code');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    fetchQRCode();
    
    return () => {
      mounted = false;
    };
  }, [value]); // Re-fetch when value changes
  
  if (loading) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer, { width: size, height: size }]}>
        <Text style={styles.errorText}>QR Error</Text>
      </View>
    );
  }
  
  console.log('Rendering QR image with URI:', qrImage?.substring(0, 50) + '...');
  console.log('Image key:', imageKey);
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {qrImage ? (
        <Image
          key={`qr-image-${imageKey}`}
          source={{ uri: qrImage }}
          style={{ width: size - 20, height: size - 20 }}
          resizeMode="contain"
          onLoad={() => {
            console.log('QR image loaded successfully at:', new Date().toISOString());
            console.log('Loaded image data length:', qrImage.length);
          }}
          onError={(e) => {
            console.error('QR image failed to load:', e);
            console.error('Failed URI:', qrImage?.substring(0, 100));
          }}
        />
      ) : (
        <Text>No QR image</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: 'bold',
  },
});