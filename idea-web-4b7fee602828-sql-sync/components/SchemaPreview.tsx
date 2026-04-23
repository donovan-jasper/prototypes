import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Field } from '../lib/schema';

interface SchemaPreviewProps {
  schema: Field[];
}

const SchemaPreview = ({ schema }: SchemaPreviewProps) => {
  if (schema.length === 0) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Schema Preview</Text>
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.nameHeader]}>Field Name</Text>
        <Text style={[styles.headerCell, styles.typeHeader]}>Type</Text>
        <Text style={[styles.headerCell, styles.descriptionHeader]}>Description</Text>
      </View>
      {schema.map((field, index) => (
        <View key={index} style={styles.row}>
          <Text style={[styles.cell, styles.nameCell]}>{field.name}</Text>
          <Text style={[styles.cell, styles.typeCell]}>{field.type}</Text>
          <Text style={[styles.cell, styles.descriptionCell]}>{field.description || '-'}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    maxHeight: 300,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 8,
    marginBottom: 8,
  },
  headerCell: {
    fontWeight: 'bold',
    color: '#666',
  },
  nameHeader: {
    flex: 2,
  },
  typeHeader: {
    flex: 1,
  },
  descriptionHeader: {
    flex: 2,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cell: {
    paddingRight: 8,
  },
  nameCell: {
    flex: 2,
  },
  typeCell: {
    flex: 1,
  },
  descriptionCell: {
    flex: 2,
  },
});

export default SchemaPreview;
