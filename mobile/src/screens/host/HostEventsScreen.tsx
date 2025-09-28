import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CommonIcon, Icon } from '../../components/common/Icon';
import { api } from '../../services/api';

interface HostEvent {
  id: string;
  title: string;
  start_date: string;
  location_name: string;
  check_in_opens_at: string;
  check_in_closes_at: string;
  total_registered: number;
  total_checked_in: number;
  is_check_in_open: boolean;
}

export default function HostEventsScreen() {
  const navigation = useNavigation();
  const [events, setEvents] = useState<HostEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // TODO: Replace with actual host events API endpoint
      // For now, we'll create mock data
      const mockEvents: HostEvent[] = [
        {
          id: '1',
          title: 'Community Cleanup - Morning Session',
          start_date: '2025-09-28',
          location_name: 'Central Park',
          check_in_opens_at: new Date().toISOString(),
          check_in_closes_at: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
          total_registered: 25,
          total_checked_in: 8,
          is_check_in_open: true,
        },
        {
          id: '2',
          title: 'Food Bank Volunteer Session',
          start_date: '2025-09-29',
          location_name: 'Community Food Bank',
          check_in_opens_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          check_in_closes_at: new Date(Date.now() + 28 * 60 * 60 * 1000).toISOString(),
          total_registered: 15,
          total_checked_in: 0,
          is_check_in_open: false,
        },
      ];

      setEvents(mockEvents);
    } catch (error) {
      Alert.alert('Error', 'Failed to load events');
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleEventPress = (event: HostEvent) => {
    navigation.navigate('EventDetails' as never, { event } as never);
  };

  const handleStartScanning = (event: HostEvent) => {
    if (!event.is_check_in_open) {
      Alert.alert(
        'Check-in Closed',
        'Check-in is not currently open for this event.'
      );
      return;
    }

    navigation.navigate('EventScanner' as never, {
      eventId: event.id,
      eventTitle: event.title,
    } as never);
  };

  const renderEventItem = ({ item }: { item: HostEvent }) => (
    <TouchableOpacity style={styles.eventCard} onPress={() => handleEventPress(item)}>
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={[
          styles.statusBadge,
          item.is_check_in_open ? styles.activeBadge : styles.inactiveBadge
        ]}>
          <Text style={[
            styles.statusText,
            item.is_check_in_open ? styles.activeText : styles.inactiveText
          ]}>
            {item.is_check_in_open ? 'Check-in Open' : 'Check-in Closed'}
          </Text>
        </View>
      </View>

      <View style={styles.eventDetails}>
        <View style={styles.detailRow}>
          <CommonIcon type="calendar" size={16} color="#666" />
          <Text style={styles.detailText}>{item.start_date}</Text>
        </View>
        <View style={styles.detailRow}>
          <CommonIcon type="location" size={16} color="#666" />
          <Text style={styles.detailText}>{item.location_name}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{item.total_checked_in}</Text>
          <Text style={styles.statLabel}>Checked In</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{item.total_registered}</Text>
          <Text style={styles.statLabel}>Registered</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {Math.round((item.total_checked_in / item.total_registered) * 100) || 0}%
          </Text>
          <Text style={styles.statLabel}>Attendance</Text>
        </View>
      </View>

      {item.is_check_in_open && (
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => handleStartScanning(item)}
        >
          <CommonIcon type="qrcode" size={20} color="#fff" />
          <Text style={styles.scanButtonText}>Start Scanning</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading your events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Events</Text>
        <Text style={styles.headerSubtitle}>
          {events.length} event{events.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadEvents(true)}
            colors={['#3B82F6']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <CommonIcon type="calendar" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No events yet</Text>
            <Text style={styles.emptySubtext}>
              Create your first event to start checking in volunteers
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#10B981',
  },
  inactiveBadge: {
    backgroundColor: '#6B7280',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeText: {
    color: '#fff',
  },
  inactiveText: {
    color: '#fff',
  },
  eventDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});