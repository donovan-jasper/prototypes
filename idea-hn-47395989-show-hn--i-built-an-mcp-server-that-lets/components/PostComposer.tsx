import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Text, View, Alert, ActivityIndicator } from 'react-native';
import { refinePost } from '@/lib/ai';
import { publishPost as publishToThreads } from '@/lib/threads';
import { publishToBluesky } from '@/lib/bluesky';
import { saveScheduledPost } from '@/lib/db';

type Platform = 'threads' | 'bluesky' | 'both';

export default function PostComposer() {
  const [content, setContent] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('both');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const handleEnhance = async () => {
    if (!content.trim()) {
      Alert.alert('Empty Post', 'Please write something before enhancing.');
      return;
    }

    setIsEnhancing(true);
    try {
      const enhanced = await refinePost(content, 'friendly');
      setContent(enhanced);
      setAiResponse(enhanced);
    } catch (error) {
      Alert.alert('Enhancement Failed', 'Could not enhance your post. Please try again.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handlePostNow = async () => {
    if (!content.trim()) {
      Alert.alert('Empty Post', 'Please write something before posting.');
      return;
    }

    setIsPosting(true);
    try {
      if (selectedPlatform === 'threads' || selectedPlatform === 'both') {
        await publishToThreads(content);
      }
      if (selectedPlatform === 'bluesky' || selectedPlatform === 'both') {
        await publishToBluesky(content);
      }
      Alert.alert('Success', 'Your post has been published!');
      setContent('');
      setAiResponse(null);
    } catch (error) {
      Alert.alert('Post Failed', 'Could not publish your post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleSchedule = async () => {
    if (!content.trim()) {
      Alert.alert('Empty Post', 'Please write something before scheduling.');
      return;
    }

    setIsScheduling(true);
    try {
      const scheduledFor = new Date();
      scheduledFor.setHours(scheduledFor.getHours() + 24);

      await saveScheduledPost({
        content,
        platform: selectedPlatform,
        scheduledFor,
      });

      Alert.alert('Scheduled', `Your post will be published tomorrow at ${scheduledFor.toLocaleTimeString()}`);
      setContent('');
      setAiResponse(null);
    } catch (error) {
      Alert.alert('Schedule Failed', 'Could not schedule your post. Please try again.');
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="What do you want to post?"
        placeholderTextColor="#999"
        multiline
        value={content}
        onChangeText={setContent}
        maxLength={500}
        editable={!isEnhancing && !isPosting && !isScheduling}
      />

      <View style={styles.charCountRow}>
        <Text style={styles.charCount}>{content.length}/500</Text>
      </View>

      {aiResponse && (
        <View style={styles.aiResponseContainer}>
          <Text style={styles.aiResponseLabel}>AI Suggested:</Text>
          <Text style={styles.aiResponseText}>{aiResponse}</Text>
        </View>
      )}

      <View style={styles.platformSelector}>
        <TouchableOpacity
          style={[styles.platformChip, selectedPlatform === 'threads' && styles.platformChipActive]}
          onPress={() => setSelectedPlatform('threads')}
        >
          <Text style={[styles.platformChipText, selectedPlatform === 'threads' && styles.platformChipTextActive]}>
            Threads
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.platformChip, selectedPlatform === 'bluesky' && styles.platformChipActive]}
          onPress={() => setSelectedPlatform('bluesky')}
        >
          <Text style={[styles.platformChipText, selectedPlatform === 'bluesky' && styles.platformChipTextActive]}>
            Bluesky
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.platformChip, selectedPlatform === 'both' && styles.platformChipActive]}
          onPress={() => setSelectedPlatform('both')}
        >
          <Text style={[styles.platformChipText, selectedPlatform === 'both' && styles.platformChipTextActive]}>
            Both
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.enhanceButton, (isEnhancing || !content.trim()) && styles.buttonDisabled]}
          onPress={handleEnhance}
          disabled={isEnhancing || !content.trim()}
        >
          {isEnhancing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Enhance</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.postButton, (isPosting || !content.trim()) && styles.buttonDisabled]}
          onPress={handlePostNow}
          disabled={isPosting || !content.trim()}
        >
          {isPosting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Post Now</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.scheduleButton, (isScheduling || !content.trim()) && styles.buttonDisabled]}
          onPress={handleSchedule}
          disabled={isScheduling || !content.trim()}
        >
          {isScheduling ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Schedule</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    fontSize: 16,
    minHeight: 100,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
    textAlignVertical: 'top',
  },
  charCountRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  charCount: {
    color: '#666',
    fontSize: 12,
  },
  aiResponseContainer: {
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    marginBottom: 16,
  },
  aiResponseLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1a73e8',
  },
  aiResponseText: {
    fontSize: 14,
    color: '#333',
  },
  platformSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  platformChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  platformChipActive: {
    backgroundColor: '#1a73e8',
  },
  platformChipText: {
    color: '#333',
  },
  platformChipTextActive: {
    color: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  enhanceButton: {
    backgroundColor: '#1a73e8',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  postButton: {
    backgroundColor: '#34a853',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  scheduleButton: {
    backgroundColor: '#fbbc05',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
