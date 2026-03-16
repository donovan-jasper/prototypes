import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const ConversationStarter = ({ match }) => {
  const [starter, setStarter] = useState(match.conversationStarters[0]);

  const generateNewStarter = () => {
    const randomIndex = Math.floor(Math.random() * match.conversationStarters.length);
    setStarter(match.conversationStarters[randomIndex]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.starterText}>{starter}</Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={generateNewStarter}
        >
          <Ionicons name="refresh" size={24} color={Colors.primary} />
          <Text style={styles.actionText}>New Suggestion</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            // Implement copy to clipboard functionality
          }}
        >
          <Ionicons name="copy" size={24} color={Colors.primary} />
          <Text style={styles.actionText}>Copy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 15,
  },
  starterText: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 5,
  },
});

export default ConversationStarter;
