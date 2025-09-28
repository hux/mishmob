import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Card, Button, Title, Paragraph, Chip, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { verificationApi } from '../../services/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      const status = await verificationApi.getVerificationStatus();
      setVerificationStatus(status);
    } catch (error) {
      console.error('Failed to fetch verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Card style={styles.profileCard}>
          <Card.Content>
            <View style={styles.avatarContainer}>
              <Avatar.Text 
                size={80} 
                label={user?.username?.substring(0, 2).toUpperCase() || 'U'} 
              />
              {verificationStatus?.is_verified && (
                <View style={styles.verifiedBadge}>
                  <Icon name="check-decagram" size={24} color="#10B981" />
                </View>
              )}
            </View>
            <Title style={styles.username}>{user?.username || 'Guest'}</Title>
            <Paragraph style={styles.email}>{user?.email || ''}</Paragraph>
            {verificationStatus?.is_verified ? (
              <Chip icon="check" style={styles.verifiedChip}>
                Verified Volunteer
              </Chip>
            ) : (
              <Chip icon="alert-circle" style={styles.unverifiedChip}>
                Not Verified
              </Chip>
            )}
          </Card.Content>
        </Card>

        {!verificationStatus?.is_verified && (
          <Card style={styles.verificationCard}>
            <Card.Content>
              <Title>Become a Verified Volunteer</Title>
              <Paragraph style={styles.verificationText}>
                Verify your identity to access more opportunities and build trust within the community.
              </Paragraph>
            </Card.Content>
            <Card.Actions>
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate('IdVerification')}
                icon="camera"
                style={styles.verifyButton}
              >
                Start Verification
              </Button>
            </Card.Actions>
          </Card>
        )}

        <Card style={styles.statsCard}>
          <Card.Content>
            <Title>Your Impact</Title>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Hours Volunteered</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Projects Completed</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.actionsCard}>
          <Card.Content>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('MyTickets' as any)}
              icon="ticket"
              style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
            >
              My Event Tickets
            </Button>
            <Button 
              mode="outlined" 
              onPress={() => {}}
              icon="cog"
              style={styles.actionButton}
            >
              Settings
            </Button>
            <Button 
              mode="outlined" 
              onPress={() => logout()}
              icon="logout"
              style={styles.actionButton}
              textColor="#EF4444"
            >
              Sign Out
            </Button>
          </Card.Content>
        </Card>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    margin: 16,
    marginBottom: 8,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 130,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  username: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 12,
  },
  verifiedChip: {
    alignSelf: 'center',
    backgroundColor: '#D1FAE5',
  },
  unverifiedChip: {
    alignSelf: 'center',
    backgroundColor: '#FEE2E2',
  },
  verificationCard: {
    margin: 16,
    marginBottom: 8,
  },
  verificationText: {
    color: '#6B7280',
    marginTop: 8,
  },
  verifyButton: {
    flex: 1,
  },
  statsCard: {
    margin: 16,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  actionsCard: {
    margin: 16,
    marginBottom: 24,
  },
  actionButton: {
    marginBottom: 12,
  },
});