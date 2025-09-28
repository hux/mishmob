import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  ActivityIndicator 
} from 'react-native';
import { Card, Title, Paragraph, Button, Text, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonIcon } from '../../components/common/Icon';
import { format, parseISO } from 'date-fns';
import { eventsApi } from '../../services/api';
import type { MainStackScreenProps } from '../../navigation/types';

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

type Props = MainStackScreenProps<'MyTickets'>;

export default function MyTicketsScreen({ navigation }: Props) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  

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
    console.log('🎫 Selecting ticket:', ticket.event_title);
    
    // Navigate to EventTicketScreen
    navigation.navigate('EventTicket', { 
      ticketId: ticket.ticket_id 
    });
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
          <CommonIcon type="error" size={60} color="#EF4444" />
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
                style={styles.ticketCard}
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
                      <CommonIcon type="calendar" size={18} color="#666" />
                      <Text style={styles.infoText}>{date}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <CommonIcon type="clock" size={18} color="#666" />
                      <Text style={styles.infoText}>{time}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <CommonIcon type="location" size={18} color="#666" />
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
                      🎫 Tap to view ticket
                    </Text>
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


        {tickets.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <CommonIcon type="ticket" size={80} color="#ccc" />
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