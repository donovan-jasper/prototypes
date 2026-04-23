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
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ModeCard: React.FC<ModeCardProps> = ({
  mode,
  onPress,
  isActive = false,
  onEdit,
  onDelete,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isActive && styles.activeContainer,
        { backgroundColor: mode.color || '#6200ee' },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
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

      {(onEdit || onDelete) && (
        <View style={styles.actions}>
          {onEdit && (
            <IconButton
              icon="pencil"
              size={20}
              onPress={onEdit}
              color="white"
            />
          )}
          {onDelete && (
            <IconButton
              icon="delete"
              size={20}
              onPress={onDelete}
              color="white"
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  activeContainer: {
    borderWidth: 2,
    borderColor: 'white',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
  },
});
