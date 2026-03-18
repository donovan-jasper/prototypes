import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Screen } from '@/types/project';
import { Button } from 'react-native-paper'; // Using Paper Button for consistency

interface ScreenNavigatorProps {
  screens: Screen[];
  activeScreenId: string | null;
  onSelectScreen: (screenId: string) => void;
  onAddScreen: () => void;
}

export default function ScreenNavigator({ screens, activeScreenId, onSelectScreen, onAddScreen }: ScreenNavigatorProps) {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollViewContent}>
        {screens.map((screen) => (
          <TouchableOpacity
            key={screen.id}
            style={[
              styles.screenTab,
              screen.id === activeScreenId && styles.activeScreenTab,
            ]}
            onPress={() => onSelectScreen(screen.id)}
          >
            <Text
              style={[
                styles.screenTabText,
                screen.id === activeScreenId && styles.activeScreenTabText,
              ]}
            >
              {screen.name}
            </Text>
          </TouchableOpacity>
        ))}
        <Button icon="plus" mode="text" onPress={onAddScreen} style={styles.addScreenButton}>
          Add Screen
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60, // Fixed height for the navigator
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    justifyContent: 'center',
  },
  scrollViewContent: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  screenTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#f0f0f0',
  },
  activeScreenTab: {
    backgroundColor: '#6200ee',
  },
  screenTabText: {
    color: '#333',
    fontWeight: '500',
  },
  activeScreenTabText: {
    color: '#fff',
  },
  addScreenButton: {
    marginLeft: 8,
  },
});
