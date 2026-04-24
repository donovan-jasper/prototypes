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
    router.push(`/course/lesson/${lessonId}`);
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
        style={[styles.lessonCard, isActive && styles.activeLessonCard]}
        onPress={() => handleLessonPress(item.id)}
        onLongPress={drag}
        activeOpacity={0.7}
        delayLongPress={200}
      >
        <View style={styles.lessonContent}>
          <Text style={styles.lessonTitle}>{item.title}</Text>
          <Text style={styles.lessonPreview} numberOfLines={2}>
            {item.content || 'No content yet'}
          </Text>
        </View>
        <View style={styles.lessonActions}>
          <TouchableOpacity
            onPress={() => handleDeleteLesson(item.id)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
          <Ionicons name="reorder-two-outline" size={24} color="#C7C7CC" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={handleTitleChange}
            placeholder="Course Title"
            placeholderTextColor="#8E8E93"
          />
          <TextInput
            style={styles.descriptionInput}
            value={description}
            onChangeText={handleDescriptionChange}
            placeholder="Course Description"
            placeholderTextColor="#8E8E93"
            multiline
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lessons</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setIsModalVisible(true)}
            >
              <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
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
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={48} color="#C7C7CC" />
              <Text style={styles.emptyStateText}>No lessons yet</Text>
              <Text style={styles.emptyStateSubtext}>Add your first lesson to get started</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pricing</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>$</Text>
            <TextInput
              style={styles.priceInput}
              value={price}
              onChangeText={handlePriceChange}
              placeholder="0"
              placeholderTextColor="#8E8E93"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Publish</Text>
            <Switch
              value={isPublished}
              onValueChange={handlePublishToggle}
              trackColor={{ false: '#E5E5EA', true: '#34C759' }}
              thumbColor={isPublished ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
          <Text style={styles.publishStatus}>
            {isPublished ? 'Your course is published and visible to students' : 'Your course is not published'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveChanges}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Lesson</Text>
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <TextInput
              style={styles.modalInput}
              value={newLessonTitle}
              onChangeText={setNewLessonTitle}
              placeholder="Lesson Title"
              placeholderTextColor="#8E8E93"
            />

            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              value={newLessonContent}
              onChangeText={setNewLessonContent}
              placeholder="Lesson Content (Markdown supported)"
              placeholderTextColor="#8E8E93"
              multiline
            />

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleAddLesson}
              activeOpacity={0.8}
            >
              <Text style={styles.modalButtonText}>Add Lesson</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  descriptionInput: {
    fontSize: 16,
    color: '#8E8E93',
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    minHeight: 80,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#007AFF',
    fontSize: 16,
    marginLeft: 4,
  },
  lessonCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeLessonCard: {
    opacity: 0.8,
    backgroundColor: '#E5E5EA',
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  lessonPreview: {
    fontSize: 14,
    color: '#8E8E93',
  },
  lessonActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginRight: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 24,
    color: '#1C1C1E',
    marginRight: 8,
  },
  priceInput: {
    fontSize: 24,
    color: '#1C1C1E',
    flex: 1,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  publishStatus: {
    fontSize: 14,
    color: '#8E8E93',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    padding: 16,
  },
  modalInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalTextArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  modalButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
