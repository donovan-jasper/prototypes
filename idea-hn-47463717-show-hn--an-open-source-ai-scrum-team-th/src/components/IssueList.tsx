import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

interface Issue {
  id: string;
  title: string;
  state: string;
  isPR: boolean;
  prDetails?: any;
}

interface IssueListProps {
  issues: Issue[];
  onPRSelect: (pr: any) => void;
}

const IssueList: React.FC<IssueListProps> = ({ issues, onPRSelect }) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={issues}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.issueItem}>
            <Text style={styles.issueTitle}>{item.title}</Text>
            <Text style={styles.issueState}>{item.state}</Text>
            {item.isPR && (
              <TouchableOpacity
                style={styles.reviewButton}
                onPress={() => onPRSelect(item.prDetails)}
              >
                <Text style={styles.reviewButtonText}>Review PR</Text>
              </TouchableOpacity>
            )}
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
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  issueState: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  reviewButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  reviewButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default IssueList;
