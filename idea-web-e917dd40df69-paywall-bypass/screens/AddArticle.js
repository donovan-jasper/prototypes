import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { fetchArticle } from '../services/ContentService';

const AddArticle = ({ navigation }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFetchArticle = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a URL');
      return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      Alert.alert('Error', 'Please enter a valid URL starting with http:// or https://');
      return;
    }

    setLoading(true);

    try {
      const article = await fetchArticle(url.trim());
      setLoading(false);
      
      Alert.alert(
        'Success',
        'Article fetched and saved successfully!',
        [
          {
            text: 'View Article',
            onPress: () => navigation.navigate('ArticleView', { article }),
          },
          {
            text: 'Add Another',
            onPress: () => setUrl(''),
          },
        ]
      );
    } catch (error) {
      setLoading(false);
      Alert.alert(
        'Error',
        error.message || 'Failed to fetch article. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handlePaste = async () => {
    // In a real app, you'd use Clipboard API
    // For now, just a placeholder
    Alert.alert('Info', 'Paste functionality requires Clipboard API');
  };

  const suggestedSites = [
    'nytimes.com',
    'wsj.com',
    'medium.com',
    'washingtonpost.com',
    'bloomberg.com',
    'ft.com',
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Article</Text>
          <Text style={styles.subtitle}>
            Paste a URL from any news site to bypass the paywall
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="https://example.com/article"
            placeholderTextColor="#999"
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.pasteButton}
            onPress={handlePaste}
            disabled={loading}
          >
            <Text style={styles.pasteButtonText}>Paste</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.fetchButton, loading && styles.fetchButtonDisabled]}
          onPress={handleFetchArticle}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.fetchButtonText}>Fetch Article</Text>
          )}
        </TouchableOpacity>

        <View style={styles.suggestedContainer}>
          <Text style={styles.suggestedTitle}>Supported Sites</Text>
          <View style={styles.suggestedGrid}>
            {suggestedSites.map((site, index) => (
              <View key={index} style={styles.suggestedSite}>
                <Text style={styles.suggestedSiteText}>{site}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>How it works</Text>
          <Text style={styles.infoText}>
            1. Copy the URL of any paywalled article{'\n'}
            2. Paste it here and tap "Fetch Article"{'\n'}
            3. We'll bypass the paywall and save it for offline reading{'\n'}
            4. Access your saved articles anytime from the Home tab
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pasteButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    marginLeft: 10,
  },
  pasteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fetchButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 30,
  },
  fetchButtonDisabled: {
    backgroundColor: '#ccc',
  },
  fetchButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  suggestedContainer: {
    marginBottom: 30,
  },
  suggestedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  suggestedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  suggestedSite: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  suggestedSiteText: {
    fontSize: 14,
    color: '#666',
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});

export default AddArticle;
