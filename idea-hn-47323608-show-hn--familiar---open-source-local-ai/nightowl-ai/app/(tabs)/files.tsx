import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFiles } from '@/hooks/useFiles';
import { FileGrid } from '@/components/FileGrid';

export default function FilesScreen() {
  const { files, searchFiles } = useFiles();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Organized Files</Text>

      {/* Add search bar here */}

      <FileGrid files={files} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
