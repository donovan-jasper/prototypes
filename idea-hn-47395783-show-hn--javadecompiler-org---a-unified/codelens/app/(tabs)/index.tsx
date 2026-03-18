import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useDecompilation } from '../../hooks/useDecompilation';
import UploadButton from '../../components/UploadButton';

const HomeScreen = () => {
  const { recentDecompilations } = useDecompilation();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  const handleUploadComplete = (decompilationId: number) => {
    setUploading(false);
    router.push(`/decompile/${decompilationId}`);
  };

  const handleUploadStart = () => {
    setUploading(true);
  };

  const handleUploadError = () => {
    setUploading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Decompilations</Text>
        <UploadButton 
          onUploadStart={handleUploadStart}
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
        />
      </View>

      {uploading && (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.uploadingText}>Decompiling file...</Text>
        </View>
      )}

      {recentDecompilations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No decompilations yet</Text>
          <Text style={styles.emptySubtext}>Upload a file to get started</Text>
        </View>
      ) : (
        <FlatList
          data={recentDecompilations}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/decompile/${item.id}`)}
              style={styles.listItem}
            >
              <Text style={styles.fileName}>{item.fileName}</Text>
              <Text style={styles.fileInfo}>
                {(item.fileSize / 1024).toFixed(2)} KB • {new Date(item.timestamp).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  uploadingContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    margin: 16,
    borderRadius: 8,
  },
  uploadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
  listItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  fileInfo: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;
