import React from 'react';
import { View, Text } from 'react-native';

const SchemaDiffItem = ({ item }) => {
  return (
    <View>
      <Text>
        {item.type} {item.tableName}
      </Text>
      {item.columns.map((column) => (
        <Text key={column.name}>
          - {column.name} ({column.type})
        </Text>
      ))}
    </View>
  );
};

export default SchemaDiffItem;
