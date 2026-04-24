import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Alert, Switch } from 'react-native';
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

  useEffect(() => {
    loadCourses().then(() => {
      const foundCourse = courses.find((c) => c.id === id);
      if (foundCourse) {
        setCourse(foundCourse);
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
    setEditingLessonId(lessonId);
  };

  const handleSaveLesson = () => {
    if (editingLessonId) {
      const lesson = course.lessons.find(l => l.id === editingLessonId);
      if (lesson) {
        updateLesson(course.id, editingLessonId, {
          title: lesson.title,
          content: lesson.content
        }).then(() => {
          setEditingLessonId(null);
        });
      }
    }
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
    Alert.alert(
      'Changes Saved',
      'Your course has been successfully updated.',
      [{ text: 'OK' }]
    );
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
        <View style={styles.lessonNumber}>
          <Text style={styles.lessonNumberText}>{item.order + 1}</Text>
        </View>
        <Text style={styles.lessonTitle}>{item.title}</Text>
        <Ionicons name="reorder-three-outline" size={24} color="#C7C7CC" />
      </TouchableOpacity>
    );
  };

  const currentLesson = editingLessonId ? course.lessons.find(l => l.id === editingLessonId) : null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TextInput
            style={styles.titleInput}
            value={course.title}
            onChangeText={(text) => updateCourse(course.id, { title: text })}
            placeholder="Course Title"
            placeholderTextColor="#8E8E93"
          />
          <TextInput
            style={styles.descriptionInput}
            value={course.description}
            onChangeText={(text) => updateCourse(course.id, { description: text })}
            placeholder="Course Description"
            placeholderTextColor="#8E8E93"
            multiline
          />
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="book-outline" size={16} color="#8E8E93" />
              <Text style={styles.metaText}>{course.lessons.length} lessons</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="pricetag-outline" size={16} color="#8E8E93" />
              <Text style={styles.metaText}>${price || '0'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
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

          <DraggableFlatList
            data={course.lessons}
            renderItem={renderLessonItem}
            keyExtractor={(item) => item.id}
            onDragEnd={({ data }) => handleReorderLessons(data)}
            activationDistance={20}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pricing & Publishing</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Price ($)</Text>
            <TextInput
              style={styles.priceInput}
              value={price}
              onChangeText={handlePriceChange}
              keyboardType="numeric"
              placeholder="0"
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
              placeholder="Lesson Title"
              value={newLessonTitle}
              onChangeText={setNewLessonTitle}
              autoFocus
            />
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Lesson Content (Markdown)"
              value={newLessonContent}
              onChangeText={setNewLessonContent}
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

      {currentLesson && (
        <Modal
          visible={!!editingLessonId}
          animationType="slide"
          onRequestClose={() => setEditingLessonId(null)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Lesson</Text>
              <TouchableOpacity
                onPress={() => setEditingLessonId(null)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <TextInput
                style={styles.modalInput}
                value={currentLesson.title}
                onChangeText={(text) => {
                  const updatedLesson = { ...currentLesson, title: text };
                  updateLesson(course.id, currentLesson.id, updatedLesson);
                }}
              />
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                value={currentLesson.content}
                onChangeText={(text) => {
                  const updatedLesson = { ...currentLesson, content: text };
                  updateLesson(course.id, currentLesson.id, updatedLesson);
                }}
                multiline
              />
              <View style={styles.previewToggle}>
                <Text style={styles.previewLabel}>Preview</Text>
                <Switch
                  value={isPreviewVisible}
                  onValueChange={setIsPreviewVisible}
                />
              </View>
              {isPreviewVisible && (
                <View style={styles.previewContainer}>
                  <Markdown style={markdownStyles}>
                    {currentLesson.content || 'Preview will appear here'}
                  </Markdown>
                </View>
              )}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.deleteButton]}
                  onPress={() => handleDeleteLesson(currentLesson.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalButtonText}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleSaveLesson}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
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
  code: {
    fontFamily: 'monospace',
    backgroundColor: '#F5F5F5',
    padding: 4,
    borderRadius: 4,
  },
  list: {
    marginLeft: 20,
  },
  listItem: {
    marginBottom: 4,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  titleInput: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1C1C1E',
  },
  descriptionInput: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 16,
    minHeight: 60,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 4,
    color: '#8E8E93',
    fontSize: 14,
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
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    marginLeft: 4,
    fontSize: 14,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  activeLessonCard: {
    opacity: 0.7,
    backgroundColor: '#F2F2F7',
  },
  lessonNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lessonNumberText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  lessonTitle: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 16,
    color: '#1C1C1E',
    marginRight: 16,
  },
  priceInput: {
    flex: 1,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
  },
  publishContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  publishLabel: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  saveButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
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
    flex: 1,
    padding: 16,
  },
  modalInput: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  modalTextArea: {
    minHeight: 200,
    textAlignVertical: 'top',
  },
  modalButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  previewToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewLabel: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  previewContainer: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
