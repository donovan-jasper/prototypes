import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator, Surface, SegmentedButtons, Banner } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { generateSlides } from '../../lib/ai/generateSlides';
import { saveDeck, getSettings } from '../../lib/db/queries';
import { themes } from '../../lib/html/slideTemplate';
import SlideViewer from '../../components/SlideViewer';

export default function CreateScreen() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('minimal');
  const [loading, setLoading] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [slideCount, setSlideCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [showDemoBanner, setShowDemoBanner] = useState(true);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    const settings = await getSettings();
    setHasApiKey(!!settings.apiKey);
  };

  const themeOptions = Object.keys(themes).map(key => ({
    value: key,
    label: themes[key].name,
  }));

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedHtml(null);

    try {
      const result = await generateSlides(prompt, selectedTheme);
      setGeneratedHtml(result.html);
      setSlideCount(result.slideCount);
      setIsDemo(result.isDemo || false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate slides');
    } finally {
      setLoading(false);
    }
  };

  const handleTryDemo = async () => {
    setPrompt('Create a pitch deck for a coffee shop startup');
    setTimeout(() => {
      handleGenerate();
    }, 100);
  };

  const handleSave = async () => {
    if (!generatedHtml) return;

    try {
      const title = prompt.slice(0, 50) + (prompt.length > 50 ? '...' : '');
      const now = Date.now();
      
      await saveDeck({
        title,
        html: generatedHtml,
        slideCount,
        createdAt: now,
        updatedAt: now,
      });

      setPrompt('');
      setGeneratedHtml(null);
      setSlideCount(0);
      setIsDemo(false);
      
      router.push('/(tabs)/');
    } catch (err) {
      setError('Failed to save deck');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Surface style={styles.header} elevation={1}>
          <Text variant="headlineMedium" style={styles.headerTitle}>
            Create Slides
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            Describe what you want to present
          </Text>
        </Surface>

        {!hasApiKey && showDemoBanner && (
          <Banner
            visible={true}
            actions={[
              {
                label: 'Dismiss',
                onPress: () => setShowDemoBanner(false),
              },
              {
                label: 'Settings',
                onPress: () => router.push('/(tabs)/settings'),
              },
            ]}
            icon="information"
            style={styles.banner}
          >
            Using demo mode - add your API key in Settings for custom AI generation
          </Banner>
        )}

        {isDemo && generatedHtml && (
          <Banner
            visible={true}
            actions={[
              {
                label: 'Add API Key',
                onPress: () => router.push('/(tabs)/settings'),
              },
            ]}
            icon="lightbulb-on"
            style={styles.demoBanner}
          >
            This is a demo template. Add your API key for custom AI-generated slides.
          </Banner>
        )}

        <View style={styles.inputSection}>
          {!hasApiKey && !generatedHtml && (
            <Button
              mode="contained"
              onPress={handleTryDemo}
              style={styles.demoButton}
              icon="play-circle"
            >
              Try Demo
            </Button>
          )}

          <TextInput
            mode="outlined"
            label="What do you want to present?"
            placeholder="e.g., Create a 3-slide pitch deck about a coffee shop"
            value={prompt}
            onChangeText={setPrompt}
            multiline
            numberOfLines={4}
            style={styles.input}
            disabled={loading}
          />

          <Text variant="labelLarge" style={styles.themeLabel}>
            Theme
          </Text>
          <SegmentedButtons
            value={selectedTheme}
            onValueChange={setSelectedTheme}
            buttons={themeOptions}
            style={styles.themeSelector}
            disabled={loading}
          />

          {error && (
            <Text variant="bodySmall" style={styles.errorText}>
              {error}
            </Text>
          )}

          <Button
            mode="contained"
            onPress={handleGenerate}
            loading={loading}
            disabled={loading || !prompt.trim()}
            style={styles.generateButton}
          >
            {loading ? 'Generating...' : 'Generate Slides'}
          </Button>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text variant="bodyMedium" style={styles.loadingText}>
              Creating your slides...
            </Text>
          </View>
        )}

        {generatedHtml && !loading && (
          <View style={styles.previewSection}>
            <View style={styles.previewHeader}>
              <Text variant="titleLarge" style={styles.previewTitle}>
                Preview
              </Text>
              <Text variant="bodyMedium" style={styles.slideCountText}>
                {slideCount} {slideCount === 1 ? 'slide' : 'slides'}
              </Text>
            </View>

            <View style={styles.viewerContainer}>
              <SlideViewer html={generatedHtml} />
            </View>

            <View style={styles.actionButtons}>
              <Button
                mode="outlined"
                onPress={handleGenerate}
                style={styles.actionButton}
              >
                Regenerate
              </Button>
              <Button
                mode="contained"
                onPress={handleSave}
                style={styles.actionButton}
              >
                Save Deck
              </Button>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#666',
  },
  banner: {
    backgroundColor: '#e3f2fd',
  },
  demoBanner: {
    backgroundColor: '#fff3e0',
  },
  inputSection: {
    padding: 16,
  },
  demoButton: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  themeLabel: {
    marginBottom: 8,
    color: '#666',
  },
  themeSelector: {
    marginBottom: 16,
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 8,
  },
  generateButton: {
    marginTop: 8,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  previewSection: {
    flex: 1,
    padding: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewTitle: {
    fontWeight: 'bold',
  },
  slideCountText: {
    color: '#666',
  },
  viewerContainer: {
    height: 400,
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});
