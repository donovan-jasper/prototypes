import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

interface Issue {
  id: string;
  title: string;
  state: string;
  isPR: boolean;
  prDetails?: any;
  aiTags?: string[];
  priorityScore?: number;
}

interface IssueListProps {
  issues: Issue[];
  onPRSelect: (pr: any) => void;
}

const IssueList: React.FC<IssueListProps> = ({ issues, onPRSelect }) => {
  // Sort issues by priority score (descending)
  const sortedIssues = [...issues].sort((a, b) => {
    if (b.priorityScore && a.priorityScore) {
      return b.priorityScore - a.priorityScore;
    }
    return 0;
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedIssues}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.issueItem}>
            <Text style={styles.issueTitle}>{item.title}</Text>
            <Text style={styles.issueState}>{item.state}</Text>

            {/* Display AI tags if available */}
            {item.aiTags && item.aiTags.length > 0 && (
              <View style={styles.tagsContainer}>
                {item.aiTags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Display priority score if available */}
            {item.priorityScore !== undefined && (
              <View style={styles.priorityContainer}>
                <Text style={styles.priorityLabel}>Priority:</Text>
                <Text style={[
                  styles.priorityScore,
                  item.priorityScore > 70 ? styles.highPriority :
                  item.priorityScore > 40 ? styles.mediumPriority :
                  styles.lowPriority
                ]}>
                  {item.priorityScore.toFixed(0)}
                </Text>
              </View>
            )}

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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#e0f7fa',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#00838f',
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  priorityScore: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  highPriority: {
    color: '#d32f2f',
  },
  mediumPriority: {
    color: '#f57c00',
  },
  lowPriority: {
    color: '#388e3c',
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
