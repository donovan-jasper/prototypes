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

  const handleEnhance = async () => {
    if (!content.trim()) {
      Alert.alert('Empty Post', 'Please write something before enhancing.');
      return;
    }

    setIsEnhancing(true);
    try {
      const enhanced = await refinePost(content, 'friendly');
      setContent(enhanced);
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

      <TouchableOpacity
        style={[styles.enhanceButton, (isEnhancing || !content.trim()) && styles.buttonDisabled]}
        onPress={handleEnhance}
        disabled={isEnhancing || !content.trim()}
      >
        {isEnhancing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.enhanceButtonText}>✨ Enhance with AI</Text>
        )}
      </TouchableOpacity>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.postButton, (isPosting || !content.trim()) && styles.buttonDisabled]}
          onPress={handlePostNow}
          disabled={isPosting || !content.trim()}
        >
          {isPosting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.postButtonText}>Post Now</Text>
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
            <Text style={styles.scheduleButtonText}>Schedule</Text>
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
    height: 120,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 8,
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
  platformSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  platformChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  platformChipActive: {
    backgroundColor: '#4a6bff',
    borderColor: '#4a6bff',
  },
  platformChipText: {
    color: '#666',
    fontSize: 14,
  },
  platformChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  enhanceButton: {
    backgroundColor: '#4a6bff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  enhanceButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  postButton: {
    flex: 1,
    backgroundColor: '#4a6bff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scheduleButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  scheduleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
