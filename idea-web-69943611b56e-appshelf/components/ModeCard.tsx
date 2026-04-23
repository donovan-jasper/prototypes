import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IconButton } from 'react-native-paper';

interface ModeCardProps {
  mode: {
    id: string;
    name: string;
    color: string;
    icon?: string;
    appIds: string[];
  };
  onPress: () => void;
  isActive?: boolean;
}

export const ModeCard: React.FC<ModeCardProps> = ({ mode, onPress, isActive }) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        { borderColor: isActive ? mode.color : 'transparent' },
        { backgroundColor: isActive ? `${mode.color}20` : 'white' }
      ]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: mode.color }]}>
          {mode.icon ? (
            <Text style={styles.icon}>{mode.icon}</Text>
          ) : (
            <Text style={styles.icon}>{mode.name.charAt(0).toUpperCase()}</Text>
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{mode.name}</Text>
          <Text style={styles.subtitle}>{mode.appIds.length} apps</Text>
        </View>
      </View>
      {isActive && (
        <IconButton
          icon="check"
          color={mode.color}
          size={20}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});
