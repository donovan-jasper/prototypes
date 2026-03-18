import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import ProgressBar from '@/components/ProgressBar';
import DirectoryCard from '@/components/DirectoryCard';
import SubmissionStatusBadge from '@/components/SubmissionStatusBadge';
import {
  getSubmissionsByStatus,
  getCompletionPercentage,
  createSubmission,
  updateSubmissionStatus,
  getSubmissionByDirectoryId,
} from '@/lib/submissions';
import { getAllDirectories } from '@/lib/directories';
import { Directory, Submission } from '@/lib/database';

type StatusFilter = 'all' | 'submitted' | 'approved' | 'rejected';

interface DirectoryWithSubmission extends Directory {
  submission?: Submission;
}

export default function TrackerScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [percentage, setPercentage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [directories, setDirectories] = useState<DirectoryWithSubmission[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [allDirectories, setAllDirectories] = useState<Directory[]>([]);
  const [selectedDirectory, setSelectedDirectory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'submitted' | 'approved' | 'rejected'>('submitted');

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [completionPct, submissions, allDirs] = await Promise.all([
        getCompletionPercentage(),
        getSubmissionsByStatus(),
        getAllDirectories(),
      ]);

      setPercentage(completionPct);
      setAllDirectories(allDirs);

      const submissionMap = new Map(
        submissions.map(sub => [sub.directoryId, sub])
      );

      const dirsWithSubmissions = allDirs
        .map(dir => ({
          ...dir,
          submission: submissionMap.get(dir.id),
        }))
        .filter(dir => dir.submission);

      setDirectories(dirsWithSubmissions);
    } catch (error) {
      console.error('Error loading tracker data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredDirectories = directories.filter(dir => {
    if (statusFilter === 'all') return true;
    return dir.submission?.status === statusFilter;
  });

  const handleAddSubmission = async () => {
    if (!selectedDirectory) return;

    try {
      await createSubmission(selectedDirectory, selectedStatus);
      setShowAddModal(false);
      setSelectedDirectory(null);
      await loadData();
    } catch (error) {
      console.error('Error creating submission:', error);
    }
  };

  const availableDirectories = allDirectories.filter(
    dir => !directories.some(d => d.id === dir.id)
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tracker</Text>
      </View>

      <ProgressBar percentage={percentage} />

      <View style={styles.segmentedControl}>
        {(['all', 'submitted', 'approved', 'rejected'] as StatusFilter[]).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.segment,
              statusFilter === filter && styles.segmentActive,
            ]}
            onPress={() => setStatusFilter(filter)}
          >
            <Text
              style={[
                styles.segmentText,
                statusFilter === filter && styles.segmentTextActive,
              ]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredDirectories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <DirectoryCard
              directory={item}
              onPress={() => router.push(`/directory/${item.id}`)}
            />
            {item.submission && (
              <View style={styles.submissionInfo}>
                <SubmissionStatusBadge status={item.submission.status} />
                {item.submission.submissionDate && (
                  <Text style={styles.submissionDate}>
                    {new Date(item.submission.submissionDate).toLocaleDateString()}
                  </Text>
                )}
              </View>
            )}
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No submissions yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to track your first submission
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowAddModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Submission</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionLabel}>Select Directory</Text>
            <ScrollView style={styles.directoryList} showsVerticalScrollIndicator={false}>
              {availableDirectories.map((dir) => (
                <TouchableOpacity
                  key={dir.id}
                  style={[
                    styles.directoryOption,
                    selectedDirectory === dir.id && styles.directoryOptionSelected,
                  ]}
                  onPress={() => setSelectedDirectory(dir.id)}
                >
                  <Text style={styles.directoryName}>{dir.name}</Text>
                  <Text style={styles.directoryCategory}>{dir.category}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionLabel}>Status</Text>
            <View style={styles.statusOptions}>
              {(['submitted', 'approved', 'rejected'] as const).map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    selectedStatus === status && styles.statusOptionSelected,
                  ]}
                  onPress={() => setSelectedStatus(status)}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      selectedStatus === status && styles.statusOptionTextSelected,
                    ]}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.addButton,
                !selectedDirectory && styles.addButtonDisabled,
              ]}
              onPress={handleAddSubmission}
              disabled={!selectedDirectory}
            >
              <Text style={styles.addButtonText}>Add Submission</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
  },
  segmentedControl: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: '#007AFF',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 100,
  },
  submissionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: -8,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  submissionDate: {
    fontSize: 13,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
    paddingHorizontal: 8,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  directoryList: {
    maxHeight: 200,
    marginHorizontal: 20,
  },
  directoryOption: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    marginBottom: 8,
  },
  directoryOptionSelected: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  directoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  directoryCategory: {
    fontSize: 13,
    color: '#666',
  },
  statusOptions: {
    flexDirection: 'row',
    marginHorizontal: 20,
    gap: 8,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  statusOptionSelected: {
    backgroundColor: '#007AFF',
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  statusOptionTextSelected: {
    color: '#FFFFFF',
  },
  addButton: {
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#CCC',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
