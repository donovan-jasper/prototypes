import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import FocusMode from '../../components/FocusMode';
import { useAppStore } from '../../store/useAppStore';

const ModesScreen = () => {
  const { focusModes, activateFocusMode } = useAppStore();

  return (
    <View style={styles.container}>
      <FlatList
        data={focusModes}
        renderItem={({ item }) => (
          <FocusMode
            mode={item}
            onPress={() => activateFocusMode(item)}
          />
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default ModesScreen;
