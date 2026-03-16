import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SmartCollection from '@/components/SmartCollection';
import { useAppsStore } from '@/store/apps';

export default function DrawerScreen() {
  const collections = useAppsStore((state) => state.collections);

  return (
    <View style={styles.container}>
      <ScrollView>
        {collections.map((collection) => (
          <SmartCollection key={collection.id} collection={collection} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
