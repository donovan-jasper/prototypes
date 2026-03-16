import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import BuildCanvas from '@/components/BuildCanvas';
import useBuildStore from '@/lib/store/buildStore';

const HomeScreen = () => {
  const router = useRouter();
  const currentBuild = useBuildStore((state) => state.currentBuild);

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
});

export default HomeScreen;
