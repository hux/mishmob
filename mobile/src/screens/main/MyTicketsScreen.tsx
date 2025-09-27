import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Alert, Animated, Image, Platform } from 'react-native';
import { Card, Title, Paragraph, Button, Text, Chip, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import QRCodeDisplay from '../../components/QRCodeDisplay';

// Mock ticket data
const mockTickets = [
  {
    id: 'ticket-1',
    eventName: 'Community Park Cleanup',
    eventDate: 'Saturday, Feb 15, 2025',
    eventTime: '9:00 AM - 12:00 PM',
    location: 'Central Park, NYC',
    status: 'active',
    qrData: 'MISHMOB-TICKET-001-USER123'
  },
  {
    id: 'ticket-2',
    eventName: 'Food Bank Volunteering',
    eventDate: 'Sunday, Feb 23, 2025',
    eventTime: '2:00 PM - 5:00 PM',
    location: 'NYC Food Bank',
    status: 'upcoming',
    qrData: 'MISHMOB-TICKET-002-USER123'
  }
];

export default function MyTicketsScreen({ navigation }: any) {
  const [tickets, setTickets] = useState(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [qrData, setQrData] = useState('');
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds countdown
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [showQR, setShowQR] = useState(true); // Force remount
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;

  // Generate new QR data with timestamp
  const generateQRData = (ticket: any) => {
    const timestamp = Date.now();
    const nonce = Math.random().toString(36).substring(2, 15);
    
    // Create a shorter, more visible change in the QR code
    // In production, this would be encrypted/signed
    const qrData = [
      ticket.id,
      'USER123',
      timestamp.toString().slice(-6), // Last 6 digits of timestamp
      nonce.slice(0, 4) // Short nonce for visible change
    ].join('-');
    
    return qrData;
  };

  // Countdown timer effect
  useEffect(() => {
    if (selectedTicket) {
      setQrData(generateQRData(selectedTicket));
      setTimeLeft(30);

      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            refreshQRCode();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [selectedTicket]);

  // Pulse animation for countdown
  useEffect(() => {
    if (timeLeft <= 5 && timeLeft > 0) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [timeLeft]);

  const refreshQRCode = () => {
    setIsRefreshing(true);
    
    // Fade out animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Force QR component to unmount and remount
      setShowQR(false);
      
      // Update QR data and increment counter
      const newQrData = generateQRData(selectedTicket);
      console.log('Refreshing QR code:', { old: qrData, new: newQrData });
      setQrData(newQrData);
      setRefreshCount(prev => prev + 1);
      
      // Remount QR component after a brief delay
      setTimeout(() => {
        setShowQR(true);
        
        // Fade in with flash effect
        Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Flash effect
        Animated.sequence([
          Animated.timing(flashAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(flashAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        setIsRefreshing(false);
      });
      }, 50); // Small delay to ensure unmount
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'upcoming':
        return '#3B82F6';
      case 'completed':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const handleShowTicket = (ticket: any) => {
    setRefreshCount(0);
    setShowQR(true);
    setSelectedTicket(ticket);
  };

  if (selectedTicket) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.ticketDetailContainer}>
          <Button 
            onPress={() => setSelectedTicket(null)}
            icon="arrow-left"
            style={styles.backButton}
          >
            Back to Tickets
          </Button>
          
          <Card style={styles.ticketCard}>
            <Card.Content>
              <Title style={styles.eventTitle}>{selectedTicket.eventName}</Title>
              
              {/* Countdown Timer */}
              <View style={styles.countdownContainer}>
                <Text style={styles.countdownLabel}>QR Code refreshes in</Text>
                <Animated.Text 
                  style={[
                    styles.countdownText,
                    {
                      transform: [{ scale: pulseAnim }],
                      color: timeLeft <= 5 ? '#EF4444' : '#3B82F6'
                    }
                  ]}
                >
                  {timeLeft}s
                </Animated.Text>
                <ProgressBar 
                  progress={timeLeft / 30} 
                  color={timeLeft <= 5 ? '#EF4444' : '#3B82F6'}
                  style={styles.progressBar}
                />
              </View>
              
              {/* Animated QR Code */}
              <View style={styles.qrWrapper}>
                <Animated.View 
                  style={[
                    styles.qrContainer,
                    {
                      opacity: fadeAnim,
                      transform: [{ scale: scaleAnim }]
                    }
                  ]}
                >
                  {showQR && qrData ? (
                    <View key={`qr-${refreshCount}-${qrData}`}>
                      {console.log('Rendering QRCodeDisplay with data:', qrData)}
                      <QRCodeDisplay
                        value={qrData}
                        size={200}
                      />
                    </View>
                  ) : (
                    <View style={{ width: 200, height: 200, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }}>
                      <Text>Loading QR...</Text>
                    </View>
                  )}
                </Animated.View>
                
                {/* Flash overlay */}
                <Animated.View 
                  style={[
                    styles.flashOverlay,
                    {
                      opacity: flashAnim,
                    }
                  ]}
                />
                
                {/* Refresh counter badge */}
                {refreshCount > 0 && (
                  <View style={styles.refreshBadge}>
                    <Text style={styles.refreshBadgeText}>#{refreshCount}</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.securityNote}>
                <MaterialCommunityIcons name="shield-check" size={16} color="#10B981" />
                <Text style={styles.securityText}>
                  Dynamic QR code for enhanced security
                </Text>
              </View>
              
              <Text style={styles.ticketId}>Ticket ID: {selectedTicket.qrData}</Text>
              <Text style={styles.qrValueText}>Code: {qrData}</Text>
              
              <View style={styles.eventDetails}>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="calendar" size={20} color="#6B7280" />
                  <Text style={styles.detailText}>{selectedTicket.eventDate}</Text>
                </View>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="clock" size={20} color="#6B7280" />
                  <Text style={styles.detailText}>{selectedTicket.eventTime}</Text>
                </View>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="map-marker" size={20} color="#6B7280" />
                  <Text style={styles.detailText}>{selectedTicket.location}</Text>
                </View>
              </View>
              
              <Chip 
                style={[styles.statusChip, { backgroundColor: getStatusColor(selectedTicket.status) + '20' }]}
                textStyle={{ color: getStatusColor(selectedTicket.status) }}
              >
                {selectedTicket.status.toUpperCase()}
              </Chip>
            </Card.Content>
          </Card>
          
          <Text style={styles.instructions}>
            Show this QR code at the event check-in
          </Text>
          
          <Button
            mode="text"
            onPress={refreshQRCode}
            disabled={isRefreshing}
            icon="refresh"
            style={styles.refreshButton}
          >
            Refresh Now
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Title style={styles.title}>My Event Tickets</Title>
        
        {tickets.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <MaterialCommunityIcons 
                name="ticket-outline" 
                size={64} 
                color="#CBD5E1" 
                style={styles.emptyIcon}
              />
              <Title style={styles.emptyTitle}>No Tickets Yet</Title>
              <Paragraph style={styles.emptyText}>
                When you register for volunteer events, your digital tickets will appear here.
              </Paragraph>
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate('Opportunities')}
                style={styles.findEventsButton}
              >
                Find Events
              </Button>
            </Card.Content>
          </Card>
        ) : (
          tickets.map((ticket) => (
            <Card key={ticket.id} style={styles.ticketListCard}>
              <Card.Content>
                <Title style={styles.ticketTitle}>{ticket.eventName}</Title>
                <View style={styles.ticketInfo}>
                  <Text style={styles.ticketDate}>{ticket.eventDate}</Text>
                  <Chip 
                    style={{ backgroundColor: getStatusColor(ticket.status) + '20' }}
                    textStyle={{ color: getStatusColor(ticket.status), fontSize: 12 }}
                  >
                    {ticket.status}
                  </Chip>
                </View>
                <Text style={styles.ticketLocation}>{ticket.location}</Text>
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => handleShowTicket(ticket)}>
                  View Ticket
                </Button>
              </Card.Actions>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyCard: {
    marginTop: 32,
  },
  emptyIcon: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 24,
  },
  findEventsButton: {
    marginTop: 8,
  },
  ticketListCard: {
    marginBottom: 12,
  },
  ticketTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  ticketInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketDate: {
    color: '#6B7280',
    fontSize: 14,
  },
  ticketLocation: {
    color: '#6B7280',
    fontSize: 14,
  },
  ticketDetailContainer: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  ticketCard: {
    marginBottom: 16,
  },
  eventTitle: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 16,
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  ticketId: {
    textAlign: 'center',
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 24,
  },
  eventDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#374151',
  },
  statusChip: {
    alignSelf: 'center',
  },
  instructions: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
  },
  countdownContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  countdownLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  countdownText: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    width: 200,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  securityText: {
    fontSize: 12,
    color: '#10B981',
    marginLeft: 6,
  },
  refreshButton: {
    marginTop: 8,
  },
  qrWrapper: {
    position: 'relative',
    alignItems: 'center',
  },
  flashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  refreshBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  refreshBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  qrValueText: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});