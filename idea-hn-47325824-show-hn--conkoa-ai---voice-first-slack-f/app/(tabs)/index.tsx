import { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { useMessageStore } from '../../store/messages';
import { getMessages, saveMessage } from '../../lib/db';
import VoiceButton from '../../components/VoiceButton';
import MessageBubble from '../../components/MessageBubble';
import ConflictResolver from '../../components/ConflictResolver';
import { checkForConflicts, registerBackgroundSync } from '../../lib/sync';

export default function MessagesScreen() {
  const { messages, setMessages, addMessage } = useMessageStore();
  const [channelId] = useState('default');
  const [conflictData, setConflictData] = useState<{
    messageId: string;
    localText: string;
    remoteText: string;
  } | null>(null);

  useEffect(() => {
    loadMessages();
    registerBackgroundSync();
  }, []);

  async function loadMessages() {
    const msgs = await getMessages(channelId);
    setMessages(msgs);

    // Check for conflicts after loading messages
    for (const msg of msgs) {
      const hasConflict = await checkForConflicts(msg.id);
      if (hasConflict) {
        // Get updated message with resolved conflict
        const updatedMsg = await db.getFirstAsync(
          'SELECT * FROM messages WHERE id = ?',
          [msg.id]
        );
        if (updatedMsg) {
          setConflictData({
            messageId: msg.id,
            localText: msg.text,
            remoteText: updatedMsg.text
          });
        }
      }
    }
  }

  async function handleTranscript(text: string) {
    const message = {
      id: Date.now().toString(),
      channelId,
      userId: 'current-user',
      text,
      timestamp: Date.now(),
    };

    await saveMessage(message);
    addMessage(message);
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        inverted
      />
      <VoiceButton onTranscript={handleTranscript} />

      {conflictData && (
        <ConflictResolver
          messageId={conflictData.messageId}
          localText={conflictData.localText}
          remoteText={conflictData.remoteText}
          visible={!!conflictData}
          onClose={() => {
            setConflictData(null);
            loadMessages(); // Refresh messages after conflict resolution
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
