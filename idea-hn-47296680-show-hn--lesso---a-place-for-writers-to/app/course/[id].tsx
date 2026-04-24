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
  const [isPriceModalVisible, setIsPriceModalVisible] = useState(false);

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
  };

  const handleSavePrice = () => {
    const priceValue = parseFloat(price) || 0;
    if (priceValue < 0) {
      Alert.alert('Error', 'Price cannot be negative');
      return;
    }

    updateCourse(course.id, { price: priceValue }).then(() => {
      setIsPriceModalVisible(false);
      Alert.alert('Success', 'Price updated successfully');
    });
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
        'Your course changes have been saved successfully!',
        [{ text: 'OK' }]
      );
    });
  };

  const renderLessonItem = ({ item, drag, isActive }: RenderItemParams<Lesson>) => {
    return (
      <TouchableOpacity
        style={[styles.lessonItem, isActive && styles.activeLessonItem]}
        onPress={() => handleLessonPress(item.id)}
        onLongPress={drag}
        activeOpacity={0.8}
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
          <Ionicons name="reorder-three-outline" size={24} color="#C7C7CC" />
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
            onChangeText={setTitle}
            placeholder="Course Title"
            placeholderTextColor="#8E8E93"
          />
          <TextInput
            style={styles.descriptionInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Course Description"
            placeholderTextColor="#8E8E93"
            multiline
          />
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.priceButton}
            onPress={() => setIsPriceModalVisible(true)}
          >
            <Text style={styles.priceButtonText}>
              {price ? `$${price}` : 'Set Price'}
            </Text>
          </TouchableOpacity>

          <View style={styles.publishContainer}>
            <Text style={styles.publishLabel}>Published</Text>
            <Switch
              value={isPublished}
              onValueChange={handlePublishToggle}
              trackColor={{ false: '#E5E5EA', true: '#34C759' }}
              thumbColor={isPublished ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>

        <View style={styles.lessonsHeader}>
          <Text style={styles.lessonsTitle}>Lessons</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <DraggableFlatList
          data={course.lessons}
          renderItem={renderLessonItem}
          keyExtractor={(item) => item.id}
          onDragEnd={({ data }) => handleReorderLessons(data)}
          activationDistance={20}
          containerStyle={styles.lessonsList}
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveChanges}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Lesson Modal */}
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

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.previewButton]}
                onPress={() => setIsPreviewVisible(true)}
              >
                <Text style={styles.modalButtonText}>Preview</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.addLessonButton]}
                onPress={handleAddLesson}
              >
                <Text style={styles.modalButtonText}>Add Lesson</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Preview Modal */}
      <Modal
        visible={isPreviewVisible}
        animationType="slide"
        onRequestClose={() => setIsPreviewVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Preview</Text>
            <TouchableOpacity
              onPress={() => setIsPreviewVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.previewContainer}>
            <Markdown style={markdownStyles}>{newLessonContent}</Markdown>
          </ScrollView>
        </View>
      </Modal>

      {/* Price Modal */}
      <Modal
        visible={isPriceModalVisible}
        animationType="slide"
        onRequestClose={() => setIsPriceModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Set Course Price</Text>
            <TouchableOpacity
              onPress={() => setIsPriceModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.priceLabel}>Price ($)</Text>
            <TextInput
              style={styles.priceInput}
              value={price}
              onChangeText={handlePriceChange}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="#8E8E93"
            />

            <View style={styles.priceInfo}>
              <Text style={styles.priceInfoText}>
                You'll receive 85% of each sale (we take 15%).
              </Text>
              <Text style={styles.priceInfoText}>
                Minimum price is $0 (free course).
              </Text>
            </View>

            <TouchableOpacity
              style={styles.savePriceButton}
              onPress={handleSavePrice}
            >
              <Text style={styles.savePriceButtonText}>Save Price</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const markdownStyles = {
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  list_item: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 4,
  },
  code_inline: {
    fontFamily: 'monospace',
    backgroundColor: '#F5F5F5',
    padding: 2,
    borderRadius: 3,
  },
  blockquote: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    marginVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#C7C7CC',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  titleInput: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  descriptionInput: {
    fontSize: 16,
    color: '#8E8E93',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    minHeight: 60,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  priceButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  priceButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  publishContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  publishLabel: {
    fontSize: 16,
    color: '#8E8E93',
    marginRight: 8,
  },
  lessonsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  lessonsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  addButton: {
    backgroundColor: '#34C759',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonsList: {
    marginBottom: 24,
  },
  lessonItem: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeLessonItem: {
    opacity: 0.8,
    backgroundColor: '#E5E5EA',
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
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
    marginRight: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
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
    color: '#000000',
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
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 8,
  },
  previewButton: {
    backgroundColor: '#007AFF',
  },
  addLessonButton: {
    backgroundColor: '#34C759',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  previewContainer: {
    flex: 1,
    padding: 16,
  },
  priceLabel: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 8,
  },
  priceInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  priceInfo: {
    backgroundColor: '#E5E5EA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  priceInfoText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  savePriceButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  savePriceButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
