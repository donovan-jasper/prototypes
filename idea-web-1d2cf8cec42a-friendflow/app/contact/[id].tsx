import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { Contact, Interaction } from '../../types';
import { getContactById, getInteractionsByContact } from '../../lib/database';
import RelationshipScoreCard from '../../components/RelationshipScoreCard';
import ActionButton from '../../components/ActionButton';
import StreakDisplay from '../../components/StreakDisplay';

const ContactDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const [contact, setContact] = useState<Contact | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const currentDate = new Date();

  useEffect(() => {
    const loadContactData = async () => {
      try {
        if (!id) return;

        const contactData = await getContactById(id);
        const interactionsData = await getInteractionsByContact(id);

        setContact(contactData);
        setInteractions(interactionsData);
      } catch (error) {
        console.error('Error loading contact data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContactData();
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!contact) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Contact not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{contact.name}</Text>
        {contact.relationship && (
          <Text style={styles.relationship}>{contact.relationship}</Text>
        )}
      </View>

      <RelationshipScoreCard
        contact={contact}
        interactions={interactions}
        currentDate={currentDate}
      />

      <View style={styles.actionSection}>
        <ActionButton
          icon="phone"
          label="Call"
          onPress={() => {/* Implement call functionality */}}
        />
        <ActionButton
          icon="message"
          label="Text"
          onPress={() => {/* Implement text functionality */}}
        />
        <ActionButton
          icon="calendar"
          label="Schedule"
          onPress={() => {/* Implement schedule functionality */}}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Next Check-In</Text>
        <Text style={styles.sectionContent}>
          {`In ${contact.frequency} days`}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Last Contacted</Text>
        <Text style={styles.sectionContent}>
          {contact.lastContact.toLocaleDateString()}
        </Text>
      </View>

      {interactions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Interactions</Text>
          {interactions.slice(0, 3).map((interaction) => (
            <View key={interaction.id} style={styles.interactionItem}>
              <Text style={styles.interactionDate}>
                {interaction.date.toLocaleDateString()}
              </Text>
              <Text style={styles.interactionType}>
                {interaction.type}
              </Text>
              {interaction.notes && (
                <Text style={styles.interactionNotes}>
                  {interaction.notes}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  relationship: {
    fontSize: 16,
    color: '#666',
  },
  actionSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  section: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 16,
    color: '#666',
  },
  interactionItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  interactionDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  interactionType: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
  },
  interactionNotes: {
    fontSize: 14,
    color: '#666',
  },
});

export default ContactDetailScreen;
