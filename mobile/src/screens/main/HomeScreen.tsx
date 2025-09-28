import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Title, Card, Button, Text, Surface } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { opportunitiesApi } from '../../services/api';
import OpportunityCard from '../../components/OpportunityCard';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { LoadingScreen, SkeletonLoader } from '../../components/LoadingScreen';

export default function HomeScreen() {
  const { user } = useAuth();
  const { handleError } = useErrorHandler();
  
  const { data: featured, isLoading, error } = useQuery({
    queryKey: ['featured-opportunities'],
    queryFn: opportunitiesApi.getFeatured,
    onError: (err) => handleError(err, 'Featured opportunities'),
  });

  console.log('Featured opportunities:', featured);
  console.log('Is loading:', isLoading);

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header}>
        <Title style={styles.greeting}>
          Welcome back, {user?.first_name || 'Volunteer'}!
        </Title>
        <Text style={styles.subtitle}>
          Ready to make a difference today?
        </Text>
      </Surface>

      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Featured Opportunities</Title>
        
        {isLoading ? (
          <SkeletonLoader lines={3} />
        ) : error ? (
          <Card style={styles.errorCard}>
            <Card.Content>
              <Text style={styles.errorText}>
                Unable to load featured opportunities
              </Text>
            </Card.Content>
          </Card>
        ) : featured && featured.length > 0 ? (
          featured.map((opportunity: any) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              style={styles.opportunityCard}
            />
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>
                No featured opportunities available at the moment
              </Text>
            </Card.Content>
          </Card>
        )}
      </View>

      <View style={styles.quickActions}>
        <Button
          mode="contained"
          icon="magnify"
          style={styles.actionButton}
        >
          Find Opportunities
        </Button>
        <Button
          mode="outlined"
          icon="account-group"
          style={styles.actionButton}
        >
          My Teams
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    elevation: 2,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  loadingCard: {
    marginBottom: 16,
  },
  opportunityCard: {
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  errorCard: {
    marginBottom: 16,
    backgroundColor: '#FEE2E2',
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
  },
  emptyCard: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});