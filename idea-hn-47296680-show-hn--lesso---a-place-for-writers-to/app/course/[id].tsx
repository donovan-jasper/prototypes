import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Alert, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useCourseStore } from '../../store/courseStore';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import Markdown from 'react-native-markdown-display';
import CourseCard from '../../components/CourseCard';
import LessonEditor from '../../components/LessonEditor';
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
        onPress={() => handleLessonPress(item.id)}
        onLongPress={drag}
        style={[styles.lessonItem, isActive && styles.activeLessonItem]}
        activeOpacity={0.8}
      >
        <View style={styles.lessonItemContent}>
          <Ionicons name="reorder-three-outline" size={24} color="#8E8E93" style={styles.dragHandle} />
          <View style={styles.lessonTextContainer}>
            <Text style={styles.lessonTitle}>{item.title}</Text>
            <Text style={styles.lessonPreview} numberOfLines={1}>
              {item.content || 'No content yet'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleDeleteLesson(item.id)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
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
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Course</Text>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveChanges}
            activeOpacity={0.7}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.courseInfoContainer}>
          <TextInput
            style={styles.titleInput}
            placeholder="Course Title"
            placeholderTextColor="#C7C7CC"
            value={title}
            onChangeText={handleTitleChange}
            autoCapitalize="words"
          />
          <TextInput
            style={styles.descriptionInput}
            placeholder="Course Description"
            placeholderTextColor="#C7C7CC"
            value={description}
            onChangeText={handleDescriptionChange}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Price ($)</Text>
          <TextInput
            style={styles.priceInput}
            placeholder="0.00"
            placeholderTextColor="#C7C7CC"
            value={price}
            onChangeText={handlePriceChange}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.publishContainer}>
          <Text style={styles.publishLabel}>Publish Course</Text>
          <Switch
            value={isPublished}
            onValueChange={handlePublishToggle}
            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
            thumbColor={isPublished ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>

        <View style={styles.lessonsHeader}>
          <Text style={styles.lessonsTitle}>Lessons</Text>
          <TouchableOpacity
            style={styles.addLessonButton}
            onPress={() => setIsModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={20} color="#007AFF" />
            <Text style={styles.addLessonButtonText}>Add Lesson</Text>
          </TouchableOpacity>
        </View>

        {course.lessons.length > 0 ? (
          <DraggableFlatList
            data={course.lessons}
            renderItem={renderLessonItem}
            keyExtractor={(item) => item.id}
            onDragEnd={({ data }) => handleReorderLessons(data)}
            activationDistance={20}
            style={styles.lessonsList}
          />
        ) : (
          <View style={styles.emptyLessonsContainer}>
            <Ionicons name="book-outline" size={48} color="#C7C7CC" />
            <Text style={styles.emptyLessonsText}>No lessons yet</Text>
            <Text style={styles.emptyLessonsSubtext}>Add your first lesson to get started</Text>
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

            <TextInput
              style={styles.modalInput}
              placeholder="Lesson Title"
              placeholderTextColor="#C7C7CC"
              value={newLessonTitle}
              onChangeText={setNewLessonTitle}
              autoCapitalize="words"
            />

            <TextInput
              style={[styles.modalInput, styles.modalContentInput]}
              placeholder="Lesson Content (Markdown)"
              placeholderTextColor="#C7C7CC"
              value={newLessonContent}
              onChangeText={setNewLessonContent}
              multiline
              numberOfLines={5}
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
                <Text style={[styles.modalButtonText, styles.addButtonText]}>Add Lesson</Text>
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
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  courseInfoContainer: {
    marginBottom: 24,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D1D6',
  },
  descriptionInput: {
    fontSize: 16,
    color: '#8E8E93',
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D1D6',
  },
  priceLabel: {
    fontSize: 16,
    color: '#1C1C1E',
    marginRight: 16,
  },
  priceInput: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
    textAlign: 'right',
  },
  publishContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D1D6',
  },
  publishLabel: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  lessonsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  lessonsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  addLessonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  addLessonButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 4,
  },
  lessonsList: {
    marginBottom: 24,
  },
  lessonItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D1D6',
  },
  activeLessonItem: {
    opacity: 0.8,
    backgroundColor: '#E5E5EA',
  },
  lessonItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dragHandle: {
    marginRight: 12,
  },
  lessonTextContainer: {
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
  deleteButton: {
    padding: 8,
  },
  emptyLessonsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D1D6',
  },
  emptyLessonsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyLessonsSubtext: {
    fontSize: 14,
    color: '#8E8E93',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#D1D1D6',
  },
  modalContentInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  modalButton: {
    padding: 12,
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
    fontSize: 16,
    fontWeight: '500',
  },
  addButtonText: {
    color: '#FFFFFF',
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#E5E5EA',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
