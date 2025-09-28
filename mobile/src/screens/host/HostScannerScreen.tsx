import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { api } from '../../services/api';

interface ActiveEvent {
  id: string;
  title: string;
  location_name: string;
  total_registered: number;
  total_checked_in: number;
  check_in_closes_at: string;
}

export default function HostScannerScreen() {
  const navigation = useNavigation();
  const [activeEvents, setActiveEvents] = useState<ActiveEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveEvents();
  }, []);

  const loadActiveEvents = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API call to get active events for this host
      // For now, we'll use mock data
      const mockActiveEvents: ActiveEvent[] = [
        {
          id: '1',
          title: 'Community Cleanup - Morning Session',
          location_name: 'Central Park',
          total_registered: 25,
          total_checked_in: 8,
          check_in_closes_at: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        },
      ];

      setActiveEvents(mockActiveEvents);
    } catch (error) {
      Alert.alert('Error', 'Failed to load active events');
      console.error('Failed to load active events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartScanning = (event: ActiveEvent) => {
    navigation.navigate('EventScanner' as never, {
      eventId: event.id,
      eventTitle: event.title,
    } as never);
  };

  const getTimeRemaining = (closesAt: string) => {
    const now = new Date().getTime();
    const closeTime = new Date(closesAt).getTime();
    const diff = closeTime - now;

    if (diff <= 0) return 'Closed';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading scanner...</Text>
      </View>
    );
  }

  if (activeEvents.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="qrcode-scan" size={80} color="#ccc" />
        <Text style={styles.emptyTitle}>No Active Events</Text>
        <Text style={styles.emptySubtitle}>
          You don't have any events with active check-in windows right now.
        </Text>
        <TouchableOpacity
          style={styles.viewEventsButton}
          onPress={() => navigation.navigate('Events' as never)}
        >
          <Text style={styles.viewEventsButtonText}>View All Events</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon name="qrcode-scan" size={48} color="#3B82F6" />
        <Text style={styles.headerTitle}>QR Code Scanner</Text>
        <Text style={styles.headerSubtitle}>
          Select an event to start checking in volunteers
        </Text>
      </View>

      <View style={styles.eventsSection}>
        <Text style={styles.sectionTitle}>Active Events</Text>
        
        {activeEvents.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={styles.eventCard}
            onPress={() => handleStartScanning(event)}
          >
            <View style={styles.eventHeader}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Icon name="chevron-right" size={24} color="#666" />
            </View>
            
            <View style={styles.eventDetails}>
              <View style={styles.detailRow}>
                <Icon name="map-marker" size={16} color="#666" />
                <Text style={styles.detailText}>{event.location_name}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Icon name="clock-outline" size={16} color="#666" />
                <Text style={styles.detailText}>
                  {getTimeRemaining(event.check_in_closes_at)}
                </Text>
              </View>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{event.total_checked_in}</Text>
                <Text style={styles.statLabel}>Checked In</Text>
              </View>
              <View style={styles.statSeparator} />
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{event.total_registered}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>

            <View style={styles.scanIndicator}>
              <Icon name="qrcode-scan" size={20} color="#3B82F6" />
              <Text style={styles.scanText}>Tap to start scanning</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.instructionsSection}>
        <Text style={styles.instructionsTitle}>How to use the scanner:</Text>
        <View style={styles.instructionsList}>
          <View style={styles.instructionItem}>
            <Icon name="numeric-1-circle" size={24} color="#3B82F6" />
            <Text style={styles.instructionText}>
              Select an active event from the list above
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Icon name="numeric-2-circle" size={24} color="#3B82F6" />
            <Text style={styles.instructionText}>
              Ask volunteers to show their QR code ticket
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Icon name="numeric-3-circle" size={24} color="#3B82F6" />
            <Text style={styles.instructionText}>
              Scan the QR code to check them in instantly
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  viewEventsButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 24,
  },
  viewEventsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  eventsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
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
    alignItems: 'center',
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
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
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statSeparator: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
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
  scanIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  scanText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  instructionsSection: {
    padding: 16,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  instructionsList: {
    gap: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  instructionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});