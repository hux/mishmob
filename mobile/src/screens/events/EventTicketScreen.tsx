import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { api } from '../../services/api';
import { colors, typography } from '../../styles/theme';

interface EventTicket {
  ticket_id: string;
  event_title: string;
  event_date: string;
  location: string;
  status: string;
  registered_at: string;
  check_in_opens_at: string;
  check_in_closes_at: string;
  is_checked_in: boolean;
  checked_in_at: string | null;
}

interface QRCodeData {
  qr_code_base64: string;
  expires_at: string;
  valid_seconds: number;
}

export const EventTicketScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { ticketId } = route.params as { ticketId: string };

  const [ticket, setTicket] = useState<EventTicket | null>(null);
  const [qrCode, setQrCode] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Generate device fingerprint for secure check-in
  const getDeviceFingerprint = async (): Promise<string> => {
    const deviceId = Device.modelId || 'unknown';
    const appInstanceId = await Application.getInstallationIdAsync();
    return `${deviceId}-${appInstanceId}`;
  };

  // Fetch ticket details
  const fetchTicket = useCallback(async () => {
    try {
      const response = await api.get('/events/my-tickets');
      const ticketData = response.data.find(
        (t: EventTicket) => t.ticket_id === ticketId
      );
      if (ticketData) {
        setTicket(ticketData);
      } else {
        Alert.alert('Error', 'Ticket not found');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load ticket details');
    }
  }, [ticketId, navigation]);

  // Generate QR code
  const generateQRCode = useCallback(async () => {
    if (!ticket || ticket.is_checked_in) return;

    try {
      const response = await api.get(`/tickets/${ticketId}/qr-code`);
      setQrCode(response.data);
      setCountdown(response.data.valid_seconds);
    } catch (error: any) {
      if (error.response?.status === 429) {
        Alert.alert('Rate Limit', 'Please wait before generating a new code');
      } else {
        Alert.alert('Error', 'Failed to generate QR code');
      }
    }
  }, [ticket, ticketId]);

  // Countdown timer for QR code expiration
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && qrCode) {
      // Auto-refresh QR code
      generateQRCode();
    }
  }, [countdown, qrCode, generateQRCode]);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchTicket();
      setLoading(false);
    };
    loadData();
  }, [fetchTicket]);

  // Generate QR code when ticket is loaded
  useEffect(() => {
    if (ticket && !ticket.is_checked_in) {
      generateQRCode();
    }
  }, [ticket, generateQRCode]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTicket();
    if (ticket && !ticket.is_checked_in) {
      await generateQRCode();
    }
    setRefreshing(false);
  }, [fetchTicket, ticket, generateQRCode]);

  // Check if check-in is currently open
  const isCheckInOpen = (): boolean => {
    if (!ticket) return false;
    const now = new Date();
    const opensAt = new Date(ticket.check_in_opens_at);
    const closesAt = new Date(ticket.check_in_closes_at);
    return now >= opensAt && now <= closesAt;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Ticket not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.eventTitle}>{ticket.event_title}</Text>
        <Text style={styles.eventDate}>
          {format(new Date(ticket.event_date), 'EEEE, MMMM d, yyyy')}
        </Text>
        <Text style={styles.location}>{ticket.location}</Text>
      </View>

      {ticket.is_checked_in ? (
        <View style={styles.checkedInContainer}>
          <Text style={styles.checkedInTitle}>✓ Checked In</Text>
          <Text style={styles.checkedInTime}>
            {ticket.checked_in_at &&
              format(new Date(ticket.checked_in_at), 'h:mm a')}
          </Text>
        </View>
      ) : (
        <>
          {isCheckInOpen() ? (
            <View style={styles.qrContainer}>
              {qrCode ? (
                <>
                  <Image
                    source={{ uri: qrCode.qr_code_base64 }}
                    style={styles.qrCode}
                    resizeMode="contain"
                  />
                  <View style={styles.countdownContainer}>
                    <Text style={styles.countdownText}>
                      Refreshes in {countdown}s
                    </Text>
                  </View>
                  <Text style={styles.instructions}>
                    Show this QR code to event staff at check-in
                  </Text>
                </>
              ) : (
                <View style={styles.loadingQR}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>Generating QR code...</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.notOpenContainer}>
              <Text style={styles.notOpenTitle}>Check-in Not Open</Text>
              <Text style={styles.notOpenText}>
                Check-in opens at{' '}
                {format(new Date(ticket.check_in_opens_at), 'h:mm a')}
              </Text>
            </View>
          )}
        </>
      )}

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Ticket ID</Text>
          <Text style={styles.detailValue}>{ticket.ticket_id}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status</Text>
          <Text style={styles.detailValue}>{ticket.status}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Registered</Text>
          <Text style={styles.detailValue}>
            {format(new Date(ticket.registered_at), 'MMM d, yyyy h:mm a')}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.manageDevicesButton}
        onPress={() => navigation.navigate('ManageDevices')}
      >
        <Text style={styles.manageDevicesText}>Manage Trusted Devices</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    ...typography.body1,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  eventTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: 8,
  },
  eventDate: {
    ...typography.body1,
    color: colors.text.primary,
    marginBottom: 4,
  },
  location: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  checkedInContainer: {
    margin: 20,
    padding: 24,
    backgroundColor: colors.success.light,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkedInTitle: {
    ...typography.h2,
    color: colors.success.main,
    marginBottom: 8,
  },
  checkedInTime: {
    ...typography.body1,
    color: colors.success.dark,
  },
  qrContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: colors.surface,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrCode: {
    width: 250,
    height: 250,
    marginBottom: 16,
  },
  countdownContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 20,
    marginBottom: 16,
  },
  countdownText: {
    ...typography.caption,
    color: colors.white,
  },
  instructions: {
    ...typography.body2,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  loadingQR: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body2,
    color: colors.text.secondary,
    marginTop: 12,
  },
  notOpenContainer: {
    margin: 20,
    padding: 24,
    backgroundColor: colors.warning.light,
    borderRadius: 12,
    alignItems: 'center',
  },
  notOpenTitle: {
    ...typography.h3,
    color: colors.warning.dark,
    marginBottom: 8,
  },
  notOpenText: {
    ...typography.body2,
    color: colors.warning.dark,
    textAlign: 'center',
  },
  details: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  detailValue: {
    ...typography.body2,
    color: colors.text.primary,
    fontWeight: '500',
  },
  manageDevicesButton: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  manageDevicesText: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: '600',
  },
});