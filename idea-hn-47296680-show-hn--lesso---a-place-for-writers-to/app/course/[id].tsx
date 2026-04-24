import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Alert, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useCourseStore } from '../../store/courseStore';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import Markdown from 'react-native-markdown-display';
import { Lesson } from '../../types';

export default function CourseEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const courses = useCourseStore((state) => state.courses);
  const updateCourse = useCourseStore((state) => state.updateCourse);
  const addLesson = useCourseStore((state) => state.addLesson);
  const updateLesson = useCourseStore((state) => state.updateLesson);
  const deleteLesson = useCourseStore((state) => state.deleteLesson);
  const reorderLessons = useCourseStore((state) => state.reorderLessons);
  const loadCourses = useCourseStore((state) => state.loadCourses);

  const [course, setCourse] = useState<Course | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonContent, setNewLessonContent] = useState('');
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [price, setPrice] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadCourses().then(() => {
      const foundCourse = courses.find((c) => c.id === id);
      if (foundCourse) {
        setCourse(foundCourse);
        setTitle(foundCourse.title);
        setDescription(foundCourse.description || '');
        setPrice(foundCourse.price?.toString() || '');
        setIsPublished(foundCourse.published || false);
      }
    });
  }, [id, courses]);

  if (!course) {
    return (
      <View style={styles.container}>
        <View style={styles.errorState}>
          <Ionicons name="alert-circle-outline" size={64} color="#C7C7CC" />
          <Text style={styles.errorTitle}>Course not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleAddLesson = () => {
    if (newLessonTitle.trim() === '') {
      Alert.alert('Error', 'Please enter a lesson title');
      return;
    }

    addLesson(course.id, {
      title: newLessonTitle,
      content: newLessonContent,
      order: course.lessons.length,
    }).then(() => {
      setNewLessonTitle('');
      setNewLessonContent('');
      setIsModalVisible(false);
    });
  };

  const handleLessonPress = (lessonId: string) => {
    router.push(`/course/lesson/${lessonId}?courseId=${course.id}`);
  };

  const handleDeleteLesson = (lessonId: string) => {
    Alert.alert(
      'Delete Lesson',
      'Are you sure you want to delete this lesson?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteLesson(course.id, lessonId).then(() => {
              if (editingLessonId === lessonId) {
                setEditingLessonId(null);
              }
            });
          }
        }
      ]
    );
  };

  const handleReorderLessons = (lessons: Lesson[]) => {
    reorderLessons(course.id, lessons);
  };

  const handlePriceChange = (text: string) => {
    const numericValue = text.replace(/[^0-9.]/g, '');
    setPrice(numericValue);
    updateCourse(course.id, { price: parseFloat(numericValue) || 0 });
  };

  const handlePublishToggle = () => {
    const newPublishedStatus = !isPublished;
    setIsPublished(newPublishedStatus);
    updateCourse(course.id, { published: newPublishedStatus });

    if (newPublishedStatus) {
      Alert.alert(
        'Course Published',
        'Your course is now live and students can enroll!',
        [{ text: 'OK' }]
      );
    }
  };

  const handleSaveChanges = () => {
    updateCourse(course.id, {
      title,
      description,
      price: parseFloat(price) || 0,
      published: isPublished
    }).then(() => {
      Alert.alert(
        'Changes Saved',
        'Your course has been successfully updated.',
        [{ text: 'OK' }]
      );
    });
  };

  const handleTitleChange = (text: string) => {
    setTitle(text);
  };

  const handleDescriptionChange = (text: string) => {
    setDescription(text);
  };

  const renderLessonItem = ({ item, drag, isActive }: RenderItemParams<Lesson>) => {
    return (
      <TouchableOpacity
        style={[styles.lessonItem, isActive && styles.activeLessonItem]}
        onLongPress={drag}
        onPress={() => handleLessonPress(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.lessonContent}>
          <Ionicons name="reorder-three-outline" size={24} color="#C7C7CC" />
          <View style={styles.lessonTextContainer}>
            <Text style={styles.lessonTitle}>{item.title}</Text>
            <Text style={styles.lessonPreview} numberOfLines={1}>
              {item.content || 'No content yet'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteLesson(item.id)}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Course</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleSaveChanges}
          activeOpacity={0.7}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Text style={styles.label}>Course Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={handleTitleChange}
            placeholder="Enter course title"
            placeholderTextColor="#C7C7CC"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={handleDescriptionChange}
            placeholder="Enter course description"
            placeholderTextColor="#C7C7CC"
            multiline
            numberOfLines={4}
          />

          <View style={styles.priceContainer}>
            <Text style={styles.label}>Price ($)</Text>
            <TextInput
              style={[styles.input, styles.priceInput]}
              value={price}
              onChangeText={handlePriceChange}
              placeholder="0.00"
              placeholderTextColor="#C7C7CC"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.publishContainer}>
            <Text style={styles.label}>Published</Text>
            <Switch
              value={isPublished}
              onValueChange={handlePublishToggle}
              trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
              thumbColor={isPublished ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>

        <View style={styles.lessonsHeader}>
          <Text style={styles.sectionTitle}>Lessons</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Lesson</Text>
          </TouchableOpacity>
        </View>

        {course.lessons.length > 0 ? (
          <DraggableFlatList
            data={course.lessons}
            renderItem={renderLessonItem}
            keyExtractor={(item) => item.id}
            onDragEnd={({ data }) => handleReorderLessons(data)}
            activationDistance={20}
            containerStyle={styles.lessonsList}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={48} color="#C7C7CC" />
            <Text style={styles.emptyStateText}>No lessons yet</Text>
            <Text style={styles.emptyStateSubtext}>Add your first lesson to get started</Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Lesson</Text>

            <Text style={styles.modalLabel}>Title</Text>
            <TextInput
              style={styles.modalInput}
              value={newLessonTitle}
              onChangeText={setNewLessonTitle}
              placeholder="Enter lesson title"
              placeholderTextColor="#C7C7CC"
            />

            <Text style={styles.modalLabel}>Content</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              value={newLessonContent}
              onChangeText={setNewLessonContent}
              placeholder="Enter lesson content (Markdown supported)"
              placeholderTextColor="#C7C7CC"
              multiline
              numberOfLines={6}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleAddLesson}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonText}>Add Lesson</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  headerButton: {
    padding: 8,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  formContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 8,
  },
  input: {
    fontSize: 17,
    padding: 12,
    borderWidth: 1,
    borderColor: '#C7C7CC',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceInput: {
    width: 100,
    marginLeft: 'auto',
  },
  publishContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  lessonsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '600',
    color: '#000000',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 4,
  },
  lessonsList: {
    marginTop: 8,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  activeLessonItem: {
    opacity: 0.8,
    backgroundColor: '#E5E5EA',
  },
  lessonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lessonTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  lessonPreview: {
    fontSize: 13,
    color: '#8E8E93',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#000000',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 15,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 8,
  },
  modalInput: {
    fontSize: 17,
    padding: 12,
    borderWidth: 1,
    borderColor: '#C7C7CC',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  modalTextArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#E5E5EA',
  },
  addButton: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 19,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
});
