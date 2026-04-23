import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface EncryptionBadgeProps {
  encrypted: boolean;
}

export const EncryptionBadge: React.FC<EncryptionBadgeProps> = ({ encrypted }) => {
  return (
    <View style={[
      styles.badge,
      encrypted ? styles.encrypted : styles.notEncrypted
    ]}>
      <Ionicons
        name={encrypted ? "lock-closed-outline" : "lock-open-outline"}
        size={14}
        color={encrypted ? Colors.success : Colors.error}
      />
      <Text style={[
        styles.badgeText,
        encrypted ? styles.encryptedText : styles.notEncryptedText
      ]}>
        {encrypted ? 'Encrypted' : 'Not Encrypted'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  encrypted: {
    backgroundColor: Colors.lightSuccess,
  },
  notEncrypted: {
    backgroundColor: Colors.lightError,
  },
  badgeText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  encryptedText: {
    color: Colors.success,
  },
  notEncryptedText: {
    color: Colors.error,
  },
});
