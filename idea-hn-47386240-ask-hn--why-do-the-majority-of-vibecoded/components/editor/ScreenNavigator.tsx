import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { Screen } from '@/types/project';

interface ScreenNavigatorProps {
  screens: Screen[];
  activeScreenId: string;
  onScreenSelect: (screenId: string) => void;
}

export default function ScreenNavigator({ screens, activeScreenId, onScreenSelect }: ScreenNavigatorProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {screens.map((screen) => (
          <TouchableOpacity
            key={screen.id}
            style={[
              styles.screenItem,
              activeScreenId === screen.id && styles.activeScreenItem,
            ]}
            onPress={() => onScreenSelect(screen.id)}
          >
            <Text
              style={[
                styles.screenName,
                activeScreenId === screen.id && styles.activeScreenName,
              ]}
              numberOfLines={1}
            >
              {screen.name}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.addScreenButton}>
          <IconButton icon="plus" size={20} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  screenItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },
  activeScreenItem: {
    backgroundColor: '#6200ee',
  },
  screenName: {
    color: '#333',
  },
  activeScreenName: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addScreenButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
