import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { exportToCSV, exportToPDF } from '../lib/export';

const ExportMenu = ({ data }) => {
  const handleExportCSV = () => {
    exportToCSV(data);
  };

  const handleExportPDF = () => {
    exportToPDF(data);
  };

  return (
    <View style={styles.container}>
      <Button mode="outlined" onPress={handleExportCSV}>
        Export to CSV
      </Button>
      <Button mode="outlined" onPress={handleExportPDF}>
        Export to PDF
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
});

export default ExportMenu;
