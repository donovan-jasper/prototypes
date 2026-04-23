import React from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import AppCard from '../components/AppCard';
import { getCuratedLists, CuratedList } from '../utils/curatedLists';
import { useQuery } from 'react-query';

const CuratedListsScreen: React.FC = () => {
  const { data: lists, isLoading, error } = useQuery<CuratedList[]>('curatedLists', getCuratedLists);

  const handleInstall = (appStoreUrl: string, playStoreUrl: string) => {
    const url = Platform.OS === 'ios' ? appStoreUrl : playStoreUrl;
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load curated lists. Please try again later.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listContainer}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>{item.title}</Text>
              <Text style={styles.listDescription}>{item.description}</Text>
            </View>
            <FlatList
              horizontal
              data={item.apps}
              keyExtractor={(app) => app.id}
              renderItem={({ item: app }) => (
                <View style={styles.appCardContainer}>
                  <AppCard
                    app={app}
                    onInstall={() => handleInstall(app.appStoreUrl, app.playStoreUrl)}
                  />
                </View>
              )}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 16,
    textAlign: 'center',
  },
  listContent: {
    padding: 15,
  },
  listContainer: {
    marginBottom: 30,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listHeader: {
    marginBottom: 15,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1c1c1e',
    marginBottom: 5,
  },
  listDescription: {
    fontSize: 14,
    color: '#8e8e93',
  },
  appCardContainer: {
    marginRight: 15,
    width: 150,
  },
});

export default CuratedListsScreen;
