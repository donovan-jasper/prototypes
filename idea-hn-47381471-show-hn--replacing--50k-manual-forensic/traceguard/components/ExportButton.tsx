import React, { useState } from 'react';
import { Button, Alert, ActivityIndicator } from 'react-native';
import { generateAuditPDF } from '@/lib/export';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { canExportPDF } from '@/lib/subscription';

export function ExportButton({ transactions, startDate, endDate }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    if (!(await canExportPDF())) {
      Alert.alert(
        'Premium Feature',
        'PDF export is a premium feature. Please upgrade to use this feature.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);
    try {
      const pdfBytes = await generateAuditPDF(transactions, startDate, endDate);
      const fileUri = FileSystem.documentDirectory + 'audit-trail.pdf';
      await FileSystem.writeAsStringAsync(fileUri, pdfBytes, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Audit Trail',
        UTI: 'com.adobe.pdf',
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      Alert.alert('Error', 'Failed to export PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button
          title="Export Audit Trail"
          onPress={handleExport}
        />
      )}
    </>
  );
}
