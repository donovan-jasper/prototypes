import React from 'react';
import { View, StyleSheet } from 'react-native';
import FileMerger from '../components/FileMerger';

const MergerScreen = ({ route, navigation }) => {
  const { files } = route.params;

  const handleMerge = (mergedPdf) => {
    // Handle merged PDF
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <FileMerger files={files} onMerge={handleMerge} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MergerScreen;
