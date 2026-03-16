import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { DataTable } from 'react-native-paper';

const ResultsTable = ({ data }) => {
  if (!data || data.length === 0) {
    return <Text>No results to display</Text>;
  }

  const columns = Object.keys(data[0]);

  return (
    <ScrollView horizontal>
      <DataTable>
        <DataTable.Header>
          {columns.map((column) => (
            <DataTable.Title key={column}>{column}</DataTable.Title>
          ))}
        </DataTable.Header>
        {data.map((row, index) => (
          <DataTable.Row key={index}>
            {columns.map((column) => (
              <DataTable.Cell key={column}>{row[column]}</DataTable.Cell>
            ))}
          </DataTable.Row>
        ))}
      </DataTable>
    </ScrollView>
  );
};

export default ResultsTable;
