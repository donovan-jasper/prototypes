import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import Widget from '../../components/Widget';
import { useAppStore } from '../../store/useAppStore';

const WidgetsScreen = () => {
  const { widgets, addWidget } = useAppStore();

  return (
    <View style={styles.container}>
      <FlatList
        data={widgets}
        renderItem={({ item }) => (
          <Widget
            widget={item}
            onPress={() => addWidget(item)}
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

export default WidgetsScreen;
