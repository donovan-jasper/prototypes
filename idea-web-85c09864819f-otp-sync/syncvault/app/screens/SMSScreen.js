import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../App';
import SMSList from '../components/SMSList';
import { startSMSListener } from '../utils/smsListener';
import { encryptData } from '../utils/encryption';

const SMSScreen = () => {
  const [smsMessages, setSmsMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isForwardingEnabled, setIsForwardingEnabled] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Start SMS listener
    const unsubscribeListener = startSMSListener();

    // Set up Firestore listener for messages
    const q = query(
      collection(db, 'users', user.uid, 'smsMessages'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        });
      });
      setSmsMessages(messages);
    });

    return () => {
      unsubscribe();
      if (unsubscribeListener) unsubscribeListener();
    };
  }, []);

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) {
      Alert.alert('Error', 'Please select a message and enter a reply');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      await addDoc(collection(db, 'users', user.uid, 'smsReplies'), {
        originalMessageId: selectedMessage.id,
        sender: selectedMessage.sender,
        body: replyText,
        timestamp: serverTimestamp(),
        status: 'pending'
      });

      setReplyText('');
      setSelectedMessage(null);
      Alert.alert('Success', 'Reply sent successfully');
    } catch (error) {
      console.error('Error sending reply:', error);
      Alert.alert('Error', 'Failed to send reply');
    }
  };

  const toggleForwarding = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        smsForwardingEnabled: !isForwardingEnabled
      });

      setIsForwardingEnabled(!isForwardingEnabled);
      Alert.alert('Success', `SMS forwarding ${!isForwardingEnabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating forwarding status:', error);
      Alert.alert('Error', 'Failed to update forwarding status');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Forwarded SMS Messages</Text>
        <View style={styles.settingsRow}>
          <Text style={styles.settingsLabel}>Enable SMS Forwarding</Text>
          <Switch
            value={isForwardingEnabled}
            onValueChange={toggleForwarding}
          />
        </View>
      </View>

      {smsMessages.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No forwarded SMS messages yet</Text>
          <Text style={styles.emptySubtext}>Messages from your phone will appear here</Text>
        </View>
      ) : (
        <>
          <SMSList
            smss={smsMessages}
            onSelectMessage={(message) => setSelectedMessage(message)}
            selectedMessage={selectedMessage}
          />

          {selectedMessage && (
            <View style={styles.replyContainer}>
              <Text style={styles.replyTitle}>Reply to {selectedMessage.sender}</Text>
              <TextInput
                style={styles.replyInput}
                value={replyText}
                onChangeText={setReplyText}
                placeholder="Type your reply..."
                multiline
              />
              <TouchableOpacity
                style={styles.replyButton}
                onPress={handleReply}
              >
                <Text style={styles.replyButtonText}>Send Reply</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingsLabel: {
    fontSize: 16,
    color: '#333',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  replyContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  replyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  replyInput: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  replyButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  replyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SMSScreen;
