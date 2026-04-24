import React from 'react';
import { FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';

const NoteList = ({ notes, onNotePress }) => {
  return (
    <FlatList
      data={notes}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.note} onPress={() => onNotePress(item)}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.date}>{item.date}</Text>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  note: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  title: {
    fontSize: 18,
  },
  date: {
    color: '#666',
  },
});

export default NoteList;
