import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Searchbar, Text, ActivityIndicator, Chip } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { opportunitiesApi } from '../../services/api';
import OpportunityCard from '../../components/OpportunityCard';
import { theme } from '../../theme';

export default function OpportunitiesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{[key: string]: string}>({});

  const { 
    data: opportunities, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['opportunities', searchQuery, filters],
    queryFn: () => opportunitiesApi.list({ 
      search: searchQuery,
      ...filters 
    }),
    enabled: true,
  });

  const onRefresh = () => {
    refetch();
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load opportunities</Text>
          <Text style={styles.errorSubtext}>{(error as Error).message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search opportunities..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        
        {(searchQuery || Object.keys(filters).length > 0) && (
          <View style={styles.filtersContainer}>
            {searchQuery && (
              <Chip 
                mode="outlined" 
                onClose={() => setSearchQuery('')}
                style={styles.filterChip}
              >
                "{searchQuery}"
              </Chip>
            )}
            {Object.keys(filters).length > 0 && (
              <Chip 
                mode="outlined" 
                onPress={clearFilters}
                style={styles.filterChip}
              >
                Clear all
              </Chip>
            )}
          </View>
        )}
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        {isLoading && !opportunities ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading opportunities...</Text>
          </View>
        ) : opportunities?.length > 0 ? (
          <View style={styles.opportunitiesContainer}>
            {opportunities.map((opportunity: any) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                style={styles.opportunityCard}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery || Object.keys(filters).length > 0 
                ? 'No opportunities match your search'
                : 'No opportunities available at the moment'
              }
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#F8FAFC',
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  filterChip: {
    height: 32,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
  },
  opportunitiesContainer: {
    padding: 16,
    gap: 16,
  },
  opportunityCard: {
    marginBottom: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    fontWeight: '600',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});