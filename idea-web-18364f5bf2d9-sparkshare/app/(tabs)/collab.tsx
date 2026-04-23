import React, { useState, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, FAB } from 'react-native-paper';
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
      const existingMatches = await getUserMatches(user.id);
      const existingMatch = existingMatches.find(
        m => (m.user1_id === user.id && m.user2_id === profile.user.id) ||
             (m.user2_id === user.id && m.user1_id === profile.user.id)
      );

      if (existingMatch) {
        setSelectedMatch(existingMatch);
        setShowMessageList(true);
      } else {
        // Create a new match
        const newMatch = await createMatch(user.id, profile.user.id);
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

  return (
    <View style={styles.container}>
      {showMessageList && selectedMatch ? (
        <MessageList
          matchId={selectedMatch.id}
          currentUserId={user.id}
          onSendMessage={() => {}}
        />
      ) : (
        <CollaboratorList
          currentUserId={user.id}
          onSelectCollaborator={handleSelectCollaborator}
          onMessageCollaborator={handleMessageCollaborator}
        />
      )}

      <FAB
        style={styles.fab}
        icon={showMessageList ? 'arrow-left' : 'message'}
        onPress={() => setShowMessageList(!showMessageList)}
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
});

export default CollabScreen;
