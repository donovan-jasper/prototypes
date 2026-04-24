import React, { useState } from 'react';
import { View, Button, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { generateAuditPDF } from '../lib/export';
import * as Sharing from 'expo-sharing';

interface ExportButtonProps {
  transactions: any[];
  startDate: Date;
  endDate: Date;
}

const ExportButton: React.FC<ExportButtonProps> = ({ transactions, startDate, endDate }) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const pdfUri = await generateAuditPDF(transactions, startDate, endDate, true);

      // Share the PDF
      await Sharing.shareAsync(pdfUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Audit Trail',
        UTI: 'com.adobe.pdf',
      });
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'There was an error generating the PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button
          title="Export Audit Trail"
          onPress={handleExport}
          color="#4CAF50"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    alignItems: 'center',
  },
});

export default ExportButton;
