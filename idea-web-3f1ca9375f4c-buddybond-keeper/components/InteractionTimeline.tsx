import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Interaction } from '@/lib/types';
import { format } from 'date-fns';

interface InteractionTimelineProps {
  interactions: Interaction[];
}

export default function InteractionTimeline({ interactions }: InteractionTimelineProps) {
  const getInteractionIcon = (type: Interaction['type']) => {
    switch (type) {
      case 'call':
        return '📞';
      case 'text':
        return '💬';
      case 'video':
        return '📹';
      case 'in-person':
        return '🤝';
      case 'other':
        return '✨';
    }
  };

  const getInteractionLabel = (type: Interaction['type']) => {
    switch (type) {
      case 'call':
        return 'Phone Call';
      case 'text':
        return 'Text Message';
      case 'video':
        return 'Video Call';
      case 'in-person':
        return 'In-Person';
      case 'other':
        return 'Other';
    }
  };

  if (interactions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No interactions yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {interactions.map((interaction, index) => (
        <View key={interaction.id} style={styles.timelineItem}>
          <View style={styles.timelineMarker}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{getInteractionIcon(interaction.type)}</Text>
            </View>
            {index < interactions.length - 1 && <View style={styles.timelineLine} />}
          </View>
          
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.type}>{getInteractionLabel(interaction.type)}</Text>
              <Text style={styles.date}>
                {format(new Date(interaction.date), 'MMM d, yyyy')}
              </Text>
            </View>
            
            {interaction.notes && (
              <Text style={styles.notes}>{interaction.notes}</Text>
            )}
            
            {interaction.photoUri && (
              <Image source={{ uri: interaction.photoUri }} style={styles.photo} />
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineMarker: {
    alignItems: 'center',
    marginRight: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0E6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 4,
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  type: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  date: {
    fontSize: 14,
    color: '#757575',
  },
  notes: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
    marginBottom: 8,
  },
  photo: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 8,
  },
});
