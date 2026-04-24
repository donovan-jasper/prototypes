import React, { useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { PDFDocument } from 'pdf-lib';

const FileMerger = ({ files, onMerge }) => {
  const handleMerge = async () => {
    const mergedPdf = await PDFDocument.create();
    for (const file of files) {
      const pdfDoc = await PDFDocument.load(file.data);
      const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }
    const mergedPdfBytes = await mergedPdf.save();
    onMerge(mergedPdfBytes);
  };

  return (
    <View style={styles.container}>
      <Button title="Merge Files" onPress={handleMerge} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FileMerger;
