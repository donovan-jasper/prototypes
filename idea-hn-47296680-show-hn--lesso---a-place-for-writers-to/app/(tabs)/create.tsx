import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { useCourseStore } from '../../store/courseStore';

export default function CreateScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [titleError, setTitleError] = useState(false);

  const createCourse = useCourseStore((state) => state.createCourse);

  const handleCreate = () => {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }

    const courseData = {
      title: title.trim(),
      description: description.trim() || undefined,
      price: isPaid && price ? parseFloat(price) : undefined,
      published: false,
    };

    createCourse(courseData);
    
    const newCourseId = useCourseStore.getState().courses[useCourseStore.getState().courses.length - 1].id;
    router.push(`/course/${newCourseId}`);
  };

  const handleTitleChange = (text: string) => {
    setTitle(text);
    if (titleError && text.trim()) {
      setTitleError(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Course Title <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, titleError && styles.inputError]}
              placeholder="e.g., Introduction to React Native"
              placeholderTextColor="#C7C7CC"
              value={title}
              onChangeText={handleTitleChange}
              autoCapitalize="words"
            />
            {titleError && (
              <Text style={styles.errorText}>Title is required</Text>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="What will students learn in this course?"
              placeholderTextColor="#C7C7CC"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.fieldContainer}>
            <View style={styles.switchRow}>
              <Text style={styles.label}>Paid Course</Text>
              <Switch
                value={isPaid}
                onValueChange={setIsPaid}
                trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {isPaid && (
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Price (USD)</Text>
              <View style={styles.priceInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={[styles.input, styles.priceInput]}
                  placeholder="0.00"
                  placeholderTextColor="#C7C7CC"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreate}
            activeOpacity={0.8}
          >
            <Text style={styles.createButtonText}>Create Course</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  form: {
    gap: 24,
  },
  fieldContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  required: {
    color: '#FF3B30',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    marginTop: 4,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingLeft: 16,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    borderWidth: 0,
    paddingLeft: 0,
  },
  createButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
