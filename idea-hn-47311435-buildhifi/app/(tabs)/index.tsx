import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';
import BuildCanvas from '@/components/BuildCanvas';
import ComponentPickerModal from '@/components/ComponentPickerModal';
import useBuildStore from '@/lib/store/buildStore';

const HomeScreen = () => {
  const router = useRouter();
  const currentBuild = useBuildStore((state) => state.currentBuild);
  const [pickerVisible, setPickerVisible] = useState(false);

  const handleNewBuild = () => {
    router.push('/build/new');
  };

  return (
    <View style={styles.container}>
      <BuildCanvas build={currentBuild} />
      <Button
        mode="contained"
        onPress={handleNewBuild}
        style={styles.newBuildButton}
      >
        New Build
      </Button>
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setPickerVisible(true)}
      />
      <ComponentPickerModal
        visible={pickerVisible}
        onDismiss={() => setPickerVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  newBuildButton: {
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
});

export default HomeScreen;
