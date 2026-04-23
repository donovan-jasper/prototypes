import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, RefreshControl } from 'react-native';
import { Text, FAB, ActivityIndicator } from 'react-native-paper';
import CollaboratorList from '../../components/CollaboratorList';
import MessageList from '../../components/MessageList';
import { UserProfile, Match } from '../../lib/types';
import { createMatch, getUserMatches } from '../../lib/matching';
import { AuthContext } from '../../context/AuthContext';

const CollabScreen = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<'find' | 'messages'>('find');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showMessageList, setShowMessageList] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadMatches();
    }
  }, [user]);

  const loadMatches = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userMatches = await getUserMatches(user.id);
      setMatches(userMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMatches();
    setRefreshing(false);
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Please log in to find collaborators</Text>
      </View>
    );
  }

  const handleSelectCollaborator = async (profile: UserProfile) => {
    try {
      // Check if a match already exists
      const existingMatch = matches.find(
        m => (m.user1_id === user.id && m.user2_id === profile.user.id) ||
             (m.user2_id === user.id && m.user1_id === profile.user.id)
      );

      if (existingMatch) {
        setSelectedMatch(existingMatch);
        setShowMessageList(true);
      } else {
        // Create a new match
        const newMatch = await createMatch(user.id, profile.user.id);
        setMatches([newMatch, ...matches]);
        setSelectedMatch(newMatch);
        setShowMessageList(true);
      }
    } catch (error) {
      console.error('Error creating match:', error);
    }
  };

  const handleMessageCollaborator = async (profile: UserProfile) => {
    handleSelectCollaborator(profile);
  };

  const handleSendMessage = () => {
    // Refresh matches when a new message is sent
    loadMatches();
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text>Loading your matches...</Text>
        </View>
      ) : showMessageList && selectedMatch ? (
        <MessageList
          matchId={selectedMatch.id}
          currentUserId={user.id}
          onSendMessage={handleSendMessage}
        />
      ) : (
        <CollaboratorList
          currentUserId={user.id}
          onSelectCollaborator={handleSelectCollaborator}
          onMessageCollaborator={handleMessageCollaborator}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        />
      )}

      <FAB
        style={styles.fab}
        icon={showMessageList ? 'arrow-left' : 'message'}
        onPress={() => setShowMessageList(!showMessageList)}
        label={showMessageList ? 'Back' : 'Messages'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CollabScreen;
