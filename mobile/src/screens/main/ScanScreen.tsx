import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { CommonIcon } from '../../components/common/Icon';

export default function ScanScreen() {
  const navigation = useNavigation();
  const { isHost, isVolunteer } = useAuth();

  if (isHost) {
    // Hosts should use the HostScannerScreen instead
    return (
      <View style={styles.redirectContainer}>
        <CommonIcon type="qrcode" size={64} color="#3B82F6" />
        <Text style={styles.redirectTitle}>Scanner Available</Text>
        <Text style={styles.redirectSubtitle}>
          Use the Scanner tab to check in volunteers at your events
        </Text>
        <TouchableOpacity
          style={styles.redirectButton}
          onPress={() => navigation.navigate('Scanner' as never)}
        >
          <Text style={styles.redirectButtonText}>Go to Scanner</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // For volunteers - show my tickets / QR codes
  return (
    <View style={styles.container}>
      <CommonIcon type="qrcode" size={64} color="#3B82F6" />
      <Text style={styles.title}>Your QR Codes</Text>
      <Text style={styles.subtitle}>
        View your event tickets and QR codes for check-in
      </Text>
      
      <TouchableOpacity
        style={styles.ticketsButton}
        onPress={() => navigation.navigate('MyTickets' as never)}
      >
        <CommonIcon type="ticket" size={20} color="#fff" />
        <Text style={styles.ticketsButtonText}>View My Tickets</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f5f5f5',
  },
  redirectContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f5f5f5',
  },
  redirectTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  redirectSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  redirectButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 24,
  },
  redirectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  ticketsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 24,
  },
  ticketsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});