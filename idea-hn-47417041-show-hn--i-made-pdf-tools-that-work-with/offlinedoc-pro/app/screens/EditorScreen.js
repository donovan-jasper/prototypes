import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import PDFEditor from '../components/PDFEditor';
import { saveFile } from '../utils/storage';

const EditorScreen = ({ route, navigation }) => {
  const { pdfData } = route.params;

  const handleSave = (fileUri) => {
    if (fileUri) {
      navigation.navigate('Home', { refresh: true });
    }
  };

  return (
    <View style={styles.container}>
      <PDFEditor pdfData={pdfData} onSave={handleSave} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default EditorScreen;
