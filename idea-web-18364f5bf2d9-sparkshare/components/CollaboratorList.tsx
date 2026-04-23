import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Avatar, Card, Chip, Badge, ActivityIndicator } from 'react-native-paper';
import { UserProfile, Skill } from '../lib/types';
import { getPotentialCollaborators, getUserProfile } from '../lib/matching';
import { AuthContext } from '../context/AuthContext';

interface CollaboratorListProps {
  currentUserId: number;
  onSelectCollaborator: (profile: UserProfile) => void;
  onMessageCollaborator: (profile: UserProfile) => void;
  refreshControl?: React.ReactElement;
}

const CollaboratorList: React.FC<CollaboratorListProps> = ({
  currentUserId,
  onSelectCollaborator,
  onMessageCollaborator,
  refreshControl
}) => {
  const [collaborators, setCollaborators] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCollaborators();
  }, []);

  const loadCollaborators = async () => {
    try {
      setLoading(true);
      const potentialCollaborators = await getPotentialCollaborators(currentUserId);
      setCollaborators(potentialCollaborators);
    } catch (error) {
      console.error('Error loading collaborators:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCollaborators();
    setRefreshing(false);
  };

  const renderSkill = (skill: Skill) => {
    const proficiencyColors = ['#FFCDD2', '#E57373', '#EF5350', '#F44336', '#D32F2F'];
    return (
      <Chip
        key={skill.id}
        style={[styles.skillChip, { backgroundColor: proficiencyColors[skill.proficiency - 1] }]}
        textStyle={styles.skillText}
      >
        {skill.skill_name}
      </Chip>
    );
  };

  const renderCollaborator = ({ item }: { item: UserProfile }) => (
    <Card style={styles.card} elevation={2}>
      <Card.Title
        title={item.user.username}
        subtitle={item.user.location || 'Location not specified'}
        left={(props) => <Avatar.Icon {...props} icon="account" />}
        right={(props) => (
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>{item.sparkScore}</Text>
            <Badge style={styles.scoreBadge}>Score</Badge>
          </View>
        )}
      />
      <Card.Content>
        <View style={styles.skillsContainer}>
          {item.skills.map(renderSkill)}
        </View>
        <View style={styles.preferencesContainer}>
          {item.preferences.map(pref => (
            <Chip key={pref.id} style={styles.preferenceChip}>
              {pref.preference_value}
            </Chip>
          ))}
        </View>
      </Card.Content>
      <Card.Actions>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onSelectCollaborator(item)}
        >
          <Text style={styles.actionText}>View Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.messageButton]}
          onPress={() => onMessageCollaborator(item)}
        >
          <Text style={[styles.actionText, styles.messageText]}>Message</Text>
        </TouchableOpacity>
      </Card.Actions>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Finding potential collaborators...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={collaborators}
      renderItem={renderCollaborator}
      keyExtractor={(item) => item.user.id.toString()}
      contentContainerStyle={styles.listContainer}
      refreshControl={
        refreshControl || (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )
      }
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 8,
  },
  card: {
    marginBottom: 12,
    borderRadius: 8,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  skillChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  skillText: {
    color: '#fff',
  },
  preferencesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  preferenceChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  scoreContainer: {
    marginRight: 16,
    alignItems: 'center',
  },
  scoreText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  scoreBadge: {
    marginTop: 4,
  },
  actionButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  messageButton: {
    backgroundColor: '#4CAF50',
  },
  actionText: {
    color: '#333',
  },
  messageText: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CollaboratorList;
