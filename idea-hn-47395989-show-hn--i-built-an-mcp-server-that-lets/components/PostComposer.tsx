import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Text, View, Alert, ActivityIndicator } from 'react-native';
import { refinePost } from '@/lib/ai';
import { publishPost as publishToThreads } from '@/lib/threads';
import { publishPost as publishToBluesky } from '@/lib/bluesky';
import { saveScheduledPost } from '@/lib/db';

type Platform = 'threads' | 'bluesky' | 'both';

export default function PostComposer() {
  const [content, setContent] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('both');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

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
        editable={!isEnhancing && !isPosting}
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
          style={[styles.scheduleButton, !content.trim() && styles.buttonDisabled]}
          onPress={handleSchedule}
          disabled={!content.trim()}
        >
          <Text style={styles.scheduleButtonText}>Schedule</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    fontSize: 16,
    color: '#000',
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  charCountRow: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  charCount: {
    fontSize: 14,
    color: '#999',
  },
  platformSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  platformChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  platformChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  platformChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  platformChipTextActive: {
    color: '#fff',
  },
  enhanceButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  enhanceButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  postButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scheduleButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  scheduleButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
