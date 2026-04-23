import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Avatar, Card, Button, ProgressBar } from 'react-native-paper';
import { getPotentialCollaborators } from '../lib/matching';
import { UserProfile } from '../lib/types';

interface CollaboratorListProps {
  currentUserId: number;
  onSelectCollaborator: (profile: UserProfile) => void;
  onMessageCollaborator: (profile: UserProfile) => void;
}

const CollaboratorList: React.FC<CollaboratorListProps> = ({
  currentUserId,
  onSelectCollaborator,
  onMessageCollaborator
}) => {
  const [collaborators, setCollaborators] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCollaborators = async () => {
      try {
        const profiles = await getPotentialCollaborators(currentUserId);
        setCollaborators(profiles);
      } catch (error) {
        console.error('Error loading collaborators:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCollaborators();
  }, [currentUserId]);

  const renderCollaborator = ({ item }: { item: UserProfile }) => (
    <Card style={styles.card} elevation={2}>
      <Card.Title
        title={item.user.username}
        subtitle={`Spark Score: ${item.sparkScore}`}
        left={(props) => <Avatar.Icon {...props} icon="account" />}
        right={(props) => (
          <View style={styles.rightContent}>
            <Text style={styles.matchScore}>{item.sparkScore}%</Text>
            <ProgressBar progress={item.sparkScore / 100} color="#6200ee" style={styles.progressBar} />
          </View>
        )}
      />

      <Card.Content>
        <View style={styles.skillsContainer}>
          {item.skills.slice(0, 3).map((skill, index) => (
            <View key={index} style={styles.skillBadge}>
              <Text style={styles.skillText}>{skill.skill_name}</Text>
            </View>
          ))}
        </View>

        <View style={styles.preferencesContainer}>
          {item.preferences.slice(0, 2).map((pref, index) => (
            <Text key={index} style={styles.preferenceText}>
              {pref.preference_value}
            </Text>
          ))}
        </View>
      </Card.Content>

      <Card.Actions>
        <Button
          icon="account-details"
          onPress={() => onSelectCollaborator(item)}
        >
          View Profile
        </Button>
        <Button
          icon="message"
          onPress={() => onMessageCollaborator(item)}
        >
          Message
        </Button>
      </Card.Actions>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading potential collaborators...</Text>
      </View>
    );
  }

  if (collaborators.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text>No potential collaborators found. Try adding more skills and preferences to your profile.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={collaborators}
      renderItem={renderCollaborator}
      keyExtractor={(item) => item.user.id.toString()}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
  },
  rightContent: {
    marginRight: 16,
    width: 80,
  },
  matchScore: {
    fontSize: 12,
    color: '#6200ee',
    textAlign: 'right',
  },
  progressBar: {
    marginTop: 4,
    height: 4,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  skillBadge: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 12,
    color: '#0d47a1',
  },
  preferencesContainer: {
    marginTop: 8,
  },
  preferenceText: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});

export default CollaboratorList;
