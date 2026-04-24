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

          <Text variant="labelLarge" style={styles.sectionTitle}>
            Slide Theme
          </Text>

          <SegmentedButtons
            value={selectedTheme}
            onValueChange={setSelectedTheme}
            buttons={themeOptions}
            style={styles.themeSelector}
          />

          <Button
            mode="contained"
            onPress={handleGenerate}
            loading={loading}
            disabled={loading || !prompt.trim()}
            style={styles.generateButton}
            icon="auto-fix"
          >
            Generate Slides
          </Button>

          {error && (
            <Text style={styles.errorText} variant="bodyMedium">
              {error}
            </Text>
          )}
        </View>

        {generatedHtml && (
          <View style={styles.previewSection}>
            <Text variant="headlineSmall" style={styles.previewTitle}>
              Preview ({slideCount} slides)
            </Text>

            <View style={styles.slideViewerContainer}>
              <SlideViewer html={generatedHtml} />
            </View>

            <View style={styles.actionButtons}>
              <Button
                mode="outlined"
                onPress={() => setGeneratedHtml(null)}
                style={styles.actionButton}
                icon="close"
              >
                Discard
              </Button>

              <Button
                mode="contained"
                onPress={handleSave}
                style={styles.actionButton}
                icon="content-save"
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
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  headerTitle: {
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#666',
  },
  banner: {
    marginBottom: 16,
  },
  demoBanner: {
    marginBottom: 16,
    backgroundColor: '#e3f2fd',
  },
  inputSection: {
    marginBottom: 24,
  },
  demoButton: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    marginBottom: 8,
    color: '#666',
  },
  themeSelector: {
    marginBottom: 16,
  },
  generateButton: {
    marginTop: 8,
  },
  errorText: {
    color: '#d32f2f',
    marginTop: 8,
    textAlign: 'center',
  },
  previewSection: {
    marginTop: 24,
  },
  previewTitle: {
    marginBottom: 16,
  },
  slideViewerContainer: {
    height: 400,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});
