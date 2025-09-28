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
import type { MainStackScreenProps } from '../../navigation/types';
import { format } from 'date-fns';
import DeviceInfo from 'react-native-device-info';
import { ticketsApi, eventsApi } from '../../services/api';
import { theme } from '../../theme';
import QRCodeDisplay from '../../components/QRCodeDisplay';

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


type Props = MainStackScreenProps<'EventTicket'>;

export const EventTicketScreen: React.FC<Props> = ({ route, navigation }) => {
  const { ticketId } = route.params;

  const [ticket, setTicket] = useState<EventTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Generate device fingerprint for secure check-in
  const getDeviceFingerprint = async (): Promise<string> => {
    const deviceId = await DeviceInfo.getModel();
    const appInstanceId = await DeviceInfo.getUniqueId();
    return `${deviceId}-${appInstanceId}`;
  };

  // Fetch ticket details
  const fetchTicket = useCallback(async () => {
    try {
      const tickets = await eventsApi.getMyTickets();
      const ticketData = tickets.find(
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


  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchTicket();
      setLoading(false);
    };
    loadData();
  }, [fetchTicket]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTicket();
    setRefreshing(false);
  }, [fetchTicket]);

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
        <ActivityIndicator size="large" color={theme.colors.primary} />
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
        <View style={styles.qrContainer}>
          <QRCodeDisplay ticketId={ticketId} size={280} />
          {isCheckInOpen() ? (
            <Text style={styles.instructions}>
              Show this QR code to event staff at check-in
            </Text>
          ) : (
            <View style={styles.checkInNotOpenInfo}>
              <Text style={styles.qrReadyText}>
                Your QR code is ready!
              </Text>
              <Text style={styles.checkInTimingText}>
                Check-in opens at{' '}
                {format(new Date(ticket.check_in_opens_at), 'h:mm a')}
              </Text>
            </View>
          )}
        </View>
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

      {/* <TouchableOpacity
        style={styles.manageDevicesButton}
        onPress={() => navigation.navigate('ManageDevices')}
      >
        <Text style={styles.manageDevicesText}>Manage Trusted Devices</Text>
      </TouchableOpacity> */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 16,
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#64748B',
  },
  checkedInContainer: {
    margin: 20,
    padding: 24,
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    alignItems: 'center',
  },
  checkedInTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.tertiary,
    marginBottom: 8,
  },
  checkedInTime: {
    fontSize: 16,
    color: '#166534',
  },
  qrContainer: {
    margin: 20,
    alignItems: 'center',
  },
  instructions: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  checkInNotOpenInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  qrReadyText: {
    fontSize: 16,
    color: theme.colors.tertiary,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  checkInTimingText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  notOpenContainer: {
    margin: 20,
    padding: 24,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    alignItems: 'center',
  },
  notOpenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 8,
  },
  notOpenText: {
    fontSize: 14,
    color: '#92400E',
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
    borderBottomColor: '#E2E8F0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  detailValue: {
    fontSize: 14,
    color: theme.colors.onSurface,
    fontWeight: '500',
  },
  manageDevicesButton: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  manageDevicesText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});