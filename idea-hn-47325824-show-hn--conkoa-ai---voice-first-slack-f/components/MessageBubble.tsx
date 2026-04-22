import { View, Text, StyleSheet } from 'react-native';
import { Message } from '../types'; // Import Message type
import { MaterialIcons } from '@expo/vector-icons'; // For icons

export default function MessageBubble({ message }: { message: Message }) {
  // Placeholder for current user ID. In a real app, this would come from auth state.
  const isCurrentUser = message.userId === 'current-user'; 

  return (
    <View style={[styles.container, isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer]}>
      <View style={[styles.bubble, isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble]}>
        <Text style={[styles.text, isCurrentUser ? styles.currentUserText : styles.otherUserText]}>
          {message.text}
        </Text>
        <View style={styles.statusRow}>
          <Text style={[styles.timestamp, isCurrentUser ? styles.currentUserTimestamp : styles.otherUserTimestamp]}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {isCurrentUser && message.synced === false && ( // Visual indicator for unsynced messages
            <MaterialIcons name="access-time" size={14} color={isCurrentUser ? 'white' : '#888'} style={styles.syncIcon} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  currentUserContainer: {
    justifyContent: 'flex-end',
  },
  otherUserContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    maxWidth: '80%',
    flexDirection: 'column', // To stack text and status
  },
  currentUserBubble: {
    backgroundColor: '#007AFF', // Blue for current user
    alignSelf: 'flex-end',
  },
  otherUserBubble: {
    backgroundColor: '#E5E5EA', // Light gray for other users
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 16,
  },
  currentUserText: {
    color: 'white',
  },
  otherUserText: {
    color: 'black',
  },
  statusRow: {
    flexDirection: 'row',
    alignSelf: 'flex-end', // Align timestamp and icon to the right
    marginTop: 4,
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 10,
    marginLeft: 8, // Space from text
  },
  currentUserTimestamp: {
    color: 'rgba(255,255,255,0.7)', // Lighter white for current user
  },
  otherUserTimestamp: {
    color: '#888', // Gray for other users
  },
  syncIcon: { // Style for sync indicator
    marginLeft: 4,
  },
});
