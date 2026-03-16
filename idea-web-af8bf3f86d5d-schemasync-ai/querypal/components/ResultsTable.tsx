import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { DataTable, Text } from 'react-native-paper';

const ResultsTable = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text>No results to display</Text>
      </View>
    );
  }

  const headers = Object.keys(data[0]);

  return (
    <ScrollView horizontal>
      <DataTable style={styles.table}>
        <DataTable.Header>
          {headers.map(header => (
            <DataTable.Title key={header}>{header}</DataTable.Title>
          ))}
        </DataTable.Header>
        {data.map((row, index) => (
          <DataTable.Row key={index}>
            {headers.map(header => (
              <DataTable.Cell key={header}>{row[header]}</DataTable.Cell>
            ))}
          </DataTable.Row>
        ))}
      </DataTable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  table: {
    minWidth: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ResultsTable;
