import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  Animated, 
  RefreshControl, 
  ActivityIndicator 
} from 'react-native';
import { Card, Title, Paragraph, Button, Text, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import { eventsApi } from '../../services/api';

interface Ticket {
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

export default function MyTicketsScreen({ navigation }: any) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(true);
  const [renderKey, setRenderKey] = useState(0);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Fetch tickets from API
  const fetchTickets = useCallback(async () => {
    try {
      console.log('🎫 Fetching real tickets from API');
      const ticketsData = await eventsApi.getMyTickets();
      console.log('🎫 Received tickets:', ticketsData);
      setTickets(ticketsData);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load tickets:', err);
      setError(err.message || 'Failed to load tickets');
      setTickets([]);
    }
  }, [refreshing]);

  // Initial load
  useEffect(() => {
    console.log('Initial useEffect - about to fetch tickets');
    fetchTickets().finally(() => {
      console.log('Fetch completed, setting loading to false');
      setLoading(false);
    });
  }, [fetchTickets]);

  // Debug tickets state changes
  useEffect(() => {
    console.log('Tickets state changed:', tickets);
    console.log('Tickets state length:', tickets.length);
  }, [tickets]);

  // Animation effects
  useEffect(() => {
    if (selectedTicket) {
      // Animate QR code appearance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true
        })
      ]).start();
    } else {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }
  }, [selectedTicket, fadeAnim, scaleAnim]);

  // Pulse animation
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    );
    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, [pulseAnim]);

  // Refresh tickets
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTickets();
    setRefreshing(false);
  }, [fetchTickets]);

  // Check if check-in is open for a ticket
  const isCheckInOpen = (ticket: Ticket): boolean => {
    if (ticket.is_checked_in) return false;
    
    const now = new Date();
    const opensAt = new Date(ticket.check_in_opens_at);
    const closesAt = new Date(ticket.check_in_closes_at);
    const isOpen = now >= opensAt && now <= closesAt;
    return isOpen;
  };

  // Format date and time
  const formatEventDateTime = (dateString: string): { date: string; time: string } => {
    try {
      const date = parseISO(dateString);
      return {
        date: format(date, 'EEEE, MMM d, yyyy'),
        time: format(date, 'h:mm a')
      };
    } catch (error) {
      return { date: 'Invalid date', time: '' };
    }
  };

  const handleSelectTicket = (ticket: Ticket) => {
    if (ticket.is_checked_in) {
      Alert.alert('Already Checked In', 'You have already checked in for this event.');
    } else {
      console.log('🎫 Selecting ticket for QR code:', ticket.event_title);
      setSelectedTicket(ticket);
      
      // Show info about check-in timing if it's not open yet
      if (!isCheckInOpen(ticket)) {
        const opensAt = new Date(ticket.check_in_opens_at);
        const closesAt = new Date(ticket.check_in_closes_at);
        const now = new Date();
        
        if (now < opensAt) {
          Alert.alert(
            'QR Code Ready',
            `Your QR code is ready! Check-in opens at ${format(opensAt, 'h:mm a')} on ${format(opensAt, 'MMM d')}.`,
            [{ text: 'OK' }]
          );
        } else if (now > closesAt) {
          Alert.alert(
            'Check-in Closed', 
            'Check-in for this event has closed.',
            [{ text: 'OK' }]
          );
        }
      }
    }
  };

  const getStatusColor = (ticket: Ticket) => {
    if (ticket.is_checked_in) return '#4CAF50';
    if (isCheckInOpen(ticket)) return '#2196F3';
    return '#FF9800';
  };

  const getStatusText = (ticket: Ticket) => {
    if (ticket.is_checked_in) return 'Checked In';
    if (isCheckInOpen(ticket)) return 'Check-in Open';
    return 'Upcoming';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading tickets...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons name="alert-circle" size={60} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="contained" onPress={() => fetchTickets()} style={styles.retryButton}>
            Retry
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Title style={styles.title}>My Tickets</Title>
          <Text style={styles.subtitle}>
            {tickets.length > 0
              ? `You have ${tickets.length} tickets`
              : 'No tickets yet. Register for an event to get started!'}
          </Text>
          <Button 
            mode="outlined" 
            onPress={() => {
              console.log('🔄 Manual refresh triggered');
              setTickets([]);
              setSelectedTicket(null);
              fetchTickets();
            }}
            style={{marginTop: 10}}
          >
            🔄 Force Refresh Data
          </Button>
        </View>

        <View style={styles.ticketsContainer}>
          {tickets.length > 0 && tickets.map((ticket, index) => {
            const { date, time } = formatEventDateTime(ticket.event_date);
            const canCheckIn = !ticket.is_checked_in && isCheckInOpen(ticket);
            return (
              <Card
                key={ticket.ticket_id}
                style={[
                  styles.ticketCard,
                  selectedTicket?.ticket_id === ticket.ticket_id && { borderColor: '#3B82F6', borderWidth: 2 }
                ]}
                onPress={() => handleSelectTicket(ticket)}
                elevation={3}
              >
                <Card.Content>
                  <View style={styles.ticketHeader}>
                    <Title style={styles.eventName}>{ticket.event_title}</Title>
                    <Chip
                      mode="flat"
                      style={[styles.statusChip, { backgroundColor: getStatusColor(ticket) }]}
                      textStyle={{ color: 'white' }}
                    >
                      {getStatusText(ticket)}
                    </Chip>
                  </View>
                  <View style={styles.eventInfo}>
                    <View style={styles.infoRow}>
                      <MaterialCommunityIcons name="calendar" size={18} color="#666" />
                      <Text style={styles.infoText}>{date}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <MaterialCommunityIcons name="clock-outline" size={18} color="#666" />
                      <Text style={styles.infoText}>{time}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <MaterialCommunityIcons name="map-marker" size={18} color="#666" />
                      <Text style={styles.infoText}>{ticket.location}</Text>
                    </View>
                    <Text style={{fontSize: 10, color: 'red', marginTop: 4}}>
                      DEBUG: Opens {ticket.check_in_opens_at} | Closes {ticket.check_in_closes_at}
                    </Text>
                    <Text style={{fontSize: 10, color: 'red'}}>
                      Current time: {new Date().toISOString()}
                    </Text>
                  </View>
                  
                  {!ticket.is_checked_in && (
                    <Text style={{ color: '#3B82F6', fontWeight: 'bold', marginTop: 8 }}>
                      🎫 Tap to show QR code
                      {isCheckInOpen(ticket) ? ' for check-in' : ' (check-in not yet open)'}
                    </Text>
                  )}
                  
                  {selectedTicket?.ticket_id === ticket.ticket_id && (
                    <Chip
                      icon="qrcode"
                      style={styles.activeChip}
                      textStyle={{ color: 'white' }}
                    >
                      QR CODE ACTIVE
                    </Chip>
                  )}
                </Card.Content>
              </Card>
            );
          })}
          
          {tickets.length === 0 && !loading && (
            <Text style={{fontSize: 16, textAlign: 'center', marginTop: 40}}>
              No tickets found
            </Text>
          )}
        </View>

        {selectedTicket && (
          <View style={styles.qrSection}>
            <Card style={[styles.qrCard, { transform: [{ scale: pulseAnim }] }]}>
              <Card.Content>
                <Title style={styles.qrTitle}>Event QR Code</Title>
                <Paragraph style={styles.qrInstructions}>
                  {isCheckInOpen(selectedTicket) 
                    ? 'Show this QR code at check-in' 
                    : `Your QR code is ready! Check-in opens at ${format(new Date(selectedTicket.check_in_opens_at), 'h:mm a')}`
                  }
                </Paragraph>
                
                <Animated.View 
                  style={[
                    styles.qrContainer,
                    {
                      opacity: fadeAnim,
                      transform: [{ scale: scaleAnim }]
                    }
                  ]}
                >
                  {showQR ? (
                    <View key={`qr-${selectedTicket.ticket_id}`}>
                      <QRCodeDisplay
                        ticketId={selectedTicket.ticket_id}
                        size={200}
                      />
                    </View>
                  ) : (
                    <View style={{ width: 200, height: 200, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }}>
                      <Text>Loading QR...</Text>
                    </View>
                  )}
                </Animated.View>

                <Text style={styles.refreshInfo}>
                  QR codes refresh automatically every 30 seconds for security
                </Text>
              </Card.Content>
            </Card>
            
            <View style={styles.ticketDetailsCard}>
              <Text style={styles.ticketId}>Ticket ID: {selectedTicket.ticket_id.substring(0, 8)}...</Text>
              
              <View style={styles.eventDetails}>
                <Text style={styles.eventDetailsTitle}>Event Details</Text>
                <Text style={styles.eventDetailsText}>{selectedTicket.event_title}</Text>
                <Text style={styles.eventDetailsText}>{formatEventDateTime(selectedTicket.event_date).date}</Text>
                <Text style={styles.eventDetailsText}>{formatEventDateTime(selectedTicket.event_date).time}</Text>
                <Text style={styles.eventDetailsText}>{selectedTicket.location}</Text>
              </View>
              
              <Button 
                mode="text" 
                onPress={() => setSelectedTicket(null)}
                style={styles.closeButton}
              >
                Close QR Code
              </Button>
            </View>
          </View>
        )}

        {tickets.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="ticket-outline" size={80} color="#ccc" />
            <Text style={styles.emptyStateText}>No tickets yet</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
    color: '#1E3A8A',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  ticketsContainer: {
    padding: 20,
  },
  ticketCard: {
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  statusChip: {
    paddingHorizontal: 2,
  },
  eventInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  activeChip: {
    marginTop: 12,
    backgroundColor: '#3B82F6',
  },
  qrSection: {
    padding: 20,
  },
  qrCard: {
    backgroundColor: 'white',
    marginBottom: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  qrTitle: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1E3A8A',
  },
  qrInstructions: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  refreshInfo: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginTop: 16,
    fontStyle: 'italic',
  },
  ticketDetailsCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  ticketId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  eventDetails: {
    marginBottom: 20,
  },
  eventDetailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  eventDetailsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  closeButton: {
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
    marginBottom: 24,
  },
  findEventsButton: {
    backgroundColor: '#3B82F6',
  },
});