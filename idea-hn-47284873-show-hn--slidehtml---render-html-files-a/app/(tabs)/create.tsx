import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator, Surface, SegmentedButtons, Banner, Divider, Portal, Modal, IconButton } from 'react-native-paper';
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
  const [deckTitle, setDeckTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [showDemoBanner, setShowDemoBanner] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

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
      setDeckTitle(result.title);
      setIsDemo(result.isDemo || false);
      setShowPreviewModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate slides');
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to generate slides');
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
      const now = Date.now();

      await saveDeck({
        title: deckTitle,
        html: generatedHtml,
        slideCount,
        createdAt: now,
        updatedAt: now,
      });

      setPrompt('');
      setGeneratedHtml(null);
      setSlideCount(0);
      setDeckTitle('');
      setIsDemo(false);
      setShowPreviewModal(false);

      router.push('/(tabs)/');
    } catch (err) {
      setError('Failed to save deck');
      Alert.alert('Error', 'Failed to save deck');
    }
  };

  const handleRegenerate = () => {
    setShowPreviewModal(false);
    handleGenerate();
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
            label="Your prompt"
            value={prompt}
            onChangeText={setPrompt}
            multiline
            numberOfLines={4}
            style={styles.promptInput}
            mode="outlined"
            placeholder="Describe your presentation topic or upload content"
            disabled={loading}
          />

          <View style={styles.themeSelector}>
            <Text variant="labelLarge" style={styles.themeLabel}>
              Slide Theme
            </Text>
            <SegmentedButtons
              value={selectedTheme}
              onValueChange={setSelectedTheme}
              buttons={themeOptions}
              style={styles.segmentedButtons}
            />
          </View>

          <Button
            mode="contained"
            onPress={handleGenerate}
            loading={loading}
            disabled={!prompt.trim() || loading}
            style={styles.generateButton}
            icon="magic"
          >
            Generate Slides
          </Button>

          {error && (
            <Text variant="bodyMedium" style={styles.errorText}>
              {error}
            </Text>
          )}
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" animating={true} />
            <Text variant="bodyMedium" style={styles.loadingText}>
              Generating your slides with AI...
            </Text>
          </View>
        )}
      </ScrollView>

      <Portal>
        <Modal
          visible={showPreviewModal}
          onDismiss={() => setShowPreviewModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.modalContent} elevation={4}>
            <View style={styles.modalHeader}>
              <Text variant="headlineSmall">Preview</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowPreviewModal(false)}
              />
            </View>

            <Divider />

            {generatedHtml && (
              <View style={styles.previewContainer}>
                <SlideViewer html={generatedHtml} />
              </View>
            )}

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={handleRegenerate}
                icon="refresh"
                style={styles.modalButton}
              >
                Regenerate
              </Button>
              <Button
                mode="contained"
                onPress={handleSave}
                icon="content-save"
                style={styles.modalButton}
              >
                Save Deck
              </Button>
            </View>
          </Surface>
        </Modal>
      </Portal>
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
  promptInput: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  themeSelector: {
    marginBottom: 16,
  },
  themeLabel: {
    marginBottom: 8,
  },
  segmentedButtons: {
    backgroundColor: 'white',
  },
  generateButton: {
    marginTop: 8,
  },
  errorText: {
    color: 'red',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  modalContainer: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewContainer: {
    flex: 1,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
    height: 400,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});
