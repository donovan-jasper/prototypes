import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import { Text, FAB, ActivityIndicator, Card, Avatar, Button, Chip, Divider } from 'react-native-paper';
import { getPotentialMatches, createMatch, getUserMatches, getUserProfile } from '../../lib/matching';
import { AuthContext } from '../../context/AuthContext';
import { UserProfile, Match } from '../../lib/types';
import MessageList from '../../components/MessageList';

const CollabScreen = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<'find' | 'messages'>('find');
  const [potentialMatches, setPotentialMatches] = useState<UserProfile[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [matchesData, potentialMatchesData] = await Promise.all([
        getUserMatches(user.id),
        getPotentialMatches(user.id)
      ]);
      setMatches(matchesData);
      setPotentialMatches(potentialMatchesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleConnect = async (profile: UserProfile) => {
    try {
      const newMatch = await createMatch(user.id, profile.user.id);
      setMatches([newMatch, ...matches]);
      setSelectedMatch(newMatch);
      setActiveTab('messages');
    } catch (error) {
      console.error('Error creating match:', error);
    }
  };

  const handleMessage = (match: Match) => {
    setSelectedMatch(match);
    setActiveTab('messages');
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Please log in to find collaborators</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Finding potential collaborators...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {activeTab === 'find' ? (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          contentContainerStyle={styles.scrollContent}
        >
          <Text variant="headlineSmall" style={styles.sectionTitle}>
            Potential Collaborators
          </Text>

          {potentialMatches.length === 0 ? (
            <View style={styles.emptyState}>
              <Text>No potential matches found. Try adjusting your preferences.</Text>
            </View>
          ) : (
            potentialMatches.map((profile) => (
              <Card key={profile.user.id} style={styles.card} mode="outlined">
                <Card.Title
                  title={profile.user.username}
                  subtitle={`Match Score: ${Math.round(profile.matchScore! * 100)}%`}
                  left={(props) => <Avatar.Icon {...props} icon="account" />}
                />
                <Card.Content>
                  <View style={styles.skillsContainer}>
                    {profile.skills.slice(0, 3).map((skill) => (
                      <Chip key={skill.id} style={styles.skillChip}>
                        {skill.skill_name}
                      </Chip>
                    ))}
                    {profile.skills.length > 3 && (
                      <Text style={styles.moreSkills}>+{profile.skills.length - 3} more</Text>
                    )}
                  </View>
                  <Divider style={styles.divider} />
                  <Text variant="bodyMedium" style={styles.location}>
                    {profile.user.location || 'Location not specified'}
                  </Text>
                </Card.Content>
                <Card.Actions>
                  <Button onPress={() => handleConnect(profile)}>Connect</Button>
                </Card.Actions>
              </Card>
            ))
          )}
        </ScrollView>
      ) : (
        <MessageList
          matchId={selectedMatch?.id || 0}
          currentUserId={user.id}
          onBack={() => setActiveTab('find')}
        />
      )}

      <FAB
        style={styles.fab}
        icon={activeTab === 'find' ? 'message' : 'account-search'}
        onPress={() => setActiveTab(activeTab === 'find' ? 'messages' : 'find')}
        label={activeTab === 'find' ? 'Messages' : 'Find Collaborators'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  skillChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  moreSkills: {
    marginLeft: 4,
    marginTop: 4,
    color: 'gray',
  },
  divider: {
    marginVertical: 8,
  },
  location: {
    color: 'gray',
  },
  emptyState: {
    padding: 16,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default CollabScreen;
