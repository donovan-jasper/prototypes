import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

interface Issue {
  id: string;
  title: string;
  state: string;
}

interface IssueListProps {
  issues: Issue[];
}

const IssueList: React.FC<IssueListProps> = ({ issues }) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={issues}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.issueItem}>
            <Text style={styles.issueTitle}>{item.title}</Text>
            <Text style={styles.issueState}>{item.state}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  issueItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  issueState: {
    fontSize: 14,
    color: '#666',
  },
});

export default IssueList;
