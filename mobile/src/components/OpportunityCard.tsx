import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Title, Paragraph, Chip, Text } from 'react-native-paper';
import { CommonIcon, Icon } from './common/Icon';

interface OpportunityCardProps {
  opportunity: {
    id: string;
    title: string;
    organization: string;
    description: string;
    location: string;
    commitment: string;
    skills: string[];
    spots_available: number;
    rating: number;
  };
  style?: any;
  onPress?: () => void;
}

export default function OpportunityCard({ opportunity, style, onPress }: OpportunityCardProps) {
  return (
    <Card style={[styles.card, style]} onPress={onPress}>
      <Card.Content>
        <Title numberOfLines={2} style={styles.title}>
          {opportunity.title}
        </Title>
        
        <View style={styles.orgRow}>
          <Icon library="MaterialCommunityIcons" name="domain" size={16} color="#666" />
          <Text style={styles.orgText}>{opportunity.organization}</Text>
          <View style={styles.rating}>
            <CommonIcon type="star" size={16} color="#F97316" />
            <Text style={styles.ratingText}>{opportunity.rating}</Text>
          </View>
        </View>

        <Paragraph numberOfLines={2} style={styles.description}>
          {opportunity.description}
        </Paragraph>

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <CommonIcon type="location" size={16} color="#666" />
            <Text style={styles.detailText}>{opportunity.location}</Text>
          </View>
          <View style={styles.detailItem}>
            <CommonIcon type="clock" size={16} color="#666" />
            <Text style={styles.detailText}>{opportunity.commitment}</Text>
          </View>
        </View>

        <View style={styles.skills}>
          {opportunity.skills.slice(0, 3).map((skill, index) => (
            <Chip
              key={index}
              mode="outlined"
              style={styles.skillChip}
              textStyle={styles.skillText}
            >
              {skill}
            </Chip>
          ))}
        </View>

        {opportunity.spots_available > 0 && (
          <Text style={styles.spots}>
            {opportunity.spots_available} spots available
          </Text>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  orgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  orgText: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14,
    flex: 1,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 2,
    fontSize: 14,
    fontWeight: 'bold',
  },
  description: {
    color: '#666',
    marginBottom: 12,
  },
  details: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14,
  },
  skills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  skillChip: {
    marginRight: 8,
    marginBottom: 8,
    height: 28,
  },
  skillText: {
    fontSize: 12,
  },
  spots: {
    color: '#10B981',
    fontWeight: 'bold',
    fontSize: 14,
  },
});