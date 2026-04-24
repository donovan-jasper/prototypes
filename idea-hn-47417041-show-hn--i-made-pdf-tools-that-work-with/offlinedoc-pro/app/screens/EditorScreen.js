import React from 'react';
import { View, StyleSheet } from 'react-native';
import PDFEditor from '../components/PDFEditor';

const EditorScreen = ({ route, navigation }) => {
  const { pdfData } = route.params;

  const handleSave = (editedPdf) => {
    // Handle saved PDF
    navigation.navigate('Home');
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
