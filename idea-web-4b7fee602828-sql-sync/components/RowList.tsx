import React from 'react';
import { FlatList, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

const RowList = ({ rows, onDelete, onEdit }) => {
  const renderItem = ({ item }) => {
    const renderRightActions = () => (
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => onEdit(item.id)}
        >
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => onDelete(item.id)}
        >
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );

    return (
      <Swipeable renderRightActions={renderRightActions}>
        <View style={styles.row}>
          {Object.entries(item).map(([key, value]) => (
            key !== 'id' && (
              <View key={key} style={styles.field}>
                <Text style={styles.fieldLabel}>{key}:</Text>
                <Text style={styles.fieldValue}>{value}</Text>
              </View>
            )
          ))}
        </View>
      </Swipeable>
    );
  };

  return (
    <FlatList
      data={rows}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    paddingBottom: 20,
  },
  row: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  field: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  fieldLabel: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  fieldValue: {
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  actionText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default RowList;
